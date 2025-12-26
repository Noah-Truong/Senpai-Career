import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth-server";
import fs from "fs";
import path from "path";
import { getUserById } from "@/lib/users";

const MESSAGES_FILE = path.join(process.cwd(), "data", "messages.json");
const THREADS_FILE = path.join(process.cwd(), "data", "threads.json");

const readMessages = () => {
  try {
    const data = fs.readFileSync(MESSAGES_FILE, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

const readThreads = () => {
  try {
    const data = fs.readFileSync(THREADS_FILE, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

export async function GET(
  request: NextRequest,
  { params }: { params: { threadId: string } }
) {
  try {
    const session = await auth();
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const threads = readThreads();
    const thread = threads.find((t: any) => t.id === params.threadId);

    if (!thread) {
      return NextResponse.json(
        { error: "Thread not found" },
        { status: 404 }
      );
    }

    if (!thread.participants.includes(userId)) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Get messages for this thread
    const messages = readMessages()
      .filter((m: any) => m.threadId === params.threadId)
      .sort((a: any, b: any) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );

    // Get other user info
    const otherUserId = thread.participants.find((id: string) => id !== userId);
    const otherUser = otherUserId ? getUserById(otherUserId) : null;
    const { password, ...otherUserWithoutPassword } = otherUser || {};

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

