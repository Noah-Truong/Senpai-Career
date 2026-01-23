import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth-server";
import fs from "fs";
import path from "path";
import { getUserById } from "@/lib/users";

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

const readMessages = () => {
  try {
    ensureDataDir();
    const data = fs.readFileSync(MESSAGES_FILE, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

const readThreads = () => {
  try {
    ensureDataDir();
    const data = fs.readFileSync(THREADS_FILE, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

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
    const threads = readThreads();
    const thread = threads.find((t: any) => t.id === threadId);

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

    const messages = readMessages()
      .filter((m: any) => m.threadId === threadId)
      .sort((a: any, b: any) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );

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
      return NextResponse.json({
        messages,
        otherUser: participants[0] || otherUserWithoutPassword,
        adminView: true,
        participants: participants.filter(Boolean),
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

