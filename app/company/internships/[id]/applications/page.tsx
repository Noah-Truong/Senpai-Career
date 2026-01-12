"use client";

import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
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

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated" && session?.user?.role !== "company") {
      router.push("/dashboard");
      return;
    }

    if (status === "authenticated" && listingId) {
      loadData();
    }
  }, [status, session, router, listingId]);

  const loadData = async () => {
    try {
      // Load listing
      const listingResponse = await fetch(`/api/internships/${listingId}`);
      if (listingResponse.ok) {
        const listingData = await listingResponse.json();
        setListing(listingData.internship);
      }

      // Load applications
      const appsResponse = await fetch(`/api/applications?listingId=${listingId}`);
      if (appsResponse.ok) {
        const appsData = await appsResponse.json();
        setApplications(appsData.applications || []);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMessageApplicant = (applicantId: string) => {
    router.push(`/messages/new?userId=${applicantId}`);
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p>{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/company/internships" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
          ← {t("button.backToListings") || "Back to Listings"}
        </Link>

        <h1 className="text-3xl font-bold mb-6">
          {t("applications.title") || "Applications"}
          {listing && (
            <span className="text-lg font-normal text-gray-600 ml-2">
              - {listing.titleKey ? t(listing.titleKey) : listing.title}
            </span>
          )}
        </h1>

        {applications.length === 0 ? (
          <div className="card-gradient p-8 text-center">
            <p className="text-gray-700 text-lg mb-4">
              {t("applications.empty") || "No applications yet for this listing."}
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {applications.map((application) => (
              <div
                key={application.id}
                className="card-gradient p-6 hover:shadow-xl transition-all duration-300 cursor-pointer"
                onClick={() => setSelectedApplication(application)}
              >
                <div className="flex items-start mb-4">
                  <Avatar
                    src={application.applicant?.profilePhoto}
                    alt={application.applicant?.name || "Applicant"}
                    size="md"
                    fallbackText={application.applicant?.name}
                    className="mr-4"
                  />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-1">
                      {application.applicant?.name || "Unknown Applicant"}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {application.applicant?.email}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Applied: {new Date(application.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-semibold rounded ${
                    application.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                    application.status === "accepted" ? "bg-green-100 text-green-800" :
                    application.status === "rejected" ? "bg-red-100 text-red-800" :
                    "bg-gray-100 text-gray-800"
                  }`}>
                    {application.status}
                  </span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMessageApplicant(application.applicantId);
                  }}
                  className="btn-primary w-full mt-4"
                >
                  {t("button.messageApplicant") || "Message Applicant"}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Application Detail Modal */}
        {selectedApplication && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">
                    {selectedApplication.applicant?.name || "Application Details"}
                  </h2>
                  <button
                    onClick={() => setSelectedApplication(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>

                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">{t("applications.applicantInfo") || "Applicant Information"}</h3>
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
                    <h3 className="text-lg font-semibold mb-2">{t("applications.resume") || "Resume"}</h3>
                    <a
                      href={selectedApplication.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline"
                    >
                      {t("button.viewResume") || "View Resume"}
                    </a>
                  </div>
                )}

                {selectedApplication.answers && selectedApplication.answers.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-2">{t("applications.answers") || "Application Answers"}</h3>
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

                <div className="flex gap-2">
                  <button
                    onClick={() => handleMessageApplicant(selectedApplication.applicantId)}
                    className="btn-primary flex-1"
                  >
                    {t("button.messageApplicant") || "Message Applicant"}
                  </button>
                  <button
                    onClick={() => setSelectedApplication(null)}
                    className="btn-secondary"
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

