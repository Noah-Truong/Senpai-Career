"use client";

import { useEffect, useState, useRef } from "react";
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

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated" && session?.user?.role !== "admin") {
      router.push("/dashboard");
      return;
    }

    if (status === "authenticated" && session?.user?.role === "admin" && !loadingRef.current) {
      loadingRef.current = true;
      loadFlaggedMeetings().finally(() => {
        loadingRef.current = false;
      });
    }
  }, [status, session, router]);

  const loadFlaggedMeetings = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      
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
  };

  const handleMarkReviewed = async (meetingId: string, notes: string) => {
    setReviewing(true);
    try {
      const supabase = createClient();
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
      alert("Failed to update meeting review status");
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1" style={{ color: '#111827' }}>
          {t("admin.meetings.title") || "Flagged Meeting Reviews"}
        </h1>
        <p style={{ color: '#6B7280' }}>
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
              className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
              onClick={() => setSelectedMeeting(meeting)}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium" style={{ color: '#111827' }}>
                    {meeting.student_name} ↔ {meeting.obog_name}
                  </p>
                  <p className="text-sm" style={{ color: '#6B7280' }}>
                    {meeting.review_reason}
                  </p>
                  <p className="text-xs mt-1" style={{ color: '#6B7280' }}>
                    {new Date(meeting.created_at).toLocaleString()}
                  </p>
                </div>
                <span className="px-3 py-1 rounded text-xs font-medium bg-red-100 text-red-800">
                  {t("admin.meetings.flagged") || "Flagged"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedMeeting && (
        <div className="fixed inset-0 backdrop-blur-md bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-bold" style={{ color: '#111827' }}>
                  {t("admin.meetings.meetingDetails") || "Meeting Details"}
                </h2>
                <p className="text-sm mt-1" style={{ color: '#6B7280' }}>
                  {selectedMeeting.student_name} ↔ {selectedMeeting.obog_name}
                </p>
              </div>
              <button
                onClick={() => setSelectedMeeting(null)}
                className="text-gray-400 hover:text-gray-600"
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

              {selectedMeeting.student_offered_opportunity && (
                <div className="p-4 bg-yellow-50 border rounded" style={{ borderColor: '#FCD34D' }}>
                  <p className="text-sm font-medium mb-2" style={{ color: '#92400E' }}>
                    {t("admin.meetings.studentReported") || "Student Reported Opportunity Offered"}
                  </p>
                  <p className="text-xs mb-2" style={{ color: '#78350F' }}>
                    {t("admin.meetings.types") || "Types"}: {selectedMeeting.student_opportunity_types?.join(", ") || "N/A"}
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

              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => {
                    const notes = (document.getElementById("adminNotes") as HTMLTextAreaElement)?.value || "";
                    handleMarkReviewed(selectedMeeting.id, notes);
                  }}
                  disabled={reviewing}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                >
                  {reviewing ? t("common.loading") : t("admin.meetings.markReviewed") || "Mark as Reviewed"}
                </button>
                <button
                  onClick={() => setSelectedMeeting(null)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
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
