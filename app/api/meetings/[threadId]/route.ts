import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth-server";
import { createClient } from "@/lib/supabase/server";
import { getUserById } from "@/lib/users";
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
    const { data: meeting, error } = await supabase
      .from("meetings")
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

    // Verify user is part of this meeting
    if (meeting) {
      const isParticipant = 
        meeting.student_id === session.user.id || 
        meeting.obog_id === session.user.id ||
        session.user.role === "admin";

      if (!isParticipant) {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 403 }
        );
      }
    }

    return NextResponse.json({ meeting: meeting || null });
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

    // Get thread from file-based system
    const threads = readThreads();
    const thread = threads.find((t: any) => t.id === threadId);

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

    // Check if meeting exists
    const { data: existing } = await supabase
      .from("meetings")
      .select("*")
      .eq("thread_id", threadId)
      .maybeSingle();

    let meeting;
    let operationType: string;

    if (existing) {
      // Update existing meeting
      const updates: any = {
        updated_at: new Date().toISOString(),
      };

      if (meetingDateTime !== undefined) updates.meeting_date_time = meetingDateTime;
      if (meetingUrl !== undefined) updates.meeting_url = meetingUrl;

      const { data: updated, error: updateError } = await supabase
        .from("meetings")
        .update(updates)
        .eq("id", existing.id)
        .select()
        .single();

      if (updateError) {
        console.error("Error updating meeting:", updateError);
        return NextResponse.json(
          { error: "Failed to update meeting" },
          { status: 500 }
        );
      }

      meeting = updated;
      operationType = meetingDateTime !== undefined ? "update_date" : "update_url";
    } else {
      // Create new meeting
      const { data: created, error: createError } = await supabase
        .from("meetings")
        .insert({
          thread_id: threadId,
          student_id: studentId,
          obog_id: obogId,
          meeting_date_time: meetingDateTime || null,
          meeting_url: meetingUrl || null,
          status: "unconfirmed",
        })
        .select()
        .single();

      if (createError) {
        console.error("Error creating meeting:", createError);
        return NextResponse.json(
          { error: "Failed to create meeting" },
          { status: 500 }
        );
      }

      meeting = created;
      operationType = "create";
      
      // Notify the other party about meeting request (OB/OG when student creates, else student)
      try {
        const { sendMeetingNotification } = await import("@/lib/notification-helpers");
        const requesterIsStudent = session.user.id === studentId;
        const notifyUserId = requesterIsStudent ? meeting.obog_id : meeting.student_id;
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

    // Log operation
    await supabase.from("meeting_operation_logs").insert({
      meeting_id: meeting.id,
      user_id: session.user.id,
      operation_type: operationType,
      new_value: { meetingDateTime, meetingUrl },
    });

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

    // Get meeting
    const { data: meeting, error: fetchError } = await supabase
      .from("meetings")
      .select("*")
      .eq("thread_id", threadId)
      .single();

    if (fetchError || !meeting) {
      return NextResponse.json(
        { error: "Meeting not found" },
        { status: 404 }
      );
    }

    const isStudent = meeting.student_id === session.user.id;
    const isObog = meeting.obog_id === session.user.id;

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
      if (isStudent) {
        updates.student_terms_accepted = true;
        updates.student_terms_accepted_at = new Date().toISOString();
        operationType = "accept_terms";
      } else if (isObog) {
        updates.obog_terms_accepted = true;
        updates.obog_terms_accepted_at = new Date().toISOString();
        operationType = "accept_terms";
      }
    } else if (action === "confirm") {
      // Check if both parties accepted terms
      if (!meeting.student_terms_accepted || !meeting.obog_terms_accepted) {
        return NextResponse.json(
          { error: "Both parties must accept terms before confirming" },
          { status: 400 }
        );
      }
      updates.status = "confirmed";
      operationType = "confirm";
      
      // Notify both parties
      try {
        const { sendMeetingNotification } = await import("@/lib/notification-helpers");
        await sendMeetingNotification(
          meeting.student_id,
          "confirm",
          meeting.meeting_date_time || "",
          threadId
        );
        await sendMeetingNotification(
          meeting.obog_id,
          "confirm",
          meeting.meeting_date_time || "",
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
      const studentStatus = isStudent ? "completed" : meeting.student_post_status;
      const obogStatus = isObog ? "completed" : meeting.obog_post_status;
      
      if (studentStatus === "completed" && (obogStatus === "completed" || !obogStatus)) {
        updates.status = "completed";
        
        // Notify both parties when meeting is completed
        try {
          const { sendMeetingNotification } = await import("@/lib/notification-helpers");
          await sendMeetingNotification(
            meeting.student_id,
            "complete",
            meeting.meeting_date_time || "",
            threadId
          );
          await sendMeetingNotification(
            meeting.obog_id,
            "complete",
            meeting.meeting_date_time || "",
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
      operationType = "mark_no_show";
      
      // If one party marks no-show and other reports, flag for review
      const studentStatus = isStudent ? "no-show" : meeting.student_post_status;
      const obogStatus = isObog ? "no-show" : meeting.obog_post_status;
      
      if ((studentStatus === "no-show" && obogStatus === "completed") ||
          (obogStatus === "no-show" && studentStatus === "completed")) {
        updates.requires_review = true;
        updates.review_reason = "No-show reported by one party while other marked complete";
      }
      
      // Notify the other party about no-show
      try {
        const { sendMeetingNotification } = await import("@/lib/notification-helpers");
        const notifyUserId = isStudent ? meeting.obog_id : meeting.student_id;
        await sendMeetingNotification(
          notifyUserId,
          "no-show",
          meeting.meeting_date_time || "",
          threadId
        );
      } catch (notifError) {
        console.error("Error sending no-show notification:", notifError);
      }
    } else if (action === "cancel") {
      updates.status = "cancelled";
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
          meeting.student_id,
          "cancel",
          meeting.meeting_date_time || "",
          threadId,
          currentUser?.name
        );
        await sendMeetingNotification(
          meeting.obog_id,
          "cancel",
          meeting.meeting_date_time || "",
          threadId,
          currentUser?.name
        );
      } catch (notifError) {
        console.error("Error sending meeting cancellation notifications:", notifError);
      }
    } else if (action === "submit_evaluation") {
      if (isStudent) {
        updates.student_evaluated = true;
        updates.student_rating = rating;
        updates.student_evaluation_comment = comment;
        updates.student_evaluated_at = new Date().toISOString();
      } else if (isObog) {
        updates.obog_evaluated = true;
        updates.obog_rating = rating;
        updates.obog_evaluation_comment = comment;
        updates.obog_evaluated_at = new Date().toISOString();
      }
      operationType = "submit_evaluation";
    } else if (action === "submit_additional_question") {
      if (!isStudent) {
        return NextResponse.json(
          { error: "Only students can submit additional questions" },
          { status: 403 }
        );
      }
      updates.student_additional_question_answered = true;
      updates.student_offered_opportunity = additionalQuestionData.offered;
      updates.student_opportunity_types = additionalQuestionData.types || [];
      updates.student_opportunity_other = additionalQuestionData.other || null;
      updates.student_evidence_screenshot = additionalQuestionData.evidenceScreenshot || null;
      updates.student_evidence_description = additionalQuestionData.evidenceDescription || null;
      updates.student_additional_question_answered_at = new Date().toISOString();
      
      if (additionalQuestionData.offered === true) {
        updates.requires_review = true;
        updates.review_reason = "Student reported being offered opportunity outside platform";
      }
      operationType = "submit_additional_question";
    }

    const { data: updated, error: updateError } = await supabase
      .from("meetings")
      .update(updates)
      .eq("id", meeting.id)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating meeting:", updateError);
      return NextResponse.json(
        { error: "Failed to update meeting" },
        { status: 500 }
      );
    }

    // Log operation
    await supabase.from("meeting_operation_logs").insert({
      meeting_id: meeting.id,
      user_id: session.user.id,
      operation_type: operationType,
      old_value: meeting,
      new_value: updated,
    });

    return NextResponse.json({ meeting: updated });
  } catch (error: any) {
    console.error("Error updating meeting:", error);
    return NextResponse.json(
      { error: "Failed to update meeting" },
      { status: 500 }
    );
  }
}
