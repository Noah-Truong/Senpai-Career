import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth-server";
import { isCorporateOB, getCorporateOBCompany } from "@/lib/corporate-ob";
import Stripe from "stripe";

const getStripe = () => new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-12-15.clover",
});

// POST - Save payment method (create SetupIntent)
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Only Corporate OB can save payment methods
    const isCorporateOBUser = await isCorporateOB(session.user.id);
    if (!isCorporateOBUser) {
      return NextResponse.json(
        { error: "Only Corporate OB can save payment methods" },
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
      const { createAdminClient } = await import("@/lib/supabase/server");
      const supabase = createAdminClient();
      await supabase
        .from("companies")
        .update({ stripe_customer_id: customerId })
        .eq("id", corporateOBCompany.id);
    }

    const body = await request.json();
    const { paymentMethodId } = body;

    if (!paymentMethodId) {
      return NextResponse.json(
        { error: "Missing paymentMethodId" },
        { status: 400 }
      );
    }

    const stripe = getStripe();

    // Attach payment method to customer
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });

    // Set as default if it's the first payment method
    const existingMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type: "card",
    });

    if (existingMethods.data.length === 1) {
      await stripe.customers.update(customerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });
    }

    return NextResponse.json({ 
      success: true,
      message: "Payment method saved successfully" 
    });
  } catch (error: any) {
    console.error("Error saving payment method:", error);
    return NextResponse.json(
      { error: error.message || "Failed to save payment method" },
      { status: 500 }
    );
  }
}

// DELETE - Remove payment method
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Only Corporate OB can delete payment methods
    const isCorporateOBUser = await isCorporateOB(session.user.id);
    if (!isCorporateOBUser) {
      return NextResponse.json(
        { error: "Only Corporate OB can delete payment methods" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const paymentMethodId = searchParams.get("id");

    if (!paymentMethodId) {
      return NextResponse.json(
        { error: "Missing payment method ID" },
        { status: 400 }
      );
    }

    const corporateOBCompany = await getCorporateOBCompany(session.user.id);
    if (!corporateOBCompany || !corporateOBCompany.stripeCustomerId) {
      return NextResponse.json(
        { error: "Company or customer not found" },
        { status: 404 }
      );
    }

    const stripe = getStripe();

    // Check if it's the default payment method
    const customer = await stripe.customers.retrieve(corporateOBCompany.stripeCustomerId);
    const isDefault = typeof customer === "object" && !customer.deleted &&
      customer.invoice_settings?.default_payment_method === paymentMethodId;

    if (isDefault) {
      return NextResponse.json(
        { error: "Cannot delete default payment method. Please set another as default first." },
        { status: 400 }
      );
    }

    // Detach payment method
    await stripe.paymentMethods.detach(paymentMethodId);

    return NextResponse.json({ 
      success: true,
      message: "Payment method removed successfully" 
    });
  } catch (error: any) {
    console.error("Error deleting payment method:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete payment method" },
      { status: 500 }
    );
  }
}

// PATCH - Set default payment method
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Only Corporate OB can set default payment method
    const isCorporateOBUser = await isCorporateOB(session.user.id);
    if (!isCorporateOBUser) {
      return NextResponse.json(
        { error: "Only Corporate OB can set default payment method" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { paymentMethodId } = body;

    if (!paymentMethodId) {
      return NextResponse.json(
        { error: "Missing paymentMethodId" },
        { status: 400 }
      );
    }

    const corporateOBCompany = await getCorporateOBCompany(session.user.id);
    if (!corporateOBCompany || !corporateOBCompany.stripeCustomerId) {
      return NextResponse.json(
        { error: "Company or customer not found" },
        { status: 404 }
      );
    }

    const stripe = getStripe();

    // Update customer's default payment method
    await stripe.customers.update(corporateOBCompany.stripeCustomerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    return NextResponse.json({ 
      success: true,
      message: "Default payment method updated successfully" 
    });
  } catch (error: any) {
    console.error("Error setting default payment method:", error);
    return NextResponse.json(
      { error: error.message || "Failed to set default payment method" },
      { status: 500 }
    );
  }
}
