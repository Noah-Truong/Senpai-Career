import { auth } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import Header from "@/components/Header";
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
    <div className="min-h-screen bg-white">
      <Header />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <OBOGDetailContent obog={obog} />
      </div>
    </div>
  );
}

