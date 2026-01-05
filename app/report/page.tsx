"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { useLanguage } from "@/contexts/LanguageContext";
import Link from "next/link";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function ReportPage() {
  const { t } = useLanguage();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [reportType, setReportType] = useState<"user" | "platform" | "safety" | "other">("user");
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    // Only students and obog can access this page
    if (status === "authenticated") {
      const role = session?.user?.role;
      if (role !== "student" && role !== "obog") {
        router.push("/dashboard");
        return;
      }
    }
  }, [status, session, router]);

  useEffect(() => {
    if (reportType === "user") {
      loadUsers();
    }
  }, [reportType]);

  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const response = await fetch("/api/users");
      if (response.ok) {
        const data = await response.json();
        // Filter out current user and admins
        const filteredUsers = (data.users || []).filter(
          (u: User) => u.id !== session?.user?.id && u.role !== "admin"
        );
        setUsers(filteredUsers);
      }
    } catch (error) {
      console.error("Error loading users:", error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    // Validate
    if (!reason || !description.trim()) {
      setError(t("report.error.required") || "Please provide a reason and description");
      setSubmitting(false);
      return;
    }

    if (reportType === "user" && !selectedUserId) {
      setError(t("report.error.selectUser") || "Please select a user to report");
      setSubmitting(false);
      return;
    }

    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reportedUserId: reportType === "user" ? selectedUserId : "PLATFORM",
          reportType,
          reason,
          description: description.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t("report.error.submit") || "Failed to submit report");
      }

      setSuccess(true);
      // Reset form
      setReportType("user");
      setReason("");
      setDescription("");
      setSelectedUserId("");
      setSearchTerm("");
    } catch (err: any) {
      setError(err.message || t("report.error.submit") || "Failed to submit report");
    } finally {
      setSubmitting(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-gray-600">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const reportTypes = [
    {
      value: "user",
      label: t("report.type.user") || "Report a User",
      description: t("report.type.userDesc") || "Report inappropriate behavior, harassment, or rule violations by another user",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
    {
      value: "safety",
      label: t("report.type.safety") || "Safety Concern",
      description: t("report.type.safetyDesc") || "Report a safety issue or emergency situation",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
    },
    {
      value: "platform",
      label: t("report.type.platform") || "Platform Issue",
      description: t("report.type.platformDesc") || "Report a bug, technical issue, or problem with the platform",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      value: "other",
      label: t("report.type.other") || "Other",
      description: t("report.type.otherDesc") || "Report something else not covered by the above categories",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Header />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t("report.page.title") || "Submit a Report"}
          </h1>
          <p className="text-gray-600">
            {t("report.page.subtitle") || "Help us maintain a safe and positive community by reporting any issues"}
          </p>
        </div>

        {success ? (
          <div className="card-gradient p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {t("report.success.title") || "Report Submitted Successfully"}
            </h2>
            <p className="text-gray-600 mb-6">
              {t("report.success.message") || "Thank you for your report. Our team will review it and take appropriate action."}
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => setSuccess(false)}
                className="btn-primary"
              >
                {t("report.success.submitAnother") || "Submit Another Report"}
              </button>
              <Link href="/dashboard" className="btn-secondary">
                {t("report.success.backToDashboard") || "Back to Dashboard"}
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* Step 1: Report Type Selection */}
            <div className="card-gradient p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-600">
                {t("report.step1.title") || "Step 1: What would you like to report?"}
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {reportTypes.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setReportType(type.value as any)}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      reportType === type.value
                        ? "border-pink-500 bg-pink-50"
                        : "border-gray-200 hover:border-gray-300 bg-white"
                    }`}
                  >
                    <div className={`mb-2 ${reportType === type.value ? "text-pink-600" : "text-gray-600"}`}>
                      {type.icon}
                    </div>
                    <h3 className={`font-semibold mb-1 ${reportType === type.value ? "text-pink-700" : "text-gray-900"}`}>
                      {type.label}
                    </h3>
                    <p className="text-sm text-gray-600">{type.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: User Selection (if reporting a user) */}
            {reportType === "user" && (
              <div className="card-gradient p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-600">
                  {t("report.step2.title") || "Step 2: Select the user"}
                </h2>
                <div className="mb-4">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={t("report.step2.searchPlaceholder") || "Search by name or email..."}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    style={{ color: '#000000' }}
                  />
                </div>
                {loadingUsers ? (
                  <p className="text-center py-4 text-gray-500">{t("common.loading")}</p>
                ) : (
                  <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
                    {filteredUsers.length === 0 ? (
                      <p className="text-center py-4 text-gray-500">
                        {t("report.step2.noUsers") || "No users found"}
                      </p>
                    ) : (
                      filteredUsers.map((user) => (
                        <button
                          key={user.id}
                          type="button"
                          onClick={() => setSelectedUserId(user.id)}
                          className={`w-full px-4 py-3 flex items-center justify-between border-b border-gray-100 last:border-b-0 transition-colors ${
                            selectedUserId === user.id
                              ? "bg-pink-50"
                              : "hover:bg-gray-50"
                          }`}
                        >
                          <div className="text-left">
                            <p className={`font-medium ${selectedUserId === user.id ? "text-pink-700" : "text-gray-900"}`}>
                              {user.name}
                            </p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs px-2 py-1 rounded ${
                              user.role === "student" ? "bg-blue-100 text-blue-700" :
                              user.role === "obog" ? "bg-purple-100 text-purple-700" :
                              "bg-green-100 text-green-700"
                            }`}>
                              {user.role === "student" ? t("role.student") :
                               user.role === "obog" ? t("role.obog") :
                               t("role.company")}
                            </span>
                            {selectedUserId === user.id && (
                              <svg className="w-5 h-5 text-pink-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Report Details */}
            <div className="card-gradient p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-600">
                {reportType === "user"
                  ? (t("report.step3.title") || "Step 3: Provide details")
                  : (t("report.step2.titleAlt") || "Step 2: Provide details")}
              </h2>

              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2 text-gray-600">
                  {t("report.reason.label") || "Reason"} <span className="text-red-500">*</span>
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  style={{ color: '#000000' }}
                  required
                >
                  <option value="">{t("report.reason.select") || "Select a reason"}</option>
                  {reportType === "user" ? (
                    <>
                      <option value="inappropriate-behavior">{t("report.reason.inappropriate") || "Inappropriate Behavior"}</option>
                      <option value="harassment">{t("report.reason.harassment") || "Harassment"}</option>
                      <option value="spam">{t("report.reason.spam") || "Spam"}</option>
                      <option value="fake-profile">{t("report.reason.fakeProfile") || "Fake Profile"}</option>
                      <option value="violation-of-terms">{t("report.reason.violation") || "Violation of Terms"}</option>
                      <option value="no-show">{t("report.reason.noShow") || "No-show / Ghosting"}</option>
                      <option value="solicitation">{t("report.reason.solicitation") || "Inappropriate Solicitation"}</option>
                      <option value="other">{t("report.reason.other") || "Other"}</option>
                    </>
                  ) : reportType === "safety" ? (
                    <>
                      <option value="physical-threat">{t("report.reason.physicalThreat") || "Physical Threat"}</option>
                      <option value="unwanted-contact">{t("report.reason.unwantedContact") || "Unwanted Contact Outside Platform"}</option>
                      <option value="stalking">{t("report.reason.stalking") || "Stalking"}</option>
                      <option value="other">{t("report.reason.other") || "Other Safety Concern"}</option>
                    </>
                  ) : reportType === "platform" ? (
                    <>
                      <option value="bug">{t("report.reason.bug") || "Bug / Technical Issue"}</option>
                      <option value="feature-request">{t("report.reason.featureRequest") || "Feature Request"}</option>
                      <option value="content-issue">{t("report.reason.contentIssue") || "Content Issue"}</option>
                      <option value="other">{t("report.reason.other") || "Other"}</option>
                    </>
                  ) : (
                    <>
                      <option value="feedback">{t("report.reason.feedback") || "General Feedback"}</option>
                      <option value="question">{t("report.reason.question") || "Question"}</option>
                      <option value="other">{t("report.reason.other") || "Other"}</option>
                    </>
                  )}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2 text-gray-600">
                  {t("report.description.label") || "Description"} <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={5}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  style={{ color: '#000000' }}
                  placeholder={t("report.description.placeholder") || "Please provide as much detail as possible..."}
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  {t("report.description.hint") || "Include specific dates, times, messages, or any other relevant information."}
                </p>
              </div>
            </div>

            {/* Safety Notice */}
            {(reportType === "user" || reportType === "safety") && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-yellow-600 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div>
                    <h3 className="font-semibold text-yellow-800 mb-1">
                      {t("report.safety.title") || "Important Safety Information"}
                    </h3>
                    <p className="text-sm text-yellow-700">
                      {t("report.safety.message") || "If you are in immediate danger, please contact local emergency services immediately. This report system is for documenting incidents, not for emergency response."}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end gap-4">
              <Link
                href="/dashboard"
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                {t("button.cancel") || "Cancel"}
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (t("common.submitting") || "Submitting...") : (t("report.submit") || "Submit Report")}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

