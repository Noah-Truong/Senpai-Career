-- Migration: Add report_type column to reports table
-- Fixes: "Could not find the 'report_type' column of 'reports' in the schema cache"
-- Run this in Supabase SQL Editor, then restart your Next.js dev server.

-- Add report_type column (nullable; allowed values: user, safety, platform, other)
ALTER TABLE public.reports
  ADD COLUMN IF NOT EXISTS report_type TEXT
  CHECK (report_type IS NULL OR report_type IN ('user', 'safety', 'platform', 'other'));

-- Optional: backfill existing rows (default to 'user' if you prefer)
-- UPDATE public.reports SET report_type = 'user' WHERE report_type IS NULL;
