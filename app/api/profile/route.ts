import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth-server";
import { getUserById, getUserByEmail, updateUser, readUsers } from "@/lib/users";

// GET - Fetch current user's profile
export async function GET(request: NextRequest) {
  try {
    console.log("Profile API: Attempting to get session...");
    const session = await auth();
    
    if (!session) {
      console.error("Profile API: auth() returned null - no session found");
      return NextResponse.json(
        { error: "Unauthorized - Please log in again" },
        { status: 401 }
      );
    }
    
    if (!session.user) {
      console.error("Profile API: Session exists but no user object");
      return NextResponse.json(
        { error: "Unauthorized - Invalid session" },
        { status: 401 }
      );
    }
    
    console.log("Profile API: Session found for user:", session.user.email);

    console.log("Profile API: Looking for user with ID:", session.user.id);
    let user = getUserById(session.user.id);
    
    // Fallback: try to find by email if ID lookup fails
    if (!user && session.user.email) {
      console.log("Profile API: ID lookup failed, trying email:", session.user.email);
      user = getUserByEmail(session.user.email);
      if (user) {
        console.log("Profile API: Found user by email, ID mismatch. Session ID:", session.user.id, "DB ID:", user.id);
      }
    }
    
    if (!user) {
      console.error("Profile API: User not found with ID:", session.user.id, "or email:", session.user.email);
      // Debug: list all user IDs
      const allUsers = readUsers();
      console.log("Profile API: Available user IDs:", allUsers.map(u => ({ id: u.id, email: u.email })));
      return NextResponse.json(
        { error: `User not found. Please try logging out and logging back in.` },
        { status: 404 }
      );
    }

    // Return user without password
    const { password, ...userWithoutPassword } = user;
    return NextResponse.json({ user: userWithoutPassword });
  } catch (error: any) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

// PUT - Update current user's profile
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const updates = body;

    // Don't allow updating id, email, password, createdAt, or role
    const { id, email, password, createdAt, role, ...allowedUpdates } = updates;

    // Update user
    const updatedUser = await updateUser(session.user.id, allowedUpdates);

    // Return updated user without password
    const { password: _, ...userWithoutPassword } = updatedUser;
    return NextResponse.json(
      { user: userWithoutPassword, message: "Profile updated successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update profile" },
      { status: 500 }
    );
  }
}

