import { auth } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import Header from "@/components/Header";

export default async function StudentDashboardPage() {
  const session = await auth();

  if (!session || session.user?.role !== "student") {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-6">Student Dashboard</h1>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="card-gradient p-6">
            <h2 className="text-xl font-semibold mb-4">OB/OG List</h2>
            <p className="text-gray-700 mb-4">
              Browse and connect with working professionals and job-offer holders for career consultations.
            </p>
            <a href="/ob-visit" className="btn-primary inline-block">
              Browse OB/OG
            </a>
          </div>
          <div className="card-gradient p-6">
            <h2 className="text-xl font-semibold mb-4">Internships</h2>
            <p className="text-gray-700 mb-4">
              Discover long-term internship opportunities that align with your interests.
            </p>
            <a href="/internship" className="btn-primary inline-block">
              View Internships
            </a>
          </div>
          <div className="card-gradient p-6">
            <h2 className="text-xl font-semibold mb-4">Messages</h2>
            <p className="text-gray-700 mb-4">
              View your conversations with OB/OG mentors and companies.
            </p>
            <a href="/messages" className="btn-primary inline-block">
              Open Messages
            </a>
          </div>
          <div className="card-gradient p-6">
            <h2 className="text-xl font-semibold mb-4">Profile</h2>
            <p className="text-gray-700 mb-4">
              Update your profile information and preferences.
            </p>
            <a href="/profile" className="btn-primary inline-block">
              Edit Profile
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

