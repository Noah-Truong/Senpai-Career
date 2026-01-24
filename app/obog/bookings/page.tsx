"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import Avatar from "@/components/Avatar";
import SidebarLayout from "@/components/SidebarLayout";
import { motion, AnimatePresence } from "framer-motion";

interface Booking {
  id: string;
  booking_date_time: string;
  duration_minutes: number;
  notes: string | null;
  status: string;
  thread_id: string | null;
  student: {
    id: string;
    name: string;
    nickname: string | null;
    profilePhoto: string | null;
  };
  meetingStatus: string | null;
  meetingPostStatus: string | null;
  meetingUrl: string | null;
  meetingDateTime: string | null;
}

const LOCALE_MAP = { en: "en-US", ja: "ja-JP" } as const;

export default function OBOGBookingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t, language } = useLanguage();
  const locale = LOCALE_MAP[language] ?? "en-US";
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCompleteModal, setShowCompleteModal] = useState<string | null>(null);
  const [processingAction, setProcessingAction] = useState<string | null>(null);

  const userRole = session?.user?.role;
  const userId = session?.user?.id;

  const checkNoShow = useCallback((booking: Booking): boolean => {
    if (booking.meetingPostStatus === "completed" || booking.meetingPostStatus === "no_show") {
      return false; // Already marked
    }
    
    const bookingDate = new Date(booking.booking_date_time);
    const now = new Date();
    const oneDayAfter = new Date(bookingDate);
    oneDayAfter.setDate(oneDayAfter.getDate() + 1);
    
    // If more than a day has passed since booking time and not completed
    return now > oneDayAfter && booking.status === "confirmed";
  }, []);

  const loadBookings = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/bookings");
      if (response.ok) {
        const data = await response.json();
        // Filter to only show bookings for the current OB/OG user (non-cancelled)
        let obogBookings = (data.bookings || [])
          .filter(
            (booking: Booking) => 
              booking.student && 
              booking.student.id &&
              booking.status !== "cancelled"
          );
        
        // Check for no-show bookings and update them
        for (const booking of obogBookings) {
          if (checkNoShow(booking) && !booking.meetingPostStatus) {
            // Auto-mark as no-show via API
            try {
              await fetch(`/api/bookings/${booking.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "mark_no_show" }),
              });
            } catch (err) {
              console.error("Error marking no-show:", err);
            }
          }
        }
        
        // Reload to get updated statuses
        const reloadResponse = await fetch("/api/bookings");
        if (reloadResponse.ok) {
          const reloadData = await reloadResponse.json();
          obogBookings = (reloadData.bookings || [])
            .filter(
              (booking: Booking) => 
                booking.student && 
                booking.student.id &&
                booking.status !== "cancelled"
            );
        }
        
        obogBookings.sort((a: Booking, b: Booking) => {
          // Sort by booking date/time, most recent first
          return new Date(b.booking_date_time).getTime() - new Date(a.booking_date_time).getTime();
        });
        
        setBookings(obogBookings);
      } else {
        setError(t("bookings.error.load"));
      }
    } catch (err) {
      console.error("Error loading bookings:", err);
      setError(t("bookings.error.load"));
    } finally {
      setLoading(false);
    }
  }, [t, checkNoShow]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated" && userRole !== "obog") {
      router.push("/");
      return;
    }

    if (status === "authenticated" && userRole === "obog" && userId) {
      loadBookings();
    }
  }, [status, userRole, userId, router, loadBookings]);

  const getStatusColor = useCallback((booking: Booking) => {
    // Check post_status first (completed/no-show), then meeting_status, then booking status
    if (booking.meetingPostStatus === "no-show" || booking.meetingStatus === "no-show") return "bg-red-100 text-red-800";
    if (booking.meetingPostStatus === "completed") return "bg-green-100 text-green-800";
    if (booking.meetingStatus === "confirmed") return "bg-blue-100 text-blue-800";
    if (booking.meetingStatus === "unconfirmed") return "bg-yellow-100 text-yellow-800";
    if (booking.status === "cancelled" || booking.meetingStatus === "cancelled") return "bg-gray-100 text-gray-800";
    if (booking.status === "pending") return "bg-yellow-100 text-yellow-800";
    return "bg-gray-100 text-gray-800";
  }, []);

  const getStatusText = useCallback(
    (booking: Booking) => {
      // Check post_status first (completed/no-show), then meeting_status, then booking status
      if (booking.meetingPostStatus === "no-show" || booking.meetingStatus === "no-show") return t("bookings.status.noShow");
      if (booking.meetingPostStatus === "completed") return t("bookings.status.completed");
      if (booking.meetingStatus === "confirmed") return t("bookings.status.confirmed");
      if (booking.meetingStatus === "unconfirmed") return t("bookings.status.pending");
      if (booking.status === "cancelled" || booking.meetingStatus === "cancelled") return t("bookings.status.cancelled");
      if (booking.status === "pending") return t("bookings.status.pending");
      return t("bookings.status.pending");
    },
    [t]
  );

  const formatDateTime = useCallback(
    (dateTimeString: string) => {
      const date = new Date(dateTimeString);
      const formatted = date.toLocaleString(locale, {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZoneName: "short",
      });
      return formatted;
    },
    [locale]
  );

  const getTimezone = useCallback(() => {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  }, []);

  const handleAccept = useCallback(async (bookingId: string) => {
    setProcessingAction(bookingId);
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "accept" }),
      });

      if (response.ok) {
        await loadBookings();
      } else {
        const errorData = await response.json();
        setError(errorData.error || t("bookings.error.accept"));
      }
    } catch (err) {
      console.error("Error accepting booking:", err);
      setError(t("bookings.error.accept"));
    } finally {
      setProcessingAction(null);
    }
  }, [loadBookings, t]);

  const handleComplete = useCallback(async (bookingId: string) => {
    setProcessingAction(bookingId);
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "complete" }),
      });

      if (response.ok) {
        setShowCompleteModal(null);
        await loadBookings();
      } else {
        const errorData = await response.json();
        setError(errorData.error || t("bookings.error.complete"));
      }
    } catch (err) {
      console.error("Error completing meeting:", err);
      setError(t("bookings.error.complete"));
    } finally {
      setProcessingAction(null);
    }
  }, [loadBookings, t]);

  const formatDuration = useCallback(
    (minutes: number) => {
      if (minutes === 1440) return t("profile.availability.duration.day");
      return `${minutes}${t("profile.availability.duration.min")}`;
    },
    [t]
  );

  if (status === "loading" || loading) {
    return (
      <SidebarLayout role="obog">
        <div className="min-h-screen bg-white p-8">
          <p style={{ color: '#6B7280' }}>{t("common.loading")}</p>
        </div>
      </SidebarLayout>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-white p-4 sm:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-6" style={{ color: '#111827' }}>
            {t("bookings.title")}
          </h1>

          {error && (
            <div
              className="mb-4 px-4 py-3 rounded border"
              style={{ backgroundColor: '#FEE2E2', borderColor: '#FCA5A5', color: '#DC2626' }}
            >
              {error}
            </div>
          )}

          {bookings.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lg" style={{ color: '#6B7280' }}>
                {t("bookings.empty")}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="bg-white border rounded-lg p-6 shadow-sm"
                  style={{ borderColor: '#E5E7EB', borderRadius: '8px' }}
                >
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    {/* Student Info */}
                    <div className="flex items-start gap-4 flex-1">
                      <Avatar
                        src={booking.student.profilePhoto}
                        alt={booking.student.name}
                        size="lg"
                        fallbackText={booking.student.name}
                      />
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold mb-1" style={{ color: '#111827' }}>
                          {booking.student.nickname || booking.student.name}
                        </h3>
                        {booking.student.nickname && (
                          <p className="text-sm mb-2" style={{ color: '#6B7280' }}>
                            {booking.student.name}
                          </p>
                        )}
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="font-medium" style={{ color: '#374151' }}>
                              {t("bookings.dateTime")}:
                            </span>{" "}
                            <span style={{ color: '#6B7280' }}>
                              {formatDateTime(booking.booking_date_time)}
                            </span>
                            <span className="text-xs ml-2" style={{ color: '#9CA3AF' }}>
                              ({getTimezone()})
                            </span>
                          </div>
                          <div>
                            <span className="font-medium" style={{ color: '#374151' }}>
                              {t("bookings.duration")}:
                            </span>{" "}
                            <span style={{ color: '#6B7280' }}>
                              {formatDuration(booking.duration_minutes)}
                            </span>
                          </div>
                          {/* Show notes always (student's message/description) */}
                          {booking.notes && (
                            <div>
                              <span className="font-medium" style={{ color: '#374151' }}>
                                {t("bookings.notes")}:
                              </span>{" "}
                              <span style={{ color: '#6B7280' }}>{booking.notes}</span>
                            </div>
                          )}
                          {/* Show meeting URL if booking is confirmed and URL exists */}
                          {booking.status === "confirmed" && booking.meetingUrl && (
                            <div>
                              <span className="font-medium" style={{ color: '#374151' }}>
                                {t("bookings.meetingLink")}:
                              </span>{" "}
                              <a
                                href={booking.meetingUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline break-all"
                              >
                                {booking.meetingUrl}
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Status and Actions */}
                    <div className="flex flex-col gap-3 md:items-end">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking)}`}
                      >
                        {getStatusText(booking)}
                      </span>
                      
                      {/* Accept button for pending bookings */}
                      {booking.status === "pending" && (
                        <button
                          onClick={() => handleAccept(booking.id)}
                          disabled={processingAction === booking.id}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {processingAction === booking.id ? t("common.loading") : t("bookings.accept")}
                        </button>
                      )}
                      
                      {/* Join Meeting button (only shown when accepted) */}
                      {(booking.status === "confirmed" || booking.meetingStatus === "confirmed") && booking.meetingUrl && (
                        <a
                          href={booking.meetingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium inline-flex items-center gap-2"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 10l4.553-2.276A1 1 0 0119 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                            />
                          </svg>
                          {t("bookings.joinMeeting")}
                        </a>
                      )}
                      
                      {/* Mark Complete button (shown when confirmed and not already completed/no-show) */}
                      {(booking.status === "confirmed" || booking.meetingStatus === "confirmed") && 
                       booking.meetingPostStatus !== "completed" && 
                       booking.meetingPostStatus !== "no-show" &&
                       booking.meetingStatus !== "no-show" && (
                        <button
                          onClick={() => setShowCompleteModal(booking.id)}
                          disabled={processingAction === booking.id}
                          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {t("bookings.markComplete")}
                        </button>
                      )}
                      
                      {booking.thread_id && (
                        <a
                          href={`/messages/${booking.thread_id}`}
                          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
                        >
                          {t("bookings.viewMessages")}
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Complete Meeting Confirmation Modal */}
      <AnimatePresence>
        {showCompleteModal && (
          <motion.div
            className="fixed inset-0 backdrop-blur-md bg-black/30 flex items-center justify-center z-[60] p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowCompleteModal(null)}
          >
            <motion.div
              className="bg-white rounded-lg max-w-md w-full p-6"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold mb-4" style={{ color: '#111827' }}>
                {t("bookings.completeModal.title")}
              </h3>
              <p className="text-sm mb-6" style={{ color: '#6B7280' }}>
                {t("bookings.completeModal.message")}
              </p>
              <div className="flex gap-4 justify-end">
                <button
                  onClick={() => setShowCompleteModal(null)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
                >
                  {t("button.cancel")}
                </button>
                <button
                  onClick={() => showCompleteModal && handleComplete(showCompleteModal)}
                  disabled={processingAction === showCompleteModal || !showCompleteModal}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processingAction === showCompleteModal ? t("common.loading") : t("bookings.completeModal.confirm")}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
