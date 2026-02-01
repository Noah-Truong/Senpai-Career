import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth-server";
import { isCorporateOB, getCorporateOBCompany } from "@/lib/corporate-ob";
import { createClient } from "@/lib/supabase/server";

// GET - Export billing history as CSV
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Only Corporate OB can export billing history
    const isCorporateOBUser = await isCorporateOB(session.user.id);
    if (!isCorporateOBUser) {
      return NextResponse.json(
        { error: "Only Corporate OB can export billing history" },
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
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const supabase = await createClient();

    // Build query
    let query = supabase
      .from("charges")
      .select("*")
      .eq("company_id", corporateOBCompany.id)
      .order("created_at", { ascending: false });

    // Apply date filters if provided
    if (startDate) {
      query = query.gte("created_at", startDate);
    }
    if (endDate) {
      query = query.lte("created_at", endDate);
    }

    const { data: charges, error } = await query;

    if (error) {
      console.error("Error fetching charges for export:", error);
      return NextResponse.json(
        { error: "Failed to fetch billing history" },
        { status: 500 }
      );
    }

    // Get user details for recipients
    const chargesWithRecipients = await Promise.all(
      (charges || []).map(async (charge) => {
        let recipientName = "";
        let recipientEmail = "";

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
            const recipientId = thread.participant_ids.find(
              (id: string) => id !== charge.corporate_ob_id
            );
            if (recipientId) {
              const { data: recipient } = await supabase
                .from("users")
                .select("name, email")
                .eq("id", recipientId)
                .single();

              if (recipient) {
                recipientName = recipient.name || "";
                recipientEmail = recipient.email || "";
              }
            }
          }
        }

        return {
          ...charge,
          recipientName,
          recipientEmail,
        };
      })
    );

    // Generate CSV content
    const csvHeaders = [
      "Date",
      "Amount (JPY)",
      "Status",
      "Recipient Name",
      "Recipient Email",
      "Stripe Payment Intent ID",
      "Charge ID",
    ];

    const csvRows = chargesWithRecipients.map((charge) => [
      new Date(charge.created_at).toISOString(),
      charge.amount,
      charge.status,
      `"${(charge.recipientName || "").replace(/"/g, '""')}"`,
      `"${(charge.recipientEmail || "").replace(/"/g, '""')}"`,
      charge.stripe_payment_intent_id || "",
      charge.id,
    ]);

    const csvContent = [
      csvHeaders.join(","),
      ...csvRows.map((row) => row.join(",")),
    ].join("\n");

    // Return CSV file
    const filename = `billing-history-${corporateOBCompany.name || "company"}-${new Date().toISOString().split("T")[0]}.csv`;

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    console.error("Error exporting billing history:", error);
    return NextResponse.json(
      { error: error.message || "Failed to export billing history" },
      { status: 500 }
    );
  }
}
