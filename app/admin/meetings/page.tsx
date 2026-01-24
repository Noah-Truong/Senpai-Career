"use client";

import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useSession } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/AdminLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { createClient } from "@/lib/supabase/client";

interface FlaggedMeeting {
  id: string;
  thread_id: string;
  student_id: string;
  obog_id: string;
  meeting_date_time: string;
  meeting_url: string;
  status: string;
  student_post_status: string;
  obog_post_status: string;
  review_reason: string;
  student_additional_question_answered: boolean;
  student_offered_opportunity: boolean;
  student_opportunity_types: string[];
  student_evidence_screenshot: string;
  student_evidence_description: string;
  admin_notes?: string;
  student_name?: string;
  student_email?: string;
  obog_name?: string;
  obog_email?: string;
  created_at: string;
}

export default function AdminMeetingsPage() {
  const { t } = useLanguage();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [meetings, setMeetings] = useState<FlaggedMeeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMeeting, setSelectedMeeting] = useState<FlaggedMeeting | null>(null);
  const [reviewing, setReviewing] = useState(false);
  const loadingRef = useRef(false);
  const isAdmin = session?.user?.role === "admin";

  const getMeetingStatusText = useCallback((status: string | null | undefined) => {
    if (!status) return t("admin.meetings.status.pending");
    switch (status.toLowerCase()) {
      case "unconfirmed": return t("admin.meetings.status.unconfirmed");
      case "confirmed": return t("admin.meetings.status.confirmed");
      case "completed": return t("admin.meetings.status.completed");
      case "cancelled": return t("admin.meetings.status.cancelled");
      case "no-show": return t("admin.meetings.status.noShow");
      case "no_show": return t("admin.meetings.status.noShow");
      case "pending": return t("admin.meetings.status.pending");
      default: return status;
    }
  }, [t]);

  const supabase = useMemo(() => createClient(), []);

  const loadFlaggedMeetings = useCallback(async () => {
    setLoading(true);
    try {
      
      // Fetch meetings that require review
      const { data: flaggedMeetings, error } = await supabase
        .from("meetings")
        .select("*")
        .eq("requires_review", true)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading flagged meetings:", error);
        return;
      }

      // Fetch user details for each meeting
      const meetingsWithUsers = await Promise.all(
        (flaggedMeetings || []).map(async (meeting) => {
          const [studentResponse, obogResponse] = await Promise.all([
            fetch(`/api/users/${meeting.student_id}`),
            fetch(`/api/users/${meeting.obog_id}`),
          ]);

          const student = studentResponse.ok ? await studentResponse.json().then(d => d.user || d) : null;
          const obog = obogResponse.ok ? await obogResponse.json().then(d => d.user || d) : null;

          return {
            ...meeting,
            student_name: student?.name || "Unknown",
            student_email: student?.email || "Unknown",
            obog_name: obog?.name || "Unknown",
            obog_email: obog?.email || "Unknown",
          };
        })
      );

      setMeetings(meetingsWithUsers);
    } catch (error) {
      console.error("Error loading flagged meetings:", error);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated" && !isAdmin) {
      router.push("/dashboard");
      return;
    }

    if (status === "authenticated" && isAdmin && !loadingRef.current) {
      loadingRef.current = true;
      loadFlaggedMeetings().finally(() => {
        loadingRef.current = false;
      });
    }
  }, [status, isAdmin, router, loadFlaggedMeetings]);

  const handleMarkReviewed = async (meetingId: string, notes: string) => {
    setReviewing(true);
    try {
      const { error } = await supabase
        .from("meetings")
        .update({
          admin_reviewed: true,
          admin_reviewed_at: new Date().toISOString(),
          admin_notes: notes,
          requires_review: false, // Remove from flagged list
        })
        .eq("id", meetingId);

      if (error) {
        throw error;
      }

      await loadFlaggedMeetings();
      setSelectedMeeting(null);
    } catch (error) {
      console.error("Error marking as reviewed:", error);
      alert(t("admin.meetings.error.update"));
    } finally {
      setReviewing(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <p style={{ color: '#6B7280' }}>{t("common.loading")}</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold mb-1" style={{ color: '#111827' }}>
          {t("admin.meetings.title") || "Flagged Meeting Reviews"}
        </h1>
        <p className="text-sm sm:text-base" style={{ color: '#6B7280' }}>
          {t("admin.meetings.subtitle") || "Review meetings flagged for violations or discrepancies"}
        </p>
      </div>

      {meetings.length === 0 ? (
        <div className="bg-white border rounded p-8 text-center" style={{ borderColor: '#E5E7EB', borderRadius: '6px' }}>
          <p style={{ color: '#6B7280' }}>
            {t("admin.meetings.noFlagged") || "No flagged meetings requiring review."}
          </p>
        </div>
      ) : (
        <div className="bg-white border rounded divide-y" style={{ borderColor: '#E5E7EB', borderRadius: '6px' }}>
          {meetings.map((meeting) => (
            <div
              key={meeting.id}
              className="p-3 sm:p-4 hover:bg-gray-50 transition-colors cursor-pointer"
              onClick={() => setSelectedMeeting(meeting)}
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm sm:text-base truncate" style={{ color: '#111827' }}>
                    {meeting.student_name} ↔ {meeting.obog_name}
                  </p>
                  <p className="text-xs sm:text-sm break-words" style={{ color: '#6B7280' }}>
                    {meeting.review_reason}
                  </p>
                  <p className="text-xs mt-1" style={{ color: '#6B7280' }}>
                    {new Date(meeting.created_at).toLocaleString()}
                  </p>
                </div>
                <span className="px-2 sm:px-3 py-1 rounded text-xs font-medium bg-red-100 text-red-800 shrink-0">
                  {t("admin.meetings.flagged") || "Flagged"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedMeeting && (
        <div className="fixed inset-0 backdrop-blur-md bg-black/30 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-lg p-4 sm:p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto pb-[env(safe-area-inset-bottom)]">
            <div className="flex justify-between items-start mb-4 gap-4">
              <div className="flex-1 min-w-0">
                <h2 className="text-lg sm:text-xl font-bold" style={{ color: '#111827' }}>
                  {t("admin.meetings.meetingDetails") || "Meeting Details"}
                </h2>
                <p className="text-xs sm:text-sm mt-1 truncate" style={{ color: '#6B7280' }}>
                  {selectedMeeting.student_name} ↔ {selectedMeeting.obog_name}
                </p>
              </div>
              <button
                onClick={() => setSelectedMeeting(null)}
                className="text-gray-400 hover:text-gray-600 shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center text-xl sm:text-2xl"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-1" style={{ color: '#374151' }}>
                  {t("admin.meetings.reason") || "Flag Reason"}
                </p>
                <p className="text-sm" style={{ color: '#6B7280' }}>
                  {selectedMeeting.review_reason}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium mb-1" style={{ color: '#374151' }}>
                  {t("meeting.dateTime") || "Date / Time"}
                </p>
                <p className="text-sm" style={{ color: '#6B7280' }}>
                  {selectedMeeting.meeting_date_time || t("meeting.notSet") || "Not set"}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium mb-1" style={{ color: '#374151' }}>
                  {t("admin.meetings.status") || "Meeting Status"}
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    selectedMeeting.status === "confirmed" ? "bg-blue-100 text-blue-800" :
                    selectedMeeting.status === "completed" ? "bg-green-100 text-green-800" :
                    selectedMeeting.status === "cancelled" ? "bg-gray-100 text-gray-800" :
                    selectedMeeting.status === "no-show" || selectedMeeting.status === "no_show" ? "bg-red-100 text-red-800" :
                    "bg-yellow-100 text-yellow-800"
                  }`}>
                    {getMeetingStatusText(selectedMeeting.status)}
                  </span>
                  {selectedMeeting.student_post_status && (
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      selectedMeeting.student_post_status === "completed" ? "bg-green-100 text-green-800" :
                      "bg-red-100 text-red-800"
                    }`}>
                      {t("admin.meetings.studentStatus") || "Student"}: {getMeetingStatusText(selectedMeeting.student_post_status)}
                    </span>
                  )}
                  {selectedMeeting.obog_post_status && (
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      selectedMeeting.obog_post_status === "completed" ? "bg-green-100 text-green-800" :
                      "bg-red-100 text-red-800"
                    }`}>
                      {t("admin.meetings.obogStatus") || "OB/OG"}: {getMeetingStatusText(selectedMeeting.obog_post_status)}
                    </span>
                  )}
                </div>
              </div>

              {selectedMeeting.student_offered_opportunity && (
                <div className="p-4 bg-yellow-50 border rounded" style={{ borderColor: '#FCD34D' }}>
                  <p className="text-sm font-medium mb-2" style={{ color: '#92400E' }}>
                    {t("admin.meetings.studentReported") || "Student Reported Opportunity Offered"}
                  </p>
                  <p className="text-xs mb-2" style={{ color: '#78350F' }}>
                    {t("admin.meetings.types") || "Types"}: {selectedMeeting.student_opportunity_types?.join(", ") || t("admin.reports.nA")}
                  </p>
                  {selectedMeeting.student_evidence_description && (
                    <p className="text-xs" style={{ color: '#78350F' }}>
                      {selectedMeeting.student_evidence_description}
                    </p>
                  )}
                  {selectedMeeting.student_evidence_screenshot && (
                    <a
                      href={selectedMeeting.student_evidence_screenshot}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:text-blue-800 underline"
                    >
                      {t("admin.meetings.viewScreenshot") || "View Screenshot"}
                    </a>
                  )}
                </div>
              )}

              <div>
                <p className="text-sm font-medium mb-2" style={{ color: '#374151' }}>
                  {t("admin.meetings.adminNotes") || "Admin Notes"}
                </p>
                <textarea
                  id="adminNotes"
                  rows={4}
                  className="w-full px-3 py-2 border rounded"
                  style={{ borderColor: '#D1D5DB', borderRadius: '6px' }}
                  placeholder={t("admin.meetings.notesPlaceholder") || "Add review notes..."}
                  defaultValue={selectedMeeting.admin_notes || ""}
                />
              </div>

              <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4 pt-4">
                <button
                  onClick={() => {
                    const notes = (document.getElementById("adminNotes") as HTMLTextAreaElement)?.value || "";
                    handleMarkReviewed(selectedMeeting.id, notes);
                  }}
                  disabled={reviewing}
                  className="w-full sm:w-auto min-h-[44px] px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  {reviewing ? t("common.loading") : t("admin.meetings.markReviewed") || "Mark as Reviewed"}
                </button>
                <button
                  onClick={() => setSelectedMeeting(null)}
                  className="w-full sm:w-auto min-h-[44px] px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                >
                  {t("button.cancel") || "Cancel"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
