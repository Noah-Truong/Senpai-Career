import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth-server";
import { readUsers } from "@/lib/users";

// GET - Fetch users (optionally filtered by role)
// Only accessible to authenticated users
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
    const role = searchParams.get("role");

    let users = await readUsers();
    
    // Filter by role if specified
    if (role) {
      users = users.filter(u => u.role === role);
    }

    // Remove password_hash from response (if it exists)
    const usersWithoutPasswords = users.map(({ password, password_hash, ...user }: any) => user);

    return NextResponse.json({ users: usersWithoutPasswords });
  } catch (error: any) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch users" },
      { status: 500 }
    );
  }
}

