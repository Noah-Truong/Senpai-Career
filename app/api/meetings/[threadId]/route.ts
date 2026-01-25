import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth-server";
import { createClient } from "@/lib/supabase/server";
import { getUserById } from "@/lib/users";
import { getThreadById } from "@/lib/messages";

// GET - Fetch meeting for a thread
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ threadId: string }> }
) {
  try {
    const { threadId } = await params;
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const supabase = await createClient();
    // Meetings are now stored in the bookings table
    const { data: booking, error } = await supabase
      .from("bookings")
      .select("*")
      .eq("thread_id", threadId)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      console.error("Error fetching meeting:", error);
      return NextResponse.json(
        { error: "Failed to fetch meeting" },
        { status: 500 }
      );
    }

    // Verify user is part of this booking/meeting
    if (booking) {
      const isParticipant = 
        booking.student_id === session.user.id || 
        booking.obog_id === session.user.id ||
        session.user.role === "admin";

      if (!isParticipant) {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 403 }
        );
      }
    }

    // Transform booking to meeting format for backward compatibility
    const meeting = booking ? {
      id: booking.id,
      thread_id: booking.thread_id,
      student_id: booking.student_id,
      obog_id: booking.obog_id,
      meeting_date_time: booking.booking_date_time,
      meeting_url: booking.meeting_url,
      status: booking.meeting_status || booking.status,
      meeting_status: booking.meeting_status,
      student_post_status: booking.student_post_status,
      obog_post_status: booking.obog_post_status,
      student_post_status_at: booking.student_post_status_at,
      obog_post_status_at: booking.obog_post_status_at,
      cancelled_at: booking.cancelled_at,
      cancelled_by: booking.cancelled_by,
      cancellation_reason: booking.cancellation_reason,
      created_at: booking.created_at,
      updated_at: booking.updated_at,
      // Fields that don't exist in bookings table - set to null/undefined
      requires_review: undefined,
      review_reason: undefined,
      student_additional_question_answered: undefined,
      student_offered_opportunity: undefined,
      student_opportunity_types: undefined,
      student_evidence_screenshot: undefined,
      student_evidence_description: undefined,
      admin_notes: undefined,
      admin_reviewed: undefined,
      admin_reviewed_at: undefined,
      student_terms_accepted: undefined,
      obog_terms_accepted: undefined,
      student_evaluated: undefined,
      obog_evaluated: undefined,
    } : null;

    return NextResponse.json({ meeting });
  } catch (error: any) {
    console.error("Error fetching meeting:", error);
    return NextResponse.json(
      { error: "Failed to fetch meeting" },
      { status: 500 }
    );
  }
}

