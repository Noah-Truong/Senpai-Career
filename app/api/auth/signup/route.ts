import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { UserRole } from "@/types";
import { createMultilingualContent } from "@/lib/translate";
import { isBlockedFreeDomain, getBlockedDomainError } from "@/lib/blocked-email-domains";

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

    // TODO: Uncomment for production - Block free email providers (features.md 4.1)
    // if (isBlockedFreeDomain(email)) {
    //   return NextResponse.json(
    //     { error: getBlockedDomainError() },
    //     { status: 400 }
    //   );
    // }

    // Validate role
    const validRoles: UserRole[] = ["student", "obog", "company", "corporate_ob"];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: "Invalid role" },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const adminClient = createAdminClient();

    // Prepare auth metadata with all profile data for the trigger
    // The handle_new_user() trigger will use this to create complete user and profile records
    const authMetadata: any = {
      name,
      role,
    };

    // Add role-specific profile data to metadata for the trigger
    if (role === "student") {
      authMetadata.nickname = profileData.nickname || "";
      authMetadata.university = profileData.university || "";
      authMetadata.year = profileData.year || null;
      authMetadata.nationality = profileData.nationality || "";
      authMetadata.jlptLevel = profileData.jlptLevel || "";
      authMetadata.languages = Array.isArray(profileData.languages) ? profileData.languages : [];
      authMetadata.interests = Array.isArray(profileData.interests) ? profileData.interests : [];
      authMetadata.skills = Array.isArray(profileData.skills) ? profileData.skills : [];
      authMetadata.desiredIndustry = profileData.desiredIndustry || "";
      authMetadata.profilePhoto = profileData.profilePhoto || null;
    } else if (role === "obog" || role === "corporate_ob") {
      authMetadata.nickname = profileData.nickname || "";
      authMetadata.type = profileData.type || "working-professional";
      authMetadata.university = profileData.university || "";
      authMetadata.company = profileData.company || "";
      authMetadata.nationality = profileData.nationality || "";
      authMetadata.languages = Array.isArray(profileData.languages) ? profileData.languages : [];
      authMetadata.topics = Array.isArray(profileData.topics) ? profileData.topics : [];
      authMetadata.oneLineMessage = profileData.oneLineMessage || null;
      authMetadata.studentEraSummary = profileData.studentEraSummary || null;
      authMetadata.profilePhoto = profileData.profilePhoto || null;
    } else if (role === "company") {
      authMetadata.companyName = profileData.companyName || "";
      authMetadata.contactName = profileData.contactName || name;
      authMetadata.overview = profileData.overview || null;
      authMetadata.workLocation = profileData.workLocation || "";
      authMetadata.hourlyWage = profileData.hourlyWage || null;
      authMetadata.weeklyHours = profileData.weeklyHours || null;
      authMetadata.sellingPoints = profileData.sellingPoints || null;
      authMetadata.idealCandidate = profileData.idealCandidate || null;
      authMetadata.internshipDetails = profileData.internshipDetails || null;
      authMetadata.newGradDetails = profileData.newGradDetails || null;
      authMetadata.logo = profileData.logo || null;
    }

    // Create auth user with Supabase - trigger will create user and profile records
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: authMetadata,
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

    // Wait a moment for the trigger to complete (handle_new_user trigger fires on auth.users insert)
    await new Promise(resolve => setTimeout(resolve, 500));

    // Check if trigger created the user record
    const { data: existingUser } = await adminClient
      .from("users")
      .select("id, email, name, role")
      .eq("id", userId)
      .single();

    if (!existingUser) {
      // Trigger didn't create user (shouldn't happen, but fallback)
      // Trigger didn't create user, manually inserting (fallback)
      const timestamp = new Date().toISOString();
      const { error: userError } = await adminClient.from("users").insert({
        id: userId,
        email: email,
        password_hash: "",
        name: name,
        role: role,
        credits: 0,
        strikes: role === "student" ? 0 : null,
        is_banned: role === "student" ? false : null,
        created_at: timestamp,
        updated_at: timestamp,
      });

      if (userError) {
        console.error("❌ USER INSERT ERROR:", userError);
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
      // User created manually (trigger fallback)
    } else {
      // User created by trigger
    }

    // Check if trigger created the profile, then update with any additional data if needed
    if (role === "student") {
      const { data: existingProfile } = await adminClient
        .from("student_profiles")
        .select("id, nickname, university")
        .eq("id", userId)
        .single();

      if (!existingProfile) {
        // Trigger didn't create profile (fallback - should rarely happen)
        // Trigger didn't create student profile, manually inserting (fallback)
        const profileInsertData = {
          id: userId,
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
          compliance_agreed: false,
          compliance_agreed_at: null,
          compliance_documents: [],
          compliance_status: "pending",
          compliance_submitted_at: null,
          profile_completed: false,
        };

        const { error: profileError } = await adminClient
          .from("student_profiles")
          .insert(profileInsertData);

        if (profileError) {
          console.error("❌ STUDENT PROFILE INSERT ERROR:", profileError);
        } else {
          // Student profile created manually (trigger fallback)
        }
      } else {
        // Profile exists (created by trigger), update with any missing data
        // Update profile to ensure all data is present (trigger might have defaults)
        const { error: updateError } = await adminClient
          .from("student_profiles")
          .update({
            nickname: profileData.nickname || existingProfile.nickname || "",
            university: profileData.university || existingProfile.university || "",
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
          // Student profile updated with signup data
        }
      }
    } else if (role === "obog" || role === "corporate_ob") {
      // Translate OB/OG multilingual fields (corporate_ob uses obog_profiles table)
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

      // Check if trigger created profile
      const { data: existingOBOGProfile } = await adminClient
        .from("obog_profiles")
        .select("id")
        .eq("id", userId)
        .single();

      if (!existingOBOGProfile) {
        // Trigger didn't create profile (fallback)
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
          console.error("❌ OBOG profile insert error:", profileError);
        } else {
          // OBOG profile created manually (trigger fallback)
        }
      } else {
        // Profile exists, update with all signup data (including translated fields)
        const { error: updateError } = await adminClient
          .from("obog_profiles")
          .update({
            nickname: profileData.nickname || "",
            type: profileData.type || "working-professional",
            university: profileData.university || "",
            company: profileData.company || "",
            nationality: profileData.nationality || "",
            languages: Array.isArray(profileData.languages) ? profileData.languages : [],
            topics: Array.isArray(profileData.topics) ? profileData.topics : [],
            one_line_message: oneLineMessage || null,
            student_era_summary: studentEraSummary || null,
            profile_photo: profileData.profilePhoto || null,
          })
          .eq("id", userId);
        if (updateError) {
          console.error("❌ OBOG profile update error:", updateError);
        } else {
          // OBOG profile updated with all signup data
        }
      }

      // If role is corporate_ob, create entry in corporate_obs table
      if (role === "corporate_ob" && profileData.company) {
        try {
          // Check if company exists in companies table
          const { data: existingCompany } = await adminClient
            .from("companies")
            .select("id")
            .eq("name", profileData.company.trim())
            .maybeSingle();

          let companyId: string;

          if (!existingCompany) {
            // Create new company
            const timestamp = Date.now();
            const randomStr = Math.random().toString(36).substring(2, 15);
            companyId = `company_${timestamp}_${randomStr}`;

            const { error: companyError } = await adminClient
              .from("companies")
              .insert({
                id: companyId,
                name: profileData.company.trim(),
                industry: null,
                description: null,
                website: null,
                logo_url: null,
                stripe_customer_id: null,
              });

            if (companyError) {
              console.error("❌ Error creating company:", companyError);
              // Continue without creating corporate_obs entry - admin can assign later
              companyId = "";
            }
          } else {
            companyId = existingCompany.id;
          }

          // Create corporate_obs entry
          if (companyId) {
            const timestamp = Date.now();
            const randomStr = Math.random().toString(36).substring(2, 15);
            const corporateOBId = `corp_ob_${timestamp}_${randomStr}`;

            const { error: corpObError } = await adminClient
              .from("corporate_obs")
              .insert({
                id: corporateOBId,
                user_id: userId,
                company_id: companyId,
                is_verified: false, // Default to unverified, admin can verify later
              });

            if (corpObError) {
              console.error("❌ Error creating corporate_obs entry:", corpObError);
              // Continue - admin can assign later
            } else {
              console.log("✅ Corporate OB entry created:", corporateOBId);
            }
          }
        } catch (corpObSignupError: any) {
          console.error("❌ Error during corporate OB signup setup:", corpObSignupError);
          // Continue - admin can assign later
        }
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

      // Check if trigger created profile
      const { data: existingCompanyProfile } = await adminClient
        .from("company_profiles")
        .select("id")
        .eq("id", userId)
        .single();

      if (!existingCompanyProfile) {
        // Trigger didn't create profile (fallback)
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
          console.error("❌ Company profile insert error:", profileError);
        } else {
          console.log("✅ Company profile created manually (trigger fallback):", userId);
        }
      } else {
        // Profile exists, update with translated data
        console.log("✅ Company profile created by trigger:", userId);
        const { error: updateError } = await adminClient
          .from("company_profiles")
          .update({
            overview: overview || null,
            internship_details: internshipDetails || null,
            new_grad_details: newGradDetails || null,
            ideal_candidate: idealCandidate || null,
            selling_points: sellingPoints || null,
          })
          .eq("id", userId);
        if (updateError) {
          console.error("❌ Company profile update error:", updateError);
        } else {
          // Company profile updated with translated data
        }
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
      : role === "obog" || role === "corporate_ob"
      ? await adminClient
          .from("obog_profiles")
          .select("id, nickname, university, company, nationality")
          .eq("id", userId)
          .single()
      : role === "company"
      ? await adminClient
          .from("company_profiles")
          .select("id, company_name, contact_name")
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

    // Verify role is set correctly
    if (verifyUser.role !== role) {
      console.error(`❌ CRITICAL: User role mismatch! Expected: ${role}, Got: ${verifyUser.role}`);
      // Fix the role
      await adminClient
        .from("users")
        .update({ role: role })
        .eq("id", userId);
    }

    if (role === "student" && !verifyProfile) {
      console.error("❌ CRITICAL: Student profile record verification failed!");
      console.error("User exists but profile missing. User ID:", userId);
    } else if ((role === "obog" || role === "corporate_ob") && !verifyProfile) {
      console.error("❌ CRITICAL: OB/OG profile record verification failed!");
      console.error("User exists but profile missing. User ID:", userId);
    } else if (role === "company" && !verifyProfile) {
      console.error("❌ CRITICAL: Company profile record verification failed!");
      console.error("User exists but profile missing. User ID:", userId);
    }

    // Signup completed successfully

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
