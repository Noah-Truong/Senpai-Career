"use client";

import { useSession } from "@/contexts/AuthContext";
import { useRouter, useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslated } from "@/lib/translation-helpers";
import Link from "next/link";
import Avatar from "@/components/Avatar";

export default function ApplicationsPage() {
  const { t } = useLanguage();
  const { translate } = useTranslated();
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const listingId = params.id as string;
  
  const [applications, setApplications] = useState<any[]>([]);
  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<any>(null);

  const loadData = useCallback(async () => {
    try {
      // Load listing
      const listingResponse = await fetch(`/api/internships/${listingId}`);
      if (listingResponse.ok) {
        const contentType = listingResponse.headers.get("content-type");
        const isJson = contentType && contentType.includes("application/json");
        
        if (isJson) {
          try {
            const text = await listingResponse.text();
            const trimmedText = text.trim();
            
            if (trimmedText.startsWith("{") || trimmedText.startsWith("[")) {
              const listingData = JSON.parse(text);
              setListing(listingData.internship);
            }
          } catch (jsonError) {
            console.error("Failed to parse listing JSON:", jsonError);
          }
        }
      }

      // Load applications
      const appsResponse = await fetch(`/api/applications?listingId=${listingId}`);
      if (appsResponse.ok) {
        const contentType = appsResponse.headers.get("content-type");
        const isJson = contentType && contentType.includes("application/json");
        
        if (isJson) {
          try {
            const text = await appsResponse.text();
            const trimmedText = text.trim();
            
            if (trimmedText.startsWith("{") || trimmedText.startsWith("[")) {
              const appsData = JSON.parse(text);
              setApplications(appsData.applications || []);
            }
          } catch (jsonError) {
            console.error("Failed to parse applications JSON:", jsonError);
          }
        }
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  }, [listingId]);

  // Use stable reference for user role
  const userRole = session?.user?.role;

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated" && userRole !== "company") {
      router.push("/dashboard");
      return;
    }

    if (status === "authenticated" && listingId) {
      loadData();
    }
  }, [status, userRole, router, listingId, loadData]);

  const handleMessageApplicant = useCallback(
    (applicantId: string) => {
      router.push(`/messages/new?userId=${applicantId}`);
    },
    [router]
  );

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          <p className="text-base sm:text-lg">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <Link
          href="/company/internships"
          className="inline-flex items-center min-h-[44px] py-2 -mt-1 mb-4 text-blue-600 hover:text-blue-800 active:opacity-80"
        >
          ← {t("button.backToListings") || "Back to Listings"}
        </Link>

        <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">
          <span className="block sm:inline">{t("applications.title") || "Applications"}</span>
          {listing && (
            <span className="block sm:inline mt-1 sm:mt-0 sm:ml-2 text-lg font-normal text-gray-600">
              — {listing.titleKey ? t(listing.titleKey) : listing.title}
            </span>
          )}
        </h1>

        {applications.length === 0 ? (
          <div className="card-gradient p-6 sm:p-8 text-center">
            <p className="text-gray-700 text-base sm:text-lg mb-4">
              {t("applications.empty") || "No applications yet for this listing."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {applications.map((application) => (
              <div
                key={application.id}
                className="card-gradient p-4 sm:p-6 hover:shadow-xl transition-all duration-300 cursor-pointer"
                onClick={() => setSelectedApplication(application)}
              >
                <div className="flex flex-wrap items-start gap-2 sm:gap-0 mb-4">
                  <Avatar
                    src={application.applicant?.profilePhoto}
                    alt={application.applicant?.name || "Applicant"}
                    size="md"
                    fallbackText={application.applicant?.name}
                    className="mr-4 sm:mr-6 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg font-semibold mb-1 truncate">
                      {application.applicant?.name || t("applications.unknownApplicant")}
                    </h3>
                    <p className="text-sm text-gray-600 truncate">
                      {application.applicant?.email}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {t("applications.applied")}: {new Date(application.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`shrink-0 px-2 py-1 text-xs font-semibold rounded ${
                    application.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                    application.status === "accepted" ? "bg-green-100 text-green-800" :
                    application.status === "rejected" ? "bg-red-100 text-red-800" :
                    "bg-gray-100 text-gray-800"
                  }`}>
                    {application.status === "pending" ? t("applications.status.pending") :
                     application.status === "accepted" ? t("applications.status.accepted") :
                     application.status === "rejected" ? t("applications.status.rejected") :
                     application.status}
                  </span>
                </div>
                <div className="space-y-2 mt-4">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedApplication(application);
                    }}
                    className="w-full min-h-[44px] py-3 px-4 rounded-md border transition-all duration-300 text-base active:opacity-80"
                    style={{
                      backgroundColor: "#FFFFFF",
                      color: "#1e3a8a",
                      borderColor: "#1e3a8a",
                    }}
                  >
                    {t("applications.viewApplication") || "View Application"}
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMessageApplicant(application.applicantId);
                    }}
                    className="btn-primary w-full min-h-[44px] py-3 active:opacity-90"
                  >
                    {t("button.messageApplicant") || "Message Applicant"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Application Detail Modal */}
        {selectedApplication && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
            <div className="bg-white rounded-t-2xl sm:rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto overscroll-contain">
              <div className="p-4 sm:p-6 pb-[env(safe-area-inset-bottom)]">
                <div className="flex items-start justify-between gap-4 mb-6">
                  <h2 className="text-xl sm:text-2xl font-bold truncate pr-2">
                    {selectedApplication.applicant?.name || t("applications.applicantInfo")}
                  </h2>
                  <button
                    type="button"
                    onClick={() => setSelectedApplication(null)}
                    className="shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center -m-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full active:opacity-80"
                    aria-label="Close"
                  >
                    ✕
                  </button>
                </div>

                <div className="mb-6">
                  <h3 className="text-base sm:text-lg font-semibold mb-2">{t("applications.applicantInfo") || "Applicant Information"}</h3>
                  <div className="space-y-2">
                    <p><strong>{t("label.name") || "Name"}:</strong> {selectedApplication.applicant?.name}</p>
                    <p><strong>{t("label.email") || "Email"}:</strong> {selectedApplication.applicant?.email}</p>
                    {selectedApplication.applicant?.university && (
                      <p><strong>{t("label.university") || "University"}:</strong> {selectedApplication.applicant.university}</p>
                    )}
                    {selectedApplication.applicant?.skills && selectedApplication.applicant.skills.length > 0 && (
                      <div>
                        <strong>{t("label.skills") || "Skills"}:</strong>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {selectedApplication.applicant.skills.map((skill: string, idx: number) => (
                            <span key={idx} className="px-2 py-1 bg-gray-100 rounded text-xs">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {selectedApplication.resumeUrl && (
                  <div className="mb-6">
                    <h3 className="text-base sm:text-lg font-semibold mb-2">{t("applications.resume") || "Resume"}</h3>
                    <a
                      href={selectedApplication.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center min-h-[44px] text-blue-600 hover:text-blue-800 underline active:opacity-80"
                    >
                      {t("button.viewResume") || "View Resume"}
                    </a>
                  </div>
                )}

                {selectedApplication.answers && selectedApplication.answers.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-base sm:text-lg font-semibold mb-2">{t("applications.answers") || "Application Answers"}</h3>
                    <div className="space-y-4">
                      {selectedApplication.answers.map((answer: any, idx: number) => (
                        <div key={idx} className="border-l-4 border-blue-500 pl-4">
                          <p className="font-semibold mb-1">{answer.question}</p>
                          <p className="text-gray-700 whitespace-pre-line">{translate(answer.answer)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => handleMessageApplicant(selectedApplication.applicantId)}
                    className="btn-primary flex-1 min-h-[44px] py-3 order-2 sm:order-1 active:opacity-90"
                  >
                    {t("button.messageApplicant") || "Message Applicant"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedApplication(null)}
                    className="btn-secondary min-h-[44px] py-3 order-1 sm:order-2 active:opacity-80"
                  >
                    {t("button.close") || "Close"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

