import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth-server";
import { createClient } from "@/lib/supabase/server";
import { getOrCreateThread } from "@/lib/messages";

// POST - Create a new booking
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (session.user.role !== "student") {
      return NextResponse.json(
        { error: "Only students can create bookings" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { obogId, bookingDateTime, durationMinutes, notes, meetingUrl } = body;

    if (!obogId || !bookingDateTime) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate and sanitize inputs
    const sanitizedNotes = notes ? String(notes).trim() : null;
    const sanitizedMeetingUrl = meetingUrl ? String(meetingUrl).trim() : null;
    
    // Basic URL validation for meeting URL
    if (sanitizedMeetingUrl && !sanitizedMeetingUrl.match(/^https?:\/\/.+/)) {
      return NextResponse.json(
        { error: "Meeting URL must be a valid HTTP/HTTPS URL" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Verify OB/OG exists and is actually an OB/OG
    const { data: obog, error: obogError } = await supabase
      .from("users")
      .select("id, role")
      .eq("id", obogId)
      .single();

    if (obogError || !obog || obog.role !== "obog") {
      return NextResponse.json(
        { error: "Invalid OB/OG user" },
        { status: 400 }
      );
    }

    // Check if the time slot is available in the availability calendar
    const { data: obogProfile } = await supabase
      .from("obog_profiles")
      .select("nickname, id")
      .eq("id", obogId)
      .single();

    const { data: obogUser } = await supabase
      .from("users")
      .select("name")
      .eq("id", obogId)
      .single();

    // Try nickname first, then name
    const obogName = obogProfile?.nickname || obogUser?.name;
    
    if (!obogName) {
      return NextResponse.json(
        { error: "OB/OG profile not found" },
        { status: 404 }
      );
    }

    const { data: availability, error: availabilityError } = await supabase
      .from("availability")
      .select("times_csv")
      .eq("alumni_name", obogName)
      .maybeSingle();

    if (availabilityError && availabilityError.code !== 'PGRST116') {
      console.error("Error fetching availability:", availabilityError);
      return NextResponse.json(
        { error: "Failed to check availability" },
        { status: 500 }
      );
    }

    if (!availability || !availability.times_csv || availability.times_csv.trim() === "") {
      return NextResponse.json(
        { error: "This OB/OG has not set their availability yet" },
        { status: 400 }
      );
    }

    // Check if the requested time is in the availability CSV
    const availableTimes = availability.times_csv.split(",").map((t: string) => t.trim()).filter((t: string) => t);
    const requestedTime = bookingDateTime.trim();
    
    if (!availableTimes.includes(requestedTime)) {
      return NextResponse.json(
        { error: "This time slot is not available in the OB/OG's calendar" },
        { status: 400 }
      );
    }

    // Check if there's already a booking for this time slot
    const { data: existingBooking } = await supabase
      .from("bookings")
      .select("id")
      .eq("obog_id", obogId)
      .eq("booking_date_time", requestedTime)
      .in("status", ["pending", "confirmed"])
      .maybeSingle();

    if (existingBooking) {
      return NextResponse.json(
        { error: "This time slot is already booked" },
        { status: 409 }
      );
    }

    // Find or create a thread between student and OB/OG
    const thread = await getOrCreateThread(session.user.id, obogId);


    // Create the booking with meeting data directly
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .insert({
        student_id: session.user.id,
        obog_id: obogId,
        thread_id: thread.id,
        booking_date_time: requestedTime,
        duration_minutes: durationMinutes || 60,
        status: "pending",
        notes: sanitizedNotes,
        meeting_url: sanitizedMeetingUrl,
        meeting_status: "unconfirmed",
      })
      .select()
      .single();

    if (bookingError) {
      console.error("Error creating booking:", bookingError);
      return NextResponse.json(
        { error: `Failed to create booking: ${bookingError.message || JSON.stringify(bookingError)}` },
        { status: 500 }
      );
    }

    // Send notification to OB/OG using saveNotification (handles email)
    const { saveNotification } = await import("@/lib/notifications");
    await saveNotification({
      userId: obogId,
      type: "system",
      title: "New Booking Request",
      content: `A student has requested to book a meeting on ${requestedTime}`,
      link: `/messages/${thread.id}`,
    });

    // Booking created successfully

    return NextResponse.json({ 
      booking: {
        ...booking,
        notes: sanitizedNotes,
        meeting_url: sanitizedMeetingUrl,
      }
    });
  } catch (error: any) {
    console.error("Error creating booking:", error);
    return NextResponse.json(
      { error: "Failed to create booking" },
      { status: 500 }
    );
  }
}

// GET - Fetch bookings for the current user
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const obogId = searchParams.get("obogId");

    let query = supabase
      .from("bookings")
      .select("*")
      .order("booking_date_time", { ascending: true });

    if (obogId) {
      // Get bookings for a specific OB/OG
      query = query.eq("obog_id", obogId);
    } else {
      // Get all bookings for the current user
      query = query.or(`student_id.eq.${session.user.id},obog_id.eq.${session.user.id}`);
    }

    const { data: bookings, error } = await query;

    if (error) {
      console.error("Error fetching bookings:", error);
      return NextResponse.json(
        { error: "Failed to fetch bookings" },
        { status: 500 }
      );
    }

    // Fetch student profiles and booking info for each booking
    const bookingsWithStudentInfo = await Promise.all(
      (bookings || []).map(async (booking: any) => {
        try {
          // Fetch student profile
          const { data: studentProfile } = await supabase
            .from("student_profiles")
            .select("nickname, profile_photo")
            .eq("id", booking.student_id)
            .single();

          const { data: studentUser } = await supabase
            .from("users")
            .select("name")
            .eq("id", booking.student_id)
            .single();

          // Meeting data is now directly in bookings table
          return {
            ...booking,
            student: {
              id: booking.student_id,
              name: studentUser?.name || "Unknown",
              nickname: studentProfile?.nickname,
              profilePhoto: studentProfile?.profile_photo,
            },
            // Map booking fields to expected frontend format
            meetingStatus: booking.meeting_status || null,
            meetingPostStatus: booking.obog_post_status || booking.student_post_status || null,
            meetingUrl: booking.meeting_url || null,
            meetingDateTime: booking.booking_date_time || null,
          };
        } catch (err) {
          console.error(`Error fetching student info for booking ${booking.id}:`, err);
          return {
            ...booking,
            student: {
              id: booking.student_id,
              name: "Unknown",
              nickname: null,
              profilePhoto: null,
            },
            meetingStatus: null,
            meetingPostStatus: null,
            meetingUrl: null,
            meetingDateTime: null,
          };
        }
      })
    );

    return NextResponse.json({ bookings: bookingsWithStudentInfo });
  } catch (error: any) {
    console.error("Error fetching bookings:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}