// POST - Create or update meeting
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ threadId: string }> }
) {
  try {
    const { threadId } = await params;
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { meetingDateTime, meetingUrl, action } = body;

    const supabase = await createClient();

    // Get thread from Supabase
    const thread = await getThreadById(threadId);

    if (!thread) {
      return NextResponse.json(
        { error: "Thread not found" },
        { status: 404 }
      );
    }

    const participants = thread.participants || [];
    if (participants.length < 2) {
      return NextResponse.json(
        { error: "Invalid thread" },
        { status: 400 }
      );
    }

    const isParticipant = participants.includes(session.user.id);
    if (!isParticipant) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Identify student and OB/OG
    const [user1, user2] = await Promise.all([
      getUserById(participants[0]),
      getUserById(participants[1]),
    ]);
    
    let studentId: string;
    let obogId: string;

    if (user1?.role === "student") {
      studentId = user1.id;
      obogId = participants.find((id: string) => id !== studentId) || participants[1];
    } else if (user2?.role === "student") {
      studentId = user2.id;
      obogId = participants.find((id: string) => id !== studentId) || participants[0];
    } else if (user1?.role === "obog") {
      obogId = user1.id;
      studentId = participants.find((id: string) => id !== obogId) || participants[1];
    } else if (user2?.role === "obog") {
      obogId = user2.id;
      studentId = participants.find((id: string) => id !== obogId) || participants[0];
    } else {
      // Fallback: assume first is student, second is OB/OG
      studentId = participants[0];
      obogId = participants[1];
    }

    // Check if booking exists (meetings are now in bookings table)
    const { data: existing } = await supabase
      .from("bookings")
      .select("*")
      .eq("thread_id", threadId)
      .maybeSingle();

    let booking;
    let operationType: string;

    if (existing) {
      // Update existing booking
      const updates: any = {
        updated_at: new Date().toISOString(),
      };

      if (meetingDateTime !== undefined) updates.booking_date_time = meetingDateTime;
      if (meetingUrl !== undefined) updates.meeting_url = meetingUrl;

      const { data: updated, error: updateError } = await supabase
        .from("bookings")
        .update(updates)
        .eq("id", existing.id)
        .select()
        .single();

      if (updateError) {
        console.error("Error updating booking:", updateError);
        return NextResponse.json(
          { error: "Failed to update meeting" },
          { status: 500 }
        );
      }

      booking = updated;
      operationType = meetingDateTime !== undefined ? "update_date" : "update_url";
    } else {
      // Create new booking (meetings are created as bookings)
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(2, 15);
      const bookingId = `booking_${timestamp}_${randomStr}`;

      const { data: created, error: createError } = await supabase
        .from("bookings")
        .insert({
          id: bookingId,
          thread_id: threadId,
          student_id: studentId,
          obog_id: obogId,
          booking_date_time: meetingDateTime || new Date().toISOString(),
          meeting_url: meetingUrl || null,
          status: "pending",
          meeting_status: "unconfirmed",
        })
        .select()
        .single();

      if (createError) {
        console.error("Error creating booking:", createError);
        return NextResponse.json(
          { error: "Failed to create meeting" },
          { status: 500 }
        );
      }

      booking = created;
      operationType = "create";
      
      // Notify the other party about meeting request (OB/OG when student creates, else student)
      try {
        const { sendMeetingNotification } = await import("@/lib/notification-helpers");
        const requesterIsStudent = session.user.id === studentId;
        const notifyUserId = requesterIsStudent ? booking.obog_id : booking.student_id;
        await sendMeetingNotification(
          notifyUserId,
          "request",
          meetingDateTime || "",
          threadId
        );
      } catch (notifError) {
        console.error("Error sending meeting request notification:", notifError);
      }
    }

    // Transform booking to meeting format for backward compatibility
    const meeting = booking ? {
      id: booking.id,
      thread_id: booking.thread_id,
      student_id: booking.student_id,
      obog_id: booking.obog_id,
      meeting_date_time: booking.booking_date_time,
      meeting_url: booking.meeting_url,
      status: booking.meeting_status || booking.status,
      meeting_status: booking.meeting_status,
      student_post_status: booking.student_post_status,
      obog_post_status: booking.obog_post_status,
      student_post_status_at: booking.student_post_status_at,
      obog_post_status_at: booking.obog_post_status_at,
      cancelled_at: booking.cancelled_at,
      cancelled_by: booking.cancelled_by,
      cancellation_reason: booking.cancellation_reason,
      created_at: booking.created_at,
      updated_at: booking.updated_at,
    } : null;

    return NextResponse.json({ meeting });
  } catch (error: any) {
    console.error("Error handling meeting:", error);
    return NextResponse.json(
      { error: "Failed to handle meeting" },
      { status: 500 }
    );
  }
}

