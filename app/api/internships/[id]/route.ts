import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth-server";
import { readInternships, updateInternship } from "@/lib/internships";
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

export async function PUT(
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

    const body = await request.json();
    const { title, compensationType, hourlyWage, fixedSalary, otherCompensation, workDetails, skillsGained, whyThisCompany } = body;

    // Validate required fields
    if (!title || !compensationType || !workDetails) {
      return NextResponse.json(
        { error: "Missing required fields: title, compensationType, and workDetails are required" },
        { status: 400 }
      );
    }

    // Validate compensation data based on type
    if (compensationType === "hourly" && !hourlyWage) {
      return NextResponse.json(
        { error: "Hourly wage is required for hourly compensation type" },
        { status: 400 }
      );
    }
    if (compensationType === "fixed" && !fixedSalary) {
      return NextResponse.json(
        { error: "Fixed salary is required for fixed compensation type" },
        { status: 400 }
      );
    }
    if (compensationType === "other" && !otherCompensation) {
      return NextResponse.json(
        { error: "Compensation description is required for other compensation type" },
        { status: 400 }
      );
    }

    // Prepare update data
    const updateData: any = {
      title,
      compensationType,
      workDetails,
      skillsGained: skillsGained || [],
      whyThisCompany: whyThisCompany || "",
    };

    if (compensationType === "hourly") {
      updateData.hourlyWage = parseFloat(hourlyWage);
      updateData.fixedSalary = undefined;
      updateData.otherCompensation = undefined;
    } else if (compensationType === "fixed") {
      updateData.fixedSalary = parseFloat(fixedSalary);
      updateData.hourlyWage = undefined;
      updateData.otherCompensation = undefined;
    } else if (compensationType === "other") {
      updateData.otherCompensation = otherCompensation;
      updateData.hourlyWage = undefined;
      updateData.fixedSalary = undefined;
    }

    const updatedInternship = updateInternship(params.id, updateData);

    if (!updatedInternship) {
      return NextResponse.json(
        { error: "Internship listing not found" },
        { status: 404 }
      );
    }

    // Check if this company owns this listing
    if (updatedInternship.companyId !== session.user.id) {
      return NextResponse.json(
        { error: "Forbidden - You can only update your own listings" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      internship: updatedInternship,
      message: "Internship listing updated successfully"
    });
  } catch (error: any) {
    console.error("Error updating internship:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update internship listing" },
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
