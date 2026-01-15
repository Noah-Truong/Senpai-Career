import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth-server";
import { createClient } from "@/lib/supabase/server";

// POST - Submit compliance agreement
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Only students can submit compliance
    if (session.user.role !== "student") {
      return NextResponse.json(
        { error: "Only students can submit compliance" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { complianceAgreed, complianceDocuments } = body;

    if (!complianceAgreed) {
      return NextResponse.json(
        { error: "You must agree to the terms and rules" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Update student profile with compliance information
    const { error: updateError } = await supabase
      .from("student_profiles")
      .update({
        compliance_agreed: true,
        compliance_agreed_at: new Date().toISOString(),
        compliance_documents: complianceDocuments || [],
        compliance_status: "submitted",
        compliance_submitted_at: new Date().toISOString(),
      })
      .eq("id", session.user.id);

    if (updateError) {
      console.error("Error updating compliance:", updateError);
      return NextResponse.json(
        { error: "Failed to submit compliance" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        message: "Compliance submitted successfully",
        complianceStatus: "submitted"
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error submitting compliance:", error);
    return NextResponse.json(
      { error: error.message || "Failed to submit compliance" },
      { status: 500 }
    );
  }
}

// GET - Get compliance status
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (session.user.role !== "student") {
      return NextResponse.json(
        { error: "Only students can view compliance" },
        { status: 403 }
      );
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("student_profiles")
      .select("compliance_agreed, compliance_agreed_at, compliance_status, compliance_submitted_at, compliance_documents")
      .eq("id", session.user.id)
      .single();

    if (error) {
      console.error("Error fetching compliance:", error);
      return NextResponse.json(
        { error: "Failed to fetch compliance status" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      complianceAgreed: data?.compliance_agreed || false,
      complianceAgreedAt: data?.compliance_agreed_at,
      complianceStatus: data?.compliance_status || "pending",
      complianceSubmittedAt: data?.compliance_submitted_at,
      complianceDocuments: data?.compliance_documents || [],
    });
  } catch (error: any) {
    console.error("Error fetching compliance:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch compliance status" },
      { status: 500 }
    );
  }
}
