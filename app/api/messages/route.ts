import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth-server";
import { getUserById, updateUser, ensureUserExists } from "@/lib/users";
import { createMultilingualContent } from "@/lib/translate";
import { createClient } from "@/lib/supabase/server";
import fs from "fs";
import path from "path";

const MESSAGES_FILE = path.join(process.cwd(), "data", "messages.json");
const THREADS_FILE = path.join(process.cwd(), "data", "threads.json");

const ensureDataDir = () => {
  const dataDir = path.dirname(MESSAGES_FILE);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(MESSAGES_FILE)) {
    fs.writeFileSync(MESSAGES_FILE, JSON.stringify([], null, 2));
  }
  if (!fs.existsSync(THREADS_FILE)) {
    fs.writeFileSync(THREADS_FILE, JSON.stringify([], null, 2));
  }
};

const readThreads = () => {
  ensureDataDir();
  try {
    const data = fs.readFileSync(THREADS_FILE, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

const saveThread = (thread: any) => {
  ensureDataDir();
  const threads = readThreads();
  const existingIndex = threads.findIndex((t: any) => t.id === thread.id);
  
  if (existingIndex >= 0) {
    threads[existingIndex] = thread;
  } else {
    threads.push(thread);
  }
  
  fs.writeFileSync(THREADS_FILE, JSON.stringify(threads, null, 2));
};

const readMessages = () => {
  ensureDataDir();
  try {
    const data = fs.readFileSync(MESSAGES_FILE, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

const saveMessage = (message: any) => {
  ensureDataDir();
  const messages = readMessages();
  messages.push(message);
  fs.writeFileSync(MESSAGES_FILE, JSON.stringify(messages, null, 2));
};

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
      const threads = readThreads();
      thread = threads.find((t: any) => t.id === threadId);
      
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
      if (fromUser.role === "obog") {
        return NextResponse.json(
          { error: "Alumni cannot start new conversations. Please wait for a student to message you first.", code: "ALUMNI_CANNOT_INITIATE" },
          { status: 403 }
        );
      }

      actualToUserId = toUserId;
      // Find or create thread
      const threads = readThreads();
      const participants = [fromUserId, actualToUserId].sort();
      thread = threads.find((t: any) => 
        t.participants.length === 2 &&
        t.participants.sort().join(",") === participants.join(",")
      );

      if (!thread) {
        thread = {
          id: `thread_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          participants,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      }
    }

    // Deduct credits BEFORE creating message to ensure atomicity
    // If deduction fails, don't send the message
    const newCredits = currentCredits - creditsCost;
    try {
      await updateUser(fromUserId, {
        credits: newCredits
      });
      console.log(`Credits deducted: User ${fromUserId}, ${currentCredits} -> ${newCredits} (cost: ${creditsCost})`);
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

    // Create message
    const message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      threadId: thread.id,
      fromUserId,
      toUserId: actualToUserId,
      content: messageContent,
      createdAt: new Date().toISOString(),
      read: false,
    };

    // Update thread
    thread.updatedAt = new Date().toISOString();
    thread.lastMessage = message;

    saveMessage(message);
    saveThread(thread);

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
    const threads = readThreads();
    const messages = readMessages();

    // Admin: all threads (read-only chat visibility, features.md 4.5). Else: own threads only.
    const userThreads = isAdmin
      ? threads
      : threads.filter((t: any) => t.participants.includes(userId));

    const threadsWithMessages = await Promise.all(userThreads.map(async (thread: any) => {
      const threadMessages = messages
        .filter((m: any) => m.threadId === thread.id)
        .sort((a: any, b: any) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

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
          lastMessage: threadMessages[0] || null,
          otherUser: otherUserWithoutPassword,
          adminView: true,
          participants,
        };
      }

      return {
        ...thread,
        lastMessage: threadMessages[0] || null,
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

