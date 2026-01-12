import { auth } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import SidebarLayout from "@/components/SidebarLayout";
import { getOBOGById } from "@/lib/users";
import { notFound } from "next/navigation";
import OBOGDetailContent from "@/components/OBOGDetailContent";

export default async function OBOGDetailPage({ params }: { params: { id: string } }) {
  const session = await auth();
  
  if (!session || session.user?.role !== "student") {
    redirect("/login");
  }

  const obog = getOBOGById(params.id);

  if (!obog) {
    notFound();
  }

  return (
    <SidebarLayout role="student">
      <div className="max-w-4xl mx-auto">
        <OBOGDetailContent obog={obog} />
      </div>
    </SidebarLayout>
  );
}

