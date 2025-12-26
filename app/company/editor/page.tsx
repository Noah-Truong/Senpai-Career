"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Header from "@/components/Header";

export default function CompanyEditorPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    companyName: "",
    overview: "",
    workLocation: "",
    hourlyWage: "",
    weeklyHours: "",
    weeklyDays: "",
    minRequiredHours: "",
    internshipDetails: "",
    newGradDetails: "",
    idealCandidate: "",
    sellingPoints: "",
    oneLineMessage: "",
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated" && session?.user?.role !== "company") {
      router.push("/dashboard");
      return;
    }

    // Load existing company data
    if (session?.user?.id) {
      loadCompanyData();
    }
  }, [status, session, router]);

  const loadCompanyData = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/company/profile");
      
      if (!response.ok) {
        if (response.status === 404) {
          // Company profile doesn't exist yet, that's okay
          return;
        }
        throw new Error("Failed to load company data");
      }

      const data = await response.json();
      if (data.company) {
        // Map company data to form fields
        setFormData({
          companyName: data.company.companyName || "",
          overview: data.company.overview || "",
          workLocation: data.company.workLocation || "",
          hourlyWage: data.company.hourlyWage?.toString() || "",
          weeklyHours: data.company.weeklyHours?.toString() || "",
          weeklyDays: data.company.weeklyDays?.toString() || "",
          minRequiredHours: data.company.minRequiredHours?.toString() || "",
          internshipDetails: data.company.internshipDetails || "",
          newGradDetails: data.company.newGradDetails || "",
          idealCandidate: data.company.idealCandidate || "",
          sellingPoints: data.company.sellingPoints || "",
          oneLineMessage: data.company.oneLineMessage || "",
        });
      }
    } catch (err) {
      console.error("Error loading company data:", err);
      setError("Failed to load company data. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setSaving(true);

    try {
      // Prepare data for API (convert string numbers to actual numbers)
      const updateData = {
        companyName: formData.companyName,
        overview: formData.overview,
        workLocation: formData.workLocation,
        hourlyWage: formData.hourlyWage ? parseFloat(formData.hourlyWage) : undefined,
        weeklyHours: formData.weeklyHours ? parseInt(formData.weeklyHours, 10) : undefined,
        weeklyDays: formData.weeklyDays ? parseInt(formData.weeklyDays, 10) : undefined,
        minRequiredHours: formData.minRequiredHours ? parseInt(formData.minRequiredHours, 10) : undefined,
        internshipDetails: formData.internshipDetails,
        newGradDetails: formData.newGradDetails,
        idealCandidate: formData.idealCandidate,
        sellingPoints: formData.sellingPoints,
        oneLineMessage: formData.oneLineMessage,
      };

      const response = await fetch("/api/company/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save company page");
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to save company page");
    } finally {
      setSaving(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-6" style={{ color: '#000000' }}>Company Page Editor</h1>
        <p className="text-gray-600 mb-8">
          Edit your company profile page that students will see when browsing opportunities.
        </p>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
            Company page saved successfully!
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="card-gradient p-6">
            <h2 className="text-xl font-semibold mb-4" style={{ color: '#000000' }}>Basic Information</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name *
                </label>
                <input
                  type="text"
                  id="companyName"
                  name="companyName"
                  required
                  value={formData.companyName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  style={{ color: '#000000' }}
                />
              </div>

              <div>
                <label htmlFor="overview" className="block text-sm font-medium text-gray-700 mb-2">
                  Company Overview *
                </label>
                <textarea
                  id="overview"
                  name="overview"
                  required
                  rows={4}
                  value={formData.overview}
                  onChange={handleChange}
                  placeholder="Describe your company, its mission, and what makes it unique..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  style={{ color: '#000000' }}
                />
              </div>

              <div>
                <label htmlFor="oneLineMessage" className="block text-sm font-medium text-gray-700 mb-2">
                  One-line Message to Students
                </label>
                <input
                  type="text"
                  id="oneLineMessage"
                  name="oneLineMessage"
                  value={formData.oneLineMessage}
                  onChange={handleChange}
                  placeholder="A brief message that will appear on your company card"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  style={{ color: '#000000' }}
                />
              </div>
            </div>
          </div>

          <div className="card-gradient p-6">
            <h2 className="text-xl font-semibold mb-4" style={{ color: '#000000' }}>Work Details</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="workLocation" className="block text-sm font-medium text-gray-700 mb-2">
                  Work Location
                </label>
                <input
                  type="text"
                  id="workLocation"
                  name="workLocation"
                  value={formData.workLocation}
                  onChange={handleChange}
                  placeholder="Tokyo, Remote, etc."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  style={{ color: '#000000' }}
                />
              </div>

              <div>
                <label htmlFor="hourlyWage" className="block text-sm font-medium text-gray-700 mb-2">
                  Hourly Wage (¥)
                </label>
                <input
                  type="number"
                  id="hourlyWage"
                  name="hourlyWage"
                  value={formData.hourlyWage}
                  onChange={handleChange}
                  placeholder="1500"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  style={{ color: '#000000' }}
                />
              </div>

              <div>
                <label htmlFor="weeklyHours" className="block text-sm font-medium text-gray-700 mb-2">
                  Weekly Hours
                </label>
                <input
                  type="number"
                  id="weeklyHours"
                  name="weeklyHours"
                  value={formData.weeklyHours}
                  onChange={handleChange}
                  placeholder="20"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  style={{ color: '#000000' }}
                />
              </div>

              <div>
                <label htmlFor="weeklyDays" className="block text-sm font-medium text-gray-700 mb-2">
                  Weekly Days
                </label>
                <input
                  type="number"
                  id="weeklyDays"
                  name="weeklyDays"
                  value={formData.weeklyDays}
                  onChange={handleChange}
                  placeholder="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  style={{ color: '#000000' }}
                />
              </div>

              <div>
                <label htmlFor="minRequiredHours" className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Required Weekly Hours
                </label>
                <input
                  type="number"
                  id="minRequiredHours"
                  name="minRequiredHours"
                  value={formData.minRequiredHours}
                  onChange={handleChange}
                  placeholder="10"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  style={{ color: '#000000' }}
                />
              </div>
            </div>
          </div>

          <div className="card-gradient p-6">
            <h2 className="text-xl font-semibold mb-4" style={{ color: '#000000' }}>Opportunity Details</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="internshipDetails" className="block text-sm font-medium text-gray-700 mb-2">
                  Internship Details
                </label>
                <textarea
                  id="internshipDetails"
                  name="internshipDetails"
                  rows={4}
                  value={formData.internshipDetails}
                  onChange={handleChange}
                  placeholder="Describe the internship opportunity, what students will learn, and what they'll work on..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  style={{ color: '#000000' }}
                />
              </div>

              <div>
                <label htmlFor="newGradDetails" className="block text-sm font-medium text-gray-700 mb-2">
                  New Graduate Position Details
                </label>
                <textarea
                  id="newGradDetails"
                  name="newGradDetails"
                  rows={4}
                  value={formData.newGradDetails}
                  onChange={handleChange}
                  placeholder="Describe the new graduate position, responsibilities, and growth opportunities..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  style={{ color: '#000000' }}
                />
              </div>
            </div>
          </div>

          <div className="card-gradient p-6">
            <h2 className="text-xl font-semibold mb-4" style={{ color: '#000000' }}>Candidate & Appeal</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="idealCandidate" className="block text-sm font-medium text-gray-700 mb-2">
                  Ideal Candidate
                </label>
                <textarea
                  id="idealCandidate"
                  name="idealCandidate"
                  rows={3}
                  value={formData.idealCandidate}
                  onChange={handleChange}
                  placeholder="Describe the skills, experience, and qualities you're looking for..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  style={{ color: '#000000' }}
                />
              </div>

              <div>
                <label htmlFor="sellingPoints" className="block text-sm font-medium text-gray-700 mb-2">
                  Selling Points / Why Work Here
                </label>
                <textarea
                  id="sellingPoints"
                  name="sellingPoints"
                  rows={3}
                  value={formData.sellingPoints}
                  onChange={handleChange}
                  placeholder="What makes your company a great place to work? What are the benefits and opportunities?"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  style={{ color: '#000000' }}
                />
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <p className="text-sm text-gray-700">
              <strong>Note:</strong> Students can work up to 28 hours/week during term, 
              up to 40 hours/week during long breaks.
            </p>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={saving}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "Saving..." : "Save Company Page"}
            </button>
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

