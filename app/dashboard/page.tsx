import { auth } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import Header from "@/components/Header";

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  // Redirect based on role
  if (session.user?.role === "student") {
    redirect("/dashboard/student");
  } else if (session.user?.role === "obog") {
    redirect("/dashboard/obog");
  } else if (session.user?.role === "company") {
    redirect("/dashboard/company");
  } else if (session.user?.role === "admin") {
    redirect("/dashboard/admin");
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
      </div>
    </div>
  );
}

