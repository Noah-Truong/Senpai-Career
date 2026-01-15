import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { UserRole } from "@/types";
import { createMultilingualContent } from "@/lib/translate";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      email,
      password,
      name,
      role,
      ...profileData
    } = body;

    // Validate required fields
    if (!email || !password || !name || !role) {
      return NextResponse.json(
        { error: `Missing required fields. Email: ${!!email}, Password: ${!!password}, Name: ${!!name}, Role: ${!!role}` },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    // Validate role
    const validRoles: UserRole[] = ["student", "obog", "company"];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: "Invalid role" },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const adminClient = createAdminClient();

    // Create auth user with Supabase
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role,
        },
      },
    });

    if (authError) {
      console.error("Supabase auth error:", authError);
      if (authError.message.includes("already registered")) {
        return NextResponse.json(
          { error: "User with this email already exists" },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: "Failed to create user" },
        { status: 500 }
      );
    }

    const userId = authData.user.id;

    // Insert into users table using admin client (bypasses RLS)
    const { error: userError } = await adminClient.from("users").insert({
      id: userId,
      email,
      password_hash: "", // Supabase handles password, we don't need to store it
      name,
      role,
      credits: 0,
      strikes: role === "student" ? 0 : null,
      is_banned: role === "student" ? false : null,
    });

    if (userError) {
      console.error("User insert error:", userError);
      // Cleanup: delete auth user if we can't create the user record
      await adminClient.auth.admin.deleteUser(userId);
      return NextResponse.json(
        { message: "Verification email sent to your email address. Please check your email to verify your account." }
      );
    }

    // Create role-specific profile using admin client (bypasses RLS)
    if (role === "student") {
      const { error: profileError } = await adminClient.from("student_profiles").insert({
        id: userId,
        nickname: profileData.nickname || "",
        university: profileData.university || "",
        year: profileData.year || null,
        nationality: profileData.nationality || "",
        jlpt_level: profileData.jlptLevel || "",
        languages: profileData.languages || [],
        interests: profileData.interests || [],
        skills: profileData.skills || [],
        desired_industry: profileData.desiredIndustry || "",
        profile_photo: profileData.profilePhoto || null,
      });
      if (profileError) {
        console.error("Student profile insert error:", profileError);
      }
    } else if (role === "obog") {
      // Translate OB/OG multilingual fields
      let oneLineMessage = profileData.oneLineMessage;
      let studentEraSummary = profileData.studentEraSummary;

      if (oneLineMessage && typeof oneLineMessage === "string" && oneLineMessage.trim()) {
        try {
          oneLineMessage = await createMultilingualContent(oneLineMessage);
        } catch (error) {
          console.error("Translation error for oneLineMessage:", error);
        }
      }

      if (studentEraSummary && typeof studentEraSummary === "string" && studentEraSummary.trim()) {
        try {
          studentEraSummary = await createMultilingualContent(studentEraSummary);
        } catch (error) {
          console.error("Translation error for studentEraSummary:", error);
        }
      }

      const { error: profileError } = await adminClient.from("obog_profiles").insert({
        id: userId,
        nickname: profileData.nickname || "",
        type: profileData.type || "working-professional",
        university: profileData.university || "",
        company: profileData.company || "",
        nationality: profileData.nationality || "",
        languages: profileData.languages || [],
        topics: profileData.topics || [],
        one_line_message: oneLineMessage || null,
        student_era_summary: studentEraSummary || null,
        profile_photo: profileData.profilePhoto || null,
      });
      if (profileError) {
        console.error("OBOG profile insert error:", profileError);
      }
    } else if (role === "company") {
      // Translate company multilingual fields
      let overview = profileData.overview;
      let internshipDetails = profileData.internshipDetails;
      let newGradDetails = profileData.newGradDetails;
      let idealCandidate = profileData.idealCandidate;
      let sellingPoints = profileData.sellingPoints;

      const companyMultilingualFields = [
        { key: "overview", value: overview },
        { key: "internshipDetails", value: internshipDetails },
        { key: "newGradDetails", value: newGradDetails },
        { key: "idealCandidate", value: idealCandidate },
        { key: "sellingPoints", value: sellingPoints },
      ];

      for (const field of companyMultilingualFields) {
        if (field.value && typeof field.value === "string" && field.value.trim()) {
          try {
            const translated = await createMultilingualContent(field.value);
            if (field.key === "overview") overview = translated;
            if (field.key === "internshipDetails") internshipDetails = translated;
            if (field.key === "newGradDetails") newGradDetails = translated;
            if (field.key === "idealCandidate") idealCandidate = translated;
            if (field.key === "sellingPoints") sellingPoints = translated;
          } catch (error) {
            console.error(`Translation error for ${field.key}:`, error);
          }
        }
      }

      const { error: profileError } = await adminClient.from("company_profiles").insert({
        id: userId,
        company_name: profileData.companyName || "",
        contact_name: profileData.contactName || name,
        overview: overview || null,
        work_location: profileData.workLocation || "",
        hourly_wage: profileData.hourlyWage || null,
        weekly_hours: profileData.weeklyHours || null,
        selling_points: sellingPoints || null,
        ideal_candidate: idealCandidate || null,
        internship_details: internshipDetails || null,
        new_grad_details: newGradDetails || null,
        logo: profileData.logo || null,
      });
      if (profileError) {
        console.error("Company profile insert error:", profileError);
      }
    }

    return NextResponse.json(
      {
        user: {
          id: userId,
          email,
          name,
          role,
        },
        message: "User created successfully",
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Signup API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create user. Please try again." },
      { status: 500 }
    );
  }
}
