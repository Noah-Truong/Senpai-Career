import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth-server";
import { getInternshipById, updateInternship, deleteInternship } from "@/lib/internships";
import { getUserById } from "@/lib/users";

// GET - Fetch a single internship by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const internship = getInternshipById(id);

    if (!internship) {
      return NextResponse.json(
        { error: "Internship listing not found" },
        { status: 404 }
      );
    }

    // Populate company information
    const company = getUserById(internship.companyId);
    const internshipWithCompany = {
      ...internship,
      companyName: company?.companyName || "Unknown Company",
      companyLogo: company?.logo,
    };

    return NextResponse.json({ internship: internshipWithCompany });
  } catch (error: any) {
    console.error("Error fetching internship:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch internship" },
      { status: 500 }
    );
  }
}

// PUT - Update an internship listing (company owner only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const internship = getInternshipById(id);

    if (!internship) {
      return NextResponse.json(
        { error: "Internship listing not found" },
        { status: 404 }
      );
    }

    // Only the company that created the listing can update it
    if (internship.companyId !== session.user.id) {
      return NextResponse.json(
        { error: "Forbidden - You can only edit your own listings" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, hourlyWage, workDetails, skillsGained, whyThisCompany } = body;

    // Build update object (only include provided fields)
    const updates: any = {};
    if (title !== undefined) updates.title = title;
    if (hourlyWage !== undefined) updates.hourlyWage = parseFloat(hourlyWage);
    if (workDetails !== undefined) updates.workDetails = workDetails;
    if (skillsGained !== undefined) updates.skillsGained = skillsGained;
    if (whyThisCompany !== undefined) updates.whyThisCompany = whyThisCompany;

    const updatedInternship = updateInternship(id, updates);

    return NextResponse.json(
      { internship: updatedInternship, message: "Internship listing updated successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error updating internship:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update internship listing" },
      { status: 500 }
    );
  }
}

// DELETE - Delete an internship listing (company owner only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const internship = getInternshipById(id);

    if (!internship) {
      return NextResponse.json(
        { error: "Internship listing not found" },
        { status: 404 }
      );
    }

    // Only the company that created the listing can delete it
    if (internship.companyId !== session.user.id) {
      return NextResponse.json(
        { error: "Forbidden - You can only delete your own listings" },
        { status: 403 }
      );
    }

    deleteInternship(id);

    return NextResponse.json(
      { message: "Internship listing deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error deleting internship:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete internship listing" },
      { status: 500 }
    );
  }
}

