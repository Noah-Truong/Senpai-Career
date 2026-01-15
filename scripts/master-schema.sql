-- ============================================
-- MASTER SUPABASE SCHEMA SCRIPT
-- Consolidates all SQL scripts into one
-- Run this ONCE in your Supabase SQL Editor to set up everything
-- ============================================
-- This script includes:
-- - Schema permissions (fixes "permission denied" errors)
-- - Database schema (tables, types, indexes)
-- - Compliance tracking fields
-- - Secure functions (fixes search_path security issues)
-- - Auth triggers (automatic user creation)
-- - Optimized RLS policies (fixes performance warnings)
-- ============================================

-- ============================================
-- PART 1: EXTENSIONS & SCHEMA PERMISSIONS
-- Fixes "permission denied for schema public" errors
-- ============================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Grant USAGE on public schema to Supabase roles
-- This is REQUIRED to prevent "permission denied for schema public" errors
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;

-- ============================================
-- PART 2: CUSTOM TYPES
-- ============================================

-- Create custom types (idempotent - only create if they don't exist)
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('student', 'obog', 'company', 'admin');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE obog_type AS ENUM ('working-professional', 'job-offer-holder');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE compensation_type AS ENUM ('hourly', 'monthly', 'project', 'other');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE internship_type AS ENUM ('internship', 'new-grad');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE application_status AS ENUM ('pending', 'accepted', 'rejected', 'withdrawn');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE report_status AS ENUM ('pending', 'reviewed', 'resolved', 'dismissed');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE notification_type AS ENUM ('internship', 'new-grad', 'message', 'system', 'application');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ============================================
-- PART 3: TABLES
-- ============================================

-- Users table (base table for all user types)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role user_role NOT NULL,
  credits INTEGER DEFAULT 0,
  strikes INTEGER DEFAULT 0,
  is_banned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Student profiles (with compliance tracking)
CREATE TABLE IF NOT EXISTS student_profiles (
  id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  nickname TEXT,
  university TEXT,
  year INTEGER,
  nationality TEXT,
  jlpt_level TEXT,
  languages TEXT[] DEFAULT '{}',
  interests TEXT[] DEFAULT '{}',
  skills TEXT[] DEFAULT '{}',
  desired_industry TEXT,
  profile_photo TEXT,
  -- Compliance tracking fields
  compliance_agreed BOOLEAN DEFAULT FALSE,
  compliance_agreed_at TIMESTAMPTZ,
  compliance_documents TEXT[] DEFAULT '{}',
  compliance_status TEXT DEFAULT 'pending' CHECK (compliance_status IN ('pending', 'submitted', 'approved', 'rejected')),
  compliance_submitted_at TIMESTAMPTZ,
  profile_completed BOOLEAN DEFAULT FALSE
);

-- OBOG profiles
CREATE TABLE IF NOT EXISTS obog_profiles (
  id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  nickname TEXT,
  type obog_type NOT NULL,
  university TEXT,
  company TEXT,
  nationality TEXT,
  languages TEXT[] DEFAULT '{}',
  topics TEXT[] DEFAULT '{}',
  one_line_message JSONB,
  student_era_summary TEXT,
  profile_photo TEXT
);

-- Company profiles
CREATE TABLE IF NOT EXISTS company_profiles (
  id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  contact_name TEXT,
  overview TEXT,
  work_location TEXT,
  hourly_wage INTEGER,
  weekly_hours INTEGER,
  selling_points TEXT,
  ideal_candidate TEXT,
  internship_details TEXT,
  new_grad_details TEXT,
  logo TEXT
);

-- Internships/Job listings
CREATE TABLE IF NOT EXISTS internships (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  compensation_type compensation_type,
  other_compensation TEXT,
  work_details TEXT,
  skills_gained TEXT[] DEFAULT '{}',
  why_this_company TEXT,
  type internship_type NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Message threads
CREATE TABLE IF NOT EXISTS threads (
  id TEXT PRIMARY KEY,
  participant_ids TEXT[] NOT NULL,
  created_by TEXT REFERENCES users(id) ON DELETE SET NULL,
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages
CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  thread_id TEXT NOT NULL REFERENCES threads(id) ON DELETE CASCADE,
  sender_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  read_by TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  link TEXT,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reports
CREATE TABLE IF NOT EXISTS reports (
  id TEXT PRIMARY KEY,
  reporter_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reported_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  details TEXT,
  status report_status DEFAULT 'pending',
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Applications
CREATE TABLE IF NOT EXISTS applications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  internship_id TEXT NOT NULL REFERENCES internships(id) ON DELETE CASCADE,
  cover_letter TEXT,
  resume_url TEXT,
  status application_status DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, internship_id)
);

-- Reviews
CREATE TABLE IF NOT EXISTS reviews (
  id TEXT PRIMARY KEY,
  reviewer_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reviewee_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PART 4: INDEXES
-- ============================================

-- Basic indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_student_profiles_university ON student_profiles(university);
CREATE INDEX IF NOT EXISTS idx_obog_profiles_company ON obog_profiles(company);
CREATE INDEX IF NOT EXISTS idx_obog_profiles_type ON obog_profiles(type);
CREATE INDEX IF NOT EXISTS idx_internships_company_id ON internships(company_id);
CREATE INDEX IF NOT EXISTS idx_internships_type ON internships(type);
CREATE INDEX IF NOT EXISTS idx_messages_thread_id ON messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_applications_user_id ON applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_internship_id ON applications(internship_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);

-- Foreign key indexes (for better query performance)
CREATE INDEX IF NOT EXISTS idx_reports_reporter_id ON reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_reports_reported_user_id ON reports(reported_user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer_id ON reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewee_id ON reviews(reviewee_id);
CREATE INDEX IF NOT EXISTS idx_threads_created_by ON threads(created_by);

-- Add compliance tracking fields to existing student_profiles table (if they don't exist)
-- This handles cases where the table was created before compliance fields were added
ALTER TABLE student_profiles 
ADD COLUMN IF NOT EXISTS compliance_agreed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS compliance_agreed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS compliance_documents TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS compliance_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS compliance_submitted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS profile_completed BOOLEAN DEFAULT FALSE;

-- Add check constraint for compliance_status if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'student_profiles_compliance_status_check'
  ) THEN
    ALTER TABLE student_profiles 
    ADD CONSTRAINT student_profiles_compliance_status_check 
    CHECK (compliance_status IN ('pending', 'submitted', 'approved', 'rejected'));
  END IF;
END $$;

-- Compliance indexes
CREATE INDEX IF NOT EXISTS idx_student_profiles_compliance_status ON student_profiles(compliance_status);
CREATE INDEX IF NOT EXISTS idx_student_profiles_profile_completed ON student_profiles(profile_completed);

-- ============================================
-- PART 5: FUNCTIONS (with secure search_path)
-- Fixes function_search_path_mutable security warnings
-- ============================================

-- Updated_at trigger function (secure)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
SET search_path = ''
LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Handle new user creation (secure)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SET search_path = ''
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  user_role TEXT;
  user_name TEXT;
  user_email TEXT;
BEGIN
  -- Extract data from the auth user's metadata
  user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'student');
  user_name := COALESCE(NEW.raw_user_meta_data->>'name', '');
  user_email := NEW.email;

  -- Insert into users table
  INSERT INTO public.users (id, email, password_hash, name, role, credits, strikes, is_banned)
  VALUES (
    NEW.id::text,
    user_email,
    '',
    user_name,
    user_role::public.user_role,
    0,
    CASE WHEN user_role = 'student' THEN 0 ELSE NULL END,
    CASE WHEN user_role = 'student' THEN FALSE ELSE NULL END
  )
  ON CONFLICT (id) DO NOTHING;

  -- Create role-specific profile
  IF user_role = 'student' THEN
    INSERT INTO public.student_profiles (id, nickname, university, year, nationality, jlpt_level, languages, interests, skills, desired_industry, profile_photo)
    VALUES (
      NEW.id::text,
      COALESCE(NEW.raw_user_meta_data->>'nickname', ''),
      COALESCE(NEW.raw_user_meta_data->>'university', ''),
      (NEW.raw_user_meta_data->>'year')::integer,
      COALESCE(NEW.raw_user_meta_data->>'nationality', ''),
      COALESCE(NEW.raw_user_meta_data->>'jlptLevel', ''),
      COALESCE(ARRAY(SELECT jsonb_array_elements_text(NEW.raw_user_meta_data->'languages')), '{}'),
      COALESCE(ARRAY(SELECT jsonb_array_elements_text(NEW.raw_user_meta_data->'interests')), '{}'),
      COALESCE(ARRAY(SELECT jsonb_array_elements_text(NEW.raw_user_meta_data->'skills')), '{}'),
      COALESCE(NEW.raw_user_meta_data->>'desiredIndustry', ''),
      NEW.raw_user_meta_data->>'profilePhoto'
    )
    ON CONFLICT (id) DO NOTHING;

  ELSIF user_role = 'obog' THEN
    INSERT INTO public.obog_profiles (id, nickname, type, university, company, nationality, languages, topics, one_line_message, student_era_summary, profile_photo)
    VALUES (
      NEW.id::text,
      COALESCE(NEW.raw_user_meta_data->>'nickname', ''),
      COALESCE(NEW.raw_user_meta_data->>'type', 'working-professional')::public.obog_type,
      COALESCE(NEW.raw_user_meta_data->>'university', ''),
      COALESCE(NEW.raw_user_meta_data->>'company', ''),
      COALESCE(NEW.raw_user_meta_data->>'nationality', ''),
      COALESCE(ARRAY(SELECT jsonb_array_elements_text(NEW.raw_user_meta_data->'languages')), '{}'),
      COALESCE(ARRAY(SELECT jsonb_array_elements_text(NEW.raw_user_meta_data->'topics')), '{}'),
      NEW.raw_user_meta_data->'oneLineMessage',
      NEW.raw_user_meta_data->>'studentEraSummary',
      NEW.raw_user_meta_data->>'profilePhoto'
    )
    ON CONFLICT (id) DO NOTHING;

  ELSIF user_role = 'company' THEN
    INSERT INTO public.company_profiles (id, company_name, contact_name, overview, work_location, hourly_wage, weekly_hours, selling_points, ideal_candidate, internship_details, new_grad_details, logo)
    VALUES (
      NEW.id::text,
      COALESCE(NEW.raw_user_meta_data->>'companyName', ''),
      COALESCE(NEW.raw_user_meta_data->>'contactName', user_name),
      NEW.raw_user_meta_data->>'overview',
      COALESCE(NEW.raw_user_meta_data->>'workLocation', ''),
      (NEW.raw_user_meta_data->>'hourlyWage')::integer,
      (NEW.raw_user_meta_data->>'weeklyHours')::integer,
      NEW.raw_user_meta_data->>'sellingPoints',
      NEW.raw_user_meta_data->>'idealCandidate',
      NEW.raw_user_meta_data->>'internshipDetails',
      NEW.raw_user_meta_data->>'newGradDetails',
      NEW.raw_user_meta_data->>'logo'
    )
    ON CONFLICT (id) DO NOTHING;
  END IF;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error in handle_new_user trigger: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Handle user deletion (secure)
CREATE OR REPLACE FUNCTION public.handle_user_deletion()
RETURNS TRIGGER
SET search_path = ''
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  DELETE FROM public.users WHERE id = OLD.id::text;
  RETURN OLD;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error in handle_user_deletion trigger: %', SQLERRM;
    RETURN OLD;
END;
$$;

-- ============================================
-- PART 6: TRIGGERS
-- ============================================

-- Updated_at triggers
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_internships_updated_at ON internships;
CREATE TRIGGER update_internships_updated_at
  BEFORE UPDATE ON internships
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_reports_updated_at ON reports;
CREATE TRIGGER update_reports_updated_at
  BEFORE UPDATE ON reports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_applications_updated_at ON applications;
CREATE TRIGGER update_applications_updated_at
  BEFORE UPDATE ON applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Auth triggers (automatic user creation)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users;
CREATE TRIGGER on_auth_user_deleted
  BEFORE DELETE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_user_deletion();

-- ============================================
-- PART 7: ROW LEVEL SECURITY (RLS)
-- Optimized policies using (select auth.uid()) to fix performance warnings
-- ============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE obog_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE internships ENABLE ROW LEVEL SECURITY;
ALTER TABLE threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Users policies (optimized)
DROP POLICY IF EXISTS "Users can read their own data" ON users;
CREATE POLICY "Users can read their own data" ON users
  FOR SELECT USING ((select auth.uid())::text = id);

DROP POLICY IF EXISTS "Users can update their own data" ON users;
CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE USING ((select auth.uid())::text = id);

DROP POLICY IF EXISTS "Anyone can read basic user info" ON users;
CREATE POLICY "Anyone can read basic user info" ON users
  FOR SELECT USING (true);

-- Student profiles policies (optimized)
DROP POLICY IF EXISTS "Anyone can read student profiles" ON student_profiles;
CREATE POLICY "Anyone can read student profiles" ON student_profiles
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Students can update their own profile" ON student_profiles;
CREATE POLICY "Students can update their own profile" ON student_profiles
  FOR UPDATE USING ((select auth.uid())::text = id);

DROP POLICY IF EXISTS "Students can insert their own profile" ON student_profiles;
CREATE POLICY "Students can insert their own profile" ON student_profiles
  FOR INSERT WITH CHECK ((select auth.uid())::text = id);

-- OBOG profiles policies (optimized)
DROP POLICY IF EXISTS "Anyone can read obog profiles" ON obog_profiles;
CREATE POLICY "Anyone can read obog profiles" ON obog_profiles
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "OBOGs can update their own profile" ON obog_profiles;
CREATE POLICY "OBOGs can update their own profile" ON obog_profiles
  FOR UPDATE USING ((select auth.uid())::text = id);

DROP POLICY IF EXISTS "OBOGs can insert their own profile" ON obog_profiles;
CREATE POLICY "OBOGs can insert their own profile" ON obog_profiles
  FOR INSERT WITH CHECK ((select auth.uid())::text = id);

-- Company profiles policies (optimized)
DROP POLICY IF EXISTS "Anyone can read company profiles" ON company_profiles;
CREATE POLICY "Anyone can read company profiles" ON company_profiles
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Companies can update their own profile" ON company_profiles;
CREATE POLICY "Companies can update their own profile" ON company_profiles
  FOR UPDATE USING ((select auth.uid())::text = id);

DROP POLICY IF EXISTS "Companies can insert their own profile" ON company_profiles;
CREATE POLICY "Companies can insert their own profile" ON company_profiles
  FOR INSERT WITH CHECK ((select auth.uid())::text = id);

-- Internships policies (optimized)
DROP POLICY IF EXISTS "Anyone can read internships" ON internships;
CREATE POLICY "Anyone can read internships" ON internships
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Companies can manage their own internships" ON internships;
CREATE POLICY "Companies can manage their own internships" ON internships
  FOR ALL USING ((select auth.uid())::text = company_id);

-- Threads policies (optimized)
DROP POLICY IF EXISTS "Users can read their own threads" ON threads;
CREATE POLICY "Users can read their own threads" ON threads
  FOR SELECT USING ((select auth.uid())::text = ANY(participant_ids));

DROP POLICY IF EXISTS "Users can create threads" ON threads;
CREATE POLICY "Users can create threads" ON threads
  FOR INSERT WITH CHECK ((select auth.uid())::text = created_by);

-- Messages policies (optimized)
DROP POLICY IF EXISTS "Users can read messages in their threads" ON messages;
CREATE POLICY "Users can read messages in their threads" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM threads
      WHERE threads.id = messages.thread_id
      AND (select auth.uid())::text = ANY(threads.participant_ids)
    )
  );

DROP POLICY IF EXISTS "Users can send messages to their threads" ON messages;
CREATE POLICY "Users can send messages to their threads" ON messages
  FOR INSERT WITH CHECK (
    (select auth.uid())::text = sender_id AND
    EXISTS (
      SELECT 1 FROM threads
      WHERE threads.id = thread_id
      AND (select auth.uid())::text = ANY(participant_ids)
    )
  );

-- Notifications policies (optimized)
DROP POLICY IF EXISTS "Users can read their own notifications" ON notifications;
CREATE POLICY "Users can read their own notifications" ON notifications
  FOR SELECT USING ((select auth.uid())::text = user_id);

DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
CREATE POLICY "Users can update their own notifications" ON notifications
  FOR UPDATE USING ((select auth.uid())::text = user_id);

-- Reports policies (optimized)
DROP POLICY IF EXISTS "Users can create reports" ON reports;
CREATE POLICY "Users can create reports" ON reports
  FOR INSERT WITH CHECK ((select auth.uid())::text = reporter_id);

DROP POLICY IF EXISTS "Users can read their own reports" ON reports;
CREATE POLICY "Users can read their own reports" ON reports
  FOR SELECT USING ((select auth.uid())::text = reporter_id);

-- Applications policies (optimized)
DROP POLICY IF EXISTS "Users can read their own applications" ON applications;
CREATE POLICY "Users can read their own applications" ON applications
  FOR SELECT USING ((select auth.uid())::text = user_id);

DROP POLICY IF EXISTS "Users can create applications" ON applications;
CREATE POLICY "Users can create applications" ON applications
  FOR INSERT WITH CHECK ((select auth.uid())::text = user_id);

DROP POLICY IF EXISTS "Users can update their own applications" ON applications;
CREATE POLICY "Users can update their own applications" ON applications
  FOR UPDATE USING ((select auth.uid())::text = user_id);

DROP POLICY IF EXISTS "Companies can read applications for their internships" ON applications;
CREATE POLICY "Companies can read applications for their internships" ON applications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM internships
      WHERE internships.id = applications.internship_id
      AND internships.company_id = (select auth.uid())::text
    )
  );

