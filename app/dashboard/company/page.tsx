import { auth } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import SidebarLayout from "@/components/SidebarLayout";

export default async function CompanyDashboardPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  // Only admin can access dashboards
  if (session.user?.role !== "admin") {
    redirect("/");
  }

  // If admin somehow reaches here, redirect to admin dashboard
  redirect("/dashboard/admin");
}