// PUT - Update meeting status or accept terms
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ threadId: string }> }
) {
  try {
    const { threadId } = await params;
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action, status, rating, comment, additionalQuestionData } = body;

    const supabase = await createClient();

    // Get booking (meetings are now in bookings table)
    const { data: booking, error: fetchError } = await supabase
      .from("bookings")
      .select("*")
      .eq("thread_id", threadId)
      .maybeSingle();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error("Error fetching booking:", fetchError);
      return NextResponse.json(
        { error: "Failed to fetch meeting" },
        { status: 500 }
      );
    }

    if (!booking) {
      return NextResponse.json(
        { error: "Meeting not found" },
        { status: 404 }
      );
    }

    const isStudent = booking.student_id === session.user.id;
    const isObog = booking.obog_id === session.user.id;

    if (!isStudent && !isObog && session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    const updates: any = {
      updated_at: new Date().toISOString(),
    };
    let operationType = "update_status";

    // Handle different actions
    if (action === "accept_terms") {
      // Terms acceptance is not stored in bookings table - this action can be a no-op
      // or you can add these fields to bookings table if needed
      operationType = "accept_terms";
    } else if (action === "confirm") {
      // Update both status and meeting_status
      updates.status = "confirmed";
      updates.meeting_status = "confirmed";
      operationType = "confirm";
      
      // Notify both parties
      try {
        const { sendMeetingNotification } = await import("@/lib/notification-helpers");
        await sendMeetingNotification(
          booking.student_id,
          "confirm",
          booking.booking_date_time || "",
          threadId
        );
        await sendMeetingNotification(
          booking.obog_id,
          "confirm",
          booking.booking_date_time || "",
          threadId
        );
      } catch (notifError) {
        console.error("Error sending meeting confirmation notifications:", notifError);
      }
    } else if (action === "complete") {
      if (isStudent) {
        updates.student_post_status = "completed";
        updates.student_post_status_at = new Date().toISOString();
      } else if (isObog) {
        updates.obog_post_status = "completed";
        updates.obog_post_status_at = new Date().toISOString();
      }
      operationType = "complete";
      
      // Determine final status based on both parties
      const studentStatus = isStudent ? "completed" : booking.student_post_status;
      const obogStatus = isObog ? "completed" : booking.obog_post_status;
      
      if (studentStatus === "completed" && (obogStatus === "completed" || !obogStatus)) {
        updates.meeting_status = "completed";
        
        // Notify both parties when meeting is completed
        try {
          const { sendMeetingNotification } = await import("@/lib/notification-helpers");
          await sendMeetingNotification(
            booking.student_id,
            "complete",
            booking.booking_date_time || "",
            threadId
          );
          await sendMeetingNotification(
            booking.obog_id,
            "complete",
            booking.booking_date_time || "",
            threadId
          );
        } catch (notifError) {
          console.error("Error sending meeting completion notifications:", notifError);
        }
      }
    } else if (action === "mark_no_show") {
      if (isStudent) {
        updates.student_post_status = "no-show";
        updates.student_post_status_at = new Date().toISOString();
      } else if (isObog) {
        updates.obog_post_status = "no-show";
        updates.obog_post_status_at = new Date().toISOString();
      }
      updates.meeting_status = "no-show";
      operationType = "mark_no_show";
      
      // Notify the other party about no-show
      try {
        const { sendMeetingNotification } = await import("@/lib/notification-helpers");
        const notifyUserId = isStudent ? booking.obog_id : booking.student_id;
        await sendMeetingNotification(
          notifyUserId,
          "no-show",
          booking.booking_date_time || "",
          threadId
        );
      } catch (notifError) {
        console.error("Error sending no-show notification:", notifError);
      }
    } else if (action === "cancel") {
      updates.status = "cancelled";
      updates.meeting_status = "cancelled";
      updates.cancelled_at = new Date().toISOString();
      updates.cancelled_by = session.user.id;
      operationType = "cancel";
      
      // Notify both parties
      try {
        const { sendMeetingNotification } = await import("@/lib/notification-helpers");
        const { data: currentUser } = await supabase
          .from("users")
          .select("name")
          .eq("id", session.user.id)
          .single();
        
        await sendMeetingNotification(
          booking.student_id,
          "cancel",
          booking.booking_date_time || "",
          threadId,
          currentUser?.name
        );
        await sendMeetingNotification(
          booking.obog_id,
          "cancel",
          booking.booking_date_time || "",
          threadId,
          currentUser?.name
        );
      } catch (notifError) {
        console.error("Error sending meeting cancellation notifications:", notifError);
      }
    } else if (action === "submit_evaluation") {
      // Evaluation is handled separately via reviews API - this can be a no-op
      // or you can add evaluation fields to bookings table if needed
      operationType = "submit_evaluation";
    } else if (action === "submit_additional_question") {
      if (!isStudent) {
        return NextResponse.json(
          { error: "Only students can submit additional questions" },
          { status: 403 }
        );
      }
      // These fields don't exist in bookings table - would need to be added to schema
      // For now, skip these updates or add them to bookings table
      operationType = "submit_additional_question";
    }

    const { data: updated, error: updateError } = await supabase
      .from("bookings")
      .update(updates)
      .eq("id", booking.id)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating booking:", updateError);
      return NextResponse.json(
        { error: "Failed to update meeting" },
        { status: 500 }
      );
    }

    // Transform booking to meeting format for backward compatibility
    const meeting = updated ? {
      id: updated.id,
      thread_id: updated.thread_id,
      student_id: updated.student_id,
      obog_id: updated.obog_id,
      meeting_date_time: updated.booking_date_time,
      meeting_url: updated.meeting_url,
      status: updated.meeting_status || updated.status,
      meeting_status: updated.meeting_status,
      student_post_status: updated.student_post_status,
      obog_post_status: updated.obog_post_status,
      student_post_status_at: updated.student_post_status_at,
      obog_post_status_at: updated.obog_post_status_at,
      cancelled_at: updated.cancelled_at,
      cancelled_by: updated.cancelled_by,
      cancellation_reason: updated.cancellation_reason,
      created_at: updated.created_at,
      updated_at: updated.updated_at,
    } : null;

    return NextResponse.json({ meeting });
  } catch (error: any) {
    console.error("Error updating meeting:", error);
    return NextResponse.json(
      { error: "Failed to update meeting" },
      { status: 500 }
    );
  }
}
