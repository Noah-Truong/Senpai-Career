"use client";

import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useSession } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AdminLayout from "@/components/AdminLayout";
import Avatar from "@/components/Avatar";
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
  student_role?: string;
  student_university?: string;
  student_profile_photo?: string;
  obog_name?: string;
  obog_email?: string;
  obog_role?: string;
  obog_company?: string;
  obog_profile_photo?: string;
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
      
      // Fetch bookings that require review (meetings are now in bookings table)
      // Note: requires_review field doesn't exist in bookings table yet
      // For now, fetch all bookings and filter client-side if needed
      const { data: allBookings, error } = await supabase
        .from("bookings")
        .select("*")
        .order("created_at", { ascending: false });
      
      // Filter for bookings that might need review (e.g., cancelled, no-show conflicts)
      // Since requires_review doesn't exist, we'll show all bookings for now
      // TODO: Add requires_review field to bookings table if needed
      const flaggedMeetings = allBookings || [];

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
            student_role: student?.role || "student",
            student_university: student?.university || "",
            student_profile_photo: student?.profilePhoto || "",
            obog_name: obog?.name || "Unknown",
            obog_email: obog?.email || "Unknown",
            obog_role: obog?.role || "obog",
            obog_company: obog?.company || "",
            obog_profile_photo: obog?.profilePhoto || "",
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
              className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
              onClick={() => setSelectedMeeting(meeting)}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">
                      {t("admin.meetings.flagged") || "Flagged"}
                    </span>
                    <span className="text-xs" style={{ color: '#9CA3AF' }}>
                      {new Date(meeting.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm break-words" style={{ color: '#6B7280' }}>
                    {meeting.review_reason || t("admin.meetings.noReason") || "No reason provided"}
                  </p>
                </div>
              </div>
              
              {/* User Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Student Info */}
                <div className="flex items-start gap-3 p-3 rounded-lg" style={{ backgroundColor: '#F0F9FF' }}>
                  <Avatar
                    src={meeting.student_profile_photo}
                    alt={meeting.student_name || "Student"}
                    size="sm"
                    fallbackText={meeting.student_name}
                    className="shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium truncate" style={{ color: '#111827' }}>
                        {meeting.student_name}
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                        {t("role.student") || "Student"}
                      </span>
                    </div>
                    <p className="text-xs truncate" style={{ color: '#6B7280' }}>
                      {meeting.student_email}
                    </p>
                    {meeting.student_university && (
                      <p className="text-xs truncate" style={{ color: '#9CA3AF' }}>
                        {meeting.student_university}
                      </p>
                    )}
                  </div>
                </div>

                {/* OB/OG Info */}
                <div className="flex items-start gap-3 p-3 rounded-lg" style={{ backgroundColor: '#F0FDF4' }}>
                  <Avatar
                    src={meeting.obog_profile_photo}
                    alt={meeting.obog_name || "OB/OG"}
                    size="sm"
                    fallbackText={meeting.obog_name}
                    className="shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium truncate" style={{ color: '#111827' }}>
                        {meeting.obog_name}
                      </span>
                      <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                        meeting.obog_role === "corporate_ob" 
                          ? "bg-indigo-100 text-indigo-800" 
                          : "bg-green-100 text-green-800"
                      }`}>
                        {meeting.obog_role === "corporate_ob" ? t("role.corporateOb") || "Corporate OB" : t("role.obog") || "OB/OG"}
                      </span>
                    </div>
                    <p className="text-xs truncate" style={{ color: '#6B7280' }}>
                      {meeting.obog_email}
                    </p>
                    {meeting.obog_company && (
                      <p className="text-xs truncate" style={{ color: '#9CA3AF' }}>
                        {meeting.obog_company}
                      </p>
                    )}
                  </div>
                </div>
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
              {/* Users Involved Section */}
              <div>
                <p className="text-sm font-medium mb-3" style={{ color: '#374151' }}>
                  {t("admin.meetings.usersInvolved") || "Users Involved"}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Student Card */}
                  <div className="p-4 rounded-lg border" style={{ backgroundColor: '#F0F9FF', borderColor: '#BFDBFE' }}>
                    <div className="flex items-start gap-3">
                      <Avatar
                        src={selectedMeeting.student_profile_photo}
                        alt={selectedMeeting.student_name || "Student"}
                        size="md"
                        fallbackText={selectedMeeting.student_name}
                        className="shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-sm font-semibold" style={{ color: '#111827' }}>
                            {selectedMeeting.student_name}
                          </span>
                          <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                            {t("role.student") || "Student"}
                          </span>
                        </div>
                        <p className="text-xs mb-1" style={{ color: '#374151' }}>
                          <span className="font-medium">{t("admin.users.email") || "Email"}:</span> {selectedMeeting.student_email}
                        </p>
                        {selectedMeeting.student_university && (
                          <p className="text-xs mb-1" style={{ color: '#374151' }}>
                            <span className="font-medium">{t("profile.university") || "University"}:</span> {selectedMeeting.student_university}
                          </p>
                        )}
                        <p className="text-xs" style={{ color: '#6B7280' }}>
                          <span className="font-medium">ID:</span> {selectedMeeting.student_id}
                        </p>
                        <div className="mt-2 flex gap-2">
                          <Link
                            href={`/user/${selectedMeeting.student_id}`}
                            className="text-xs px-2 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {t("admin.users.viewProfile") || "View Profile"}
                          </Link>
                          <Link
                            href={`/messages/new?userId=${selectedMeeting.student_id}`}
                            className="text-xs px-2 py-1 rounded bg-purple-600 text-white hover:bg-purple-700"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {t("admin.users.message") || "Message"}
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* OB/OG Card */}
                  <div className="p-4 rounded-lg border" style={{ backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' }}>
                    <div className="flex items-start gap-3">
                      <Avatar
                        src={selectedMeeting.obog_profile_photo}
                        alt={selectedMeeting.obog_name || "OB/OG"}
                        size="md"
                        fallbackText={selectedMeeting.obog_name}
                        className="shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-sm font-semibold" style={{ color: '#111827' }}>
                            {selectedMeeting.obog_name}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                            selectedMeeting.obog_role === "corporate_ob" 
                              ? "bg-indigo-100 text-indigo-800" 
                              : "bg-green-100 text-green-800"
                          }`}>
                            {selectedMeeting.obog_role === "corporate_ob" ? t("role.corporateOb") || "Corporate OB" : t("role.obog") || "OB/OG"}
                          </span>
                        </div>
                        <p className="text-xs mb-1" style={{ color: '#374151' }}>
                          <span className="font-medium">{t("admin.users.email") || "Email"}:</span> {selectedMeeting.obog_email}
                        </p>
                        {selectedMeeting.obog_company && (
                          <p className="text-xs mb-1" style={{ color: '#374151' }}>
                            <span className="font-medium">{t("profile.company") || "Company"}:</span> {selectedMeeting.obog_company}
                          </p>
                        )}
                        <p className="text-xs" style={{ color: '#6B7280' }}>
                          <span className="font-medium">ID:</span> {selectedMeeting.obog_id}
                        </p>
                        <div className="mt-2 flex gap-2">
                          <Link
                            href={`/user/${selectedMeeting.obog_id}`}
                            className="text-xs px-2 py-1 rounded bg-green-600 text-white hover:bg-green-700"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {t("admin.users.viewProfile") || "View Profile"}
                          </Link>
                          <Link
                            href={`/messages/new?userId=${selectedMeeting.obog_id}`}
                            className="text-xs px-2 py-1 rounded bg-purple-600 text-white hover:bg-purple-700"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {t("admin.users.message") || "Message"}
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium mb-1" style={{ color: '#374151' }}>
                  {t("admin.meetings.reason") || "Flag Reason"}
                </p>
                <p className="text-sm" style={{ color: '#6B7280' }}>
                  {selectedMeeting.review_reason || t("admin.meetings.noReason") || "No reason provided"}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium mb-1" style={{ color: '#374151' }}>
                    {t("meeting.dateTime") || "Date / Time"}
                  </p>
                  <p className="text-sm" style={{ color: '#6B7280' }}>
                    {selectedMeeting.meeting_date_time 
                      ? new Date(selectedMeeting.meeting_date_time).toLocaleString() 
                      : t("meeting.notSet") || "Not set"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1" style={{ color: '#374151' }}>
                    {t("admin.meetings.createdAt") || "Created At"}
                  </p>
                  <p className="text-sm" style={{ color: '#6B7280' }}>
                    {new Date(selectedMeeting.created_at).toLocaleString()}
                  </p>
                </div>
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
