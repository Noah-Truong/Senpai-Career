import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth-server";
import { createClient } from "@/lib/supabase/server";

// GET - Fetch saved items for current student
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Only students can have saved items
    if (session.user.role !== "student") {
      return NextResponse.json(
        { error: "Only students can save items" },
        { status: 403 }
      );
    }

    const supabase = await createClient();
    const { data: savedItems, error } = await supabase
      .from("saved_items")
      .select("*")
      .eq("student_id", session.user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching saved items:", error);
      return NextResponse.json(
        { error: "Failed to fetch saved items" },
        { status: 500 }
      );
    }

    return NextResponse.json({ savedItems: savedItems || [] });
  } catch (error: any) {
    console.error("Error fetching saved items:", error);
    return NextResponse.json(
      { error: "Failed to fetch saved items" },
      { status: 500 }
    );
  }
}

// POST - Save an item (company or recruitment)
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Only students can save items
    if (session.user.role !== "student") {
      return NextResponse.json(
        { error: "Only students can save items" },
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

    // Verify item exists
    const supabase = await createClient();
    if (itemType === "company") {
      const { data: company } = await supabase
        .from("company_profiles")
        .select("id")
        .eq("id", itemId)
        .single();

      if (!company) {
        return NextResponse.json(
          { error: "Company not found" },
          { status: 404 }
        );
      }
    } else if (itemType === "recruitment") {
      const { data: recruitment } = await supabase
        .from("internships")
        .select("id")
        .eq("id", itemId)
        .single();

      if (!recruitment) {
        return NextResponse.json(
          { error: "Recruitment not found" },
          { status: 404 }
        );
      }
    }

    // Save item (UNIQUE constraint will prevent duplicates)
    const { data: savedItem, error } = await supabase
      .from("saved_items")
      .insert({
        student_id: session.user.id,
        item_type: itemType,
        item_id: itemId,
      })
      .select()
      .single();

    if (error) {
      // If duplicate, return existing item
      if (error.code === "23505") {
        const { data: existing } = await supabase
          .from("saved_items")
          .select("*")
          .eq("student_id", session.user.id)
          .eq("item_type", itemType)
          .eq("item_id", itemId)
          .single();

        return NextResponse.json({ savedItem: existing, message: "Already saved" });
      }

      console.error("Error saving item:", error);
      return NextResponse.json(
        { error: "Failed to save item" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { savedItem, message: "Item saved successfully" },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error saving item:", error);
    return NextResponse.json(
      { error: "Failed to save item" },
      { status: 500 }
    );
  }
}

// DELETE - Unsave an item
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Only students can unsave items
    if (session.user.role !== "student") {
      return NextResponse.json(
        { error: "Only students can unsave items" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const itemType = searchParams.get("itemType");
    const itemId = searchParams.get("itemId");

    if (!itemType || !itemId) {
      return NextResponse.json(
        { error: "Missing required parameters: itemType and itemId" },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { error } = await supabase
      .from("saved_items")
      .delete()
      .eq("student_id", session.user.id)
      .eq("item_type", itemType)
      .eq("item_id", itemId);

    if (error) {
      console.error("Error unsaving item:", error);
      return NextResponse.json(
        { error: "Failed to unsave item" },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Item unsaved successfully" });
  } catch (error: any) {
    console.error("Error unsaving item:", error);
    return NextResponse.json(
      { error: "Failed to unsave item" },
      { status: 500 }
    );
  }
}
