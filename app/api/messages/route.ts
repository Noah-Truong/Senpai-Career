import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth-server";
import { getUserById, updateUser, ensureUserExists } from "@/lib/users";
import { createMultilingualContent } from "@/lib/translate";
import { createClient } from "@/lib/supabase/server";
import {
  getOrCreateThread,
  getThreadById,
  getUserThreads,
  createMessage as createMessageInDb,
} from "@/lib/messages";

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
    const { toUserId, content, threadId } = body;

    if (!content) {
      return NextResponse.json(
        { error: "Missing message content" },
        { status: 400 }
      );
    }

    const fromUserId = session.user.id;
    
    // Check user credits before sending message
    let fromUser = await getUserById(fromUserId);
    
    // If user doesn't exist, try to create from auth metadata
    if (!fromUser) {
      const supabase = await createClient();
      const { data: { user: supabaseUser } } = await supabase.auth.getUser();
      
      if (supabaseUser && supabaseUser.id === fromUserId) {
        const createdUser = await ensureUserExists(supabaseUser);
        if (createdUser) {
          fromUser = createdUser;
        }
      }
    }
    
    if (!fromUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Credits cost is the same for all users
    const creditsCost = 10; // Same for all account types
    const currentCredits = fromUser.credits ?? 0;

    if (currentCredits < creditsCost) {
      return NextResponse.json(
        { error: "Insufficient credits", insufficientCredits: true },
        { status: 402 } // Payment Required
      );
    }

    let thread;
    let actualToUserId = toUserId;

    if (threadId) {
      // Existing thread - reply to existing conversation
      thread = await getThreadById(threadId);
      
      if (!thread) {
        return NextResponse.json(
          { error: "Thread not found" },
          { status: 404 }
        );
      }

      if (!thread.participants.includes(fromUserId)) {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 403 }
        );
      }

      // Use the other participant as toUserId
      actualToUserId = thread.participants.find((id: string) => id !== fromUserId);
      if (!actualToUserId) {
        return NextResponse.json(
          { error: "Invalid thread" },
          { status: 400 }
        );
      }
    } else {
      // New thread
      if (!toUserId) {
        return NextResponse.json(
          { error: "Missing required fields" },
          { status: 400 }
        );
      }

      // Alumni (obog) cannot initiate new conversations - they can only reply
      // Companies and students can initiate conversations
      if (fromUser.role === "obog") {
        return NextResponse.json(
          { error: "Alumni cannot start new conversations. Please wait for a student to message you first.", code: "ALUMNI_CANNOT_INITIATE" },
          { status: 403 }
        );
      }

      actualToUserId = toUserId;
      // Find or create thread
      thread = await getOrCreateThread(fromUserId, actualToUserId);
    }

    // Deduct credits BEFORE creating message to ensure atomicity
    // If deduction fails, don't send the message
    const newCredits = currentCredits - creditsCost;
    try {
      await updateUser(fromUserId, {
        credits: newCredits
      });
      // Credits deducted successfully
    } catch (creditError: any) {
      console.error("Error deducting credits:", creditError);
      return NextResponse.json(
        { error: "Failed to deduct credits. Please try again.", insufficientCredits: false },
        { status: 500 }
      );
    }

    // Translate message content and create multilingual version
    let messageContent: string | { en: string; ja: string };
    try {
      const multilingualContent = await createMultilingualContent(content);
      messageContent = multilingualContent;
    } catch (error) {
      console.error("Translation error, storing as plain text:", error);
      // Fallback to plain text if translation fails
      messageContent = content;
    }

    // Create message in database
    const message = await createMessageInDb(thread.id, fromUserId, messageContent);

    // Send notification to recipient
    try {
      const { sendRoleBasedNotification } = await import("@/lib/notification-helpers");
      const supabase = await createClient();
      const { data: fromUser } = await supabase
        .from("users")
        .select("name")
        .eq("id", fromUserId)
        .single();
      
      await sendRoleBasedNotification(
        actualToUserId,
        "message",
        "New Message",
        `You have a new message from ${fromUser?.name || "a user"}`,
        `/messages/${thread.id}`
      );
    } catch (notifError) {
      // Don't fail message sending if notification fails
      console.error("Error sending message notification:", notifError);
    }

    return NextResponse.json(
      { 
        message,
        threadId: thread.id,
        success: true,
        creditsDeducted: creditsCost,
        remainingCredits: currentCredits - creditsCost
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Message creation error:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const isAdmin = session.user.role === "admin";
    const supabase = await createClient();

    // Admin: all threads (read-only chat visibility, features.md 4.5). Else: own threads only.
    let userThreads;
    if (isAdmin) {
      const { data: allThreads } = await supabase
        .from("threads")
        .select("*")
        .order("last_message_at", { ascending: false });
      
      // Transform to MessageThread format
      userThreads = await Promise.all(
        (allThreads || []).map(async (thread: any) => {
          const { data: lastMsg } = await supabase
            .from("messages")
            .select("*")
            .eq("thread_id", thread.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .single();
          
          return {
            id: thread.id,
            participants: thread.participant_ids || [],
            lastMessage: lastMsg ? {
              id: lastMsg.id,
              threadId: lastMsg.thread_id,
              fromUserId: lastMsg.sender_id,
              toUserId: "",
              content: typeof lastMsg.content === "string" && lastMsg.content.trim().startsWith("{")
                ? JSON.parse(lastMsg.content)
                : lastMsg.content,
              createdAt: new Date(lastMsg.created_at),
              read: (lastMsg.read_by || []).length > 0,
            } : undefined,
            createdAt: new Date(thread.created_at),
            updatedAt: new Date(thread.last_message_at || thread.created_at),
          };
        })
      );
    } else {
      userThreads = await getUserThreads(userId);
    }

    const threadsWithMessages = await Promise.all(userThreads.map(async (thread: any) => {
      const otherUserId = thread.participants.find((id: string) => id !== userId);
      const otherUser = otherUserId ? await getUserById(otherUserId) : null;
      const { password, password_hash, ...otherUserWithoutPassword } = (otherUser || {}) as any;

      if (isAdmin) {
        const [p0, p1] = thread.participants || [];
        const u0 = p0 ? await getUserById(p0) : null;
        const u1 = p1 ? await getUserById(p1) : null;
        const participants = [u0, u1].filter(Boolean).map((u) => {
          const { password: _p, password_hash: _ph, ...rest } = (u || {}) as any;
          return rest;
        });
        return {
          ...thread,
          otherUser: otherUserWithoutPassword,
          adminView: true,
          participants,
        };
      }

      return {
        ...thread,
        otherUser: otherUserWithoutPassword,
      };
    }));

    return NextResponse.json({ threads: threadsWithMessages });
  } catch (error: any) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

