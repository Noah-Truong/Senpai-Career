import { auth } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import SidebarLayout from "@/components/SidebarLayout";

export default async function StudentDashboardPage() {
  const session = await auth();

  if (!session || session.user?.role !== "student") {
    redirect("/login");
  }

  return (
    <SidebarLayout role="student">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold mb-6" style={{ color: '#111827' }}>Student Dashboard</h1>
        <div className="grid md:grid-cols-2 gap-6">
          <div 
            className="p-6 bg-white border rounded"
            style={{ borderColor: '#E5E7EB', borderRadius: '6px' }}
          >
            <h2 className="text-lg font-semibold mb-3" style={{ color: '#111827' }}>OB/OG List</h2>
            <p className="mb-4" style={{ color: '#6B7280' }}>
              Browse and connect with working professionals and job-offer holders for career consultations.
            </p>
            <a href="/ob-list" className="btn-primary inline-block">
              Browse OB/OG
            </a>
          </div>
          <div 
            className="p-6 bg-white border rounded"
            style={{ borderColor: '#E5E7EB', borderRadius: '6px' }}
          >
            <h2 className="text-lg font-semibold mb-3" style={{ color: '#111827' }}>Internships</h2>
            <p className="mb-4" style={{ color: '#6B7280' }}>
              Discover long-term internship opportunities that align with your interests.
            </p>
            <a href="/internships" className="btn-primary inline-block">
              View Internships
            </a>
          </div>
          <div 
            className="p-6 bg-white border rounded"
            style={{ borderColor: '#E5E7EB', borderRadius: '6px' }}
          >
            <h2 className="text-lg font-semibold mb-3" style={{ color: '#111827' }}>Messages</h2>
            <p className="mb-4" style={{ color: '#6B7280' }}>
              View your conversations with OB/OG mentors and companies.
            </p>
            <a href="/messages" className="btn-primary inline-block">
              Open Messages
            </a>
          </div>
          <div 
            className="p-6 bg-white border rounded"
            style={{ borderColor: '#E5E7EB', borderRadius: '6px' }}
          >
            <h2 className="text-lg font-semibold mb-3" style={{ color: '#111827' }}>Profile</h2>
            <p className="mb-4" style={{ color: '#6B7280' }}>
              Update your profile information and preferences.
            </p>
            <a href="/student/profile" className="btn-primary inline-block">
              Edit Profile
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
