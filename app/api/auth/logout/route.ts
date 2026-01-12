import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Logout error:", error);
      return NextResponse.json(
        { error: "Logout failed" },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Logged out successfully" });
  } catch (error: any) {
    console.error("Logout API error:", error);
    return NextResponse.json(
      { error: error.message || "Logout failed. Please try again." },
      { status: 500 }
    );
  }
}
