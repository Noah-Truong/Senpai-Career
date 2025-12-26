import { NextRequest, NextResponse } from "next/server";
import { getUserByEmail } from "@/lib/users";
import { generateResetToken, cleanupExpiredTokens } from "@/lib/password-reset";
import { sendPasswordResetEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Clean up expired tokens
    cleanupExpiredTokens();

    // Check if user exists
    const user = getUserByEmail(email);
    
    // For security, don't reveal if email exists or not
    // Always return success message
    if (user) {
      const token = generateResetToken(email);
      const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
      const resetUrl = `${baseUrl}/reset-password/${token}`;
      
      try {
        // Send password reset email
        await sendPasswordResetEmail(
          user.email,
          user.name || "User",
          resetUrl
        );
        
        console.log(`Password reset email sent to ${user.email}`);
      } catch (emailError: any) {
        console.error("Failed to send password reset email:", emailError);
        
        // In development, if it's a Resend test email restriction, return the reset link
        // This allows testing without needing to verify a domain
        if (process.env.NODE_ENV === "development" && 
            emailError.message?.includes("You can only send testing emails to your own email address")) {
          console.warn("Resend test mode restriction: Can only send to verified email. Returning reset link for testing.");
          return NextResponse.json({
            message: "Password reset link generated (development mode - Resend test restriction)",
            resetUrl, // Return reset link in development when Resend has restrictions
          });
        }
        
        // Still return success to prevent email enumeration
        // But log the error for debugging
      }
    }

    // Always return success message to prevent email enumeration
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

