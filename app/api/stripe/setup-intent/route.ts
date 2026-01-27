import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth-server";
import { isCorporateOB, getCorporateOBCompany } from "@/lib/corporate-ob";
import { createAdminClient } from "@/lib/supabase/server";
import Stripe from "stripe";

const getStripe = () => new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-12-15.clover",
});

// POST - Create SetupIntent for saving payment method
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Only Corporate OB can create setup intents
    const isCorporateOBUser = await isCorporateOB(session.user.id);
    if (!isCorporateOBUser) {
      return NextResponse.json(
        { error: "Only Corporate OB can create setup intents" },
        { status: 403 }
      );
    }

    const corporateOBCompany = await getCorporateOBCompany(session.user.id);
    if (!corporateOBCompany) {
      return NextResponse.json(
        { error: "Company not found" },
        { status: 404 }
      );
    }

    // Ensure Stripe customer exists
    let customerId = corporateOBCompany.stripeCustomerId;
    if (!customerId) {
      // Create customer first
      const stripe = getStripe();
      const customer = await stripe.customers.create({
        email: session.user.email,
        name: corporateOBCompany.name,
        metadata: {
          company_id: corporateOBCompany.id,
          corporate_ob_id: session.user.id,
        },
      });
      customerId = customer.id;

      // Update company with customer ID
      const supabase = createAdminClient();
      await supabase
        .from("companies")
        .update({ stripe_customer_id: customerId })
        .eq("id", corporateOBCompany.id);
    }

    const stripe = getStripe();

    // Create SetupIntent
    const setupIntent = await stripe.setupIntents.create({
      customer: customerId,
      payment_method_types: ["card"],
    });

    return NextResponse.json({
      clientSecret: setupIntent.client_secret,
      setupIntentId: setupIntent.id,
    });
  } catch (error: any) {
    console.error("Error creating setup intent:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create setup intent" },
      { status: 500 }
    );
  }
}
