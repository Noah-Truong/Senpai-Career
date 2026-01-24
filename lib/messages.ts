import { createClient } from "@/lib/supabase/server";
import { Message, MessageThread } from "@/types";

// Transform database row to Message
function transformMessage(row: any): Message {
  // Parse content (can be JSON string for MultilingualContent or plain text)
  let content: string | { en: string; ja: string };
  try {
    if (typeof row.content === "string" && row.content.trim().startsWith("{")) {
      content = JSON.parse(row.content);
    } else {
      content = row.content;
    }
  } catch {
    content = row.content;
  }

  return {
    id: row.id,
    threadId: row.thread_id,
    fromUserId: row.sender_id,
    toUserId: "", // Will be set by caller based on thread participants
    content,
    createdAt: new Date(row.created_at),
    read: row.read_by && row.read_by.length > 0,
  };
}

// Transform database row to MessageThread
function transformThread(row: any, lastMessage?: Message): MessageThread {
  return {
    id: row.id,
    participants: row.participant_ids || [],
    lastMessage,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.last_message_at || row.created_at),
  };
}

/**
 * Get or create a thread between two users
 */
export async function getOrCreateThread(
  userId1: string,
  userId2: string
): Promise<MessageThread> {
  const supabase = await createClient();
  
  // Sort participant IDs for consistent lookup
  const participants = [userId1, userId2].sort();
  
  // Try to find existing thread (must have exactly these 2 participants)
  // Query threads that contain both participants, then filter for exact match
  const { data: allThreads } = await supabase
    .from("threads")
    .select("*")
    .contains("participant_ids", [userId1])
    .contains("participant_ids", [userId2]);

  // Filter for exact match (2 participants, sorted)
  const existingThread = allThreads?.find(
    (t) =>
      t.participant_ids?.length === 2 &&
      t.participant_ids.sort().join(",") === participants.join(",")
  );

  if (existingThread) {
    const thread = existingThread;
    // Get last message
    const { data: lastMsg } = await supabase
      .from("messages")
      .select("*")
      .eq("thread_id", thread.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();
    
    return transformThread(thread, lastMsg ? transformMessage(lastMsg) : undefined);
  }

  // Create new thread
  const threadId = `thread_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const { data: newThread, error } = await supabase
    .from("threads")
    .insert({
      id: threadId,
      participant_ids: participants,
      created_by: userId1,
    })
    .select()
    .single();

  if (error || !newThread) {
    throw new Error("Failed to create thread");
  }

  return transformThread(newThread);
}

/**
 * Get thread by ID
 */
export async function getThreadById(threadId: string): Promise<MessageThread | null> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("threads")
    .select("*")
    .eq("id", threadId)
    .single();

  if (error || !data) {
    return null;
  }

  // Get last message
  const { data: lastMsg } = await supabase
    .from("messages")
    .select("*")
    .eq("thread_id", threadId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  return transformThread(data, lastMsg ? transformMessage(lastMsg) : undefined);
}

/**
 * Get all threads for a user
 */
export async function getUserThreads(userId: string): Promise<MessageThread[]> {
  const supabase = await createClient();
  
  // Find threads where userId is in participant_ids array
  const { data: threads, error } = await supabase
    .from("threads")
    .select("*")
    .contains("participant_ids", [userId])
    .order("last_message_at", { ascending: false });

  if (error || !threads) {
    return [];
  }

  // Get last message for each thread
  const threadsWithMessages = await Promise.all(
    threads.map(async (thread) => {
      const { data: lastMsg } = await supabase
        .from("messages")
        .select("*")
        .eq("thread_id", thread.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();
      
      return transformThread(thread, lastMsg ? transformMessage(lastMsg) : undefined);
    })
  );

  return threadsWithMessages;
}

/**
 * Get all messages in a thread
 */
export async function getThreadMessages(threadId: string): Promise<Message[]> {
  const supabase = await createClient();
  
  const { data: messages, error } = await supabase
    .from("messages")
    .select("*")
    .eq("thread_id", threadId)
    .order("created_at", { ascending: true });

  if (error || !messages) {
    return [];
  }

  // Get thread to determine toUserId for each message
  const thread = await getThreadById(threadId);
  if (!thread) {
    return [];
  }

  return messages.map((msg) => {
    const transformed = transformMessage(msg);
    // Set toUserId based on thread participants
    transformed.toUserId = thread.participants.find(
      (id) => id !== transformed.fromUserId
    ) || "";
    return transformed;
  });
}

/**
 * Create a new message
 */
export async function createMessage(
  threadId: string,
  fromUserId: string,
  content: string | { en: string; ja: string }
): Promise<Message> {
  const supabase = await createClient();
  
  // Verify thread exists and user is a participant
  const thread = await getThreadById(threadId);
  if (!thread) {
    throw new Error("Thread not found");
  }
  
  if (!thread.participants.includes(fromUserId)) {
    throw new Error("User is not a participant in this thread");
  }

  // Determine toUserId
  const toUserId = thread.participants.find((id) => id !== fromUserId) || "";

  // Serialize content (if it's an object, store as JSON string)
  const contentStr = typeof content === "string" 
    ? content 
    : JSON.stringify(content);

  const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const { data: message, error } = await supabase
    .from("messages")
    .insert({
      id: messageId,
      thread_id: threadId,
      sender_id: fromUserId,
      content: contentStr,
      read_by: [],
    })
    .select()
    .single();

  if (error || !message) {
    throw new Error("Failed to create message");
  }

  // Update thread's last_message_at
  await supabase
    .from("threads")
    .update({ last_message_at: new Date().toISOString() })
    .eq("id", threadId);

  const transformed = transformMessage(message);
  transformed.toUserId = toUserId;
  return transformed;
}

/**
 * Mark message as read
 */
export async function markMessageAsRead(
  messageId: string,
  userId: string
): Promise<void> {
  const supabase = await createClient();
  
  // Get current read_by array
  const { data: message } = await supabase
    .from("messages")
    .select("read_by")
    .eq("id", messageId)
    .single();

  if (!message) {
    return;
  }

  const readBy = (message.read_by || []) as string[];
  if (!readBy.includes(userId)) {
    readBy.push(userId);
    
    await supabase
      .from("messages")
      .update({ read_by: readBy })
      .eq("id", messageId);
  }
}

/**
 * Mark all messages in a thread as read for a user
 */
export async function markThreadAsRead(
  threadId: string,
  userId: string
): Promise<void> {
  const supabase = await createClient();
  
  // Get all messages in thread
  const { data: messages } = await supabase
    .from("messages")
    .select("id, read_by")
    .eq("thread_id", threadId);

  if (!messages) {
    return;
  }

  // Update each message that hasn't been read by this user
  for (const msg of messages) {
    const readBy = (msg.read_by || []) as string[];
    if (!readBy.includes(userId)) {
      readBy.push(userId);
      await supabase
        .from("messages")
        .update({ read_by: readBy })
        .eq("id", msg.id);
    }
  }
}
