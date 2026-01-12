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
        strikes: user.strikes,
        isBanned: user.is_banned,
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
        createdAt: user.created_at,
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
        createdAt: user.created_at,
      };
    }
  }

  // Return user without profile if profile not found
  return {
    ...user,
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
    .order("created_at", { ascending: false });

  if (error || !users) {
    console.error("Error reading OBOG users:", error);
    return [];
  }

  const usersWithProfiles = await Promise.all(
    users.map(async (user) => mergeUserWithProfile(supabase, user))
  );

  return usersWithProfiles.filter((u): u is UserData => u !== null);
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
  if (updates.isBanned !== undefined) userUpdates.is_banned = updates.isBanned;

  if (Object.keys(userUpdates).length > 0) {
    const { error: updateError } = await supabase
      .from("users")
      .update(userUpdates)
      .eq("id", userId);

    if (updateError) {
      console.error("Error updating user:", updateError);
      throw new Error("Failed to update user");
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

    if (Object.keys(profileUpdates).length > 0) {
      await supabase.from("student_profiles").update(profileUpdates).eq("id", userId);
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
