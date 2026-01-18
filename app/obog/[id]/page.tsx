import { auth } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import SidebarLayout from "@/components/SidebarLayout";
import { getOBOGById } from "@/lib/users";
import { notFound } from "next/navigation";
import OBOGDetailContent from "@/components/OBOGDetailContent";

export default async function OBOGDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();

  if (!session || session.user?.role !== "student") {
    redirect("/login");
  }

  const { id } = await params;
  const obog = await getOBOGById(id);

  if (!obog) {
    notFound();
  }

  return (
 
      <div className="max-w-4xl mx-auto">
        <OBOGDetailContent obog={obog as any} />
      </div>
 
  );
}

