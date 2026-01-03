import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth-server";
import { readInternships } from "@/lib/internships";
import { getUserById } from "@/lib/users";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const internships = readInternships();
    const internship = internships.find(i => i.id === params.id);

    if (!internship) {
      return NextResponse.json(
        { error: "Internship listing not found" },
        { status: 404 }
      );
    }

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
      { error: "Failed to fetch internship" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (session.user.role !== "company") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const internships = readInternships();
    const internship = internships.find(i => i.id === params.id);

    if (!internship) {
      return NextResponse.json(
        { error: "Internship listing not found" },
        { status: 404 }
      );
    }

    if (internship.companyId !== session.user.id) {
      return NextResponse.json(
        { error: "Forbidden - You can only delete your own listings" },
        { status: 403 }
      );
    }

    // Delete logic would go here - for now, we'll use the lib function
    const { deleteInternship } = await import("@/lib/internships");
    deleteInternship(params.id);

    return NextResponse.json({ message: "Internship listing deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting internship:", error);
    return NextResponse.json(
      { error: "Failed to delete internship listing" },
      { status: 500 }
    );
  }
}
