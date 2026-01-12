import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth-server";
import { readInternships, saveInternship, getInternshipsByType } from "@/lib/internships";
import { getUserById } from "@/lib/users";

// GET - Fetch all internships (optionally filtered by type)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") as "internship" | "new-grad" | null;

    let internships = readInternships();

    // Filter by type if specified
    if (type) {
      internships = getInternshipsByType(type);
    }

    // Populate company information
    const internshipsWithCompany = internships.map(internship => {
      const company = getUserById(internship.companyId);
      return {
        ...internship,
        companyName: company?.companyName || "Unknown Company",
        companyLogo: company?.logo,
      };
    });

    return NextResponse.json({ internships: internshipsWithCompany });
  } catch (error: any) {
    console.error("Error fetching internships:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch internships" },
      { status: 500 }
    );
  }
}

// POST - Create a new internship listing (company only)
export async function POST(request: NextRequest) {
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
        { error: "Forbidden - Company access only" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, compensationType, hourlyWage, fixedSalary, otherCompensation, workDetails, skillsGained, whyThisCompany, type } = body;

    // Validate required fields
    if (!title || !compensationType || !workDetails || !type) {
      return NextResponse.json(
        { error: "Missing required fields: title, compensationType, workDetails, and type are required" },
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

    // Get company info for logo
    const company = getUserById(session.user.id);
    if (!company) {
      return NextResponse.json(
        { error: "Company profile not found" },
        { status: 404 }
      );
    }

    const newInternship = saveInternship({
      companyId: session.user.id,
      title,
      compensationType,
      ...(compensationType === "hourly" && { hourlyWage: parseFloat(hourlyWage) }),
      ...(compensationType === "fixed" && { fixedSalary: parseFloat(fixedSalary) }),
      ...(compensationType === "other" && { otherCompensation }),
      workDetails,
      skillsGained: skillsGained || [],
      whyThisCompany: whyThisCompany || "",
      companyLogo: company.logo,
      type: type as "internship" | "new-grad",
    });

    return NextResponse.json(
      { internship: newInternship, message: "Internship listing created successfully" },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating internship:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create internship listing" },
      { status: 500 }
    );
  }
}

