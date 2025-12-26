import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth-server";
import { getUserById, updateUser } from "@/lib/users";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { action, reason } = body; // action: "add" | "remove", reason: string

    if (!action || (action !== "add" && action !== "remove")) {
      return NextResponse.json(
        { error: "Invalid action. Must be 'add' or 'remove'" },
        { status: 400 }
      );
    }

    const user = getUserById(id);
    
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Only students can have strikes
    if (user.role !== "student") {
      return NextResponse.json(
        { error: "Strikes can only be applied to students" },
        { status: 400 }
      );
    }

    const currentStrikes = (user as any).strikes || 0;
    let newStrikes = currentStrikes;

    if (action === "add") {
      newStrikes = currentStrikes + 1;
    } else if (action === "remove") {
      newStrikes = Math.max(0, currentStrikes - 1);
    }

    // Auto-ban if strikes reach 2
    const isBanned = newStrikes >= 2;

    // Update user
    await updateUser(id, {
      strikes: newStrikes,
      isBanned: isBanned,
    } as any);

    const updatedUser = getUserById(id);

    return NextResponse.json({
      user: updatedUser,
      message: action === "add" 
        ? `Strike added. User now has ${newStrikes} strike(s).${isBanned ? " User has been banned." : ""}`
        : `Strike removed. User now has ${newStrikes} strike(s).`,
    });
  } catch (error: any) {
    console.error("Error updating strikes:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update strikes" },
      { status: 500 }
    );
  }
}

