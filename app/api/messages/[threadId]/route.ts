import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth-server";
import { getUserById } from "@/lib/users";
import { getThreadById, getThreadMessages, markThreadAsRead } from "@/lib/messages";

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

    const userId = session.user.id;
    const isAdmin = session.user.role === "admin";
    const thread = await getThreadById(threadId);

    if (!thread) {
      return NextResponse.json(
        { error: "Thread not found" },
        { status: 404 }
      );
    }

    const isParticipant = thread.participants.includes(userId);
    if (!isParticipant && !isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Mark thread as read for this user
    await markThreadAsRead(threadId, userId);

    let messages = await getThreadMessages(threadId);

    const otherUserId = thread.participants.find((id: string) => id !== userId);
    const otherUser = otherUserId ? await getUserById(otherUserId) : null;
    const { password, password_hash, ...otherUserWithoutPassword } = (otherUser || {}) as any;

    if (isAdmin && !isParticipant) {
      const participants = await Promise.all(
        (thread.participants || []).map(async (id: string) => {
          const u = await getUserById(id);
          if (!u) return null;
          const { password: _p, password_hash: _ph, ...rest } = u as any;
          return rest;
        })
      );
      
      // Enrich messages with sender information for admin view
      const messagesWithSenders = await Promise.all(
        messages.map(async (message: any) => {
          const sender = await getUserById(message.fromUserId);
          if (!sender) return message;
          const { password: _p, password_hash: _ph, ...senderWithoutPassword } = sender as any;
          return {
            ...message,
            sender: senderWithoutPassword,
          };
        })
      );
      
      return NextResponse.json({
        messages: messagesWithSenders,
        otherUser: participants[0] || otherUserWithoutPassword,
        adminView: true,
        participants: participants.filter(Boolean),
      });
    }

    // For admin participants, also enrich messages with sender info
    if (isAdmin && isParticipant) {
      const messagesWithSenders = await Promise.all(
        messages.map(async (message: any) => {
          const sender = await getUserById(message.fromUserId);
          if (!sender) return message;
          const { password: _p, password_hash: _ph, ...senderWithoutPassword } = sender as any;
          return {
            ...message,
            sender: senderWithoutPassword,
          };
        })
      );
      
      return NextResponse.json({
        messages: messagesWithSenders,
        otherUser: otherUserWithoutPassword,
        adminView: true,
      });
    }

    return NextResponse.json({
      messages,
      otherUser: otherUserWithoutPassword,
    });
  } catch (error: any) {
    console.error("Error fetching thread:", error);
    return NextResponse.json(
      { error: "Failed to fetch thread" },
      { status: 500 }
    );
  }
}

