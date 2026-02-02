import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth-server";
import { readInternships, updateInternship } from "@/lib/internships";
import { getUserById } from "@/lib/users";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;
    const isCompany = session?.user?.role === "company";
    
    // Companies can see all listings (including stopped), students can only see public
    const internships = await readInternships(isCompany);
    const internship = internships.find(i => i.id === id);

    if (!internship) {
      return NextResponse.json(
        { error: "Internship listing not found" },
        { status: 404 }
      );
    }

    // Students cannot access stopped listings
    if (!isCompany && internship.status === "stopped") {
      return NextResponse.json(
        { error: "Internship listing not found" },
        { status: 404 }
      );
    }

    // Check if company owns this listing (for stopped listings)
    if (internship.status === "stopped" && internship.companyId !== session?.user?.id) {
      return NextResponse.json(
        { error: "Internship listing not found" },
        { status: 404 }
      );
    }

    const company = await getUserById(internship.companyId) as any;
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

    if (session.user.role !== "company") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, compensationType, hourlyWage, fixedSalary, otherCompensation, workDetails, skillsGained, whyThisCompany, status } = body;

    // Validate required fields
    if (!title || !compensationType || !workDetails) {
      return NextResponse.json(
        { error: "Missing required fields: title, compensationType, and workDetails are required" },
        { status: 400 }
      );
    }

    // Validate compensation data based on type
    if (compensationType === "hourly" && (hourlyWage === undefined || hourlyWage === null || hourlyWage === "")) {
      return NextResponse.json(
        { error: "Hourly wage is required for hourly compensation type" },
        { status: 400 }
      );
    }
    if (compensationType === "fixed" && (fixedSalary === undefined || fixedSalary === null || fixedSalary === "")) {
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

    // Allow status updates
    if (status !== undefined) {
      if (status !== "public" && status !== "stopped") {
        return NextResponse.json(
          { error: "Invalid status. Must be 'public' or 'stopped'" },
          { status: 400 }
        );
      }
      updateData.status = status;
    }

    if (compensationType === "hourly") {
      updateData.hourlyWage = hourlyWage !== "" && hourlyWage !== undefined && hourlyWage !== null
        ? Math.round(Number(hourlyWage))
        : undefined;
      updateData.fixedSalary = null;
      updateData.otherCompensation = otherCompensation ?? null;
    } else if (compensationType === "fixed") {
      updateData.fixedSalary = fixedSalary !== "" && fixedSalary !== undefined && fixedSalary !== null
        ? Math.round(Number(fixedSalary))
        : undefined;
      updateData.hourlyWage = null;
      updateData.otherCompensation = otherCompensation ?? null;
    } else if (compensationType === "other") {
      updateData.otherCompensation = otherCompensation ?? null;
      updateData.hourlyWage = null;
      updateData.fixedSalary = null;
    }

    const { id } = await params;
    const updatedInternship = await updateInternship(id, updateData);

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

    if (session.user.role !== "company") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const internships = await readInternships();
    const internship = internships.find(i => i.id === id);

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
    await deleteInternship(id);

    return NextResponse.json({ message: "Internship listing deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting internship:", error);
    return NextResponse.json(
      { error: "Failed to delete internship listing" },
      { status: 500 }
    );
  }
}
