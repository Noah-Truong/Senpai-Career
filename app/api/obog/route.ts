import { NextRequest, NextResponse } from "next/server";
import { getOBOGUsers } from "@/lib/users";

export async function GET(request: NextRequest) {
  try {
    const obogUsers = getOBOGUsers();
    
    // Return users without passwords
    const usersWithoutPasswords = obogUsers.map(({ password, ...user }) => user);

    return NextResponse.json({ users: usersWithoutPasswords });
  } catch (error: any) {
    console.error("Error fetching OB/OG users:", error);
    return NextResponse.json(
      { error: "Failed to fetch OB/OG users" },
      { status: 500 }
    );
  }
}

