"use client";

import { useState } from "react";
import { useSession } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";

interface ReportButtonProps {
  reportedUserId: string;
  reportedUserName?: string;
}

export default function ReportButton({ reportedUserId, reportedUserName }: ReportButtonProps) {
  const { t } = useLanguage();
  const { data: session } = useSession();
  const [showModal, setShowModal] = useState(false);
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  if (!session || session.user?.id === reportedUserId) {
    return null; // Don't show report button if not logged in or trying to report yourself
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    if (!reason || !description.trim()) {
      setError(t("report.error.required") || "Please provide a reason and description");
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
          reportedUserId,
          reason,
          description: description.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t("report.error.submit") || "Failed to submit report");
      }

      setSuccess(true);
      setTimeout(() => {
        setShowModal(false);
        setSuccess(false);
        setReason("");
        setDescription("");
      }, 2000);
    } catch (err: any) {
      setError(err.message || t("report.error.submit") || "Failed to submit report");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="text-red-600 hover:text-red-800 text-sm font-medium"
      >
        {t("report.button") || "Report User"}
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">
              {t("report.title") || "Report User"}
            </h2>
            {reportedUserName && (
              <p className="text-gray-600 mb-4">
                {t("report.reporting") || "Reporting"}: <strong>{reportedUserName}</strong>
              </p>
            )}

            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
                {t("report.success") || "Report submitted successfully"}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  {t("report.reason.label") || "Reason"}
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  style={{ color: '#000000' }}
                  required
                >
                  <option value="">{t("report.reason.select") || "Select a reason"}</option>
                  <option value="inappropriate-behavior">{t("report.reason.inappropriate") || "Inappropriate Behavior"}</option>
                  <option value="harassment">{t("report.reason.harassment") || "Harassment"}</option>
                  <option value="spam">{t("report.reason.spam") || "Spam"}</option>
                  <option value="fake-profile">{t("report.reason.fakeProfile") || "Fake Profile"}</option>
                  <option value="violation-of-terms">{t("report.reason.violation") || "Violation of Terms"}</option>
                  <option value="other">{t("report.reason.other") || "Other"}</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  {t("report.description.label") || "Description"}
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  style={{ color: '#000000' }}
                  placeholder={t("report.description.placeholder") || "Please provide details about the issue..."}
                  required
                />
              </div>

              <div className="flex gap-4 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setError("");
                    setReason("");
                    setDescription("");
                    setSuccess(false);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  disabled={submitting}
                >
                  {t("nav.cancel") || "Cancel"}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (t("common.submitting") || "Submitting...") : (t("report.submit") || "Submit Report")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

