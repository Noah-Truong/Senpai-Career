import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth-server";
import { isCorporateOB, getCorporateOBCompany } from "@/lib/corporate-ob";
import { createClient } from "@/lib/supabase/server";

// GET - Get billing history for Corporate OB's company
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Only Corporate OB can view billing history
    const isCorporateOBUser = await isCorporateOB(session.user.id);
    if (!isCorporateOBUser) {
      return NextResponse.json(
        { error: "Only Corporate OB can view billing history" },
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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = (page - 1) * limit;

    const supabase = await createClient();

    // Get charges for this company
    const { data: charges, error, count } = await supabase
      .from("charges")
      .select("*", { count: "exact" })
      .eq("company_id", corporateOBCompany.id)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("Error fetching charges:", error);
      return NextResponse.json(
        { error: "Failed to fetch billing history" },
        { status: 500 }
      );
    }

    // Get user details for recipients
    const chargesWithUsers = await Promise.all(
      (charges || []).map(async (charge) => {
        // Get message to find recipient
        const { data: message } = await supabase
          .from("messages")
          .select("thread_id, sender_id")
          .eq("id", charge.message_id)
          .single();

        if (message) {
          // Get thread to find recipient
          const { data: thread } = await supabase
            .from("threads")
            .select("participant_ids")
            .eq("id", message.thread_id)
            .single();

          if (thread) {
            const recipientId = thread.participant_ids.find((id: string) => id !== charge.corporate_ob_id);
            if (recipientId) {
              const { data: recipient } = await supabase
                .from("users")
                .select("name, email")
                .eq("id", recipientId)
                .single();

              return {
                ...charge,
                recipient: recipient ? { name: recipient.name, email: recipient.email } : null,
              };
            }
          }
        }

        return {
          ...charge,
          recipient: null,
        };
      })
    );

    // Calculate monthly totals
    const monthlyTotals: Record<string, { total: number; count: number }> = {};
    (charges || []).forEach((charge) => {
      if (charge.status === "succeeded") {
        const month = new Date(charge.created_at).toISOString().substring(0, 7); // YYYY-MM
        if (!monthlyTotals[month]) {
          monthlyTotals[month] = { total: 0, count: 0 };
        }
        monthlyTotals[month].total += charge.amount;
        monthlyTotals[month].count += 1;
      }
    });

    return NextResponse.json({
      charges: chargesWithUsers,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
      monthlyTotals,
    });
  } catch (error: any) {
    console.error("Error fetching billing history:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch billing history" },
      { status: 500 }
    );
  }
}
