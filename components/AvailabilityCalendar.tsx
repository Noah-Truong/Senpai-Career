"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { modalVariants, modalContentVariants } from "@/lib/animations";
import { createClient } from "@/lib/supabase/client";
import { useSession } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";

interface AvailabilityCalendarProps {
  obogId: string;
  obogName: string;
  isOpen: boolean;
  onClose: () => void;
  isOwner?: boolean; // If true, allows editing. If false, view-only
}

export default function AvailabilityCalendar({
  obogId,
  obogName,
  isOpen,
  onClose,
  isOwner = false,
}: AvailabilityCalendarProps) {
  const { t } = useLanguage();
  const { data: session } = useSession();
  const [duration, setDuration] = useState<15 | 30 | 60 | 1440>(60);
  const [selectedSlots, setSelectedSlots] = useState<Set<string>>(new Set());
  const [bookedSlots, setBookedSlots] = useState<Map<string, any>>(new Map()); // Map of slot key -> booking data
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [bookingSlot, setBookingSlot] = useState<string | null>(null);
  const [bookingNotes, setBookingNotes] = useState("");
  const [bookingDuration, setBookingDuration] = useState<15 | 30 | 60 | 1440>(60);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1); // Monday
    const monday = new Date(today);
    monday.setDate(diff);
    monday.setHours(0, 0, 0, 0);
    return monday;
  });

  const supabase = createClient();

  // Additional security check: Only OBOGs can configure
  const canConfigure = isOwner && session?.user?.role === "obog" && session?.user?.id === obogId;
  const isStudent = session?.user?.role === "student";
  const canBook = !isOwner && isStudent; // Students can book when viewing someone else's calendar

  // Generate dates for the next 3 weeks (21 days)
  const generateDates = () => {
    const dates: Date[] = [];
    for (let i = 0; i < 21; i++) {
      const date = new Date(currentWeekStart);
      date.setDate(date.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  // Generate time slots based on duration
  const generateTimeSlots = () => {
    const slots: string[] = [];
    const startHour = 6;
    const endHour = 20;

    if (duration === 1440) {
      // Full day option
      return ["all-day"];
    }

    for (let hour = startHour; hour <= endHour; hour++) {
      if (duration === 60) {
        slots.push(`${hour.toString().padStart(2, "0")}:00`);
      } else if (duration === 30) {
        slots.push(`${hour.toString().padStart(2, "0")}:00`);
        slots.push(`${hour.toString().padStart(2, "0")}:30`);
      } else if (duration === 15) {
        slots.push(`${hour.toString().padStart(2, "0")}:00`);
        slots.push(`${hour.toString().padStart(2, "0")}:15`);
        slots.push(`${hour.toString().padStart(2, "0")}:30`);
        slots.push(`${hour.toString().padStart(2, "0")}:45`);
      }
    }
    return slots;
  };

  const dates = generateDates();
  const timeSlots = generateTimeSlots();

  // Parse CSV times to Set of date_time keys
  const parseCSVToSlots = (csv: string): Set<string> => {
    if (!csv || csv.trim() === "") return new Set();
    
    const slots = new Set<string>();
    const times = csv.split(",").map(t => t.trim()).filter(t => t);
    
    times.forEach(timeStr => {
      // Format: "YYYY-MM-DD HH:MM"
      const [datePart, timePart] = timeStr.split(" ");
      if (datePart && timePart) {
        // Convert to our key format: "YYYY-MM-DD_HH:MM"
        const key = `${datePart}_${timePart}`;
        slots.add(key);
      }
    });
    
    return slots;
  };

  // Convert Set of slots to CSV format
  const slotsToCSV = (slots: Set<string>): string => {
    const times: string[] = [];
    slots.forEach(key => {
      // Key format: "YYYY-MM-DD_HH:MM" -> CSV: "YYYY-MM-DD HH:MM"
      const [date, time] = key.split("_");
      if (date && time) {
        times.push(`${date} ${time}`);
      }
    });
    return times.join(",");
  };

  // Load existing availability from CSV and bookings
  useEffect(() => {
    if (isOpen) {
      loadAvailability();
      loadBookings();
    }
  }, [isOpen, obogName, duration]);

  const loadAvailability = async () => {
    setLoading(true);
    try {
      // Fetch availability by alumni name (try exact match first)
      let { data, error } = await supabase
        .from("availability")
        .select("times_csv")
        .eq("alumni_name", obogName)
        .single();

      // If not found, that's okay - they just haven't set availability yet
      // We'll create a new entry when they save

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }

      if (data && data.times_csv) {
        // Parse CSV and filter by current duration
        const allSlots = parseCSVToSlots(data.times_csv);
        const filteredSlots = new Set<string>();
        
        // Filter slots that match the current date range and duration
        allSlots.forEach(key => {
          const [dateStr, timeStr] = key.split("_");
          const slotDate = new Date(dateStr);
          
          // Check if date is in our current range
          const isInRange = dates.some(d => {
            const dStr = d.toISOString().split("T")[0];
            return dStr === dateStr;
          });
          
          if (isInRange) {
            // Show all slots regardless of duration in view mode
            // In edit mode, we still show all slots but the user can select based on duration
            filteredSlots.add(key);
          }
        });
        
        setSelectedSlots(filteredSlots);
      } else {
        setSelectedSlots(new Set());
      }
    } catch (error) {
      console.error("Error loading availability:", error);
      setSelectedSlots(new Set());
    } finally {
      setLoading(false);
    }
  };

  const loadBookings = async () => {
    try {
      const response = await fetch(`/api/bookings?obogId=${obogId}`);
      if (response.ok) {
        const data = await response.json();
        const bookingsMap = new Map<string, any>();
        
        (data.bookings || []).forEach((booking: any) => {
          if (booking.status === "pending" || booking.status === "confirmed") {
            const dateTime = booking.booking_date_time;
            // Convert "YYYY-MM-DD HH:MM" to our key format "YYYY-MM-DD_HH:MM"
            const [date, time] = dateTime.split(" ");
            if (date && time) {
              const key = `${date}_${time}`;
              bookingsMap.set(key, booking);
            }
          }
        });
        
        setBookedSlots(bookingsMap);
      }
    } catch (error) {
      console.error("Error loading bookings:", error);
    }
  };

  const handleBookSlot = async () => {
    if (!bookingSlot) return;

    setBookingLoading(true);
    try {
      const [dateStr, timeStr] = bookingSlot.split("_");
      const bookingDateTime = `${dateStr} ${timeStr}`;

      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          obogId,
          bookingDateTime,
          durationMinutes: bookingDuration,
          notes: bookingNotes || null,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Reload bookings to show the new booking
        await loadBookings();
        // Reload availability to refresh the view
        await loadAvailability();
        setBookingSlot(null);
        setBookingNotes("");
        alert(t("booking.success") || "Booking request sent! The OB/OG will be notified.");
      } else {
        let errorMessage = "Failed to create booking";
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          // If response is not JSON, use default message
        }
        alert(errorMessage);
      }
    } catch (error) {
      console.error("Error creating booking:", error);
      alert("Failed to create booking");
    } finally {
      setBookingLoading(false);
    }
  };

  const toggleSlot = (date: Date, timeSlot: string) => {
    const dateStr = date.toISOString().split("T")[0];
    const key = `${dateStr}_${timeSlot}`;

    // If student is booking, open booking modal
    if (canBook && !canConfigure) {
      // Check if slot is available and not booked
      if (selectedSlots.has(key) && !bookedSlots.has(key)) {
        setBookingSlot(key);
        return;
      } else {
        // Debug: log why booking isn't working
        console.log("Booking check:", {
          key,
          isSelected: selectedSlots.has(key),
          isBooked: bookedSlots.has(key),
          canBook,
          canConfigure
        });
        return;
      }
    }

    // Only allow configuration if user is authenticated OBOG and owns this profile
    if (!canConfigure) return;

    const newSelected = new Set(selectedSlots);

    if (newSelected.has(key)) {
      newSelected.delete(key);
    } else {
      newSelected.add(key);
    }

    setSelectedSlots(newSelected);
  };

  const saveAvailability = async () => {
    // Security check: Only authenticated OBOGs can save their own availability
    if (!canConfigure) {
      alert("Only alumni can configure availability.");
      return;
    }

    setSaving(true);
    try {
      // Convert selected slots to CSV format
      const csvTimes = slotsToCSV(selectedSlots);

      // Ensure we're using the correct alumni name (nickname or name)
      const alumniName = obogName.trim();
      
      if (!alumniName) {
        throw new Error("Alumni name is required");
      }

      // Check if record exists
      const { data: existing, error: checkError } = await supabase
        .from("availability")
        .select("id, alumni_name")
        .eq("alumni_name", alumniName)
        .maybeSingle(); // Use maybeSingle() to return null if not found instead of error

      if (existing && existing.id) {
        // Update existing record
        const { error } = await supabase
          .from("availability")
          .update({ 
            times_csv: csvTimes,
            updated_at: new Date().toISOString()
          })
          .eq("id", existing.id);

        if (error) throw error;
      } else {
        // Insert new record (or update if unique constraint violation)
        const { error } = await supabase
          .from("availability")
          .insert({
            alumni_name: alumniName,
            times_csv: csvTimes
          });

        if (error) {
          // If insert fails due to unique constraint, try update instead
          if (error.code === '23505') { // Unique violation
            const { error: updateError } = await supabase
              .from("availability")
              .update({ 
                times_csv: csvTimes,
                updated_at: new Date().toISOString()
              })
              .eq("alumni_name", alumniName);
            
            if (updateError) throw updateError;
          } else {
            throw error;
          }
        }
      }

      alert("Availability saved successfully!");
    } catch (error: any) {
      console.error("Error saving availability:", error);
      const errorMessage = error?.message || "Failed to save availability. Please try again.";
      alert(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (date: Date) => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}`;
  };

  const formatTime = (time: string) => {
    if (time === "all-day") return "All Day";
    const [hour, minute] = time.split(":");
    const hourNum = parseInt(hour);
    const period = hourNum >= 12 ? "pm" : "am";
    const displayHour = hourNum > 12 ? hourNum - 12 : hourNum === 0 ? 12 : hourNum;
    return `${displayHour}:${minute}${period}`;
  };

  if (!isOpen) return null;

  return (
    <motion.div
      className="fixed inset-0 backdrop-blur-md bg-black/30 flex items-center justify-center z-50 p-4"
      variants={modalVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      onClick={onClose}
    >
      <motion.div
        className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        variants={modalContentVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="card-gradient p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">
              {canConfigure ? "Configure Your Availability" : `${obogName}'s Availability`}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
            >
              ×
            </button>
          </div>

          {/* Duration Selector - Show to all users, allow changing to filter view */}
          <div className="flex gap-2">
            {[15, 30, 60, 1440].map((mins) => (
              <button
                key={mins}
                onClick={() => setDuration(mins as 15 | 30 | 60 | 1440)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  duration === mins
                    ? "bg-navy text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {mins === 1440 ? "Day" : `${mins}min`}
              </button>
            ))}
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="flex-1 overflow-auto p-6">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Loading availability...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="inline-block min-w-full">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="sticky left-0 z-10 bg-white border-r border-b border-gray-300 p-2 text-left font-semibold text-gray-700 min-w-[100px]">
                        Time
                      </th>
                      {dates.map((date) => (
                        <th
                          key={date.toISOString()}
                          className="border-b border-gray-300 p-2 text-center font-semibold text-gray-700 min-w-[120px]"
                        >
                          <div className="text-sm">{formatDate(date)}</div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {timeSlots.map((timeSlot) => (
                      <tr key={timeSlot}>
                        <td className="sticky left-0 z-10 bg-white border-r border-b border-gray-200 p-2 text-sm font-medium text-gray-600">
                          {formatTime(timeSlot)}
                        </td>
                        {dates.map((date) => {
                          const dateStr = date.toISOString().split("T")[0];
                          const key = `${dateStr}_${timeSlot}`;
                          const isSelected = selectedSlots.has(key);
                          const isBooked = bookedSlots.has(key);
                          const booking = bookedSlots.get(key);
                          const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));
                          const isClickable = !isPast && (
                            canConfigure || 
                            (canBook && isSelected && !isBooked)
                          );

                          return (
                            <td
                              key={`${dateStr}_${timeSlot}`}
                              className={`border-b border-r border-gray-200 p-1 ${
                                isPast ? "bg-gray-100" : ""
                              }`}
                            >
                              <button
                                onClick={() => {
                                  if (isClickable) {
                                    toggleSlot(date, timeSlot);
                                  }
                                }}
                                disabled={!isClickable || isBooked}
                                className={`w-full h-10 rounded transition-all ${
                                  isBooked
                                    ? "bg-blue-500 hover:bg-blue-600 text-white"
                                    : isSelected
                                    ? canBook && !canConfigure
                                      ? "bg-green-400 hover:bg-green-500 text-white cursor-pointer"
                                      : "bg-green-500 hover:bg-green-600 text-white"
                                    : isPast
                                    ? "bg-gray-200 cursor-not-allowed"
                                    : canConfigure
                                    ? "bg-gray-100 hover:bg-gray-200 cursor-pointer"
                                    : "bg-gray-50 cursor-default"
                                }`}
                                title={
                                  isBooked
                                    ? `Booked${booking?.status === "pending" ? " (Pending)" : ""}`
                                    : isSelected
                                    ? canBook ? "Click to book this slot" : "Available"
                                    : isPast
                                    ? "Past date"
                                    : canConfigure
                                    ? "Click to toggle availability"
                                    : "Not available"
                                }
                              >
                                {isBooked ? "📅" : isSelected ? "✓" : ""}
                              </button>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="card-gradient p-6 border-t border-gray-200 flex justify-between items-center">
          {canConfigure ? (
            <>
              <div className="text-sm text-gray-600">
                Click on time slots to mark your availability. Green indicates available times.
              </div>
              <div className="flex gap-4">
                <button
                  onClick={onClose}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={saveAvailability}
                  disabled={saving}
                  className="btn-primary px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? "Saving..." : "Save Availability"}
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="text-sm text-gray-600">
                Green indicates available times. You can view but not edit this calendar.
              </div>
              <button
                onClick={onClose}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </>
          )}
        </div>
      </motion.div>

      {/* Booking Modal */}
      {bookingSlot && canBook && (
        <motion.div
          className="fixed inset-0 backdrop-blur-md bg-black/30 flex items-center justify-center z-[60] p-4"
          variants={modalVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          onClick={() => setBookingSlot(null)}
        >
          <motion.div
            className="bg-white rounded-lg max-w-md w-full p-6"
            variants={modalContentVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold mb-4" style={{ color: '#111827' }}>
              {t("booking.title") || "Book Meeting Time"}
            </h3>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-1" style={{ color: '#374151' }}>
                  {t("booking.dateTime") || "Date & Time"}
                </p>
                <p className="text-sm" style={{ color: '#6B7280' }}>
                  {(() => {
                    const [dateStr, timeStr] = bookingSlot.split("_");
                    const date = new Date(dateStr);
                    return `${date.toLocaleDateString()} at ${timeStr}`;
                  })()}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
                  {t("booking.duration") || "Duration"}
                </label>
                <div className="flex gap-2">
                  {[15, 30, 60, 1440].map((mins) => (
                    <button
                      key={mins}
                      onClick={() => setBookingDuration(mins as 15 | 30 | 60 | 1440)}
                      className={`px-3 py-1 rounded text-sm ${
                        bookingDuration === mins
                          ? "bg-navy text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {mins === 1440 ? "Day" : `${mins}min`}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
                  {t("booking.notes") || "Notes (Optional)"}
                </label>
                <textarea
                  value={bookingNotes}
                  onChange={(e) => setBookingNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border rounded text-sm"
                  style={{ borderColor: '#D1D5DB', borderRadius: '6px' }}
                  placeholder={t("booking.notesPlaceholder") || "Add any notes about the meeting..."}
                />
              </div>
            </div>

            <div className="flex gap-4 justify-end mt-6">
              <button
                onClick={() => {
                  setBookingSlot(null);
                  setBookingNotes("");
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                {t("button.cancel") || "Cancel"}
              </button>
              <button
                onClick={handleBookSlot}
                disabled={bookingLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {bookingLoading ? t("common.loading") : t("booking.book") || "Book Meeting"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}