-- Reviews policies (optimized)
DROP POLICY IF EXISTS "Anyone can read reviews" ON reviews;
CREATE POLICY "Anyone can read reviews" ON reviews
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create reviews" ON reviews;
CREATE POLICY "Users can create reviews" ON reviews
  FOR INSERT WITH CHECK ((select auth.uid())::text = reviewer_id);

-- ============================================
-- PART 8: PERMISSIONS & GRANTS
-- Fixes "permission denied for schema public" errors
-- These grants MUST come AFTER all tables are created
-- ============================================

-- Grant USAGE on schema (already done at top, but ensure it's here too)
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;

-- Grant USAGE on all custom types (ENUMs) - required for using these types in queries
-- GRANT is idempotent, so safe to run multiple times
GRANT USAGE ON TYPE user_role TO anon, authenticated, service_role, supabase_auth_admin;
GRANT USAGE ON TYPE obog_type TO anon, authenticated, service_role, supabase_auth_admin;
GRANT USAGE ON TYPE compensation_type TO anon, authenticated, service_role, supabase_auth_admin;
GRANT USAGE ON TYPE internship_type TO anon, authenticated, service_role, supabase_auth_admin;
GRANT USAGE ON TYPE application_status TO anon, authenticated, service_role, supabase_auth_admin;
GRANT USAGE ON TYPE report_status TO anon, authenticated, service_role, supabase_auth_admin;
GRANT USAGE ON TYPE notification_type TO anon, authenticated, service_role, supabase_auth_admin;

-- Grant EXECUTE on functions
GRANT EXECUTE ON FUNCTION update_updated_at_column() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO supabase_auth_admin, service_role;
GRANT EXECUTE ON FUNCTION public.handle_user_deletion() TO supabase_auth_admin, service_role;

-- Grant table permissions to authenticated users
-- RLS policies will still control row-level access
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Grant table permissions to anonymous users (for public read access)
-- RLS policies will still control what they can see
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;

-- Grant permissions for service_role (admin operations - bypasses RLS)
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- Ensure future tables also get these permissions automatically
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO authenticated;

-- Grant permissions for auth admin role (for triggers)
GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
GRANT ALL ON ALL TABLES IN SCHEMA public TO supabase_auth_admin;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO supabase_auth_admin;

-- Explicit grants on specific tables to ensure permissions are set
GRANT ALL ON public.users TO authenticated, supabase_auth_admin;
GRANT ALL ON public.student_profiles TO authenticated, supabase_auth_admin;
GRANT ALL ON public.obog_profiles TO authenticated, supabase_auth_admin;
GRANT ALL ON public.company_profiles TO authenticated, supabase_auth_admin;
GRANT ALL ON public.internships TO authenticated, supabase_auth_admin;
GRANT ALL ON public.threads TO authenticated, supabase_auth_admin;
GRANT ALL ON public.messages TO authenticated, supabase_auth_admin;
GRANT ALL ON public.notifications TO authenticated, supabase_auth_admin;
GRANT ALL ON public.reports TO authenticated, supabase_auth_admin;
GRANT ALL ON public.applications TO authenticated, supabase_auth_admin;
GRANT ALL ON public.reviews TO authenticated, supabase_auth_admin;

-- Grant SELECT on specific tables for anonymous users (where RLS allows)
GRANT SELECT ON public.users TO anon;
GRANT SELECT ON public.student_profiles TO anon;
GRANT SELECT ON public.obog_profiles TO anon;
GRANT SELECT ON public.company_profiles TO anon;
GRANT SELECT ON public.internships TO anon;
GRANT SELECT ON public.reviews TO anon;

-- ============================================
-- DONE! 
-- All issues should now be fixed:
-- ✅ Schema permissions
-- ✅ Security vulnerabilities (function search_path)
-- ✅ Performance issues (RLS optimization)
-- ✅ Compliance tracking
-- ✅ Auth triggers
-- ============================================
