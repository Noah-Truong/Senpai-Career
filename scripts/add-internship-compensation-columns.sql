-- Add hourly_wage and fixed_salary to internships table for listing compensation
-- Run in Supabase SQL Editor. Safe to run multiple times (uses IF NOT EXISTS where supported).

ALTER TABLE internships ADD COLUMN IF NOT EXISTS hourly_wage INTEGER;
ALTER TABLE internships ADD COLUMN IF NOT EXISTS fixed_salary INTEGER;
