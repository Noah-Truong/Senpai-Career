import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth-server";
import { isCorporateOB, getCorporateOBCompany } from "@/lib/corporate-ob";
import { createAdminClient } from "@/lib/supabase/server";
import Stripe from "stripe";

const getStripe = () => new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-12-15.clover",
});

// POST - Create Stripe customer for company
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Only Corporate OB can create customers for their company
    const isCorporateOBUser = await isCorporateOB(session.user.id);
    if (!isCorporateOBUser) {
      return NextResponse.json(
        { error: "Only Corporate OB can create Stripe customers" },
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

    // If customer already exists, return it
    if (corporateOBCompany.stripeCustomerId) {
      const stripe = getStripe();
      try {
        const customer = await stripe.customers.retrieve(corporateOBCompany.stripeCustomerId);
        return NextResponse.json({ customer });
      } catch (error) {
        // Customer doesn't exist in Stripe, create new one
      }
    }

    // Create new Stripe customer
    const stripe = getStripe();
    const customer = await stripe.customers.create({
      email: session.user.email,
      name: corporateOBCompany.name,
      metadata: {
        company_id: corporateOBCompany.id,
        corporate_ob_id: session.user.id,
      },
    });

    // Update company with Stripe customer ID
    const supabase = createAdminClient();
    await supabase
      .from("companies")
      .update({ stripe_customer_id: customer.id })
      .eq("id", corporateOBCompany.id);

    return NextResponse.json({ customer });
  } catch (error: any) {
    console.error("Error creating Stripe customer:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create Stripe customer" },
      { status: 500 }
    );
  }
}
