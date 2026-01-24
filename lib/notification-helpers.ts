import { saveNotification } from "./notifications";
import { createClient } from "./supabase/server";

/**
 * Send role-appropriate notifications based on notification type and user role
 */
export async function sendRoleBasedNotification(
  userId: string,
  notificationType: "application" | "message" | "meeting" | "internship" | "system",
  title: string,
  content: string,
  link?: string
): Promise<void> {
  const supabase = await createClient();

  // Get user role
  const { data: user } = await supabase
    .from("users")
    .select("role")
    .eq("id", userId)
    .single();

  if (!user) return;

  // Check if notification should be sent based on role and type
  let shouldSend = false;

  if (user.role === "student") {
    // Students receive: applications, messages, meetings, internship postings
    shouldSend =
      notificationType === "application" ||
      notificationType === "message" ||
      notificationType === "meeting" ||
      notificationType === "internship" ||
      notificationType === "system";
  } else if (user.role === "obog") {
    // OB/OG receive: meetings only
    shouldSend = notificationType === "meeting" || notificationType === "system";
  } else if (user.role === "company") {
    // Companies receive: applications, messages (only if status is "Recruiting")
    if (notificationType === "application" || notificationType === "message") {
      // Check company status
      const { data: companyProfile } = await supabase
        .from("company_profiles")
        .select("id")
        .eq("id", userId)
        .single();
      
      // For MVP, assume all companies are recruiting
      // TODO: Add company status field if needed
      shouldSend = true;
    } else {
      shouldSend = notificationType === "system";
    }
  }

  if (shouldSend) {
    await saveNotification({
      userId,
      type: notificationType,
      title,
      content,
      link,
    });
  }
}

/**
 * Send meeting-related notification (request, confirm, cancel, no-show, complete)
 */
export async function sendMeetingNotification(
  userId: string,
  action: "request" | "confirm" | "cancel" | "no-show" | "complete",
  meetingDateTime: string,
  threadId: string,
  otherUserName?: string
): Promise<void> {
  const titles: Record<string, string> = {
    request: "New Meeting Request",
    confirm: "Meeting Confirmed",
    cancel: "Meeting Cancelled",
    "no-show": "No-Show Reported",
    complete: "Meeting Completed",
  };

  const contents: Record<string, string> = {
    request: `A meeting has been requested for ${meetingDateTime}`,
    confirm: `Your meeting for ${meetingDateTime} has been confirmed`,
    cancel: `The meeting for ${meetingDateTime} has been cancelled${otherUserName ? ` by ${otherUserName}` : ""}`,
    "no-show": `A no-show has been reported for the meeting on ${meetingDateTime}`,
    complete: `The meeting on ${meetingDateTime} has been marked as completed`,
  };

  await sendRoleBasedNotification(
    userId,
    "meeting",
    titles[action],
    contents[action],
    `/messages/${threadId}`
  );
}

/**
 * Send application status change notification
 */
export async function sendApplicationNotification(
  userId: string,
  status: "accepted" | "rejected" | "pending",
  listingTitle: string,
  link?: string
): Promise<void> {
  const titles: Record<string, string> = {
    accepted: "Application Accepted",
    rejected: "Application Update",
    pending: "Application Received",
  };

  const contents: Record<string, string> = {
    accepted: `Congratulations! Your application for "${listingTitle}" has been accepted.`,
    rejected: `Your application for "${listingTitle}" has been reviewed.`,
    pending: `Your application for "${listingTitle}" has been received.`,
  };

  await sendRoleBasedNotification(
    userId,
    "application",
    titles[status],
    contents[status],
    link
  );
}

/**
 * Send internship posting notification (only to students with matching desired industry)
 */
export async function sendInternshipPostingNotification(
  internshipId: string,
  companyName: string,
  title: string,
  industry?: string
): Promise<void> {
  const supabase = await createClient();

  // Get all students
  const { data: students } = await supabase
    .from("users")
    .select("id")
    .eq("role", "student");

  if (!students) return;

  // For each student, check if they want notifications for this industry
  for (const student of students) {
    // Get student profile to check desired industry
    const { data: profile } = await supabase
      .from("student_profiles")
      .select("desired_industry")
      .eq("id", student.id)
      .single();

    // Check notification settings
    const { data: settings } = await supabase
      .from("notification_settings")
      .select("email_internship_postings")
      .eq("user_id", student.id)
      .single();

    // Skip if student has disabled internship posting notifications
    if (settings && settings.email_internship_postings === false) {
      continue;
    }

    // If industry matches or no industry filter, send notification
    if (!industry || !profile?.desired_industry || 
        profile.desired_industry.includes(industry)) {
      await sendRoleBasedNotification(
        student.id,
        "internship",
        `New Internship: ${title}`,
        `${companyName} has posted a new internship: ${title}`,
        `/internships/${internshipId}`
      );
    }
  }
}
