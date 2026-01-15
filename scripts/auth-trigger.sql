-- Supabase Auth Trigger for SenpaiCareer
-- This trigger automatically creates rows in users and profile tables
-- when a new auth user is created via Supabase Auth
--
-- Run this SQL in your Supabase SQL Editor (Dashboard > SQL Editor)

-- Function to handle new auth user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
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
    '', -- Password is handled by Supabase Auth
    user_name,
    user_role::user_role,
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
      COALESCE(NEW.raw_user_meta_data->>'type', 'working-professional')::obog_type,
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
    -- Log error but don't fail the auth user creation
    RAISE WARNING 'Error in handle_new_user trigger: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users table
-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
GRANT ALL ON public.users TO supabase_auth_admin;
GRANT ALL ON public.student_profiles TO supabase_auth_admin;
GRANT ALL ON public.obog_profiles TO supabase_auth_admin;
GRANT ALL ON public.company_profiles TO supabase_auth_admin;

-- ============================================
-- OPTIONAL: Function to handle user deletion
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_user_deletion()
RETURNS TRIGGER AS $$
BEGIN
  -- Delete user from public.users (cascades to profile tables)
  DELETE FROM public.users WHERE id = OLD.id::text;
  RETURN OLD;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error in handle_user_deletion trigger: %', SQLERRM;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create deletion trigger
DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users;

CREATE TRIGGER on_auth_user_deleted
  BEFORE DELETE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_user_deletion();

-- ============================================
-- OPTIONAL: Backfill existing auth users
-- Run this once to sync existing auth users
-- ============================================

-- Uncomment and run this to backfill existing users:
/*
INSERT INTO public.users (id, email, password_hash, name, role, credits, strikes, is_banned)
SELECT
  au.id::text,
  au.email,
  '',
  COALESCE(au.raw_user_meta_data->>'name', ''),
  COALESCE(au.raw_user_meta_data->>'role', 'student')::user_role,
  0,
  CASE WHEN COALESCE(au.raw_user_meta_data->>'role', 'student') = 'student' THEN 0 ELSE NULL END,
  CASE WHEN COALESCE(au.raw_user_meta_data->>'role', 'student') = 'student' THEN FALSE ELSE NULL END
FROM auth.users au
WHERE NOT EXISTS (SELECT 1 FROM public.users u WHERE u.id = au.id::text)
ON CONFLICT (id) DO NOTHING;

-- Backfill student profiles
INSERT INTO public.student_profiles (id)
SELECT u.id
FROM public.users u
WHERE u.role = 'student'
AND NOT EXISTS (SELECT 1 FROM public.student_profiles sp WHERE sp.id = u.id)
ON CONFLICT (id) DO NOTHING;

-- Backfill obog profiles
INSERT INTO public.obog_profiles (id, type)
SELECT u.id, 'working-professional'::obog_type
FROM public.users u
WHERE u.role = 'obog'
AND NOT EXISTS (SELECT 1 FROM public.obog_profiles op WHERE op.id = u.id)
ON CONFLICT (id) DO NOTHING;

-- Backfill company profiles
INSERT INTO public.company_profiles (id, company_name)
SELECT u.id, ''
FROM public.users u
WHERE u.role = 'company'
AND NOT EXISTS (SELECT 1 FROM public.company_profiles cp WHERE cp.id = u.id)
ON CONFLICT (id) DO NOTHING;
*/

-- ============================================
-- Verify the trigger was created
-- ============================================
SELECT
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name IN ('on_auth_user_created', 'on_auth_user_deleted');
