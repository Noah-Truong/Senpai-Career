import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth-server";
import { getUserById, getUserByEmail, updateUser, readUsers, ensureUserExists } from "@/lib/users";
import { createClient } from "@/lib/supabase/server";

// GET - Fetch current user's profile
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session) {
      // User is not authenticated in Supabase at all
      if (process.env.NODE_ENV === "development") {
        // Profile API: No session - user not authenticated in Supabase
      }
      return NextResponse.json(
        { error: "Unauthorized - Please log in again" },
        { status: 401 }
      );
    }
    
    if (!session.user) {
      // Session exists but user object is missing (shouldn't happen, but handle gracefully)
      if (process.env.NODE_ENV === "development") {
        // Profile API: Session exists but user object is missing
      }
      return NextResponse.json(
        { error: "Unauthorized - Invalid session" },
        { status: 401 }
      );
    }

    // User is authenticated in Supabase (session.user exists)
    // Now try to get their full profile from the database
    let user = await getUserById(session.user.id);
    
    // Fallback: try to find by email if ID lookup fails
    if (!user && session.user.email) {
      user = await getUserByEmail(session.user.email);
    }
    
    // If user still doesn't exist in database, try to create from auth metadata
    // This handles the case where user is authenticated but database record is missing
    if (!user) {
      if (process.env.NODE_ENV === "development") {
        console.log("Profile API: User authenticated but no database record, attempting to create...");
        console.log("User ID:", session.user.id);
        console.log("User Email:", session.user.email);
      }
      
      const supabase = await createClient();
      const { data: { user: supabaseUser }, error: getUserError } = await supabase.auth.getUser();
      
      if (getUserError) {
        if (process.env.NODE_ENV === "development") {
          console.error("Profile API: Error getting Supabase user:", getUserError.message);
        }
        return NextResponse.json(
          { error: "Authentication error. Please try logging out and back in." },
          { status: 401 }
        );
      }
      
      if (supabaseUser) {
        const createdUser = await ensureUserExists(supabaseUser);
        if (createdUser) {
          user = createdUser;
          if (process.env.NODE_ENV === "development") {
            // Profile API: Successfully created user record from auth metadata
          }
        } else {
          if (process.env.NODE_ENV === "development") {
            console.error("Profile API: Failed to create user record from auth metadata");
          }
        }
      }
    }
    
    if (!user) {
      return NextResponse.json(
        { error: "User not found. Please try logging out and logging back in." },
        { status: 404 }
      );
    }

    // Return user without password fields
    const { password, password_hash, ...userWithoutPassword } = user as any;
    return NextResponse.json({ user: userWithoutPassword });
  } catch (error: any) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to fetch profile" },
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
    const { id, email, password: _password, createdAt, role, ...allowedUpdates } = updates;

    // Update user
    const updatedUser = await updateUser(session.user.id, allowedUpdates);

    // Return updated user without password fields
    const { password, password_hash, ...userWithoutPassword } = updatedUser as any;
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

