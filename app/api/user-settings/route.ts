import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth-server";
import { createClient } from "@/lib/supabase/server";
import { ensureUserExists } from "@/lib/users";

// GET - Fetch user settings
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const supabase = await createClient();

    // Ensure user exists in users table (in case trigger didn't fire)
    const { data: { user: supabaseUser } } = await supabase.auth.getUser();
    if (supabaseUser) {
      await ensureUserExists(supabaseUser);
    }

    // Get or create user settings
    const { data: settings, error } = await supabase
      .rpc("get_or_create_user_settings", { p_user_id: session.user.id });

    if (error) {
      // If function doesn't exist, try direct query
      let { data: existingSettings } = await supabase
        .from("user_settings")
        .select("*")
        .eq("user_id", session.user.id)
        .single();

      if (!existingSettings) {
        // Create default settings
        const { data: newSettings, error: createError } = await supabase
          .from("user_settings")
          .insert({
            user_id: session.user.id,
            language_preference: "en",
            theme_preference: "light",
            timezone: "Asia/Tokyo",
            profile_visibility: "public",
            show_email: false,
            show_phone: false,
            allow_messages_from: "all",
            email_updates: true,
            two_factor_enabled: false,
          })
          .select()
          .single();

        if (createError) {
          throw createError;
        }

        return NextResponse.json({ settings: newSettings });
      }

      return NextResponse.json({ settings: existingSettings });
    }

    return NextResponse.json({ settings });
  } catch (error: any) {
    console.error("Error fetching user settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch user settings" },
      { status: 500 }
    );
  }
}

// POST - Create default user settings
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const supabase = await createClient();

    // Ensure user exists in users table (in case trigger didn't fire)
    const { data: { user: supabaseUser } } = await supabase.auth.getUser();
    if (supabaseUser) {
      await ensureUserExists(supabaseUser);
    }

    // Check if settings already exist
    const { data: existing } = await supabase
      .from("user_settings")
      .select("id")
      .eq("user_id", session.user.id)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: "Settings already exist" },
        { status: 409 }
      );
    }

    // Create default settings
    const { data: settings, error } = await supabase
      .from("user_settings")
      .insert({
        user_id: session.user.id,
        language_preference: "en",
        theme_preference: "light",
        timezone: "Asia/Tokyo",
        profile_visibility: "public",
        show_email: false,
        show_phone: false,
        allow_messages_from: "all",
        email_updates: true,
        two_factor_enabled: false,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ settings });
  } catch (error: any) {
    console.error("Error creating user settings:", error);
    return NextResponse.json(
      { error: "Failed to create user settings" },
      { status: 500 }
    );
  }
}

// PUT - Update user settings
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      languagePreference,
      themePreference,
      timezone,
      profileVisibility,
      showEmail,
      showPhone,
      allowMessagesFrom,
      emailUpdates,
      twoFactorEnabled,
    } = body;

    const supabase = await createClient();

    // Ensure user exists in users table (in case trigger didn't fire)
    const { data: { user: supabaseUser } } = await supabase.auth.getUser();
    if (supabaseUser) {
      await ensureUserExists(supabaseUser);
    }

    // Check if settings exist
    const { data: existing } = await supabase
      .from("user_settings")
      .select("id")
      .eq("user_id", session.user.id)
      .single();

    const updates: any = {};

    if (languagePreference !== undefined) updates.language_preference = languagePreference;
    if (themePreference !== undefined) updates.theme_preference = themePreference;
    if (timezone !== undefined) updates.timezone = timezone;
    if (profileVisibility !== undefined) updates.profile_visibility = profileVisibility;
    if (showEmail !== undefined) updates.show_email = showEmail;
    if (showPhone !== undefined) updates.show_phone = showPhone;
    if (allowMessagesFrom !== undefined) updates.allow_messages_from = allowMessagesFrom;
    if (emailUpdates !== undefined) updates.email_updates = emailUpdates;
    if (twoFactorEnabled !== undefined) updates.two_factor_enabled = twoFactorEnabled;

    let settings;

    if (existing) {
      // Update existing
      const { data: updated, error } = await supabase
        .from("user_settings")
        .update(updates)
        .eq("id", existing.id)
        .select()
        .single();

      if (error) {
        throw error;
      }
      settings = updated;
    } else {
      // Create new with provided values or defaults
      const { data: created, error } = await supabase
        .from("user_settings")
        .insert({
          user_id: session.user.id,
          language_preference: languagePreference || "en",
          theme_preference: themePreference || "light",
          timezone: timezone || "Asia/Tokyo",
          profile_visibility: profileVisibility || "public",
          show_email: showEmail ?? false,
          show_phone: showPhone ?? false,
          allow_messages_from: allowMessagesFrom || "all",
          email_updates: emailUpdates ?? true,
          two_factor_enabled: twoFactorEnabled ?? false,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }
      settings = created;
    }

    return NextResponse.json({ settings });
  } catch (error: any) {
    console.error("Error updating user settings:", error);
    return NextResponse.json(
      { error: "Failed to update user settings" },
      { status: 500 }
    );
  }
}
