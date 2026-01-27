import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth-server";
import { isCorporateOB, getCorporateOBCompany } from "@/lib/corporate-ob";
import Stripe from "stripe";

const getStripe = () => new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-12-15.clover",
});

// GET - List payment methods for company
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Only Corporate OB can view payment methods
    const isCorporateOBUser = await isCorporateOB(session.user.id);
    if (!isCorporateOBUser) {
      return NextResponse.json(
        { error: "Only Corporate OB can view payment methods" },
        { status: 403 }
      );
    }

    const corporateOBCompany = await getCorporateOBCompany(session.user.id);
    if (!corporateOBCompany || !corporateOBCompany.stripeCustomerId) {
      return NextResponse.json({ paymentMethods: [] });
    }

    const stripe = getStripe();
    const paymentMethods = await stripe.paymentMethods.list({
      customer: corporateOBCompany.stripeCustomerId,
      type: "card",
    });

    // Get customer to find default payment method
    const customer = await stripe.customers.retrieve(corporateOBCompany.stripeCustomerId);
    const defaultPaymentMethodId = typeof customer === "object" && !customer.deleted 
      ? customer.invoice_settings?.default_payment_method 
      : null;

    const formattedMethods = paymentMethods.data.map((pm) => ({
      id: pm.id,
      type: pm.type,
      card: pm.card ? {
        brand: pm.card.brand,
        last4: pm.card.last4,
        expMonth: pm.card.exp_month,
        expYear: pm.card.exp_year,
      } : null,
      isDefault: pm.id === defaultPaymentMethodId,
    }));

    return NextResponse.json({ paymentMethods: formattedMethods });
  } catch (error: any) {
    console.error("Error fetching payment methods:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch payment methods" },
      { status: 500 }
    );
  }
}
