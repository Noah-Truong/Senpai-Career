// This file is deprecated - auth is now handled by Supabase
// Keeping for backward compatibility during migration

import { createClient } from "@/lib/supabase/server";
import bcrypt from "bcryptjs";

// Helper function to hash passwords (used during migration)
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

// Helper function to verify passwords (used during migration)
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// Legacy authOptions export for any remaining NextAuth references
// This should be removed once migration is complete
export const authOptions = {
  providers: [],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt" as const,
  },
  secret: process.env.NEXTAUTH_SECRET,
};
