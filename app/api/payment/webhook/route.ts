import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getUserById, updateUser } from "@/lib/users";

const getStripe = () => new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-12-15.clover",
});

const getWebhookSecret = () => process.env.STRIPE_WEBHOOK_SECRET || "";

// Disable body parsing for webhook route
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const stripe = getStripe();
  const webhookSecret = getWebhookSecret();

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
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        
        const userId = session.metadata?.userId;
        const credits = parseInt(session.metadata?.credits || "0");

        if (userId && credits > 0) {
          const user = await getUserById(userId);
          if (user) {
            const currentCredits = user.credits ?? 0;
            await updateUser(userId, {
              credits: currentCredits + credits,
            });

            // Store subscription info (you might want to create a subscriptions table)
            console.log(`Subscription created for user ${userId}: ${subscriptionId}`);
          }
        }
      } else {
        // Handle one-time payment
        const userId = session.metadata?.userId;
        const credits = parseInt(session.metadata?.credits || "0");

        if (userId && credits > 0) {
          const user = await getUserById(userId);
          if (user) {
            const currentCredits = user.credits ?? 0;
            await updateUser(userId, {
              credits: currentCredits + credits,
            });
            console.log(`Credits added for user ${userId}: +${credits}`);
          }
        }
      }
    } else if (event.type === "invoice.payment_succeeded") {
      // Handle recurring subscription payment
      const invoice = event.data.object as any;
      const subscriptionId = invoice.subscription as string;

      if (subscriptionId) {
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);

        // Get metadata from subscription or invoice
        const metadata = subscription.metadata || invoice.metadata;
        const userId = metadata?.userId;
        const credits = parseInt(metadata?.credits || "0");

        if (userId && credits > 0) {
          const user = await getUserById(userId);
          if (user) {
            const currentCredits = user.credits ?? 0;
            await updateUser(userId, {
              credits: currentCredits + credits,
            });
            console.log(`Recurring payment: Added ${credits} credits to user ${userId}`);
          }
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

