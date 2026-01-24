-- ============================================
-- RECRUITMENT STATUS SCHEMA
-- Adds status management for internship/job listings
-- ============================================

-- Create recruitment_status enum
DO $$ BEGIN
  CREATE TYPE recruitment_status AS ENUM ('public', 'stopped');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Add status column to internships table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'internships' AND column_name = 'status'
  ) THEN
    ALTER TABLE internships 
    ADD COLUMN status recruitment_status DEFAULT 'public';
  END IF;
END $$;

-- Create index for status filtering
CREATE INDEX IF NOT EXISTS idx_internships_status ON internships(status);
CREATE INDEX IF NOT EXISTS idx_internships_company_status ON internships(company_id, status);

-- Grant usage on the enum type
GRANT USAGE ON TYPE recruitment_status TO anon, authenticated, service_role, supabase_auth_admin;

-- Update existing records to have 'public' status (if any exist without status)
UPDATE internships SET status = 'public' WHERE status IS NULL;

-- Add NOT NULL constraint after setting defaults
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'internships' AND column_name = 'status' AND is_nullable = 'YES'
  ) THEN
    ALTER TABLE internships ALTER COLUMN status SET NOT NULL;
  END IF;
END $$;
