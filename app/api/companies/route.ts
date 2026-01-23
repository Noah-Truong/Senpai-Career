import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth-server";
import { readUsers } from "@/lib/users";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const users = await readUsers();
    const companies = users
      .filter(u => u.role === "company")
      .map(({ password, password_hash, ...company }: any) => company);

    return NextResponse.json({ companies });
  } catch (error: any) {
    console.error("Error fetching companies:", error);
    return NextResponse.json(
      { error: "Failed to fetch companies" },
      { status: 500 }
    );
  }
}

