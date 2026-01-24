import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth-server";
import { readInternships, saveInternship, getInternshipsByType } from "@/lib/internships";
import { getUserById } from "@/lib/users";

// GET - Fetch all internships (optionally filtered by type)
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") as "internship" | "new-grad" | null;

    // Companies can see all their listings (including stopped), students can only see public
    const isCompany = session?.user?.role === "company";
    const includeStopped = isCompany;

    let internships = await readInternships(includeStopped);

    // Filter by type if specified
    if (type) {
      internships = await getInternshipsByType(type, includeStopped);
    }

    // If student, filter out stopped listings (double-check)
    if (!isCompany) {
      internships = internships.filter(i => i.status === "public" || !i.status);
    }

    // Populate company information
    const internshipsWithCompany = await Promise.all(internships.map(async (internship) => {
      const company = await getUserById(internship.companyId) as any;
      return {
        ...internship,
        companyName: company?.companyName || "Unknown Company",
        companyLogo: company?.logo,
      };
    }));

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
    const { title, compensationType, otherCompensation, workDetails, skillsGained, whyThisCompany, type } = body;

    // Validate required fields
    if (!title || !compensationType || !workDetails || !type) {
      return NextResponse.json(
        { error: "Missing required fields: title, compensationType, workDetails, and type are required" },
        { status: 400 }
      );
    }

    // Validate compensation_type enum values (hourly, monthly, project, other)
    const validCompensationTypes = ["hourly", "monthly", "project", "other"];
    if (!validCompensationTypes.includes(compensationType)) {
      return NextResponse.json(
        { error: `Invalid compensationType. Must be one of: ${validCompensationTypes.join(", ")}` },
        { status: 400 }
      );
    }

    // Validate other_compensation is provided for "other" type
    if (compensationType === "other" && !otherCompensation) {
      return NextResponse.json(
        { error: "Compensation description is required for other compensation type" },
        { status: 400 }
      );
    }

    // Get company info for logo
    const company = await getUserById(session.user.id) as any;
    if (!company) {
      return NextResponse.json(
        { error: "Company profile not found" },
        { status: 404 }
      );
    }

    const mappedComp =
      compensationType === "monthly" ? "fixed" : compensationType === "project" ? "other" : compensationType;
    const newInternship = await saveInternship({
      companyId: session.user.id,
      title,
      compensationType: mappedComp as "hourly" | "fixed" | "other",
      otherCompensation: otherCompensation || null,
      workDetails,
      skillsGained: skillsGained || [],
      whyThisCompany: whyThisCompany || "",
      type: type as "internship" | "new-grad",
      status: "public", // New listings default to public
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

