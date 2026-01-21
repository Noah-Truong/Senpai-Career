import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth-server";
import { getUserById } from "@/lib/users";
import Stripe from "stripe";

const getStripe = () => new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-12-15.clover",
});

export async function POST(request: NextRequest) {
  const stripe = getStripe();
  try {
    const session = await auth();
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { credits, isRecurring } = body;

    if (!credits || credits <= 0) {
      return NextResponse.json(
        { error: "Invalid credits amount" },
        { status: 400 }
      );
    }

    // Get user to determine pricing
    const user = await getUserById(session.user.id);
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Calculate price based on user role
    // Companies: 20 credits = 300 JPY (15 JPY per credit)
    // Others: 20 credits = 600 JPY (30 JPY per credit)
    const pricePerCredit = user.role === "company" ? 15 : 30; // JPY per credit
    const amountJPY = Math.round(credits * pricePerCredit);
    
    // Stripe amounts are in smallest currency unit (yen = no decimals)
    const amount = amountJPY;

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    if (isRecurring) {
      // Create a subscription for recurring payments
      // For subscriptions, we'll create a price and subscription
      const price = await stripe.prices.create({
        currency: "jpy",
        unit_amount: amount,
        recurring: {
          interval: "month",
        },
        product_data: {
          name: `${credits} Credits (Monthly)`,
        },
      });

      const checkoutSession = await stripe.checkout.sessions.create({
        mode: "subscription",
        payment_method_types: ["card"],
        line_items: [
          {
            price: price.id,
            quantity: 1,
          },
        ],
        customer_email: user.email,
        metadata: {
          userId: user.id,
          credits: credits.toString(),
          userRole: user.role,
        },
        subscription_data: {
          metadata: {
            userId: user.id,
            credits: credits.toString(),
            userRole: user.role,
          },
        },
        success_url: `${baseUrl}/credits?success=true&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/credits?canceled=true`,
      });

      return NextResponse.json({ 
        sessionId: checkoutSession.id,
        url: checkoutSession.url 
      });
    } else {
      // One-time payment
      const checkoutSession = await stripe.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "jpy",
              product_data: {
                name: `${credits} Credits`,
              },
              unit_amount: amount,
            },
            quantity: 1,
          },
        ],
        customer_email: user.email,
        metadata: {
          userId: user.id,
          credits: credits.toString(),
          userRole: user.role,
        },
        success_url: `${baseUrl}/credits?success=true&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/credits?canceled=true`,
      });

      return NextResponse.json({ 
        sessionId: checkoutSession.id,
        url: checkoutSession.url 
      });
    }
  } catch (error: any) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create checkout session" },
      { status: 500 }
    );
  }
}

