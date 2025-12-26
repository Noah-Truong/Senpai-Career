import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth-server";
import { getUserById, updateUser } from "@/lib/users";

// GET - Fetch current company's profile
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Only allow company users
    if (session.user.role !== "company") {
      return NextResponse.json(
        { error: "Forbidden - Company access only" },
        { status: 403 }
      );
    }

    let user = getUserById(session.user.id);
    
    if (!user) {
      return NextResponse.json(
        { error: "Company profile not found" },
        { status: 404 }
      );
    }

    // Return company profile without password
    const { password, ...companyWithoutPassword } = user;
    return NextResponse.json({ company: companyWithoutPassword });
  } catch (error: any) {
    console.error("Error fetching company profile:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch company profile" },
      { status: 500 }
    );
  }
}

// PUT - Update current company's profile
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Only allow company users
    if (session.user.role !== "company") {
      return NextResponse.json(
        { error: "Forbidden - Company access only" },
        { status: 403 }
      );
    }

    const body = await request.json();
    
    // Extract allowed company fields (exclude system fields)
    const {
      id,
      email,
      password,
      createdAt,
      role,
      ...allowedUpdates
    } = body;

    // Validate required fields if provided
    if (allowedUpdates.companyName !== undefined && !allowedUpdates.companyName?.trim()) {
      return NextResponse.json(
        { error: "Company name is required" },
        { status: 400 }
      );
    }

    // Update company profile
    const updatedCompany = await updateUser(session.user.id, allowedUpdates);

    // Return updated company without password
    const { password: _, ...companyWithoutPassword } = updatedCompany;
    return NextResponse.json(
      { company: companyWithoutPassword, message: "Company profile updated successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error updating company profile:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update company profile" },
      { status: 500 }
    );
  }
}

