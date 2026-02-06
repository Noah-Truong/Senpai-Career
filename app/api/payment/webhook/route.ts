import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/server";

const getStripe = () => new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-12-15.clover",
});

const getWebhookSecret = () => process.env.STRIPE_WEBHOOK_SECRET || "";

/** Add credits for a user. Uses service-role client so RLS does not block (webhook has no session). */
async function addCreditsForUser(userId: string, creditsToAdd: number): Promise<void> {
  const supabase = createAdminClient();
  const { data: user, error: fetchError } = await supabase
    .from("users")
    .select("credits")
    .eq("id", userId)
    .single();

  if (fetchError || !user) {
    throw new Error(`User not found: ${userId}`);
  }

  const currentCredits = user.credits ?? 0;
  const newCredits = currentCredits + creditsToAdd;

  const { error: updateError } = await supabase
    .from("users")
    .update({ credits: newCredits })
    .eq("id", userId);

  if (updateError) {
    throw new Error(`Failed to update credits: ${updateError.message}`);
  }
  console.log(`Credits added for user ${userId}: +${creditsToAdd} (total: ${newCredits})`);
}

// Disable body parsing for webhook route
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const webhookSecret = getWebhookSecret();
  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET is not set");
    return NextResponse.json(
      { error: "Webhook not configured" },
      { status: 500 }
    );
  }
  if (!process.env.STRIPE_SECRET_KEY) {
    console.error("STRIPE_SECRET_KEY is not set");
    return NextResponse.json(
      { error: "Stripe not configured" },
      { status: 500 }
    );
  }

  const stripe = getStripe();

  try {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "No signature" },
        { status: 400 }
      );
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error("Webhook signature verification failed:", err.message);
      return NextResponse.json(
        { error: `Webhook Error: ${err.message}` },
        { status: 400 }
      );
    }

    // Handle the event
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      
      if (session.mode === "subscription") {
        // Handle subscription payment
        const subscriptionId = session.subscription as string;
        await stripe.subscriptions.retrieve(subscriptionId);
        
        const userId = session.metadata?.userId;
        const credits = parseInt(session.metadata?.credits || "0", 10);

        if (userId && credits > 0) {
          await addCreditsForUser(userId, credits);
        }
      } else {
        // Handle one-time payment
        const userId = session.metadata?.userId;
        const credits = parseInt(session.metadata?.credits || "0", 10);

        if (userId && credits > 0) {
          await addCreditsForUser(userId, credits);
        }
      }
    } else if (event.type === "invoice.payment_succeeded") {
      // Handle recurring subscription payment
      const invoice = event.data.object as any;
      const subscriptionId = invoice.subscription as string;

      if (subscriptionId) {
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);

        const metadata = subscription.metadata || invoice.metadata;
        const userId = metadata?.userId;
        const credits = parseInt(metadata?.credits || "0", 10);

        if (userId && credits > 0) {
          await addCreditsForUser(userId, credits);
        }
      }
    } else if (event.type === "customer.subscription.deleted") {
      // Handle subscription cancellation
      const subscription = event.data.object as Stripe.Subscription;
      console.log(`Subscription canceled: ${subscription.id}`);
      // You might want to notify the user or update their account status
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: error.message || "Webhook handler failed" },
      { status: 500 }
    );
  }
}

