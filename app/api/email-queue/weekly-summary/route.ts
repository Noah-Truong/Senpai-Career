import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Send weekly summary emails to users who have opted for weekly summaries
 * Should be run weekly (e.g., every Monday at 9 AM)
 */
export async function POST(request: NextRequest) {
  try {
    // Optional: Add authentication for cron job
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const supabase = await createClient();

    // Get all users with weekly summary preference
    const { data: settings } = await supabase
      .from("notification_settings")
      .select("user_id, notification_email")
      .eq("notification_frequency", "weekly_summary")
      .eq("email_notifications_enabled", true);

    if (!settings || settings.length === 0) {
      return NextResponse.json({ 
        message: "No users with weekly summary preference",
        count: 0
      });
    }

    // Get notifications from the past week for each user
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    let summaryCount = 0;

    for (const setting of settings) {
      const { data: notifications } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", setting.user_id)
        .gte("created_at", oneWeekAgo.toISOString())
        .order("created_at", { ascending: false });

      if (!notifications || notifications.length === 0) {
        continue; // Skip users with no notifications
      }

      // Get user email
      const { data: user } = await supabase
        .from("users")
        .select("email, name")
        .eq("id", setting.user_id)
        .single();

      const email = setting.notification_email || user?.email;
      if (!email) continue;

      // Generate summary HTML
      const htmlContent = `
        <html>
          <body>
            <h2>Weekly Notification Summary</h2>
            <p>Hello ${user?.name || "User"},</p>
            <p>Here's a summary of your notifications from the past week:</p>
            <ul>
              ${notifications.map(n => `<li><strong>${n.title}</strong>: ${n.content || ""}</li>`).join("")}
            </ul>
            <p><a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/messages">View All Notifications</a></p>
          </body>
        </html>
      `;

      // Queue or send the summary email
      const { sendEmailNotification } = await import("@/lib/email-notifications");
      await sendEmailNotification(
        setting.user_id,
        "Weekly Notification Summary",
        htmlContent,
        `You have ${notifications.length} notification(s) from the past week. Visit the platform to view them.`,
        "system"
      );

      summaryCount++;
    }

    return NextResponse.json({ 
      message: "Weekly summaries sent",
      count: summaryCount,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error("Error sending weekly summaries:", error);
    return NextResponse.json(
      { error: "Failed to send weekly summaries" },
      { status: 500 }
    );
  }
}
