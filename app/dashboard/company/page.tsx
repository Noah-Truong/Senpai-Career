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
        <h1 className="text-3xl font-bold mb-6">Company Dashboard</h1>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="card-gradient p-6">
            <h2 className="text-xl font-semibold mb-4">Company Page Editor</h2>
            <p className="text-gray-700 mb-4">
              Edit your company profile, internship details, and company information.
            </p>
            <a href="/company/editor" className="btn-primary inline-block">
              Edit Company Page
            </a>
          </div>
          <div className="card-gradient p-6">
            <h2 className="text-xl font-semibold mb-4">Student List</h2>
            <p className="text-gray-700 mb-4">
              Search and filter students to find qualified candidates.
            </p>
            <a href="/company/students" className="btn-primary inline-block">
              Browse Students
            </a>
          </div>
          <div className="card-gradient p-6">
            <h2 className="text-xl font-semibold mb-4">Messages</h2>
            <p className="text-gray-700 mb-4">
              View your scout messages and conversations with students.
            </p>
            <a href="/messages" className="btn-primary inline-block">
              Open Messages
            </a>
          </div>
          <div className="card-gradient p-6">
            <h2 className="text-xl font-semibold mb-4">Internship Listings</h2>
            <p className="text-gray-700 mb-4">
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

