import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth-server";
import { getUserById, updateUser, ensureUserExists } from "@/lib/users";
import { createMultilingualContent } from "@/lib/translate";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import {
  getOrCreateThread,
  getThreadById,
  getUserThreads,
  createMessage as createMessageInDb,
} from "@/lib/messages";
import { isCorporateOB, getCorporateOBCompany } from "@/lib/corporate-ob";
import Stripe from "stripe";

const getStripe = () => new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-12-15.clover",
});

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

    // Check if this is a Corporate OB message (different billing)
    const isCorporateOBUser = await isCorporateOB(fromUserId);
    
    // For Corporate OB: use pay-per-message (¥500) instead of credits
    // For others: use credits (10 credits per message)
    if (isCorporateOBUser) {
      // Corporate OB billing will be handled after message creation
      // Skip credit check for Corporate OB
    } else {
      // Credits cost is the same for all non-Corporate OB users
      const creditsCost = 10; // Same for all account types
      const currentCredits = fromUser.credits ?? 0;

      if (currentCredits < creditsCost) {
        return NextResponse.json(
          { error: "Insufficient credits", insufficientCredits: true },
          { status: 402 } // Payment Required
        );
      }
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
      // Corporate OB can initiate conversations with students
      // Companies and students can initiate conversations
      if (fromUser.role === "obog") {
        return NextResponse.json(
          { error: "Alumni cannot start new conversations. Please wait for a student to message you first.", code: "ALUMNI_CANNOT_INITIATE" },
          { status: 403 }
        );
      }

      // Check if this is a Corporate OB to Student message
      const toUser = await getUserById(actualToUserId);
      const isCorporateOBToStudent = fromUser.role === "corporate_ob" && toUser?.role === "student";
      
      // Students cannot initiate conversations with Corporate OB
      if (fromUser.role === "student" && toUser?.role === "corporate_ob") {
        return NextResponse.json(
          { error: "Students cannot initiate conversations with Corporate OB. Please wait for them to message you first.", code: "STUDENT_CANNOT_INITIATE_CORP_OB" },
          { status: 403 }
        );
      }

      actualToUserId = toUserId;
      // Find or create thread
      thread = await getOrCreateThread(fromUserId, actualToUserId);
    }

    // Deduct credits for non-Corporate OB users BEFORE creating message
    // Corporate OB will be charged via Stripe after message creation
    if (!isCorporateOBUser) {
      const creditsCost = 10;
      const currentCredits = fromUser.credits ?? 0;
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

    // For Corporate OB: Charge ¥500 per message via Stripe
    if (isCorporateOBUser) {
      try {
        const corporateOBCompany = await getCorporateOBCompany(fromUserId);
        if (!corporateOBCompany || !corporateOBCompany.stripeCustomerId) {
          // Refund/delete message if no payment method
          return NextResponse.json(
            { 
              error: "No payment method configured. Please add a payment method to send messages.",
              code: "NO_PAYMENT_METHOD",
              requiresPaymentMethod: true
            },
            { status: 402 }
          );
        }

        const stripe = getStripe();
        const amountJPY = 500; // ¥500 per message

        // Create PaymentIntent
        const paymentIntent = await stripe.paymentIntents.create({
          amount: amountJPY,
          currency: "jpy",
          customer: corporateOBCompany.stripeCustomerId,
          payment_method: undefined, // Will use default payment method
          confirm: true,
          description: `Message to student - ${actualToUserId}`,
        });

        // Create charge record
        const supabase = createAdminClient();
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(2, 15);
        const chargeId = `charge_${timestamp}_${randomStr}`;

        await supabase.from("charges").insert({
          id: chargeId,
          company_id: corporateOBCompany.id,
          corporate_ob_id: fromUserId,
          message_id: message.id,
          amount: amountJPY,
          stripe_payment_intent_id: paymentIntent.id,
          status: paymentIntent.status === "succeeded" ? "succeeded" : "pending",
        });

        if (paymentIntent.status !== "succeeded") {
          console.warn("PaymentIntent not succeeded:", paymentIntent.status);
        }
      } catch (billingError: any) {
        console.error("Error processing Corporate OB billing:", billingError);
        // Don't fail the message if billing fails - log it for admin review
        // In production, you might want to handle this differently
      }
    }

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
        creditsDeducted: isCorporateOBUser ? 0 : 10,
        remainingCredits: isCorporateOBUser ? undefined : ((fromUser.credits ?? 0) - 10),
        amountCharged: isCorporateOBUser ? 500 : undefined,
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

