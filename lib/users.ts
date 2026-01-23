import { createClient } from "@/lib/supabase/server";
import { User } from "@/types";

export interface UserData extends Omit<User, "createdAt"> {
  password?: string;
  createdAt: string;
}

// Helper function to merge user with profile data
async function mergeUserWithProfile(supabase: any, user: any): Promise<UserData | null> {
  if (!user) return null;

  let profile: any = null;

  if (user.role === "student") {
    const { data } = await supabase
      .from("student_profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    profile = data;
    if (profile) {
      return {
        ...user,
        nickname: profile.nickname,
        university: profile.university,
        year: profile.year,
        nationality: profile.nationality,
        jlptLevel: profile.jlpt_level,
        languages: profile.languages,
        interests: profile.interests,
        skills: profile.skills,
        desiredIndustry: profile.desired_industry,
        profilePhoto: profile.profile_photo,
        profileCompleted: profile.profile_completed || false,
        complianceAgreed: profile.compliance_agreed || false,
        complianceAgreedAt: profile.compliance_agreed_at,
        complianceStatus: profile.compliance_status || "pending",
        complianceSubmittedAt: profile.compliance_submitted_at,
        complianceDocuments: profile.compliance_documents || [],
        strikes: user.strikes,
        isBanned: user.is_banned,
        viewedRules: user.viewed_rules || false,
        createdAt: user.created_at,
      };
    }
  } else if (user.role === "obog") {
    const { data } = await supabase
      .from("obog_profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    profile = data;
    if (profile) {
      return {
        ...user,
        nickname: profile.nickname,
        type: profile.type,
        university: profile.university,
        company: profile.company,
        nationality: profile.nationality,
        languages: profile.languages,
        topics: profile.topics,
        oneLineMessage: profile.one_line_message,
        studentEraSummary: profile.student_era_summary,
        profilePhoto: profile.profile_photo,
        viewedRules: user.viewed_rules || false,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
      };
    }
  } else if (user.role === "company") {
    const { data } = await supabase
      .from("company_profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    profile = data;
    if (profile) {
      return {
        ...user,
        companyName: profile.company_name,
        contactName: profile.contact_name,
        overview: profile.overview,
        workLocation: profile.work_location,
        hourlyWage: profile.hourly_wage,
        weeklyHours: profile.weekly_hours,
        sellingPoints: profile.selling_points,
        idealCandidate: profile.ideal_candidate,
        internshipDetails: profile.internship_details,
        newGradDetails: profile.new_grad_details,
        logo: profile.logo,
        viewedRules: user.viewed_rules || false,
        createdAt: user.created_at,
      };
    }
  }

  // Return user without profile if profile not found
  return {
    ...user,
    viewedRules: user.viewed_rules || false,
    createdAt: user.created_at,
  };
}

export const readUsers = async (): Promise<UserData[]> => {
  const supabase = await createClient();
  const { data: users, error } = await supabase
    .from("users")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !users) {
    console.error("Error reading users:", error);
    return [];
  }

  // Merge each user with their profile
  const usersWithProfiles = await Promise.all(
    users.map(async (user) => mergeUserWithProfile(supabase, user))
  );

  return usersWithProfiles.filter((u): u is UserData => u !== null);
};

export const saveUser = async (userData: Omit<UserData, "id" | "createdAt">): Promise<UserData> => {
  const supabase = await createClient();

  // Check if user already exists
  const { data: existing } = await supabase
    .from("users")
    .select("id")
    .eq("email", userData.email)
    .single();

  if (existing) {
    throw new Error("User with this email already exists");
  }

  const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Insert into users table
  const { error: userError } = await supabase.from("users").insert({
    id: userId,
    email: userData.email,
    password_hash: "", // Password handled by Supabase Auth
    name: userData.name,
    role: userData.role,
    credits: userData.credits || 0,
    strikes: userData.strikes || 0,
    is_banned: userData.isBanned || false,
  });

  if (userError) {
    console.error("Error saving user:", userError);
    throw new Error("Failed to create user");
  }

  // Insert profile based on role
  if (userData.role === "student") {
    await supabase.from("student_profiles").insert({
      id: userId,
      nickname: (userData as any).nickname || "",
      university: (userData as any).university || "",
      year: (userData as any).year || null,
      nationality: (userData as any).nationality || "",
      jlpt_level: (userData as any).jlptLevel || "",
      languages: (userData as any).languages || [],
      interests: (userData as any).interests || [],
      skills: (userData as any).skills || [],
      desired_industry: (userData as any).desiredIndustry || "",
      profile_photo: (userData as any).profilePhoto || null,
    });
  } else if (userData.role === "obog") {
    await supabase.from("obog_profiles").insert({
      id: userId,
      nickname: (userData as any).nickname || "",
      type: (userData as any).type || "working-professional",
      university: (userData as any).university || "",
      company: (userData as any).company || "",
      nationality: (userData as any).nationality || "",
      languages: (userData as any).languages || [],
      topics: (userData as any).topics || [],
      one_line_message: (userData as any).oneLineMessage || null,
      student_era_summary: (userData as any).studentEraSummary || null,
      profile_photo: (userData as any).profilePhoto || null,
    });
  } else if (userData.role === "company") {
    await supabase.from("company_profiles").insert({
      id: userId,
      company_name: (userData as any).companyName || "",
      contact_name: (userData as any).contactName || userData.name,
      overview: (userData as any).overview || null,
      work_location: (userData as any).workLocation || "",
      hourly_wage: (userData as any).hourlyWage || null,
      weekly_hours: (userData as any).weeklyHours || null,
      selling_points: (userData as any).sellingPoints || null,
      ideal_candidate: (userData as any).idealCandidate || null,
      internship_details: (userData as any).internshipDetails || null,
      new_grad_details: (userData as any).newGradDetails || null,
      logo: (userData as any).logo || null,
    });
  }

  return {
    ...userData,
    id: userId,
    createdAt: new Date().toISOString(),
  } as UserData;
};

export const getUserByEmail = async (email: string): Promise<UserData | undefined> => {
  const supabase = await createClient();
  const { data: user, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .single();

  if (error || !user) {
    return undefined;
  }

  return mergeUserWithProfile(supabase, user) as Promise<UserData | undefined>;
};

export const getOBOGUsers = async (): Promise<UserData[]> => {
  const supabase = await createClient();
  const { data: users, error } = await supabase
    .from("users")
    .select("*")
    .eq("role", "obog")
    .order("updated_at", { ascending: false });

  if (error || !users) {
    console.error("Error reading OBOG users:", error);
    return [];
  }

  const usersWithProfiles = await Promise.all(
    users.map(async (user) => mergeUserWithProfile(supabase, user))
  );

  const filtered = usersWithProfiles.filter((u): u is UserData => u !== null);
  // Default sort by recently updated (features.md 4.4)
  filtered.sort((a, b) => {
    const aAt = (a as any).updatedAt || (a as any).createdAt || "";
    const bAt = (b as any).updatedAt || (b as any).createdAt || "";
    return new Date(bAt).getTime() - new Date(aAt).getTime();
  });
  return filtered;
};

export const getOBOGById = async (id: string): Promise<UserData | undefined> => {
  const supabase = await createClient();
  const { data: user, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", id)
    .eq("role", "obog")
    .single();

  if (error || !user) {
    return undefined;
  }

  return mergeUserWithProfile(supabase, user) as Promise<UserData | undefined>;
};

/**
 * Ensures a user record exists in the users table.
 * If the user is authenticated but doesn't have a record, creates one from auth metadata.
 */
export const ensureUserExists = async (supabaseAuthUser: any): Promise<UserData | null> => {
  const supabase = await createClient();
  
  // Check if user exists
  const { data: existingUser, error: checkError } = await supabase
    .from("users")
    .select("*")
    .eq("id", supabaseAuthUser.id)
    .single();

  if (existingUser) {
    // User exists, return merged profile
    return mergeUserWithProfile(supabase, existingUser);
  }

  // User doesn't exist, create from auth metadata
  const role = supabaseAuthUser.user_metadata?.role || "student";
  const name = supabaseAuthUser.user_metadata?.name || supabaseAuthUser.email?.split("@")[0] || "User";
  const email = supabaseAuthUser.email || "";

  const { error: insertError } = await supabase.from("users").insert({
    id: supabaseAuthUser.id,
    email,
    password_hash: "",
    name,
    role,
    credits: 0,
    strikes: role === "student" ? 0 : null,
    is_banned: role === "student" ? false : null,
  });

  if (insertError) {
    console.error("Error creating user record:", insertError);
    return null;
  }

  // Create basic profile based on role
  if (role === "student") {
    await supabase.from("student_profiles").insert({
      id: supabaseAuthUser.id,
      nickname: supabaseAuthUser.user_metadata?.nickname || "",
      university: supabaseAuthUser.user_metadata?.university || "",
      year: null,
      nationality: supabaseAuthUser.user_metadata?.nationality || "",
      jlpt_level: supabaseAuthUser.user_metadata?.jlptLevel || "",
      languages: Array.isArray(supabaseAuthUser.user_metadata?.languages) 
        ? supabaseAuthUser.user_metadata.languages 
        : [],
      interests: Array.isArray(supabaseAuthUser.user_metadata?.interests)
        ? supabaseAuthUser.user_metadata.interests
        : [],
      skills: Array.isArray(supabaseAuthUser.user_metadata?.skills)
        ? supabaseAuthUser.user_metadata.skills
        : [],
      desired_industry: supabaseAuthUser.user_metadata?.desiredIndustry || "",
      profile_photo: supabaseAuthUser.user_metadata?.profilePhoto || null,
      compliance_agreed: false,
      compliance_agreed_at: null,
      compliance_documents: [],
      compliance_status: "pending",
      compliance_submitted_at: null,
      profile_completed: false,
    });
  } else if (role === "obog") {
    await supabase.from("obog_profiles").insert({
      id: supabaseAuthUser.id,
      nickname: supabaseAuthUser.user_metadata?.nickname || "",
      type: supabaseAuthUser.user_metadata?.type || "working-professional",
      university: supabaseAuthUser.user_metadata?.university || "",
      company: supabaseAuthUser.user_metadata?.company || "",
      nationality: supabaseAuthUser.user_metadata?.nationality || "",
      languages: Array.isArray(supabaseAuthUser.user_metadata?.languages)
        ? supabaseAuthUser.user_metadata.languages
        : [],
      topics: Array.isArray(supabaseAuthUser.user_metadata?.topics)
        ? supabaseAuthUser.user_metadata.topics
        : [],
      one_line_message: supabaseAuthUser.user_metadata?.oneLineMessage || null,
      student_era_summary: supabaseAuthUser.user_metadata?.studentEraSummary || null,
      profile_photo: supabaseAuthUser.user_metadata?.profilePhoto || null,
    });
  } else if (role === "company") {
    await supabase.from("company_profiles").insert({
      id: supabaseAuthUser.id,
      company_name: supabaseAuthUser.user_metadata?.companyName || "",
      contact_name: supabaseAuthUser.user_metadata?.contactName || name,
      overview: supabaseAuthUser.user_metadata?.overview || null,
      work_location: supabaseAuthUser.user_metadata?.workLocation || "",
      hourly_wage: supabaseAuthUser.user_metadata?.hourlyWage || null,
      weekly_hours: supabaseAuthUser.user_metadata?.weeklyHours || null,
      selling_points: supabaseAuthUser.user_metadata?.sellingPoints || null,
      ideal_candidate: supabaseAuthUser.user_metadata?.idealCandidate || null,
      internship_details: supabaseAuthUser.user_metadata?.internshipDetails || null,
      new_grad_details: supabaseAuthUser.user_metadata?.newGradDetails || null,
      logo: supabaseAuthUser.user_metadata?.logo || null,
    });
  }

  // Fetch the newly created user
  const { data: newUser, error: fetchError } = await supabase
    .from("users")
    .select("*")
    .eq("id", supabaseAuthUser.id)
    .single();

  if (fetchError || !newUser) {
    return null;
  }

  return mergeUserWithProfile(supabase, newUser);
};

export const getUserById = async (id: string): Promise<UserData | undefined> => {
  const supabase = await createClient();
  const { data: user, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !user) {
    return undefined;
  }

  return mergeUserWithProfile(supabase, user) as Promise<UserData | undefined>;
};

export const updateUser = async (
  userId: string,
  updates: Partial<Omit<UserData, "id" | "email" | "password" | "createdAt" | "role">>
): Promise<UserData> => {
  const supabase = await createClient();

  // Get current user to know their role
  const { data: currentUser, error: fetchError } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();

  if (fetchError || !currentUser) {
    throw new Error("User not found");
  }

  // Update users table fields
  const userUpdates: any = {};
  if (updates.name !== undefined) userUpdates.name = updates.name;
  if (updates.credits !== undefined) userUpdates.credits = updates.credits;
  if (updates.strikes !== undefined) userUpdates.strikes = updates.strikes;
  if ((updates as any).isBanned !== undefined) userUpdates.is_banned = (updates as any).isBanned;
  if ((updates as any).viewedRules !== undefined) userUpdates.viewed_rules = (updates as any).viewedRules;

  if (Object.keys(userUpdates).length > 0) {
    const { error: updateError, data: updateData } = await supabase
      .from("users")
      .update(userUpdates)
      .eq("id", userId)
      .select();

    if (updateError) {
      console.error("Error updating user:", updateError);
      console.error("Update data attempted:", userUpdates);
      throw new Error(`Failed to update user: ${updateError.message}`);
    }
    
    if (userUpdates.credits !== undefined) {
      console.log(`Credits updated for user ${userId}: ${userUpdates.credits}`);
    }
  }

  // Update profile based on role
  if (currentUser.role === "student") {
    const profileUpdates: any = {};
    if ((updates as any).nickname !== undefined) profileUpdates.nickname = (updates as any).nickname;
    if ((updates as any).university !== undefined) profileUpdates.university = (updates as any).university;
    if ((updates as any).year !== undefined) profileUpdates.year = (updates as any).year;
    if ((updates as any).nationality !== undefined) profileUpdates.nationality = (updates as any).nationality;
    if ((updates as any).jlptLevel !== undefined) profileUpdates.jlpt_level = (updates as any).jlptLevel;
    if ((updates as any).languages !== undefined) profileUpdates.languages = (updates as any).languages;
    if ((updates as any).interests !== undefined) profileUpdates.interests = (updates as any).interests;
    if ((updates as any).skills !== undefined) profileUpdates.skills = (updates as any).skills;
    if ((updates as any).desiredIndustry !== undefined) profileUpdates.desired_industry = (updates as any).desiredIndustry;
    if ((updates as any).profilePhoto !== undefined) profileUpdates.profile_photo = (updates as any).profilePhoto;
    if ((updates as any).profileCompleted !== undefined) profileUpdates.profile_completed = (updates as any).profileCompleted;
    // Compliance fields
    if ((updates as any).complianceAgreed !== undefined) profileUpdates.compliance_agreed = (updates as any).complianceAgreed;
    if ((updates as any).complianceAgreedAt !== undefined) profileUpdates.compliance_agreed_at = (updates as any).complianceAgreedAt;
    if ((updates as any).complianceDocuments !== undefined) profileUpdates.compliance_documents = (updates as any).complianceDocuments;
    if ((updates as any).complianceStatus !== undefined) profileUpdates.compliance_status = (updates as any).complianceStatus;
    if ((updates as any).complianceSubmittedAt !== undefined) profileUpdates.compliance_submitted_at = (updates as any).complianceSubmittedAt;

    if (Object.keys(profileUpdates).length > 0) {
      const { error: profileError } = await supabase.from("student_profiles").update(profileUpdates).eq("id", userId);
      if (profileError) {
        console.error("Error updating student profile:", profileError);
        throw new Error("Failed to update student profile");
      }
    }
  } else if (currentUser.role === "obog") {
    const profileUpdates: any = {};
    if ((updates as any).nickname !== undefined) profileUpdates.nickname = (updates as any).nickname;
    if ((updates as any).type !== undefined) profileUpdates.type = (updates as any).type;
    if ((updates as any).university !== undefined) profileUpdates.university = (updates as any).university;
    if ((updates as any).company !== undefined) profileUpdates.company = (updates as any).company;
    if ((updates as any).nationality !== undefined) profileUpdates.nationality = (updates as any).nationality;
    if ((updates as any).languages !== undefined) profileUpdates.languages = (updates as any).languages;
    if ((updates as any).topics !== undefined) profileUpdates.topics = (updates as any).topics;
    if ((updates as any).oneLineMessage !== undefined) profileUpdates.one_line_message = (updates as any).oneLineMessage;
    if ((updates as any).studentEraSummary !== undefined) profileUpdates.student_era_summary = (updates as any).studentEraSummary;
    if ((updates as any).profilePhoto !== undefined) profileUpdates.profile_photo = (updates as any).profilePhoto;

    if (Object.keys(profileUpdates).length > 0) {
      await supabase.from("obog_profiles").update(profileUpdates).eq("id", userId);
    }
  } else if (currentUser.role === "company") {
    const profileUpdates: any = {};
    if ((updates as any).companyName !== undefined) profileUpdates.company_name = (updates as any).companyName;
    if ((updates as any).contactName !== undefined) profileUpdates.contact_name = (updates as any).contactName;
    if ((updates as any).overview !== undefined) profileUpdates.overview = (updates as any).overview;
    if ((updates as any).workLocation !== undefined) profileUpdates.work_location = (updates as any).workLocation;
    if ((updates as any).hourlyWage !== undefined) profileUpdates.hourly_wage = (updates as any).hourlyWage;
    if ((updates as any).weeklyHours !== undefined) profileUpdates.weekly_hours = (updates as any).weeklyHours;
    if ((updates as any).sellingPoints !== undefined) profileUpdates.selling_points = (updates as any).sellingPoints;
    if ((updates as any).idealCandidate !== undefined) profileUpdates.ideal_candidate = (updates as any).idealCandidate;
    if ((updates as any).internshipDetails !== undefined) profileUpdates.internship_details = (updates as any).internshipDetails;
    if ((updates as any).newGradDetails !== undefined) profileUpdates.new_grad_details = (updates as any).newGradDetails;
    if ((updates as any).logo !== undefined) profileUpdates.logo = (updates as any).logo;

    if (Object.keys(profileUpdates).length > 0) {
      await supabase.from("company_profiles").update(profileUpdates).eq("id", userId);
    }
  }

  // Return updated user
  const updatedUser = await getUserById(userId);
  if (!updatedUser) {
    throw new Error("Failed to fetch updated user");
  }
  return updatedUser;
};

export const deleteUser = async (userId: string): Promise<void> => {
  const supabase = await createClient();

  const { error } = await supabase.from("users").delete().eq("id", userId);

  if (error) {
    console.error("Error deleting user:", error);
    throw new Error("User not found");
  }
};
