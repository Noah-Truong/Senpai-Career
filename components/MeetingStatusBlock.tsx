"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";

interface MeetingStatusBlockProps {
  threadId: string;
  otherUser: any;
  meeting: any;
  onUpdate?: () => void;
  onShowTermsModal?: () => void;
  onShowEvaluationModal?: () => void;
  onShowAdditionalQuestionModal?: () => void;
}

export default function MeetingStatusBlock({ 
  threadId, 
  otherUser, 
  meeting: meetingProp,
  onUpdate,
  onShowTermsModal,
  onShowEvaluationModal,
  onShowAdditionalQuestionModal,
}: MeetingStatusBlockProps) {
  const { t } = useLanguage();
  const { data: session } = useSession();
  const [meeting, setMeeting] = useState<any>(meetingProp);
  const [editingDateTime, setEditingDateTime] = useState(false);
  const [editingUrl, setEditingUrl] = useState(false);
  const [meetingDateTime, setMeetingDateTime] = useState(meetingProp?.meeting_date_time || "");
  const [meetingUrl, setMeetingUrl] = useState(meetingProp?.meeting_url || "");

  useEffect(() => {
    if (meetingProp) {
      setMeeting(meetingProp);
      setMeetingDateTime(meetingProp.meeting_date_time || "");
      setMeetingUrl(meetingProp.meeting_url || "");
    }
  }, [meetingProp]);

  const isStudent = session?.user?.role === "student";
  const isObog = session?.user?.role === "obog";
  const isStudentInMeeting = meeting && meeting.student_id === session?.user?.id;
  const isObogInMeeting = meeting && meeting.obog_id === session?.user?.id;


  const handleUpdateField = async (field: "dateTime" | "url") => {
    try {
      const response = await fetch(`/api/meetings/${threadId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          meetingDateTime: field === "dateTime" ? meetingDateTime : undefined,
          meetingUrl: field === "url" ? meetingUrl : undefined,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setMeeting(data.meeting);
        setEditingDateTime(false);
        setEditingUrl(false);
        onUpdate?.();
      }
    } catch (error) {
      console.error("Error updating meeting:", error);
    }
  };


  const getStatusDisplay = () => {
    if (!meeting) return null;

    const status = meeting.status;
    const studentStatus = meeting.student_post_status;
    const obogStatus = meeting.obog_post_status;

    // Determine final status based on post-meeting operations
    if (status === "confirmed" || status === "unconfirmed") {
      if (studentStatus === "completed" && (obogStatus === "completed" || !obogStatus)) {
        return "completed";
      }
      if (studentStatus === "no-show" || obogStatus === "no-show") {
        return "no-show";
      }
      if (!studentStatus && !obogStatus && status === "confirmed") {
        return "pending_operation"; // Both parties need to mark
      }
    }

    return status;
  };

  const currentStatus = getStatusDisplay();
  const canEdit = meeting && (isStudentInMeeting || isObogInMeeting);

  // Only show for student-OB/OG conversations
  if (!isStudent && !isObog) {
    return null;
  }

  // Only show if other user is OB/OG (for students) or student (for OB/OG)
  if ((isStudent && otherUser?.role !== "obog") || 
      (isObog && otherUser?.role !== "student")) {
    return null;
  }

  if (!meeting) {
    return null;
  }

  return (
    <>
      {/* Meeting Status Block - Rendered as system message */}
      <div 
        className="mb-4 p-4 bg-gray-50 border rounded"
        style={{ borderColor: '#E5E7EB', borderRadius: '6px' }}
      >
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-semibold text-sm" style={{ color: '#111827' }}>
            {t("meeting.status.title") || "Meeting Status"}
          </h3>
          <span className={`px-2 py-1 rounded text-xs font-medium ${
            currentStatus === "confirmed" ? "bg-blue-100 text-blue-800" :
            currentStatus === "completed" ? "bg-green-100 text-green-800" :
            currentStatus === "cancelled" ? "bg-gray-100 text-gray-800" :
            currentStatus === "no-show" ? "bg-red-100 text-red-800" :
            "bg-yellow-100 text-yellow-800"
          }`}>
            {currentStatus === "unconfirmed" ? t("meeting.status.unconfirmed") || "Unconfirmed" :
             currentStatus === "confirmed" ? t("meeting.status.confirmed") || "Confirmed" :
             currentStatus === "completed" ? t("meeting.status.completed") || "Completed" :
             currentStatus === "cancelled" ? t("meeting.status.cancelled") || "Cancelled" :
             currentStatus === "no-show" ? t("meeting.status.noShow") || "No-Show" :
             t("meeting.status.pendingOperation") || "Pending Operation"}
          </span>
        </div>

        {/* Date/Time Field */}
        <div className="mb-3">
          <label className="block text-xs font-medium mb-1" style={{ color: '#374151' }}>
            {t("meeting.dateTime") || "Date / Time"}
          </label>
          {editingDateTime && canEdit ? (
            <div className="flex gap-2">
              <input
                type="text"
                value={meetingDateTime}
                onChange={(e) => setMeetingDateTime(e.target.value)}
                placeholder={t("meeting.dateTimePlaceholder") || "e.g., 2024-12-20 14:00"}
                className="flex-1 px-2 py-1 text-sm border rounded"
                style={{ borderColor: '#D1D5DB', borderRadius: '4px' }}
              />
              <button
                onClick={() => handleUpdateField("dateTime")}
                className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                {t("button.save") || "Save"}
              </button>
              <button
                onClick={() => {
                  setEditingDateTime(false);
                  setMeetingDateTime(meeting?.meeting_date_time || "");
                }}
                className="px-3 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                {t("button.cancel") || "Cancel"}
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <p className="text-sm" style={{ color: '#6B7280' }}>
                {meeting?.meeting_date_time || t("meeting.notSet") || "Not set"}
              </p>
              {canEdit && (
                <button
                  onClick={() => setEditingDateTime(true)}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  {t("button.edit") || "Edit"}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Meeting URL Field */}
        <div className="mb-3">
          <label className="block text-xs font-medium mb-1" style={{ color: '#374151' }}>
            {t("meeting.url") || "Meeting URL"}
          </label>
          {editingUrl && canEdit ? (
            <div className="flex gap-2">
              <input
                type="text"
                value={meetingUrl}
                onChange={(e) => setMeetingUrl(e.target.value)}
                placeholder={t("meeting.urlPlaceholder") || "https://..."}
                className="flex-1 px-2 py-1 text-sm border rounded"
                style={{ borderColor: '#D1D5DB', borderRadius: '4px' }}
              />
              <button
                onClick={() => handleUpdateField("url")}
                className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                {t("button.save") || "Save"}
              </button>
              <button
                onClick={() => {
                  setEditingUrl(false);
                  setMeetingUrl(meeting?.meeting_url || "");
                }}
                className="px-3 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                {t("button.cancel") || "Cancel"}
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              {meeting?.meeting_url ? (
                <a
                  href={meeting.meeting_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-800 underline"
                >
                  {meeting.meeting_url}
                </a>
              ) : (
                <p className="text-sm" style={{ color: '#6B7280' }}>
                  {t("meeting.notSet") || "Not set"}
                </p>
              )}
              {canEdit && (
                <button
                  onClick={() => setEditingUrl(true)}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  {t("button.edit") || "Edit"}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Terms Acceptance Status */}
        {meeting && (
          <div className="mb-3 text-xs" style={{ color: '#6B7280' }}>
            <p>
              {t("meeting.terms.student") || "Student"}: {meeting.student_terms_accepted 
                ? "✓ " + (t("meeting.terms.accepted") || "Accepted")
                : "✗ " + (t("meeting.terms.notAccepted") || "Not accepted")}
            </p>
            <p>
              {t("meeting.terms.obog") || "OB/OG"}: {meeting.obog_terms_accepted 
                ? "✓ " + (t("meeting.terms.accepted") || "Accepted")
                : "✗ " + (t("meeting.terms.notAccepted") || "Not accepted")}
            </p>
          </div>
        )}

        {/* System notification for pending operations */}
        {currentStatus === "pending_operation" && (
          <div className="mb-3 p-2 bg-yellow-50 border rounded text-xs" style={{ borderColor: '#FCD34D' }}>
            {t("meeting.pendingOperation") || "Did the meeting take place? Currently no operation"}
          </div>
        )}
      </div>
    </>
  );
}
