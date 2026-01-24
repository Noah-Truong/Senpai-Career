import { createClient } from "@/lib/supabase/server";

export interface EmailNotificationData {
  userId: string;
  email: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
  scheduledSendAt?: Date;
}

/**
 * Check if email should be sent based on user preferences and time
 */
export async function shouldSendEmail(
  userId: string,
  notificationType: string
): Promise<{ shouldSend: boolean; email?: string; scheduleFor?: Date }> {
  const supabase = await createClient();

  // Get user notification settings
  const { data: settings } = await supabase
    .from("notification_settings")
    .select("*")
    .eq("user_id", userId)
    .single();

  // Default: send immediately if no settings
  if (!settings) {
    const { data: user } = await supabase
      .from("users")
      .select("email")
      .eq("id", userId)
      .single();

    return {
      shouldSend: true,
      email: user?.email,
    };
  }

  // Check if email notifications are enabled
  if (!settings.email_notifications_enabled) {
    return { shouldSend: false };
  }

  // Get email address (use notification_email if set, otherwise user email)
  const { data: user } = await supabase
    .from("users")
    .select("email")
    .eq("id", userId)
    .single();

  const email = settings.notification_email || user?.email;
  if (!email) {
    return { shouldSend: false };
  }

  // Check frequency setting
  if (settings.notification_frequency === "off") {
    return { shouldSend: false };
  }

  // Check if weekly summary (queue for weekly summary)
  if (settings.notification_frequency === "weekly_summary") {
    // Calculate next Monday 9 AM for weekly summary
    const now = new Date();
    const nextMonday = new Date(now);
    nextMonday.setDate(now.getDate() + ((1 + 7 - now.getDay()) % 7 || 7));
    nextMonday.setHours(9, 0, 0, 0);
    
    return {
      shouldSend: false, // Don't send immediately
      email,
      scheduleFor: nextMonday,
    };
  }

  // Immediate: Check late-night restriction
  const now = new Date();
  const hour = now.getHours();
  const isLateNight = hour >= 22 || hour < 6; // 10 PM to 6 AM

  if (isLateNight) {
    // Schedule for next morning (6 AM)
    const nextMorning = new Date(now);
    if (hour >= 22) {
      nextMorning.setDate(now.getDate() + 1);
    }
    nextMorning.setHours(6, 0, 0, 0);

    return {
      shouldSend: false, // Don't send immediately
      email,
      scheduleFor: nextMorning,
    };
  }

  return {
    shouldSend: true,
    email,
  };
}

/**
 * Queue an email for later sending (weekly summary or late-night delay)
 */
export async function queueEmailNotification(
  data: EmailNotificationData
): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase.from("email_notification_queue").insert({
    user_id: data.userId,
    email_address: data.email,
    subject: data.subject,
    html_content: data.htmlContent,
    text_content: data.textContent || "",
    scheduled_send_at: data.scheduledSendAt?.toISOString() || new Date().toISOString(),
  });

  if (error) {
    console.error("Error queueing email notification:", error);
  }
}

/**
 * Send email notification immediately (or queue if needed)
 */
export async function sendEmailNotification(
  userId: string,
  subject: string,
  htmlContent: string,
  textContent?: string,
  notificationType?: string
): Promise<{ sent: boolean; queued: boolean; error?: string }> {
  const supabase = await createClient();
  
  try {
    const check = await shouldSendEmail(userId, notificationType || "");

    if (!check.shouldSend && !check.scheduleFor) {
      return { sent: false, queued: false };
    }

    if (check.scheduleFor) {
      // Queue for later
      await queueEmailNotification({
        userId,
        email: check.email!,
        subject,
        htmlContent,
        textContent,
        scheduledSendAt: check.scheduleFor,
      });
      return { sent: false, queued: true };
    }

    // Send immediately (in production, use actual email service like SendGrid, Resend, etc.)
    // For MVP, we'll just log it
    console.log("Email notification would be sent:", {
      to: check.email,
      subject,
      htmlContent,
    });

    // TODO: Integrate with email service (SendGrid, Resend, AWS SES, etc.)
    // For now, we'll just queue it as "sent" in the queue table for tracking
    const { error: queueError } = await supabase.from("email_notification_queue").insert({
      user_id: userId,
      email_address: check.email!,
      subject,
      html_content: htmlContent,
      text_content: textContent || "",
      scheduled_send_at: new Date().toISOString(),
      sent_at: new Date().toISOString(), // Mark as sent immediately
    });

    if (queueError) {
      console.error("Error queueing email:", queueError);
    }

    return { sent: true, queued: false };
  } catch (error: any) {
    console.error("Error sending email notification:", error);
    return { sent: false, queued: false, error: error.message };
  }
}

/**
 * Process queued emails (should be run as a cron job)
 */
export async function processEmailQueue(): Promise<void> {
  const supabase = await createClient();
  const now = new Date();

  // Get emails ready to send
  const { data: queuedEmails } = await supabase
    .from("email_notification_queue")
    .select("*")
    .is("sent_at", null)
    .lte("scheduled_send_at", now.toISOString())
    .limit(100);

  if (!queuedEmails || queuedEmails.length === 0) {
    return;
  }

  for (const email of queuedEmails) {
    try {
      // TODO: Actually send email via email service
      console.log("Processing queued email:", {
        to: email.email_address,
        subject: email.subject,
      });

      // Mark as sent
      await supabase
        .from("email_notification_queue")
        .update({
          sent_at: new Date().toISOString(),
        })
        .eq("id", email.id);
    } catch (error: any) {
      // Log error and increment attempts
      await supabase
        .from("email_notification_queue")
        .update({
          send_attempts: (email.send_attempts || 0) + 1,
          last_error: error.message,
        })
        .eq("id", email.id);
    }
  }
}
