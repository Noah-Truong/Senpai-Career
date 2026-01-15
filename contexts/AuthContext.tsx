"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { User as SupabaseUser } from "@supabase/supabase-js";

interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: string;
  profilePhoto?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, userData: any) => Promise<{ error: string | null; userId?: string }>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  const fetchUserProfile = useCallback(async (supabaseUser: SupabaseUser) => {
    try {
      // Fetch from our API to get the full user profile including role
      const response = await fetch(`/api/users/${supabaseUser.id}`);
      if (response.ok) {
        const data = await response.json();
        const userData = data.user || data;
        if (userData) {
          setUser({
            id: userData.id,
            email: userData.email || supabaseUser.email || "",
            name: userData.name || supabaseUser.user_metadata?.name || supabaseUser.email?.split("@")[0] || "User",
            role: userData.role || supabaseUser.user_metadata?.role || "student",
            profilePhoto: userData.profilePhoto,
          });
          return;
        }
      }
      
      // If user doesn't exist in users table, use auth metadata
      // This can happen if signup partially failed or trigger hasn't run yet
      console.warn("User not found in users table, using auth metadata. User ID:", supabaseUser.id);
      setUser({
        id: supabaseUser.id,
        email: supabaseUser.email || "",
        name: supabaseUser.user_metadata?.name || supabaseUser.email?.split("@")[0] || "User",
        role: supabaseUser.user_metadata?.role || "student",
        profilePhoto: undefined,
      });
    } catch (error) {
      console.error("Error fetching user profile:", error);
      // Fallback to auth metadata on error
      setUser({
        id: supabaseUser.id,
        email: supabaseUser.email || "",
        name: supabaseUser.user_metadata?.name || supabaseUser.email?.split("@")[0] || "User",
        role: supabaseUser.user_metadata?.role || "student",
        profilePhoto: undefined,
      });
    }
  }, []);

  const refreshUser = useCallback(async () => {
    const { data: { user: supabaseUser } } = await supabase.auth.getUser();
    if (supabaseUser) {
      await fetchUserProfile(supabaseUser);
    } else {
      setUser(null);
    }
  }, [supabase.auth, fetchUserProfile]);

  useEffect(() => {
    // Initial auth check
    const initAuth = async () => {
      try {
        const { data: { user: supabaseUser } } = await supabase.auth.getUser();
        if (supabaseUser) {
          await fetchUserProfile(supabaseUser);
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" && session?.user) {
          await fetchUserProfile(session.user);
        } else if (event === "SIGNED_OUT") {
          setUser(null);
        } else if (event === "TOKEN_REFRESHED" && session?.user) {
          await fetchUserProfile(session.user);
        }
        setIsLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase.auth, fetchUserProfile]);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        return { error: error.message };
      }
      return { error: null };
    } catch (err: any) {
      return { error: err.message || "An error occurred during sign in" };
    }
  };

  const signUp = async (email: string, password: string, userData: any) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: userData.name,
            role: userData.role,
          },
        },
      });
      if (error) {
        return { error: error.message };
      }
      return { error: null, userId: data.user?.id };
    } catch (err: any) {
      return { error: err.message || "An error occurred during sign up" };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signUp, signOut, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Compatibility hook that mimics NextAuth's useSession API
export function useSession() {
  const { user, isLoading } = useAuth();

  return {
    data: user ? { user } : null,
    status: isLoading ? "loading" : user ? "authenticated" : "unauthenticated",
    update: async () => {},
  };
}
