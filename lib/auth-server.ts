import { createClient } from "@/lib/supabase/server";

export async function auth() {
  try {
    const supabase = await createClient();

    const { data: { user: supabaseUser }, error } = await supabase.auth.getUser();

    if (error || !supabaseUser) {
      if (process.env.NODE_ENV === "development") {
        console.log("Auth: No authenticated user found");
      }
      return null;
    }

    // Fetch the full user profile from our users table
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", supabaseUser.id)
      .single();

    if (userError || !userData) {
      // User exists in auth but not in users table yet
      // This shouldn't happen if signup worked correctly, but handle gracefully
      if (process.env.NODE_ENV === "development") {
        console.log("Auth: User not found in users table, using auth metadata");
        console.log("User ID:", supabaseUser.id);
        console.log("Error:", userError);
      }
      
      // Return basic info from Supabase user metadata
      // The user should create their profile or we should sync them
      return {
        user: {
          id: supabaseUser.id,
          email: supabaseUser.email || "",
          name: supabaseUser.user_metadata?.name || supabaseUser.email?.split("@")[0] || "User",
          role: supabaseUser.user_metadata?.role || "student",
          profilePhoto: undefined,
        },
      };
    }

    // Get profile photo based on role
    let profilePhoto: string | undefined;
    if (userData.role === "student") {
      const { data: profile } = await supabase
        .from("student_profiles")
        .select("profile_photo")
        .eq("id", supabaseUser.id)
        .single();
      profilePhoto = profile?.profile_photo;
    } else if (userData.role === "obog") {
      const { data: profile } = await supabase
        .from("obog_profiles")
        .select("profile_photo")
        .eq("id", supabaseUser.id)
        .single();
      profilePhoto = profile?.profile_photo;
    } else if (userData.role === "company") {
      const { data: profile } = await supabase
        .from("company_profiles")
        .select("logo")
        .eq("id", supabaseUser.id)
        .single();
      profilePhoto = profile?.logo;
    }

    if (process.env.NODE_ENV === "development") {
      console.log("Auth: Successfully authenticated user:", userData.email);
    }

    return {
      user: {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        profilePhoto,
      },
    };
  } catch (error) {
    console.error("Auth error:", error);
    return null;
  }
}
