import { NextRequest, NextResponse } from "next/server";
import { getUserByEmail, updateUser } from "@/lib/users";
import { validateResetToken, markTokenAsUsed } from "@/lib/password-reset";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json(
        { error: "Token and password are required" },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    // Validate token
    const tokenValidation = validateResetToken(token);
    
    if (!tokenValidation.valid || !tokenValidation.email) {
      return NextResponse.json(
        { error: "Invalid or expired reset token" },
        { status: 400 }
      );
    }

    // Get user
    const user = getUserByEmail(tokenValidation.email);
    
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user password
    // Note: updateUser doesn't allow password updates, so we need to update directly
    const fs = require("fs");
    const path = require("path");
    const USERS_FILE = path.join(process.cwd(), "data", "users.json");
    const users = JSON.parse(fs.readFileSync(USERS_FILE, "utf-8"));
    const userIndex = users.findIndex((u: any) => u.id === user.id);
    
    if (userIndex === -1) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    users[userIndex].password = hashedPassword;
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));

    // Mark token as used
    markTokenAsUsed(token);

    return NextResponse.json({
      message: "Password has been reset successfully",
    });
  } catch (error: any) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to reset password" },
      { status: 500 }
    );
  }
}

