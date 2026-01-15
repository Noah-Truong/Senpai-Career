import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth-server";
import { getUserById, updateUser } from "@/lib/users";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session || !session.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { action, reason } = body; // action: "ban" | "unban"

    if (!action || (action !== "ban" && action !== "unban")) {
      return NextResponse.json(
        { error: "Invalid action. Must be 'ban' or 'unban'" },
        { status: 400 }
      );
    }

    const user = await getUserById(id);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Update ban status
    await updateUser(id, {
      isBanned: action === "ban",
    });

    return NextResponse.json({
      message: `User ${action === "ban" ? "banned" : "unbanned"} successfully`,
      user: {
        ...user,
        isBanned: action === "ban",
      },
    });
  } catch (error: any) {
    console.error("Error updating ban status:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update ban status" },
      { status: 500 }
    );
  }
}

