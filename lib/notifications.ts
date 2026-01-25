import { createClient, createAdminClient } from "@/lib/supabase/server";
import { Notification } from "@/types";
import { v4 as uuidv4 } from "uuid";
import { sendEmailNotification } from "./email-notifications";

export interface NotificationData extends Omit<Notification, "createdAt"> {
  createdAt: string;
}

// Helper to transform database row to NotificationData
function transformNotification(row: any): NotificationData {
  return {
    id: row.id,
    userId: row.user_id,
    type: row.type,
    title: row.title,
    content: row.content,
    link: row.link,
    read: row.read,
    createdAt: row.created_at,
  };
}

export const readNotifications = async (): Promise<NotificationData[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !data) {
    console.error("Error reading notifications:", error);
    return [];
  }

  return data.map(transformNotification);
};

export const saveNotification = async (
  notificationData: Omit<NotificationData, "id" | "createdAt" | "read">,
  sendEmail: boolean = true
): Promise<NotificationData> => {
  // Use admin client for system notifications or when creating notifications for other users
  // This bypasses RLS which is needed since there's no INSERT policy for notifications
  const supabase = createAdminClient();
  const notificationId = uuidv4();

  const { data, error } = await supabase
    .from("notifications")
    .insert({
      id: notificationId,
      user_id: notificationData.userId,
      type: notificationData.type,
      title: notificationData.title,
      content: notificationData.content,
      link: notificationData.link,
      read: false,
    })
    .select()
    .single();

  if (error) {
    console.error("Error saving notification:", error);
    throw new Error("Failed to create notification");
  }

  // Send email notification if requested and appropriate
  if (sendEmail) {
    try {
      const htmlContent = `
        <html>
          <body>
            <h2>${notificationData.title}</h2>
            <p>${notificationData.content || ""}</p>
            ${notificationData.link ? `<p><a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}${notificationData.link}">View Details</a></p>` : ""}
          </body>
        </html>
      `;
      
      await sendEmailNotification(
        notificationData.userId,
        notificationData.title,
        htmlContent,
        notificationData.content || "",
        notificationData.type
      );
    } catch (emailError) {
      // Don't fail notification creation if email fails
      console.error("Error sending email notification:", emailError);
    }
  }

  return transformNotification(data);
};

export const getNotificationsByUserId = async (userId: string): Promise<NotificationData[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error || !data) {
    console.error("Error reading user notifications:", error);
    return [];
  }

  return data.map(transformNotification);
};

export const getUnreadNotificationsCount = async (userId: string): Promise<number> => {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("read", false);

  if (error) {
    console.error("Error counting unread notifications:", error);
    return 0;
  }

  return count || 0;
};

export const markNotificationAsRead = async (notificationId: string): Promise<NotificationData | undefined> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("id", notificationId)
    .select()
    .single();

  if (error || !data) {
    console.error("Error marking notification as read:", error);
    return undefined;
  }

  return transformNotification(data);
};

export const markAllNotificationsAsRead = async (userId: string): Promise<void> => {
  const supabase = await createClient();
  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("user_id", userId)
    .eq("read", false);

  if (error) {
    console.error("Error marking all notifications as read:", error);
  }
};

export const deleteNotification = async (notificationId: string): Promise<boolean> => {
  const supabase = await createClient();
  const { error, count } = await supabase
    .from("notifications")
    .delete()
    .eq("id", notificationId);

  if (error) {
    console.error("Error deleting notification:", error);
    return false;
  }

  return true;
};
