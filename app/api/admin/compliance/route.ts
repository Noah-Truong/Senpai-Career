import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth-server";
import { createClient } from "@/lib/supabase/server";

// PUT - Update compliance status (admin only)
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Only admins can update compliance status
    if (session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { userId, status } = body;

    if (!userId || !status) {
      return NextResponse.json(
        { error: "User ID and status are required" },
        { status: 400 }
      );
    }

    if (!["approved", "rejected"].includes(status)) {
      return NextResponse.json(
        { error: "Status must be 'approved' or 'rejected'" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Update compliance status
    const { error: updateError } = await supabase
      .from("student_profiles")
      .update({
        compliance_status: status,
      })
      .eq("id", userId);

    if (updateError) {
      console.error("Error updating compliance status:", updateError);
      return NextResponse.json(
        { error: updateError.message || "Failed to update compliance status" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        message: "Compliance status updated successfully",
        status 
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error updating compliance status:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update compliance status" },
      { status: 500 }
    );
  }
}
