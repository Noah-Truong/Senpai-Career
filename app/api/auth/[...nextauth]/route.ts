// This route is deprecated - auth is now handled by Supabase
// Keeping for backward compatibility during migration

import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.redirect(new URL("/login", process.env.NEXTAUTH_URL || "http://localhost:3000"));
}

export async function POST() {
  return NextResponse.json(
    { error: "NextAuth is deprecated. Please use the new Supabase auth endpoints." },
    { status: 410 }
  );
}
