"use client";

import { useSession } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import Header from "@/components/Header";

interface InternshipListing {
  id: string;
  companyId: string;
  title: string;
  hourlyWage: number;
  workDetails: string;
  skillsGained: string[];
  whyThisCompany: string;
  companyLogo?: string;
  type: "internship" | "new-grad";
  createdAt: string;
}

export default function CompanyInternshipsPage() {
  const { t } = useLanguage();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [internships, setInternships] = useState<InternshipListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
      loadInternships();
    }
  }, [status, session, router]);

  const loadInternships = async () => {
    try {
      // Companies should see all their listings including stopped ones
      const response = await fetch("/api/internships");
      if (response.ok) {
        // Check if response is JSON before parsing
        const contentType = response.headers.get("content-type");
        const isJson = contentType && contentType.includes("application/json");
        
        if (isJson) {
          try {
            const text = await response.text();
            const trimmedText = text.trim();
            
            if (trimmedText.startsWith("{") || trimmedText.startsWith("[")) {
              const data = JSON.parse(text);
              // Filter to show only this company's internships
              // Companies see all their listings (including stopped)
              const companyInternships = (data.internships || []).filter(
                (i: InternshipListing) => i.companyId === session?.user?.id
              );
              setInternships(companyInternships);
            } else {
              console.warn("Internships API returned non-JSON response");
              setError("Failed to load internships");
            }
          } catch (jsonError) {
            console.error("Failed to parse internships JSON:", jsonError);
            setError("Failed to load internships");
          }
        } else {
          console.warn("Internships API returned non-JSON content type");
          setError("Failed to load internships");
        }
      } else {
        throw new Error("Failed to load internships");
      }
    } catch (err: any) {
      console.error("Error loading internships:", err);
      setError(err.message || "Failed to load internships");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this listing?")) {
      return;
    }

    try {
      const response = await fetch(`/api/internships/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete listing");
      }

      // Reload internships
      loadInternships();
    } catch (err: any) {
      alert(err.message || "Failed to delete listing");
    }
  };

  const handleStatusChange = async (id: string, newStatus: "public" | "stopped") => {
    try {
      const response = await fetch(`/api/internships/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      // Reload internships
      loadInternships();
    } catch (err: any) {
      alert(err.message || "Failed to update status");
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2" style={{ color: '#000000' }}>
              My Internship Listings
            </h1>
            <p className="text-gray-600">
              Manage your internship and new graduate position listings.
            </p>
          </div>
          <Link href="/company/internships/new" className="btn-primary">
            Post New Listing
          </Link>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {internships.length === 0 ? (
          <div className="card-gradient p-8 text-center">
            <p className="text-gray-700 text-lg mb-4">You haven't posted any listings yet.</p>
            <p className="text-gray-600 mb-6">
              Create your first internship or new graduate position listing to start attracting students.
            </p>
            <Link href="/company/internships/new" className="btn-primary inline-block">
              Post Your First Listing
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {internships.map((internship: any) => (
              <div
                key={internship.id}
                className="card-gradient p-6 hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold">
                        {(internship as any).titleKey ? t((internship as any).titleKey) : internship.title}
                      </h3>
                      {(internship as any).status === "stopped" && (
                        <span className="px-2 py-1 text-xs font-semibold rounded bg-gray-200 text-gray-700">
                          Stopped
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <span
                        className="inline-block px-2 py-1 text-xs font-semibold rounded"
                        style={{ backgroundColor: '#D7FFEF', color: '#0F2A44' }}
                      >
                        {internship.type === "internship" ? "Internship" : "New Graduate"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm font-semibold text-gray-900 mb-1">
                    {internship.compensationType === "hourly" && `${t("compensation.hourly")}: ¥${internship.hourlyWage?.toLocaleString()}`}
                    {internship.compensationType === "fixed" && `${t("compensation.fixed")}: ¥${internship.fixedSalary?.toLocaleString()}`}
                    {internship.compensationType === "other" && `${t("compensation.other")}: ${(internship as any).otherCompensation}`}
                  </p>
                  <p className="text-sm text-gray-700 line-clamp-2">
                    {(internship as any).workDetailsKey ? t((internship as any).workDetailsKey) : internship.workDetails}
                  </p>
                </div>

                {(((internship as any).skillsGainedKeys && (internship as any).skillsGainedKeys.length > 0) || (internship.skillsGained && internship.skillsGained.length > 0)) && (
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-2">
                      {((internship as any).skillsGainedKeys || internship.skillsGained).slice(0, 3).map((skillKeyOrSkill: string, idx: number) => (
                        <span key={idx} className="px-2 py-1 bg-gray-100 rounded text-xs">
                          {(internship as any).skillsGainedKeys ? t(skillKeyOrSkill) : skillKeyOrSkill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="text-sm text-gray-600 mb-4">
                  <p className="line-clamp-2">
                    {(internship as any).whyThisCompanyKey ? t((internship as any).whyThisCompanyKey) : internship.whyThisCompany}
                  </p>
                </div>

                <div className="flex gap-2 mt-4">
                  <Link
                    href={`/company/internships/${internship.id}/applications`}
                    className="btn-primary flex-1 text-center"
                  >
                    View Applications
                  </Link>
                  <Link
                    href={`/company/internships/${internship.id}/edit`}
                    className="btn-secondary flex-1 text-center"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(internship.id)}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

