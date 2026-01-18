import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth-server";
import { saveApplication, readApplications, getApplicationsByListingId } from "@/lib/applications";
import { readInternships } from "@/lib/internships";
import { getUserById } from "@/lib/users";
import { createMultilingualContent } from "@/lib/translate";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Only students and new grads can apply
    if (session.user.role === "company") {
      return NextResponse.json(
        { error: "Companies cannot apply to listings" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { listingId, answers, resumeUrl } = body;

    if (!listingId) {
      return NextResponse.json(
        { error: "Missing listingId" },
        { status: 400 }
      );
    }

    // Check if listing exists
    const internships = await readInternships();
    const listing = internships.find(l => l.id === listingId);
    
    if (!listing) {
      return NextResponse.json(
        { error: "Listing not found" },
        { status: 404 }
      );
    }

    // Check if user already applied
    const existingApplications = await readApplications();
    const alreadyApplied = existingApplications.some(
      a => a.listingId === listingId && a.applicantId === session.user.id
    );

    if (alreadyApplied) {
      return NextResponse.json(
        { error: "You have already applied to this listing" },
        { status: 409 }
      );
    }

    // Translate application answers
    let translatedAnswers = answers || [];
    if (translatedAnswers.length > 0) {
      translatedAnswers = await Promise.all(
        translatedAnswers.map(async (answer: { question: string; answer: string }) => {
          if (answer.answer && answer.answer.trim()) {
            try {
              const multilingualAnswer = await createMultilingualContent(answer.answer);
              return {
                question: answer.question,
                answer: multilingualAnswer,
              };
            } catch (error) {
              console.error("Translation error for answer:", error);
              return answer; // Fallback to original
            }
          }
          return answer;
        })
      );
    }

    const application = await saveApplication({
      listingId,
      applicantId: session.user.id,
      resumeUrl,
      answers: translatedAnswers,
      status: "pending",
    });

    return NextResponse.json(
      { application, message: "Application submitted successfully" },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating application:", error);
    return NextResponse.json(
      { error: "Failed to submit application" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const listingId = searchParams.get("listingId");

    if (listingId) {
      // Get applications for a specific listing (company only)
      if (session.user.role !== "company") {
        return NextResponse.json(
          { error: "Forbidden" },
          { status: 403 }
        );
      }

      const internships = await readInternships();
      const listing = internships.find(l => l.id === listingId);
      if (!listing || listing.companyId !== session.user.id) {
        return NextResponse.json(
          { error: "Forbidden - You can only view applications for your own listings" },
          { status: 403 }
        );
      }

      const applications = await getApplicationsByListingId(listingId);
      
      // Populate applicant information
      const applicationsWithApplicants = await Promise.all(applications.map(async (app) => {
        const applicant = await getUserById(app.applicantId);
        const { password, ...applicantWithoutPassword } = applicant || {};
        return {
          ...app,
          applicant: applicantWithoutPassword,
        };
      }));

      return NextResponse.json({ applications: applicationsWithApplicants });
    } else {
      // Get user's own applications
      const allApplications = await readApplications();
      const applications = allApplications.filter(a => a.applicantId === session.user.id);
      
      // Populate listing information
      const internships = await readInternships();
      const applicationsWithListings = applications.map(app => {
        const listing = internships.find(l => l.id === app.listingId);
        return {
          ...app,
          listing,
        };
      });

      return NextResponse.json({ applications: applicationsWithListings });
    }
  } catch (error: any) {
    console.error("Error fetching applications:", error);
    return NextResponse.json(
      { error: "Failed to fetch applications" },
      { status: 500 }
    );
  }
}

