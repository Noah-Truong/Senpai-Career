import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth-server";
import { createClient } from "@/lib/supabase/server";

// PUT - Update booking (confirm, cancel, etc.)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action, cancellationReason } = body;

    const supabase = await createClient();

    // Get the booking
    const { data: booking, error: fetchError } = await supabase
      .from("bookings")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !booking) {
      return NextResponse.json(
        { error: "Booking not found" },
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

    if (action === "confirm" || action === "accept") {
      if (!isObog) {
        return NextResponse.json(
          { error: "Only OB/OG can accept bookings" },
          { status: 403 }
        );
      }
      if (booking.status !== "pending") {
        return NextResponse.json(
          { error: "Booking is not in pending status" },
          { status: 400 }
        );
      }
      updates.status = "confirmed";
      updates.meeting_status = "confirmed";

      // Notify student using saveNotification (handles email)
      const { saveNotification } = await import("@/lib/notifications");
      await saveNotification({
        userId: booking.student_id,
        type: "system",
        title: "Booking Accepted",
        content: `Your booking for ${booking.booking_date_time} has been accepted`,
        link: `/messages/${booking.thread_id}`,
      });
    } else if (action === "complete") {
      if (!isObog) {
        return NextResponse.json(
          { error: "Only OB/OG can mark meetings as completed" },
          { status: 403 }
        );
      }
      
      // Update booking post_status directly
      updates.obog_post_status = "completed";
      updates.obog_post_status_at = new Date().toISOString();
      
      // If student also completed or hasn't responded, mark meeting as completed
      if (booking.student_post_status === "completed" || !booking.student_post_status) {
        updates.meeting_status = "completed";
      }

      // Notify student using saveNotification (handles email)
      const { saveNotification } = await import("@/lib/notifications");
      await saveNotification({
        userId: booking.student_id,
        type: "system",
        title: "Meeting Completed",
        content: `The meeting on ${booking.booking_date_time} has been marked as completed`,
        link: `/messages/${booking.thread_id}`,
      });
    } else if (action === "cancel") {
      updates.status = "cancelled";
      updates.cancelled_at = new Date().toISOString();
      updates.cancelled_by = session.user.id;
      updates.cancellation_reason = cancellationReason || null;

      // Update meeting status if exists
      if (booking.meeting_id) {
        await supabase
          .from("meetings")
          .update({ status: "cancelled" })
          .eq("id", booking.meeting_id);
      }

      // Notify the other party using saveNotification (handles email)
      const notifyUserId = isStudent ? booking.obog_id : booking.student_id;
      const { saveNotification } = await import("@/lib/notifications");
      await saveNotification({
        userId: notifyUserId,
        type: "system",
        title: "Booking Cancelled",
        content: `The booking for ${booking.booking_date_time} has been cancelled`,
        link: `/messages/${booking.thread_id}`,
      });
    } else if (action === "mark_no_show") {
      if (!isObog) {
        return NextResponse.json(
          { error: "Only OB/OG can mark no-show" },
          { status: 403 }
        );
      }
      
      // Update booking post_status directly
      updates.obog_post_status = "no-show";
      updates.obog_post_status_at = new Date().toISOString();
      updates.meeting_status = "no-show";

      // Notify student using saveNotification (handles email)
      const { saveNotification } = await import("@/lib/notifications");
      await saveNotification({
        userId: booking.student_id,
        type: "system",
        title: "Meeting Marked as No-Show",
        content: `The meeting on ${booking.booking_date_time} has been marked as no-show`,
        link: `/messages/${booking.thread_id}`,
      });
    }

    const { data: updated, error: updateError } = await supabase
      .from("bookings")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating booking:", updateError);
      return NextResponse.json(
        { error: "Failed to update booking" },
        { status: 500 }
      );
    }

    return NextResponse.json({ booking: updated });
  } catch (error: any) {
    console.error("Error updating booking:", error);
    return NextResponse.json(
      { error: "Failed to update booking" },
      { status: 500 }
    );
  }
}
