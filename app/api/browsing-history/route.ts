import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth-server";
import { createClient } from "@/lib/supabase/server";

// GET - Fetch browsing history for current student
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Only students have browsing history
    if (session.user.role !== "student") {
      return NextResponse.json(
        { error: "Only students have browsing history" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    const supabase = await createClient();
    
    // Get unique items (most recent view per item)
    const { data: history, error } = await supabase
      .from("browsing_history")
      .select("*")
      .eq("student_id", session.user.id)
      .order("viewed_at", { ascending: false })
      .limit(limit * 2); // Get more to filter duplicates

    if (error) {
      console.error("Error fetching browsing history:", error);
      return NextResponse.json(
        { error: "Failed to fetch browsing history" },
        { status: 500 }
      );
    }

    // Deduplicate by item_type + item_id, keeping most recent
    const seen = new Map<string, any>();
    (history || []).forEach((item: any) => {
      const key = `${item.item_type}_${item.item_id}`;
      if (!seen.has(key) || new Date(item.viewed_at) > new Date(seen.get(key).viewed_at)) {
        seen.set(key, item);
      }
    });

    const uniqueHistory = Array.from(seen.values())
      .sort((a, b) => new Date(b.viewed_at).getTime() - new Date(a.viewed_at).getTime())
      .slice(0, limit);

    return NextResponse.json({ history: uniqueHistory });
  } catch (error: any) {
    console.error("Error fetching browsing history:", error);
    return NextResponse.json(
      { error: "Failed to fetch browsing history" },
      { status: 500 }
    );
  }
}

// POST - Record a page view
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Only students have browsing history
    if (session.user.role !== "student") {
      return NextResponse.json(
        { error: "Only students have browsing history" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { itemType, itemId } = body;

    if (!itemType || !itemId) {
      return NextResponse.json(
        { error: "Missing required fields: itemType and itemId" },
        { status: 400 }
      );
    }

    if (itemType !== "company" && itemType !== "recruitment") {
      return NextResponse.json(
        { error: "Invalid itemType. Must be 'company' or 'recruitment'" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Use the database function to record history
    const { error: functionError } = await supabase.rpc("record_browsing_history", {
      p_student_id: session.user.id,
      p_item_type: itemType,
      p_item_id: itemId,
    });

    if (functionError) {
      // Fallback: direct insert if function doesn't exist
      const { error: insertError } = await supabase
        .from("browsing_history")
        .insert({
          student_id: session.user.id,
          item_type: itemType,
          item_id: itemId,
        });

      if (insertError) {
        console.error("Error recording browsing history:", insertError);
        return NextResponse.json(
          { error: "Failed to record browsing history" },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ message: "Browsing history recorded" });
  } catch (error: any) {
    console.error("Error recording browsing history:", error);
    return NextResponse.json(
      { error: "Failed to record browsing history" },
      { status: 500 }
    );
  }
}
