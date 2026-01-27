import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth-server";
import { createAdminClient } from "@/lib/supabase/server";

// POST - Assign Corporate OB role to a user
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { userId, companyId, isVerified } = body;

    if (!userId || !companyId) {
      return NextResponse.json(
        { error: "Missing required fields: userId and companyId" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Verify user exists
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id, role")
      .eq("id", userId)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Verify company exists
    const { data: company, error: companyError } = await supabase
      .from("companies")
      .select("id")
      .eq("id", companyId)
      .single();

    if (companyError || !company) {
      return NextResponse.json(
        { error: "Company not found" },
        { status: 404 }
      );
    }

    // Check if Corporate OB already exists for this user and company
    const { data: existing } = await supabase
      .from("corporate_obs")
      .select("id")
      .eq("user_id", userId)
      .eq("company_id", companyId)
      .maybeSingle();

    if (existing) {
      // Update existing record
      const { data, error } = await supabase
        .from("corporate_obs")
        .update({
          is_verified: isVerified !== undefined ? isVerified : false,
        })
        .eq("id", existing.id)
        .select()
        .single();

      if (error) {
        console.error("Error updating corporate OB:", error);
        return NextResponse.json(
          { error: "Failed to update Corporate OB" },
          { status: 500 }
        );
      }

      // Update user role to corporate_ob
      await supabase
        .from("users")
        .update({ role: "corporate_ob" })
        .eq("id", userId);

      return NextResponse.json({
        corporateOB: data,
        message: "Corporate OB updated successfully",
      });
    } else {
      // Create new Corporate OB record
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(2, 15);
      const corporateOBId = `corp_ob_${timestamp}_${randomStr}`;

      const { data, error } = await supabase
        .from("corporate_obs")
        .insert({
          id: corporateOBId,
          user_id: userId,
          company_id: companyId,
          is_verified: isVerified !== undefined ? isVerified : false,
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating corporate OB:", error);
        return NextResponse.json(
          { error: "Failed to create Corporate OB" },
          { status: 500 }
        );
      }

      // Update user role to corporate_ob
      await supabase
        .from("users")
        .update({ role: "corporate_ob" })
        .eq("id", userId);

      return NextResponse.json({
        corporateOB: data,
        message: "Corporate OB assigned successfully",
      }, { status: 201 });
    }
  } catch (error: any) {
    console.error("Error assigning Corporate OB:", error);
    return NextResponse.json(
      { error: error.message || "Failed to assign Corporate OB" },
      { status: 500 }
    );
  }
}

// GET - List all Corporate OBs
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const supabase = createAdminClient();

    // Use admin client which bypasses RLS - fetch corporate_obs directly
    const { data: corporateOBs, error } = await supabase
      .from("corporate_obs")
      .select(`
        *,
        users:user_id (id, name, email, role),
        companies:company_id (id, name, logo_url, industry, description, website, stripe_customer_id, created_at, updated_at)
      `)
      .order("created_at", { ascending: false });
    
    // If error is RLS-related, log it for debugging
    if (error && error.code === '42501') {
      console.error("RLS permission error - check SUPABASE_SERVICE_ROLE_KEY is set correctly");
      console.error("Service role key should bypass RLS. Error details:", error);
    }

    if (error) {
      console.error("Error fetching Corporate OBs:", error);
      return NextResponse.json(
        { error: "Failed to fetch Corporate OBs" },
        { status: 500 }
      );
    }

    return NextResponse.json({ corporateOBs: corporateOBs || [] });
  } catch (error: any) {
    console.error("Error fetching Corporate OBs:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch Corporate OBs" },
      { status: 500 }
    );
  }
}
