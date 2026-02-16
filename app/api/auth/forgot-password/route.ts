import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// For the reset link to open your app's /reset-password page:
// 1. Supabase Dashboard → Authentication → URL Configuration → Redirect URLs:
//    Add: https://yourdomain.com/reset-password (and http://localhost:3000/reset-password for local)
// 2. Supabase Dashboard → Authentication → Email Templates → "Reset Password":
//    Use {{ .RedirectTo }} in the link (not {{ .SiteURL }}) so the email points to the URL above.

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const redirectTo = `${baseUrl.replace(/\/$/, "")}/reset-password`;

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo
    });

    // Always return success message to prevent email enumeration
    // Supabase handles the case where email doesn't exist gracefully
    if (error) {
      console.error("Password reset error:", error);
      // Still return success to prevent email enumeration
    }

    return NextResponse.json({
      message: "If an account with that email exists, a password reset link has been sent.",
    });
  } catch (error: any) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Failed to process password reset request" },
      { status: 500 }
    );
  }
}

