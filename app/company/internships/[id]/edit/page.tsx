"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import { useLanguage } from "@/contexts/LanguageContext";

export default function EditInternshipPage({ params }: { params: { id: string } }) {
  const { t } = useLanguage();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    type: "internship" as "internship" | "new-grad",
    title: "",
    hourlyWage: "",
    workDetails: "",
    skillsGained: "",
    whyThisCompany: "",
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

    if (status === "authenticated") {
      loadInternship();
    }
  }, [status, session, router, params.id]);

  const loadInternship = async () => {
    try {
      const response = await fetch(`/api/internships/${params.id}`);
      if (!response.ok) {
        throw new Error("Failed to load internship listing");
      }
      const data = await response.json();
      const internship = data.internship;

      // Check if this company owns this listing
      if (internship.companyId !== session?.user?.id) {
        router.push("/company/internships");
        return;
      }

      setFormData({
        type: internship.type,
        title: internship.title || "",
        hourlyWage: internship.hourlyWage?.toString() || "",
        workDetails: internship.workDetails || "",
        skillsGained: internship.skillsGained?.join(", ") || "",
        whyThisCompany: internship.whyThisCompany || "",
      });
    } catch (err: any) {
      console.error("Error loading internship:", err);
      setError(err.message || "Failed to load internship listing");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setSaving(true);

    try {
      // Parse skillsGained (comma-separated)
      const skillsGained = formData.skillsGained
        .split(",")
        .map(s => s.trim())
        .filter(s => s.length > 0);

      const response = await fetch(`/api/internships/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: formData.title,
          hourlyWage: parseFloat(formData.hourlyWage),
          workDetails: formData.workDetails,
          skillsGained,
          whyThisCompany: formData.whyThisCompany,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update internship listing");
      }

      setSuccess(true);
      // Keep loading animation until redirect
      setTimeout(() => {
        router.push("/company/internships");
      }, 1500);
      // Don't set saving to false - keep animation until redirect
    } catch (err: any) {
      setError(err.message || "Failed to update internship listing");
      setSaving(false); // Only stop loading on error
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#000000' }}>
            Edit Listing
          </h1>
          <p className="text-gray-600">
            Update your internship or new graduate position listing.
          </p>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
            Listing updated successfully! Redirecting...
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="card-gradient p-6">
            <h2 className="text-xl font-semibold mb-4" style={{ color: '#000000' }}>Listing Type</h2>
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                Type *
              </label>
              <select
                id="type"
                name="type"
                required
                value={formData.type}
                onChange={handleChange}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
                style={{ color: '#000000' }}
              >
                <option value="internship">Internship</option>
                <option value="new-grad">New Graduate Position</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">Type cannot be changed after creation</p>
            </div>
          </div>

          <div className="card-gradient p-6">
            <h2 className="text-xl font-semibold mb-4" style={{ color: '#000000' }}>Basic Information</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Position Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g., Software Engineering Intern"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  style={{ color: '#000000' }}
                />
              </div>

              <div>
                <label htmlFor="hourlyWage" className="block text-sm font-medium text-gray-700 mb-2">
                  Hourly Wage (¥) *
                </label>
                <input
                  type="number"
                  id="hourlyWage"
                  name="hourlyWage"
                  required
                  min="0"
                  step="1"
                  value={formData.hourlyWage}
                  onChange={handleChange}
                  placeholder="1500"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  style={{ color: '#000000' }}
                />
              </div>
            </div>
          </div>

          <div className="card-gradient p-6">
            <h2 className="text-xl font-semibold mb-4" style={{ color: '#000000' }}>Position Details</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="workDetails" className="block text-sm font-medium text-gray-700 mb-2">
                  Work Details / Description *
                </label>
                <textarea
                  id="workDetails"
                  name="workDetails"
                  required
                  rows={5}
                  value={formData.workDetails}
                  onChange={handleChange}
                  placeholder="Describe what the intern/employee will work on, responsibilities, and day-to-day tasks..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  style={{ color: '#000000' }}
                />
              </div>

              <div>
                <label htmlFor="skillsGained" className="block text-sm font-medium text-gray-700 mb-2">
                  Skills Gained (comma-separated)
                </label>
                <input
                  type="text"
                  id="skillsGained"
                  name="skillsGained"
                  value={formData.skillsGained}
                  onChange={handleChange}
                  placeholder="Programming, Design, Communication, etc."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  style={{ color: '#000000' }}
                />
                <p className="text-xs text-gray-500 mt-1">Separate multiple skills with commas</p>
              </div>

              <div>
                <label htmlFor="whyThisCompany" className="block text-sm font-medium text-gray-700 mb-2">
                  Why This Company / What Makes It Special
                </label>
                <textarea
                  id="whyThisCompany"
                  name="whyThisCompany"
                  rows={4}
                  value={formData.whyThisCompany}
                  onChange={handleChange}
                  placeholder="What makes your company a great place to work? What opportunities for growth do you offer?"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  style={{ color: '#000000' }}
                />
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={saving}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Saving...</span>
                </>
              ) : (
                "Save Changes"
              )}
            </button>
            <button
              type="button"
              onClick={() => router.push("/company/internships")}
              className="btn-secondary"
              disabled={saving}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

