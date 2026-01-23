"use client";

import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

interface MeetingOperationButtonsProps {
  meeting: any;
  threadId: string;
  isStudent: boolean;
  isObog: boolean;
  isStudentInMeeting: boolean;
  isObogInMeeting: boolean;
  onUpdate: () => void;
  onShowTermsModal: () => void;
  onShowEvaluationModal: () => void;
  onShowAdditionalQuestionModal: () => void;
}

export default function MeetingOperationButtons({
  meeting,
  threadId,
  isStudent,
  isObog,
  isStudentInMeeting,
  isObogInMeeting,
  onUpdate,
  onShowTermsModal,
  onShowEvaluationModal,
  onShowAdditionalQuestionModal,
}: MeetingOperationButtonsProps) {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    // Check if user has accepted terms
    const hasAcceptedTerms = isStudentInMeeting 
      ? meeting?.student_terms_accepted 
      : meeting?.obog_terms_accepted;

    if (!hasAcceptedTerms) {
      onShowTermsModal();
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/meetings/${threadId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "confirm" }),
      });

      if (response.ok) {
        onUpdate();
      } else {
        const errorData = await response.json();
        if (errorData.error?.includes("terms")) {
          onShowTermsModal();
        }
      }
    } catch (error) {
      console.error("Error confirming meeting:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/meetings/${threadId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "complete" }),
      });

      if (response.ok) {
        onUpdate();
        // Show evaluation form immediately
        onShowEvaluationModal();
      }
    } catch (error) {
      console.error("Error marking complete:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkNoShow = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/meetings/${threadId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "mark_no_show" }),
      });

      if (response.ok) {
        onUpdate();
      }
    } catch (error) {
      console.error("Error marking no-show:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/meetings/${threadId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "cancel" }),
      });

      if (response.ok) {
        onUpdate();
      }
    } catch (error) {
      console.error("Error cancelling meeting:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptTerms = () => {
    onShowTermsModal();
  };

  // Only show for student-OB/OG conversations
  if (!isStudent && !isObog) {
    return null;
  }

  const canEdit = meeting && (isStudentInMeeting || isObogInMeeting);
  const canConfirm = meeting && 
    meeting.status === "unconfirmed" && 
    meeting.student_terms_accepted && 
    meeting.obog_terms_accepted &&
    (isStudentInMeeting || isObogInMeeting);
  const needsTermsAcceptance = meeting && 
    ((isStudentInMeeting && !meeting.student_terms_accepted) ||
     (isObogInMeeting && !meeting.obog_terms_accepted));
  const canPostOperate = meeting && 
    (meeting.status === "confirmed" || meeting.status === "completed") &&
    (isStudentInMeeting || isObogInMeeting);
  const studentPostStatus = meeting?.student_post_status;
  const obogPostStatus = meeting?.obog_post_status;
  const hasPostStatus = isStudentInMeeting ? studentPostStatus : obogPostStatus;

  // Show create meeting button if no meeting exists (only for students)
  if (!meeting && isStudent) {
    return (
      <div className="mb-4">
        <button
          onClick={async () => {
            setLoading(true);
            try {
              const response = await fetch(`/api/meetings/${threadId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  meetingDateTime: null,
                  meetingUrl: null,
                }),
              });

              if (response.ok) {
                onUpdate();
              }
            } catch (error) {
              console.error("Error creating meeting:", error);
            } finally {
              setLoading(false);
            }
          }}
          disabled={loading}
          className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? t("common.loading") : t("meeting.create") || "Create Meeting"}
        </button>
      </div>
    );
  }

  if (!meeting || !canEdit) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {/* Accept Terms Button */}
      {needsTermsAcceptance && (
        <button
          onClick={handleAcceptTerms}
          className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {t("meeting.acceptTerms") || "Accept Terms"}
        </button>
      )}

      {/* Confirm Meeting Button */}
      {canConfirm && (
        <button
          onClick={handleConfirm}
          disabled={loading}
          className="px-4 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? t("common.loading") : t("meeting.confirm") || "Confirm Meeting"}
        </button>
      )}

      {/* Post-Meeting Operations */}
      {canPostOperate && !hasPostStatus && (
        <>
          <button
            onClick={handleComplete}
            disabled={loading}
            className="px-4 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? t("common.loading") : t("meeting.markComplete") || "Mark Complete"}
          </button>
          <button
            onClick={handleMarkNoShow}
            disabled={loading}
            className="px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? t("common.loading") : t("meeting.markNoShow") || "Mark No-Show"}
          </button>
        </>
      )}

      {/* Cancel Button */}
      {meeting && meeting.status !== "cancelled" && meeting.status !== "completed" && (
        <button
          onClick={handleCancel}
          disabled={loading}
          className="px-4 py-2 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50"
        >
          {loading ? t("common.loading") : t("meeting.cancel") || "Cancel Meeting"}
        </button>
      )}

      {/* Show Additional Question if student completed and hasn't answered */}
      {isStudent && 
       meeting?.status === "completed" && 
       !meeting?.student_additional_question_answered &&
       meeting?.student_post_status === "completed" && (
        <button
          onClick={onShowAdditionalQuestionModal}
          className="px-4 py-2 text-sm bg-yellow-600 text-white rounded hover:bg-yellow-700"
        >
          {t("meeting.answerQuestion") || "Answer Question"}
        </button>
      )}
    </div>
  );
}
