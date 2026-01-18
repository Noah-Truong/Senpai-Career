"use client";

import { useSession } from "@/contexts/AuthContext";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import CompanyLogo from "@/components/CompanyLogo";
import Link from "next/link";

export default function RecruitingDetailPage() {
  const { t } = useLanguage();
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const listingId = params.id as string;
  
  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [applying, setApplying] = useState(false);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [applicationAnswers, setApplicationAnswers] = useState<{ [key: number]: string }>({});
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [hasApplied, setHasApplied] = useState(false);

  useEffect(() => {
    if (listingId) {
      loadListing();
      checkApplicationStatus();
    }
  }, [listingId]);

  const loadListing = async () => {
    try {
      const response = await fetch(`/api/internships/${listingId}`);
      if (!response.ok) {
        throw new Error("Failed to load listing");
      }
      const data = await response.json();
      setListing(data.internship);
    } catch (err: any) {
      setError(err.message || "Failed to load listing");
    } finally {
      setLoading(false);
    }
  };

  const checkApplicationStatus = async () => {
    if (!session?.user) return;
    
    try {
      const response = await fetch("/api/applications");
      if (response.ok) {
        const data = await response.json();
        const userApplication = data.applications?.find((app: any) => app.listingId === listingId);
        setHasApplied(!!userApplication);
      }
    } catch (error) {
      console.error("Error checking application status:", error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setResumeFile(e.target.files[0]);
    }
  };

  const handleSubmitApplication = async () => {
    if (!session?.user) {
      router.push("/login");
      return;
    }

    setApplying(true);
    try {
      let resumeUrl = "";
      if (resumeFile) {
        const formData = new FormData();
        formData.append("file", resumeFile);
        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json();
          resumeUrl = uploadData.url;
        }
      }

      const questions = listing?.applicationQuestions || [];
      const answers = questions.map((q: string, idx: number) => ({
        question: q,
        answer: applicationAnswers[idx] || "",
      }));

      const response = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId,
          answers,
          resumeUrl,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to submit application");
      }

      setHasApplied(true);
      setShowApplicationForm(false);
      alert(t("application.success") || "Application submitted successfully!");
    } catch (err: any) {
      alert(err.message || "Failed to submit application");
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p>{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-red-600">{error || "Listing not found"}</p>
          <Link href="/recruiting" className="btn-primary mt-4 inline-block">
            {t("button.backToListings") || "Back to Listings"}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/recruiting" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
          ← {t("button.backToListings") || "Back to Listings"}
        </Link>

        <div className="card-gradient p-6 mb-6">
          <div className="flex items-start mb-6">
            <CompanyLogo
              src={listing.companyLogo}
              alt={listing.companyName}
              size="lg"
              className="mr-4"
            />
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">
                {listing.titleKey ? t(listing.titleKey) : listing.title}
              </h1>
              <p className="text-lg text-gray-600">{listing.companyName}</p>
            </div>
          </div>
        </div>

        <div className="card-gradient p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">{t("listing.workDetails") || "Work Details"}</h2>
          <p className="text-gray-700 whitespace-pre-line">
            {listing.workDetailsKey ? t(listing.workDetailsKey) : listing.workDetails || listing.newGradDetails}
          </p>
        </div>

        {listing.skillsGained && listing.skillsGained.length > 0 && (
          <div className="card-gradient p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">{t("listing.skillsGained") || "Skills Gained"}</h2>
            <div className="flex flex-wrap gap-2">
              {listing.skillsGained.map((skill: string, idx: number) => (
                <span key={idx} className="px-3 py-1 bg-gray-100 rounded text-sm">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {listing.whyThisCompany && (
          <div className="card-gradient p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">{t("listing.whyThisCompany") || "Why This Company"}</h2>
            <p className="text-gray-700">
              {listing.whyThisCompanyKey ? t(listing.whyThisCompanyKey) : listing.whyThisCompany}
            </p>
          </div>
        )}

        {session?.user && session.user.role !== "company" && (
          <div className="card-gradient p-6">
            {hasApplied ? (
              <div className="text-center">
                <p className="text-green-600 font-semibold mb-4">
                  {t("application.alreadyApplied") || "You have already applied to this position."}
                </p>
                <Link href="/messages" className="btn-primary">
                  {t("button.viewMessages") || "View Messages"}
                </Link>
              </div>
            ) : (
              <>
                {!showApplicationForm ? (
                  <button
                    onClick={() => setShowApplicationForm(true)}
                    className="btn-primary w-full"
                  >
                    {t("button.apply") || "Apply Now"}
                  </button>
                ) : (
                  <div>
                    <h2 className="text-xl font-semibold mb-4">{t("application.title") || "Application Form"}</h2>
                    
                    {(listing.applicationQuestions || []).map((question: string, idx: number) => (
                      <div key={idx} className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {question}
                        </label>
                        <textarea
                          value={applicationAnswers[idx] || ""}
                          onChange={(e) => setApplicationAnswers({ ...applicationAnswers, [idx]: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          rows={4}
                          required
                        />
                      </div>
                    ))}

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t("application.resume") || "Resume (Optional)"}
                      </label>
                      <input
                        type="file"
                        onChange={handleFileChange}
                        accept=".pdf,.doc,.docx"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={handleSubmitApplication}
                        disabled={applying}
                        className="btn-primary flex-1"
                      >
                        {applying ? t("common.submitting") || "Submitting..." : t("button.submit") || "Submit Application"}
                      </button>
                      <button
                        onClick={() => setShowApplicationForm(false)}
                        className="btn-secondary"
                      >
                        {t("button.cancel") || "Cancel"}
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

