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

    // Get user profile to check if they're an international student
    const { data: studentProfile } = await supabase
      .from("student_profiles")
      .select("nationality")
      .eq("id", session.user.id)
      .single();

    const isInternational = studentProfile?.nationality && 
      studentProfile.nationality.toLowerCase() !== "japan" && 
      studentProfile.nationality.toLowerCase() !== "japanese";

    // For international students, require documents
    if (isInternational) {
      const docs = complianceDocuments || [];
      const hasPermissionDoc = docs.some((d: string) => d.includes("permission") || d.includes("activity"));
      const hasJapaneseCert = docs.some((d: string) => d.includes("japanese") || d.includes("jlpt") || d.includes("cert"));

      if (!hasPermissionDoc) {
        return NextResponse.json(
          { error: "Permission for Activities Outside Qualification document is required for international students" },
          { status: 400 }
        );
      }

      if (!hasJapaneseCert) {
        return NextResponse.json(
          { error: "Japanese Language Certification document is required for international students" },
          { status: 400 }
        );
      }
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
        { error: updateError.message || "Failed to submit compliance" },
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

    // Allow students to view their own compliance, or admins to view any student's compliance
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const targetUserId = userId || session.user.id;

    if (session.user.role !== "student" && session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Only students and admins can view compliance" },
        { status: 403 }
      );
    }

    // Students can only view their own compliance
    if (session.user.role === "student" && targetUserId !== session.user.id) {
      return NextResponse.json(
        { error: "You can only view your own compliance" },
        { status: 403 }
      );
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("student_profiles")
      .select("compliance_agreed, compliance_agreed_at, compliance_status, compliance_submitted_at, compliance_documents")
      .eq("id", targetUserId)
      .single();

    if (error) {
      console.error("Error fetching compliance:", error);
      return NextResponse.json(
        { error: error.message || "Failed to fetch compliance status" },
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
