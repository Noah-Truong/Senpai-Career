import { auth } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import SidebarLayout from "@/components/SidebarLayout";

export default async function OBOGDashboardPage() {
  const session = await auth();

  if (!session || session.user?.role !== "obog") {
    redirect("/login");
  }

  return (
    <SidebarLayout role="obog">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold mb-6" style={{ color: '#111827' }}>OB/OG Dashboard</h1>
        <div className="grid md:grid-cols-2 gap-6">
          <div 
            className="p-6 bg-white border rounded"
            style={{ borderColor: '#E5E7EB', borderRadius: '6px' }}
          >
            <h2 className="text-lg font-semibold mb-3" style={{ color: '#111827' }}>Your Profile</h2>
            <p className="mb-4" style={{ color: '#6B7280' }}>
              Manage your OB/OG profile and update the topics you can help with.
            </p>
            <a href="/profile" className="btn-primary inline-block">
              Edit Profile
            </a>
          </div>
          <div 
            className="p-6 bg-white border rounded"
            style={{ borderColor: '#E5E7EB', borderRadius: '6px' }}
          >
            <h2 className="text-lg font-semibold mb-3" style={{ color: '#111827' }}>Messages</h2>
            <p className="mb-4" style={{ color: '#6B7280' }}>
              View messages from students seeking career advice.
            </p>
            <a href="/messages" className="btn-primary inline-block">
              Open Messages
            </a>
          </div>
          <div 
            className="p-6 bg-white border rounded"
            style={{ borderColor: '#E5E7EB', borderRadius: '6px' }}
          >
            <h2 className="text-lg font-semibold mb-3" style={{ color: '#111827' }}>Report an Issue</h2>
            <p className="mb-4" style={{ color: '#6B7280' }}>
              Report safety concerns, inappropriate behavior, or platform issues.
            </p>
            <a href="/report" className="btn-secondary inline-block">
              Submit Report
            </a>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}
