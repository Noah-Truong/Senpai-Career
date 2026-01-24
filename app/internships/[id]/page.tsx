"use client";

import { useSession } from "@/contexts/AuthContext";
import { useRouter, useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslated } from "@/lib/translation-helpers";
import CompanyLogo from "@/components/CompanyLogo";
import Link from "next/link";
import SaveButton from "@/components/SaveButton";

export default function InternshipDetailPage() {
  const { t, language } = useLanguage();
  const { translate } = useTranslated();
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

  // Memoize translated content for faster rendering
  const workDetails = useMemo(() => {
    if (!listing) return "";
    if (listing.workDetailsKey) {
      return t(listing.workDetailsKey);
    }
    // Check if workDetails is a multilingual object
    if (typeof listing.workDetails === "object" && listing.workDetails !== null) {
      return translate(listing.workDetails);
    }
    return listing.workDetails || "";
  }, [listing, t, translate]);

  const whyThisCompany = useMemo(() => {
    if (!listing) return "";
    if (listing.whyThisCompanyKey) {
      return t(listing.whyThisCompanyKey);
    }
    if (typeof listing.whyThisCompany === "object" && listing.whyThisCompany !== null) {
      return translate(listing.whyThisCompany);
    }
    return listing.whyThisCompany || "";
  }, [listing, t, translate]);

  const title = useMemo(() => {
    if (!listing) return "";
    return listing.titleKey ? t(listing.titleKey) : listing.title || "";
  }, [listing, t]);

  const loadListing = useCallback(async () => {
    if (!listingId) return;
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
  }, [listingId]);

  const checkApplicationStatus = useCallback(async () => {
    if (!session?.user || !listingId) return;
    
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
  }, [session?.user, listingId]);

  useEffect(() => {
    if (listingId) {
      loadListing();
      checkApplicationStatus();
    }
  }, [listingId, loadListing, checkApplicationStatus]);

  // Record browsing history (students only)
  useEffect(() => {
    if (listing && session?.user?.role === "student" && listingId) {
      fetch("/api/browsing-history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemType: "recruitment", itemId: listingId }),
      }).catch(console.error);
    }
  }, [listing, listingId, session?.user?.role]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setResumeFile(e.target.files[0]);
    }
  }, []);

  const handleSubmitApplication = useCallback(async () => {
    if (!session?.user) {
      router.push("/login");
      return;
    }

    setApplying(true);
    try {
      // Upload resume if provided
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

      // Prepare answers
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
  }, [session?.user, router, resumeFile, listing, applicationAnswers, listingId, t]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="card-gradient p-6 mb-6">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
            <div className="card-gradient p-6 mb-6">
              <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-red-600">{error || "Listing not found"}</p>
          <Link href="/internships" className="btn-primary mt-4 inline-block">
            {t("button.backToListings") || "Back to Listings"}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/internships" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
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
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl font-bold mb-2">
                    {title}
                  </h1>
                  <p className="text-lg text-gray-600">{listing.companyName}</p>
                  <p className="text-xl font-semibold text-gray-900 mt-2">
                    {listing.compensationType === "hourly" && `${t("compensation.hourly")}: ¥${listing.hourlyWage?.toLocaleString()}/hr`}
                    {listing.compensationType === "fixed" && `${t("compensation.fixed")}: ¥${listing.fixedSalary?.toLocaleString()}/year`}
                    {listing.compensationType === "other" && `${t("compensation.other")}: ${listing.otherCompensation}`}
                  </p>
                </div>
                {session?.user?.role === "student" && (
                  <SaveButton itemType="recruitment" itemId={listingId} />
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="card-gradient p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">{t("listing.workDetails") || "Work Details"}</h2>
          <p className="text-gray-700 whitespace-pre-line">
            {workDetails}
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

        {whyThisCompany && (
          <div className="card-gradient p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">{t("listing.whyThisCompany") || "Why This Company"}</h2>
            <p className="text-gray-700">
              {whyThisCompany}
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

