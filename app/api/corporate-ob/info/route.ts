import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth-server";
import { getCorporateOBByUserId, getCorporateOBCompany } from "@/lib/corporate-ob";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "Missing userId parameter" },
        { status: 400 }
      );
    }

    // Get Corporate OB record
    const corporateOB = await getCorporateOBByUserId(userId);
    if (!corporateOB) {
      return NextResponse.json(
        { error: "Corporate OB not found" },
        { status: 404 }
      );
    }

    // Get company info
    const company = await getCorporateOBCompany(userId);

    return NextResponse.json({
      ...corporateOB,
      company,
    });
  } catch (error: any) {
    console.error("Error fetching Corporate OB info:", error);
    return NextResponse.json(
      { error: "Failed to fetch Corporate OB info" },
      { status: 500 }
    );
  }
}
