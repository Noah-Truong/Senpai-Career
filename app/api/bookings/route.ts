import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth-server";
import { createClient } from "@/lib/supabase/server";
import fs from "fs";
import path from "path";

const THREADS_FILE = path.join(process.cwd(), "data", "threads.json");

const readThreads = () => {
  try {
    if (!fs.existsSync(THREADS_FILE)) {
      return [];
    }
    const data = fs.readFileSync(THREADS_FILE, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

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
    const { obogId, bookingDateTime, durationMinutes, notes } = body;

    if (!obogId || !bookingDateTime) {
      return NextResponse.json(
        { error: "Missing required fields" },
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
    const availableTimes = availability.times_csv.split(",").map(t => t.trim()).filter(t => t);
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
    const threads = readThreads();
    const participants = [session.user.id, obogId].sort();
    let thread = threads.find((t: any) => 
      t.participants.length === 2 &&
      t.participants.sort().join(",") === participants.join(",")
    );

    if (!thread) {
      thread = {
        id: `thread_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        participants,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      threads.push(thread);
      fs.writeFileSync(THREADS_FILE, JSON.stringify(threads, null, 2));
    }

    // Create the booking
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .insert({
        student_id: session.user.id,
        obog_id: obogId,
        thread_id: thread.id,
        booking_date_time: requestedTime,
        duration_minutes: durationMinutes || 60,
        status: "pending",
        notes: notes || null,
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

    // Create a meeting for this booking
    const { data: meeting, error: meetingError } = await supabase
      .from("meetings")
      .insert({
        thread_id: thread.id,
        student_id: session.user.id,
        obog_id: obogId,
        meeting_date_time: requestedTime,
        status: "unconfirmed",
      })
      .select()
      .single();

    if (meetingError && meetingError.code !== '23505') { // Ignore unique constraint if meeting already exists
      console.error("Error creating meeting:", meetingError);
    } else if (meeting) {
      // Link booking to meeting
      await supabase
        .from("bookings")
        .update({ meeting_id: meeting.id })
        .eq("id", booking.id);
    }

    // Send notification to OB/OG
    await supabase.from("notifications").insert({
      user_id: obogId,
      type: "system",
      title: "New Booking Request",
      content: `A student has requested to book a meeting on ${requestedTime}`,
      link: `/messages/${thread.id}`,
    });

    return NextResponse.json({ booking, meeting: meeting || null });
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

    return NextResponse.json({ bookings: bookings || [] });
  } catch (error: any) {
    console.error("Error fetching bookings:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}
