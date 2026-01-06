import { auth } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import Header from "@/components/Header";

export default async function CompanyDashboardPage() {
  const session = await auth();

  if (!session || session.user?.role !== "company") {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold mb-6" style={{ color: '#111827' }}>Company Dashboard</h1>
        <div className="grid md:grid-cols-2 gap-6">
          <div 
            className="p-6 bg-white border rounded"
            style={{ borderColor: '#E5E7EB', borderRadius: '6px' }}
          >
            <h2 className="text-lg font-semibold mb-3" style={{ color: '#111827' }}>Company Page Editor</h2>
            <p className="mb-4" style={{ color: '#6B7280' }}>
              Edit your company profile, internship details, and company information.
            </p>
            <a href="/company/profile" className="btn-primary inline-block">
              Edit Company Page
            </a>
          </div>
          <div 
            className="p-6 bg-white border rounded"
            style={{ borderColor: '#E5E7EB', borderRadius: '6px' }}
          >
            <h2 className="text-lg font-semibold mb-3" style={{ color: '#111827' }}>Student List</h2>
            <p className="mb-4" style={{ color: '#6B7280' }}>
              Search and filter students to find qualified candidates.
            </p>
            <a href="/company/students" className="btn-primary inline-block">
              Browse Students
            </a>
          </div>
          <div 
            className="p-6 bg-white border rounded"
            style={{ borderColor: '#E5E7EB', borderRadius: '6px' }}
          >
            <h2 className="text-lg font-semibold mb-3" style={{ color: '#111827' }}>Messages</h2>
            <p className="mb-4" style={{ color: '#6B7280' }}>
              View your scout messages and conversations with students.
            </p>
            <a href="/messages" className="btn-primary inline-block">
              Open Messages
            </a>
          </div>
          <div 
            className="p-6 bg-white border rounded"
            style={{ borderColor: '#E5E7EB', borderRadius: '6px' }}
          >
            <h2 className="text-lg font-semibold mb-3" style={{ color: '#111827' }}>Internship Listings</h2>
            <p className="mb-4" style={{ color: '#6B7280' }}>
              Post and manage internship and new graduate position listings.
            </p>
            <a href="/company/internships" className="btn-primary inline-block">
              Manage Listings
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
