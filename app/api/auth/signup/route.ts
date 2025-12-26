import { NextRequest, NextResponse } from "next/server";
import { saveUser, readUsers } from "@/lib/users";
import { UserRole } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      email,
      password,
      name,
      role,
      ...profileData
    } = body;

    // Validate required fields
    if (!email || !password || !name || !role) {
      return NextResponse.json(
        { error: `Missing required fields. Email: ${!!email}, Password: ${!!password}, Name: ${!!name}, Role: ${!!role}` },
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

    // Validate role
    const validRoles: UserRole[] = ["student", "obog", "company"];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: "Invalid role" },
        { status: 400 }
      );
    }

    // Create user based on role
    const userData: any = {
      email,
      password,
      name,
      role,
      ...profileData,
    };

    // Add role-specific defaults
    if (role === "student") {
      userData.strikes = 0;
      userData.isBanned = false;
    } else if (role === "company") {
    }

    const user = await saveUser(userData);

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return NextResponse.json(
      { user: userWithoutPassword, message: "User created successfully" },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Signup API error:", error);
    if (error.message && error.message.includes("already exists")) {
      return NextResponse.json(
        { error: error.message },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: error.message || "Failed to create user. Please try again." },
      { status: 500 }
    );
  }
}

