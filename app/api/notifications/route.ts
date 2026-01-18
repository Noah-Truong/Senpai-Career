import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth-server";
import { 
  getNotificationsByUserId, 
  getUnreadNotificationsCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  saveNotification
} from "@/lib/notifications";

// GET - Fetch notifications for current user
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const notifications = await getNotificationsByUserId(session.user.id);
    const unreadCount = await getUnreadNotificationsCount(session.user.id);

    return NextResponse.json({ 
      notifications,
      unreadCount 
    });
  } catch (error: any) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

// POST - Create a new notification
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { userId, type, title, content, link } = body;

    if (!userId || !type || !title || !content) {
      return NextResponse.json(
        { error: "Missing required fields: userId, type, title, content" },
        { status: 400 }
      );
    }

    const notification = saveNotification({
      userId,
      type,
      title,
      content,
      link,
    });

    return NextResponse.json(
      { notification, message: "Notification created successfully" },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating notification:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create notification" },
      { status: 500 }
    );
  }
}

// PUT - Mark notification as read or mark all as read
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
    const { notificationId, markAll } = body;

    if (markAll) {
      markAllNotificationsAsRead(session.user.id);
      return NextResponse.json({ message: "All notifications marked as read" });
    }

    if (!notificationId) {
      return NextResponse.json(
        { error: "Missing notificationId" },
        { status: 400 }
      );
    }

    const notification = markNotificationAsRead(notificationId);

    if (!notification) {
      return NextResponse.json(
        { error: "Notification not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ notification, message: "Notification marked as read" });
  } catch (error: any) {
    console.error("Error updating notification:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update notification" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a notification
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const notificationId = searchParams.get("id");

    if (!notificationId) {
      return NextResponse.json(
        { error: "Missing notificationId" },
        { status: 400 }
      );
    }

    const deleted = deleteNotification(notificationId);

    if (!deleted) {
      return NextResponse.json(
        { error: "Notification not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Notification deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting notification:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete notification" },
      { status: 500 }
    );
  }
}

