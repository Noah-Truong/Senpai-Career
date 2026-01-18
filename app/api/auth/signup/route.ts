import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { UserRole } from "@/types";
import { createMultilingualContent } from "@/lib/translate";

/**
 * Student Signup API Endpoint
 * 
 * Creates a new student account with two database records:
 * 
 * 1. users table row (exact structure):
 *    - id (from Supabase Auth user ID)
 *    - email (from form)
 *    - password_hash (empty string "" - handled by Supabase Auth)
 *    - name (from form)
 *    - role ("student")
 *    - credits (0)
 *    - strikes (0)
 *    - is_banned (false)
 *    - created_at (timestamp)
 *    - updated_at (same as created_at on initial creation)
 * 
 * 2. student_profiles table row:
 *    - id (same as users.id - foreign key)
 *    - nickname (from form)
 *    - university (from form)
 *    - year (from form, integer)
 *    - nationality (from form)
 *    - jlpt_level (from form)
 *    - languages (array from form)
 *    - interests (array from form)
 *    - skills (array from form)
 *    - desired_industry (from form, string)
 *    - profile_photo (from form, nullable)
 *    - compliance_agreed (false - default)
 *    - compliance_agreed_at (null - default)
 *    - compliance_documents ([] - default)
 *    - compliance_status ("pending" - default)
 *    - compliance_submitted_at (null - default)
 *    - profile_completed (false - default)
 */
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

    // IMPORTANT: Insert into users table FIRST using admin client (bypasses RLS)
    // This creates the row in the users table with email, password_hash, name, role, created_at, etc.
    const { data: existingUser } = await adminClient
      .from("users")
      .select("id")
      .eq("id", userId)
      .single();

    if (!existingUser) {
      // Insert into users table with all required fields matching the exact structure:
      // id, email, password_hash, name, role, credits, strikes, is_banned, created_at, updated_at
      // Note: password_hash is empty string because Supabase Auth handles password hashing separately
      // The actual password hash is stored by Supabase Auth, not in our users table
      const timestamp = new Date().toISOString();
      const { error: userError } = await adminClient.from("users").insert({
        id: userId, // From Supabase Auth user ID
        email: email, // Email from signup form
        password_hash: "", // Empty string - Supabase Auth handles password hashing
        name: name, // Full name from signup form
        role: role, // "student" for student signup
        credits: 0, // Default credits
        strikes: role === "student" ? 0 : null, // Students start with 0 strikes
        is_banned: role === "student" ? false : null, // Students start unbanned
        created_at: timestamp, // Initial timestamp
        updated_at: timestamp, // Same as created_at on initial creation
      });

      if (userError) {
        console.error("❌ USER INSERT ERROR:", userError);
        console.error("Error details:", JSON.stringify(userError, null, 2));
        // Cleanup: delete auth user if we can't create the user record
        try {
          await adminClient.auth.admin.deleteUser(userId);
        } catch (deleteError) {
          console.error("Failed to delete auth user:", deleteError);
        }
        return NextResponse.json(
          { error: `Failed to create user account: ${userError.message}` },
          { status: 500 }
        );
      }
      console.log("✅ User created in users table:", userId, email);
    } else {
      console.log("⚠️ User already exists in users table, skipping insert");
    }

    // IMPORTANT: Create student profile in student_profiles table
    // This saves all the profile data: nickname, university, year, nationality, languages, etc.
    if (role === "student") {
      const { data: existingProfile } = await adminClient
        .from("student_profiles")
        .select("id")
        .eq("id", userId)
        .single();

      if (!existingProfile) {
        // Insert new student profile with all data from signup form
        // This matches exactly the structure expected in student_profiles table
        const profileInsertData = {
          id: userId, // Same ID as users table (foreign key) - REQUIRED
          nickname: profileData.nickname || "", // From signup form
          university: profileData.university || "", // From signup form
          year: profileData.year || null, // From signup form (parsed to integer)
          nationality: profileData.nationality || "", // From signup form
          jlpt_level: profileData.jlptLevel || "", // From signup form
          languages: Array.isArray(profileData.languages) ? profileData.languages : [], // From signup form - array
          interests: Array.isArray(profileData.interests) ? profileData.interests : [], // From signup form - array
          skills: Array.isArray(profileData.skills) ? profileData.skills : [], // From signup form - array
          desired_industry: profileData.desiredIndustry || "", // From signup form (joined string)
          profile_photo: profileData.profilePhoto || null, // Optional profile photo
          // Compliance tracking fields (defaults set by database)
          compliance_agreed: false, // Default: false
          compliance_agreed_at: null, // Default: null
          compliance_documents: [], // Default: empty array
          compliance_status: "pending", // Default: "pending"
          compliance_submitted_at: null, // Default: null
          profile_completed: false, // Default: false
        };

        const { error: profileError, data: insertedProfile } = await adminClient
          .from("student_profiles")
          .insert(profileInsertData)
          .select()
          .single();

        if (profileError) {
          console.error("❌ STUDENT PROFILE INSERT ERROR:", profileError);
          console.error("Profile data attempted:", JSON.stringify(profileInsertData, null, 2));
          console.error("Error details:", JSON.stringify(profileError, null, 2));
          // Don't fail the whole signup, but log the error
        } else {
          console.log("✅ Student profile created in student_profiles table:", userId);
          console.log("Profile data saved:", {
            nickname: profileInsertData.nickname,
            university: profileInsertData.university,
            year: profileInsertData.year,
            nationality: profileInsertData.nationality,
          });
        }
      } else {
        // Update existing profile with provided data (shouldn't happen on signup, but handle it)
        console.log("⚠️ Student profile already exists, updating with signup data");
        const { error: updateError } = await adminClient
          .from("student_profiles")
          .update({
            nickname: profileData.nickname || "",
            university: profileData.university || "",
            year: profileData.year || null,
            nationality: profileData.nationality || "",
            jlpt_level: profileData.jlptLevel || "",
            languages: Array.isArray(profileData.languages) ? profileData.languages : [],
            interests: Array.isArray(profileData.interests) ? profileData.interests : [],
            skills: Array.isArray(profileData.skills) ? profileData.skills : [],
            desired_industry: profileData.desiredIndustry || "",
            profile_photo: profileData.profilePhoto || null,
          })
          .eq("id", userId);
        if (updateError) {
          console.error("❌ Student profile update error:", updateError);
        } else {
          console.log("✅ Student profile updated successfully");
        }
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

    // Verify both records were created successfully
    const { data: verifyUser } = await adminClient
      .from("users")
      .select("id, email, name, role, created_at")
      .eq("id", userId)
      .single();

    const { data: verifyProfile } = role === "student" 
      ? await adminClient
          .from("student_profiles")
          .select("id, nickname, university, year, nationality")
          .eq("id", userId)
          .single()
      : { data: null };

    if (!verifyUser) {
      console.error("❌ CRITICAL: User record verification failed!");
      return NextResponse.json(
        { error: "User account created but verification failed. Please contact support." },
        { status: 500 }
      );
    }

    if (role === "student" && !verifyProfile) {
      console.error("❌ CRITICAL: Student profile record verification failed!");
      console.error("User exists but profile missing. User ID:", userId);
    }

    console.log("✅ Signup completed successfully:");
    console.log("   Users table:", verifyUser);
    if (verifyProfile) {
      console.log("   Student profiles table:", verifyProfile);
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
        verified: {
          userExists: !!verifyUser,
          profileExists: role === "student" ? !!verifyProfile : null,
        },
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
