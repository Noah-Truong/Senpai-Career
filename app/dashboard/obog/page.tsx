import { auth } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import Header from "@/components/Header";

export default async function OBOGDashboardPage() {
  const session = await auth();

  if (!session || session.user?.role !== "obog") {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-6">OB/OG Dashboard</h1>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="card-gradient p-6">
            <h2 className="text-xl font-semibold mb-4">Your Profile</h2>
            <p className="text-gray-700 mb-4">
              Manage your OB/OG profile and update the topics you can help with.
            </p>
            <a href="/profile" className="btn-primary inline-block">
              Edit Profile
            </a>
          </div>
          <div className="card-gradient p-6">
            <h2 className="text-xl font-semibold mb-4">Messages</h2>
            <p className="text-gray-700 mb-4">
              View messages from students seeking career advice.
            </p>
            <a href="/messages" className="btn-primary inline-block">
              Open Messages
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

