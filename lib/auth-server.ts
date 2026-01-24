import { createClient } from "@/lib/supabase/server";

export async function auth() {
  try {
    let supabase;
    try {
      supabase = await createClient();
    } catch (clientError) {
      console.error("Auth: Error creating Supabase client:", clientError);
      return null;
    }

    if (!supabase) {
      return null;
    }

    // Debug: Check if cookies are available (only in development)
    if (process.env.NODE_ENV === "development") {
      const { cookies } = await import("next/headers");
      const cookieStore = await cookies();
      const allCookies = cookieStore.getAll();
      const supabaseCookies = allCookies.filter(c => 
        c.name.includes("supabase") || c.name.includes("sb-")
      );
      if (supabaseCookies.length === 0) {
        console.warn("Auth: No Supabase cookies found in request");
        console.log("Auth: All cookies:", allCookies.map(c => c.name).join(", ") || "none");
      } else {
        console.log("Auth: Found Supabase cookies:", supabaseCookies.map(c => c.name).join(", "));
      }
    }

    const { data: { user: supabaseUser }, error } = await supabase.auth.getUser();

    if (error) {
      // Log the specific error for debugging
      console.error("Auth: Error getting user from Supabase:", {
        message: error.message,
        status: error.status,
        name: error.name,
      });
      
      // Common errors:
      // - "Invalid Refresh Token" or "JWT expired" = session expired, user needs to log in again
      // - Network errors = temporary issue
      // - "User not found" = shouldn't happen with getUser()
      
      // If it's a session/auth error, return null (user needs to re-authenticate)
      if (error.message?.includes("refresh") || error.message?.includes("token") || error.message?.includes("session")) {
        if (process.env.NODE_ENV === "development") {
          console.log("Auth: Session expired or invalid - user needs to log in again");
        }
        return null;
      }
      
      // For other errors, still return null to be safe
      return null;
    }

    if (!supabaseUser) {
      if (process.env.NODE_ENV === "development") {
        console.log("Auth: No authenticated user found in Supabase (no error, just no user)");
      }
      return null;
    }
    
    // User is authenticated in Supabase
    if (process.env.NODE_ENV === "development") {
      console.log("Auth: User authenticated in Supabase:", supabaseUser.id, supabaseUser.email);
    }

    // Fetch the full user profile from our users table
    let { data: userData, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", supabaseUser.id)
      .single();

    if (userError || !userData) {
      // User exists in auth but not in users table yet
      // This can happen if the trigger didn't fire or user was created before trigger setup
      if (process.env.NODE_ENV === "development") {
        console.log("Auth: User authenticated in Supabase but not found in users table");
        console.log("User ID:", supabaseUser.id);
        console.log("Email:", supabaseUser.email);
        console.log("Error:", userError?.message || "No error, just missing record");
        console.log("Attempting to create user record...");
      }
      
      // Try to create the user record automatically
      try {
        const { ensureUserExists } = await import("@/lib/users");
        const createdUser = await ensureUserExists(supabaseUser);
        
        if (createdUser) {
          if (process.env.NODE_ENV === "development") {
            console.log("Auth: Successfully created user record");
          }
          // Fetch the newly created user
          const { data: newUserData } = await supabase
            .from("users")
            .select("*")
            .eq("id", supabaseUser.id)
            .single();
          
          if (newUserData) {
            userData = newUserData;
          }
        }
      } catch (createError) {
        console.error("Auth: Error creating user record:", createError);
        // Continue with fallback session
      }
      
      // If still no userData, return fallback session
      if (!userData) {
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
    }

    // Get profile photo based on role
    let profilePhoto: string | undefined;
    try {
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
    } catch (profileError) {
      // Profile photo is optional, so we continue even if fetching fails
      if (process.env.NODE_ENV === "development") {
        console.log("Auth: Error fetching profile photo:", profileError);
      }
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
