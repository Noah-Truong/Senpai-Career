import { NextRequest, NextResponse } from "next/server";
import { readUsers } from "@/lib/users";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const users = readUsers();
    const user = users.find((u: any) => u.id === id);

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Return only public information based on role
    const publicProfile: any = {
      id: user.id,
      role: user.role,
      name: user.name,
      nickname: user.nickname,
      profilePhoto: user.profilePhoto,
      createdAt: user.createdAt,
    };

    if (user.role === "student") {
      publicProfile.university = user.university;
      publicProfile.year = user.year;
      publicProfile.nationality = user.nationality;
      publicProfile.languages = user.languages;
      publicProfile.interests = user.interests;
      publicProfile.skills = user.skills;
      publicProfile.desiredIndustry = user.desiredIndustry;
      publicProfile.jlptLevel = user.jlptLevel;
    } else if (user.role === "obog") {
      publicProfile.type = user.type;
      publicProfile.university = user.university;
      publicProfile.company = user.company;
      publicProfile.nationality = user.nationality;
      publicProfile.languages = user.languages;
      publicProfile.topics = user.topics;
      publicProfile.oneLineMessage = user.oneLineMessage;
      publicProfile.studentEraSummary = user.studentEraSummary;
    } else if (user.role === "company") {
      publicProfile.companyName = user.companyName;
      publicProfile.logo = user.logo;
      publicProfile.overview = user.overview;
      publicProfile.workLocation = user.workLocation;
      publicProfile.hourlyWage = user.hourlyWage;
      publicProfile.weeklyHours = user.weeklyHours;
      publicProfile.weeklyDays = user.weeklyDays;
      publicProfile.internshipDetails = user.internshipDetails;
      publicProfile.newGradDetails = user.newGradDetails;
      publicProfile.idealCandidate = user.idealCandidate;
      publicProfile.sellingPoints = user.sellingPoints;
      publicProfile.oneLineMessage = user.oneLineMessage;
    }

    return NextResponse.json({ user: publicProfile });
  } catch (error: any) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}

