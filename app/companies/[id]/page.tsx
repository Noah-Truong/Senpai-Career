import { auth } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCorporateOBsByCompany } from "@/lib/corporate-ob";
import { getUserById } from "@/lib/users";
import CompanyDetailContent from "@/components/CompanyDetailContent";

export default async function CompanyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  
  if (!session) {
    redirect("/login");
  }

  const { id } = await params;
  const supabase = await createClient();

  // Get company from companies table
  const { data: company, error } = await supabase
    .from("companies")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !company) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="card-gradient p-8 text-center">
            <p className="text-gray-700 text-lg mb-4">Company not found</p>
            <a href="/companies" className="btn-primary">
              Back to Companies
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Get Corporate OBs for this company
  const corporateOBs = await getCorporateOBsByCompany(id);
  
  // Get user details for each Corporate OB
  const obUsers = await Promise.all(
    corporateOBs.map(async (ob) => {
      const user = await getUserById(ob.userId);
      return user ? { ...ob, user } : null;
    })
  );

  // Filter out null values with proper type narrowing
  const validOBUsers = obUsers.filter((ob): ob is NonNullable<typeof ob> => ob !== null);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CompanyDetailContent 
          company={{
            id: company.id,
            name: company.name,
            logoUrl: company.logo_url,
            industry: company.industry,
            description: company.description,
            website: company.website,
            obCount: validOBUsers.length,
          }}
          corporateOBs={validOBUsers}
        />
      </div>
    </div>
  );
}
