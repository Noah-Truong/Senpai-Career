import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth-server";
import { getCompaniesWithOBCount } from "@/lib/corporate-ob";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get companies from companies table (not company_profiles)
    // This shows companies ranked by Corporate OB count
    const companies = await getCompaniesWithOBCount();

    // Transform to match expected format
    const formattedCompanies = companies.map((company) => ({
      id: company.id,
      name: company.name,
      companyName: company.name,
      logo: company.logoUrl,
      overview: company.description,
      website: company.website,
      industry: company.industry,
      obCount: company.obCount || 0,
    }));

    return NextResponse.json({ companies: formattedCompanies });
  } catch (error: any) {
    console.error("Error fetching companies:", error);
    return NextResponse.json(
      { error: "Failed to fetch companies" },
      { status: 500 }
    );
  }
}

