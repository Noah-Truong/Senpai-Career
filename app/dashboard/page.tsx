import { auth } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import Header from "@/components/Header";

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  // Only admin can access dashboards
  if (session.user?.role === "admin") {
    redirect("/dashboard/admin");
  }

  // Redirect all non-admin users to home
  redirect("/");
}

