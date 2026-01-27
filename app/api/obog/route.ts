import { NextRequest, NextResponse } from "next/server";
import { getOBOGUsers } from "@/lib/users";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const university = searchParams.get("university");
    const language = searchParams.get("language");
    const industry = searchParams.get("industry");
    const jobType = searchParams.get("jobType");

    let obogUsers = await getOBOGUsers();

    // Apply filters
    if (university) {
      const universities = university.split(",").map(u => u.trim());
      obogUsers = obogUsers.filter((user: any) => 
        user.university && universities.some(u => 
          user.university.toLowerCase().includes(u.toLowerCase())
        )
      );
    }

    if (language) {
      const languages = language.split(",").map(l => l.trim().toLowerCase());
      obogUsers = obogUsers.filter((user: any) => 
        user.languages && user.languages.some((lang: string) => 
          languages.includes(lang.toLowerCase())
        )
      );
    }

    if (industry) {
      const industries = industry.split(",").map(i => i.trim().toLowerCase());
      obogUsers = obogUsers.filter((user: any) => 
        user.company && industries.some(ind => 
          user.company.toLowerCase().includes(ind)
        )
      );
    }

    if (jobType) {
      const jobTypes = jobType.split(",").map(j => j.trim().toLowerCase());
      obogUsers = obogUsers.filter((user: any) => 
        user.type && jobTypes.includes(user.type.toLowerCase())
      );
    }

    // Return users without password fields
    const usersWithoutPasswords = obogUsers.map(({ password, password_hash, ...user }: any) => user);

    return NextResponse.json({ users: usersWithoutPasswords });
  } catch (error: any) {
    console.error("Error fetching OB/OG users:", error);
    return NextResponse.json(
      { error: "Failed to fetch OB/OG users" },
      { status: 500 }
    );
  }
}

