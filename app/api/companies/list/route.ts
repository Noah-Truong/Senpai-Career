import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth-server";
import { createClient } from "@/lib/supabase/server";
import { getCompaniesWithOBCount } from "@/lib/corporate-ob";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Only admins can list companies (for Corporate OB assignment)
    if (session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const companies = await getCompaniesWithOBCount();

    return NextResponse.json({ companies });
  } catch (error: any) {
    console.error("Error fetching companies:", error);
    return NextResponse.json(
      { error: "Failed to fetch companies" },
      { status: 500 }
    );
  }
}
