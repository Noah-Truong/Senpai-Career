import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth-server";
import { createClient } from "@/lib/supabase/server";

// GET - Fetch students (for Corporate OB users)
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Only corporate_ob and admin can access this endpoint
    if (session.user.role !== "corporate_ob" && session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Access denied. Only Corporate OB users can view student list." },
        { status: 403 }
      );
    }

    const supabase = await createClient();

    // Fetch all students with completed profiles (compliance status can be pending or approved)
    const { data: students, error } = await supabase
      .from("student_profiles")
      .select(`
        id,
        nickname,
        university,
        year,
        nationality,
        jlpt_level,
        languages,
        interests,
        skills,
        desired_industry,
        profile_photo,
        profile_completed,
        compliance_status
      `)
      .eq("profile_completed", true);

    if (error) {
      console.error("Error fetching students:", error);
      return NextResponse.json(
        { error: "Failed to fetch students" },
        { status: 500 }
      );
    }

    // Fetch user names for each student
    const studentIds = students?.map(s => s.id) || [];

    let usersMap: Record<string, { name: string; email: string }> = {};
    if (studentIds.length > 0) {
      const { data: users } = await supabase
        .from("users")
        .select("id, name, email")
        .in("id", studentIds);

      usersMap = (users || []).reduce((acc, user) => {
        acc[user.id] = { name: user.name, email: user.email };
        return acc;
      }, {} as Record<string, { name: string; email: string }>);
    }

    // Combine student profiles with user data
    const studentsWithUserInfo = (students || []).map(student => ({
      id: student.id,
      name: usersMap[student.id]?.name || "Unknown",
      nickname: student.nickname,
      university: student.university,
      year: student.year,
      nationality: student.nationality,
      jlptLevel: student.jlpt_level,
      languages: student.languages || [],
      interests: student.interests || [],
      skills: student.skills || [],
      desiredIndustry: student.desired_industry,
      profilePhoto: student.profile_photo,
    }));

    return NextResponse.json({ students: studentsWithUserInfo });
  } catch (error: any) {
    console.error("Error fetching students:", error);
    return NextResponse.json(
      { error: "Failed to fetch students" },
      { status: 500 }
    );
  }
}
