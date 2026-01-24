import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth-server";
import { createClient } from "@/lib/supabase/server";

// GET - Fetch notification settings for current user
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

    // Get or create default settings
    let { data: settings } = await supabase
      .from("notification_settings")
      .select("*")
      .eq("user_id", session.user.id)
      .single();

    if (!settings) {
      // Create default settings
      const { data: user } = await supabase
        .from("users")
        .select("email")
        .eq("id", session.user.id)
        .single();

      const { data: newSettings } = await supabase
        .from("notification_settings")
        .insert({
          user_id: session.user.id,
          email_notifications_enabled: true,
          notification_email: user?.email || null,
          notification_frequency: "immediate",
        })
        .select()
        .single();

      settings = newSettings;
    }

    return NextResponse.json({ settings });
  } catch (error: any) {
    console.error("Error fetching notification settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch notification settings" },
      { status: 500 }
    );
  }
}

// PUT - Update notification settings
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      emailNotificationsEnabled,
      notificationEmail,
      notificationFrequency,
      emailApplicationUpdates,
      emailMessageNotifications,
      emailMeetingNotifications,
      emailInternshipPostings,
    } = body;

    const supabase = await createClient();

    // Check if settings exist
    const { data: existing } = await supabase
      .from("notification_settings")
      .select("id")
      .eq("user_id", session.user.id)
      .maybeSingle();

    const updates: any = {
      updated_at: new Date().toISOString(),
    };

    if (emailNotificationsEnabled !== undefined) {
      updates.email_notifications_enabled = emailNotificationsEnabled;
    }
    if (notificationEmail !== undefined) {
      updates.notification_email = notificationEmail;
    }
    if (notificationFrequency !== undefined) {
      updates.notification_frequency = notificationFrequency;
    }
    if (emailApplicationUpdates !== undefined) {
      updates.email_application_updates = emailApplicationUpdates;
    }
    if (emailMessageNotifications !== undefined) {
      updates.email_message_notifications = emailMessageNotifications;
    }
    if (emailMeetingNotifications !== undefined) {
      updates.email_meeting_notifications = emailMeetingNotifications;
    }
    if (emailInternshipPostings !== undefined) {
      updates.email_internship_postings = emailInternshipPostings;
    }

    let settings;

    if (existing) {
      // Update existing
      const { data: updated, error } = await supabase
        .from("notification_settings")
        .update(updates)
        .eq("id", existing.id)
        .select()
        .single();

      if (error) {
        throw error;
      }
      settings = updated;
    } else {
      // Create new with defaults
      const { data: user } = await supabase
        .from("users")
        .select("email")
        .eq("id", session.user.id)
        .single();

      const { data: created, error } = await supabase
        .from("notification_settings")
        .insert({
          user_id: session.user.id,
          email_notifications_enabled: emailNotificationsEnabled ?? true,
          notification_email: notificationEmail || user?.email || null,
          notification_frequency: notificationFrequency || "immediate",
          email_application_updates: emailApplicationUpdates ?? true,
          email_message_notifications: emailMessageNotifications ?? true,
          email_meeting_notifications: emailMeetingNotifications ?? true,
          email_internship_postings: emailInternshipPostings ?? true,
          ...updates,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }
      settings = created;
    }

    return NextResponse.json({ settings });
  } catch (error: any) {
    console.error("Error updating notification settings:", error);
    return NextResponse.json(
      { error: "Failed to update notification settings" },
      { status: 500 }
    );
  }
}
