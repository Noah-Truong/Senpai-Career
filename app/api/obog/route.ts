import { NextRequest, NextResponse } from "next/server";
import { getOBOGUsers } from "@/lib/users";

export async function GET(request: NextRequest) {
  try {
    const obogUsers = await getOBOGUsers();

    // Return users without password fields
    const usersWithoutPasswords = obogUsers.map(({ password, password_hash, ...user }: any) => user);

    return NextResponse.json({ users: usersWithoutPasswords });
  } catch (error: any) {
    console.error("Error fetching OB/OG users:", error);
    return NextResponse.json(
      { error: "Failed to fetch OB/OG users" },
      { status: 500 }
    );
  }
}

