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

    if (action === "confirm") {
      if (!isObog) {
        return NextResponse.json(
          { error: "Only OB/OG can confirm bookings" },
          { status: 403 }
        );
      }
      updates.status = "confirmed";
      
      // Update meeting status if exists
      if (booking.meeting_id) {
        await supabase
          .from("meetings")
          .update({ status: "confirmed" })
          .eq("id", booking.meeting_id);
      }

      // Notify student
      await supabase.from("notifications").insert({
        user_id: booking.student_id,
        type: "system",
        title: "Booking Confirmed",
        content: `Your booking for ${booking.booking_date_time} has been confirmed`,
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

      // Notify the other party
      const notifyUserId = isStudent ? booking.obog_id : booking.student_id;
      await supabase.from("notifications").insert({
        user_id: notifyUserId,
        type: "system",
        title: "Booking Cancelled",
        content: `The booking for ${booking.booking_date_time} has been cancelled`,
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
