import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth-server";
import { deleteUser, getUserById } from "@/lib/users";

// DELETE - Delete current user's account
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Verify user exists in users table
    const user = await getUserById(userId);
    if (!user) {
      // User might already be deleted, return success anyway
      return NextResponse.json(
        { message: "Account already deleted" },
        { status: 200 }
      );
    }

    // Delete the user account (deletes from auth.users and public.users)
    await deleteUser(userId);

    return NextResponse.json(
      { message: "Account deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error deleting account:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete account" },
      { status: 500 }
    );
  }
}

