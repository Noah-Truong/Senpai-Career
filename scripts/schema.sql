-- ============================================
-- SENPAICAREER — CONSOLIDATED SUPABASE SCHEMA
-- Run once in Supabase SQL Editor.
-- Creates all tables, fixes, RLS, triggers, grants.
-- ============================================

-- PART 1: EXTENSIONS & SCHEMA PERMISSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- PART 2: CUSTOM TYPES
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('student', 'obog', 'company', 'admin');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE obog_type AS ENUM ('working-professional', 'job-offer-holder');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE compensation_type AS ENUM ('hourly', 'fixed', 'monthly', 'project', 'other');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE internship_type AS ENUM ('internship', 'new-grad');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE application_status AS ENUM ('pending', 'reviewed', 'accepted', 'rejected', 'withdrawn');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE report_status AS ENUM ('pending', 'reviewed', 'resolved', 'dismissed');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE notification_type AS ENUM ('internship', 'new-grad', 'message', 'system', 'application', 'meeting');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- PART 3: TABLES
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role user_role NOT NULL,
  credits INTEGER DEFAULT 0,
  strikes INTEGER DEFAULT 0,
  is_banned BOOLEAN DEFAULT FALSE,
  viewed_rules BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

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
  compliance_agreed BOOLEAN DEFAULT FALSE,
  compliance_agreed_at TIMESTAMPTZ,
  compliance_documents TEXT[] DEFAULT '{}',
  compliance_status TEXT DEFAULT 'pending' CHECK (compliance_status IN ('pending', 'submitted', 'approved', 'rejected')),
  compliance_submitted_at TIMESTAMPTZ,
  profile_completed BOOLEAN DEFAULT FALSE
);

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
  status TEXT DEFAULT 'public' CHECK (status IN ('public', 'stopped')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS threads (
  id TEXT PRIMARY KEY,
  participant_ids TEXT[] NOT NULL,
  created_by TEXT REFERENCES users(id) ON DELETE SET NULL,
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  thread_id TEXT NOT NULL REFERENCES threads(id) ON DELETE CASCADE,
  sender_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  read_by TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

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

-- Reports: includes report_type (fix for "Could not find report_type column")
CREATE TABLE IF NOT EXISTS reports (
  id TEXT PRIMARY KEY,
  reporter_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reported_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  report_type TEXT CHECK (report_type IS NULL OR report_type IN ('user', 'safety', 'platform', 'other')),
  reason TEXT NOT NULL,
  details TEXT,
  status report_status DEFAULT 'pending',
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Applications: cover_letter stores answers as JSON; resume_url, status
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

CREATE TABLE IF NOT EXISTS reviews (
  id TEXT PRIMARY KEY,
  reviewer_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reviewee_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bookings (consolidated from meetings + meeting_operation_logs)
CREATE TABLE IF NOT EXISTS bookings (
  id TEXT PRIMARY KEY DEFAULT ('booking_' || gen_random_uuid()::text),
  student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  obog_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  thread_id TEXT,
  booking_date_time TEXT NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  notes TEXT,
  meeting_url TEXT,
  meeting_status TEXT DEFAULT 'unconfirmed' CHECK (meeting_status IN ('unconfirmed', 'confirmed', 'completed', 'cancelled', 'no-show')),
  student_post_status TEXT CHECK (student_post_status IN ('completed', 'no-show')),
  obog_post_status TEXT CHECK (obog_post_status IN ('completed', 'no-show')),
  student_post_status_at TIMESTAMPTZ,
  obog_post_status_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  cancelled_by TEXT,
  cancellation_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Availability (for OB/OG calendar)
CREATE TABLE IF NOT EXISTS availability (
  id TEXT PRIMARY KEY,
  alumni_name TEXT UNIQUE NOT NULL,
  times_csv TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Saved items (students save companies/recruitments)
CREATE TABLE IF NOT EXISTS saved_items (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL CHECK (item_type IN ('company', 'recruitment')),
  item_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, item_type, item_id)
);

-- Browsing history (students)
CREATE TABLE IF NOT EXISTS browsing_history (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL CHECK (item_type IN ('company', 'recruitment')),
  item_id TEXT NOT NULL,
  viewed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notification settings (email preferences)
CREATE TABLE IF NOT EXISTS notification_settings (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  email_notifications_enabled BOOLEAN DEFAULT TRUE,
  notification_email TEXT,
  notification_frequency TEXT DEFAULT 'immediate' CHECK (notification_frequency IN ('immediate', 'weekly_summary', 'off')),
  email_application_updates BOOLEAN DEFAULT TRUE,
  email_message_notifications BOOLEAN DEFAULT TRUE,
  email_meeting_notifications BOOLEAN DEFAULT TRUE,
  email_internship_postings BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Email notification queue (for cron)
CREATE TABLE IF NOT EXISTS email_notification_queue (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  email_address TEXT NOT NULL,
  subject TEXT NOT NULL,
  html_content TEXT,
  text_content TEXT,
  scheduled_send_at TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,
  send_attempts INTEGER DEFAULT 0,
  last_error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User settings (language, theme, etc.)
CREATE TABLE IF NOT EXISTS user_settings (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  language_preference TEXT DEFAULT 'en',
  theme_preference TEXT DEFAULT 'light',
  timezone TEXT DEFAULT 'Asia/Tokyo',
  profile_visibility TEXT DEFAULT 'public',
  show_email BOOLEAN DEFAULT FALSE,
  show_phone BOOLEAN DEFAULT FALSE,
  allow_messages_from TEXT DEFAULT 'all',
  email_updates BOOLEAN DEFAULT TRUE,
  two_factor_enabled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Idempotent migrations (existing DBs)
ALTER TABLE users ADD COLUMN IF NOT EXISTS viewed_rules BOOLEAN DEFAULT FALSE;
DO $$ BEGIN
  EXECUTE 'ALTER TYPE notification_type ADD VALUE IF NOT EXISTS ''meeting''';
EXCEPTION WHEN OTHERS THEN null;
END $$;

-- PART 4: INDEXES
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_student_profiles_university ON student_profiles(university);
CREATE INDEX IF NOT EXISTS idx_obog_profiles_company ON obog_profiles(company);
CREATE INDEX IF NOT EXISTS idx_obog_profiles_type ON obog_profiles(type);
CREATE INDEX IF NOT EXISTS idx_internships_company_id ON internships(company_id);
CREATE INDEX IF NOT EXISTS idx_internships_type ON internships(type);
CREATE INDEX IF NOT EXISTS idx_internships_status ON internships(status);
CREATE INDEX IF NOT EXISTS idx_messages_thread_id ON messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_applications_user_id ON applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_internship_id ON applications(internship_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_reporter_id ON reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_reports_reported_user_id ON reports(reported_user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer_id ON reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewee_id ON reviews(reviewee_id);
CREATE INDEX IF NOT EXISTS idx_threads_created_by ON threads(created_by);
CREATE INDEX IF NOT EXISTS idx_student_profiles_compliance_status ON student_profiles(compliance_status);
CREATE INDEX IF NOT EXISTS idx_student_profiles_profile_completed ON student_profiles(profile_completed);
CREATE INDEX IF NOT EXISTS idx_bookings_student_id ON bookings(student_id);
CREATE INDEX IF NOT EXISTS idx_bookings_obog_id ON bookings(obog_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_booking_date_time ON bookings(booking_date_time);
CREATE INDEX IF NOT EXISTS idx_availability_alumni_name ON availability(alumni_name);
CREATE INDEX IF NOT EXISTS idx_saved_items_student_id ON saved_items(student_id);
CREATE INDEX IF NOT EXISTS idx_saved_items_item ON saved_items(item_type, item_id);
CREATE INDEX IF NOT EXISTS idx_browsing_history_student_id ON browsing_history(student_id);
CREATE INDEX IF NOT EXISTS idx_browsing_history_viewed_at ON browsing_history(viewed_at);
CREATE INDEX IF NOT EXISTS idx_notification_settings_user_id ON notification_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_email_notification_queue_scheduled ON email_notification_queue(scheduled_send_at);
CREATE INDEX IF NOT EXISTS idx_email_notification_queue_sent_at ON email_notification_queue(sent_at);
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);

-- PART 5: FUNCTIONS (secure search_path)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER SET search_path = '' LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER SET search_path = '' LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  r TEXT;
  n TEXT;
  e TEXT;
BEGIN
  r := COALESCE(NEW.raw_user_meta_data->>'role', 'student');
  n := COALESCE(NEW.raw_user_meta_data->>'name', '');
  e := NEW.email;
  INSERT INTO public.users (id, email, password_hash, name, role, credits, strikes, is_banned)
  VALUES (NEW.id::text, e, '', n, r::public.user_role, 0,
    CASE WHEN r = 'student' THEN 0 ELSE NULL END,
    CASE WHEN r = 'student' THEN FALSE ELSE NULL END)
  ON CONFLICT (id) DO NOTHING;

  IF r = 'student' THEN
    INSERT INTO public.student_profiles (id, nickname, university, year, nationality, jlpt_level, languages, interests, skills, desired_industry, profile_photo)
    VALUES (NEW.id::text, COALESCE(NEW.raw_user_meta_data->>'nickname',''),
      COALESCE(NEW.raw_user_meta_data->>'university',''), (NEW.raw_user_meta_data->>'year')::int,
      COALESCE(NEW.raw_user_meta_data->>'nationality',''), COALESCE(NEW.raw_user_meta_data->>'jlptLevel',''),
      COALESCE(ARRAY(SELECT jsonb_array_elements_text(NEW.raw_user_meta_data->'languages')), '{}'),
      COALESCE(ARRAY(SELECT jsonb_array_elements_text(NEW.raw_user_meta_data->'interests')), '{}'),
      COALESCE(ARRAY(SELECT jsonb_array_elements_text(NEW.raw_user_meta_data->'skills')), '{}'),
      COALESCE(NEW.raw_user_meta_data->>'desiredIndustry',''), NEW.raw_user_meta_data->>'profilePhoto')
    ON CONFLICT (id) DO NOTHING;
  ELSIF r = 'obog' THEN
    INSERT INTO public.obog_profiles (id, nickname, type, university, company, nationality, languages, topics, one_line_message, student_era_summary, profile_photo)
    VALUES (NEW.id::text, COALESCE(NEW.raw_user_meta_data->>'nickname',''),
      COALESCE(NEW.raw_user_meta_data->>'type','working-professional')::public.obog_type,
      COALESCE(NEW.raw_user_meta_data->>'university',''), COALESCE(NEW.raw_user_meta_data->>'company',''),
      COALESCE(NEW.raw_user_meta_data->>'nationality',''),
      COALESCE(ARRAY(SELECT jsonb_array_elements_text(NEW.raw_user_meta_data->'languages')), '{}'),
      COALESCE(ARRAY(SELECT jsonb_array_elements_text(NEW.raw_user_meta_data->'topics')), '{}'),
      NEW.raw_user_meta_data->'oneLineMessage', NEW.raw_user_meta_data->>'studentEraSummary',
      NEW.raw_user_meta_data->>'profilePhoto')
    ON CONFLICT (id) DO NOTHING;
  ELSIF r = 'company' THEN
    INSERT INTO public.company_profiles (id, company_name, contact_name, overview, work_location, hourly_wage, weekly_hours, selling_points, ideal_candidate, internship_details, new_grad_details, logo)
    VALUES (NEW.id::text, COALESCE(NEW.raw_user_meta_data->>'companyName',''),
      COALESCE(NEW.raw_user_meta_data->>'contactName', n), NEW.raw_user_meta_data->>'overview',
      COALESCE(NEW.raw_user_meta_data->>'workLocation',''), (NEW.raw_user_meta_data->>'hourlyWage')::int,
      (NEW.raw_user_meta_data->>'weeklyHours')::int, NEW.raw_user_meta_data->>'sellingPoints',
      NEW.raw_user_meta_data->>'idealCandidate', NEW.raw_user_meta_data->>'internshipDetails',
      NEW.raw_user_meta_data->>'newGradDetails', NEW.raw_user_meta_data->>'logo')
    ON CONFLICT (id) DO NOTHING;
  END IF;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'handle_new_user: %', SQLERRM;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_user_deletion()
RETURNS TRIGGER SET search_path = '' LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  DELETE FROM public.users WHERE id = OLD.id::text;
  RETURN OLD;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'handle_user_deletion: %', SQLERRM;
  RETURN OLD;
END;
$$;

-- Generate availability ID if not provided
CREATE OR REPLACE FUNCTION generate_availability_id()
RETURNS TRIGGER SET search_path = '' LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.id IS NULL OR NEW.id = '' THEN
    NEW.id := 'avail_' || gen_random_uuid()::text;
  END IF;
  RETURN NEW;
END;
$$;

-- Record browsing history (called from API / lib)
CREATE OR REPLACE FUNCTION record_browsing_history(
  p_student_id TEXT,
  p_item_type TEXT,
  p_item_id TEXT
)
RETURNS void SET search_path = '' LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO browsing_history (student_id, item_type, item_id)
  VALUES (p_student_id, p_item_type, p_item_id);
END;
$$;

-- PART 6: TRIGGERS
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS update_internships_updated_at ON internships;
CREATE TRIGGER update_internships_updated_at BEFORE UPDATE ON internships FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS update_reports_updated_at ON reports;
CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON reports FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS update_applications_updated_at ON applications;
CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON applications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS update_bookings_updated_at ON bookings;
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS update_availability_updated_at ON availability;
CREATE TRIGGER update_availability_updated_at BEFORE UPDATE ON availability FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS update_notification_settings_updated_at ON notification_settings;
CREATE TRIGGER update_notification_settings_updated_at BEFORE UPDATE ON notification_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users;
CREATE TRIGGER on_auth_user_deleted BEFORE DELETE ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_user_deletion();

DROP TRIGGER IF EXISTS generate_availability_id_trigger ON availability;
CREATE TRIGGER generate_availability_id_trigger BEFORE INSERT ON availability FOR EACH ROW EXECUTE FUNCTION generate_availability_id();

-- PART 7: ROW LEVEL SECURITY
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
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE browsing_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_notification_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read their own data" ON users;
CREATE POLICY "Users can read their own data" ON users FOR SELECT USING ((SELECT auth.uid())::text = id);
DROP POLICY IF EXISTS "Users can update their own data" ON users;
CREATE POLICY "Users can update their own data" ON users FOR UPDATE USING ((SELECT auth.uid())::text = id);
DROP POLICY IF EXISTS "Anyone can read basic user info" ON users;
CREATE POLICY "Anyone can read basic user info" ON users FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can read student profiles" ON student_profiles;
CREATE POLICY "Anyone can read student profiles" ON student_profiles FOR SELECT USING (true);
DROP POLICY IF EXISTS "Students can update their own profile" ON student_profiles;
CREATE POLICY "Students can update their own profile" ON student_profiles FOR UPDATE USING ((SELECT auth.uid())::text = id);
DROP POLICY IF EXISTS "Students can insert their own profile" ON student_profiles;
CREATE POLICY "Students can insert their own profile" ON student_profiles FOR INSERT WITH CHECK ((SELECT auth.uid())::text = id);

DROP POLICY IF EXISTS "Anyone can read obog profiles" ON obog_profiles;
CREATE POLICY "Anyone can read obog profiles" ON obog_profiles FOR SELECT USING (true);
DROP POLICY IF EXISTS "OBOGs can update their own profile" ON obog_profiles;
CREATE POLICY "OBOGs can update their own profile" ON obog_profiles FOR UPDATE USING ((SELECT auth.uid())::text = id);
DROP POLICY IF EXISTS "OBOGs can insert their own profile" ON obog_profiles;
CREATE POLICY "OBOGs can insert their own profile" ON obog_profiles FOR INSERT WITH CHECK ((SELECT auth.uid())::text = id);

DROP POLICY IF EXISTS "Anyone can read company profiles" ON company_profiles;
CREATE POLICY "Anyone can read company profiles" ON company_profiles FOR SELECT USING (true);
DROP POLICY IF EXISTS "Companies can update their own profile" ON company_profiles;
CREATE POLICY "Companies can update their own profile" ON company_profiles FOR UPDATE USING ((SELECT auth.uid())::text = id);
DROP POLICY IF EXISTS "Companies can insert their own profile" ON company_profiles;
CREATE POLICY "Companies can insert their own profile" ON company_profiles FOR INSERT WITH CHECK ((SELECT auth.uid())::text = id);

DROP POLICY IF EXISTS "Anyone can read internships" ON internships;
CREATE POLICY "Anyone can read internships" ON internships FOR SELECT USING (true);
DROP POLICY IF EXISTS "Companies can manage their own internships" ON internships;
CREATE POLICY "Companies can manage their own internships" ON internships FOR ALL USING ((SELECT auth.uid())::text = company_id);

DROP POLICY IF EXISTS "Users can read their own threads" ON threads;
CREATE POLICY "Users can read their own threads" ON threads FOR SELECT USING ((SELECT auth.uid())::text = ANY(participant_ids));
DROP POLICY IF EXISTS "Users can create threads" ON threads;
CREATE POLICY "Users can create threads" ON threads FOR INSERT WITH CHECK ((SELECT auth.uid())::text = created_by);

DROP POLICY IF EXISTS "Users can read messages in their threads" ON messages;
CREATE POLICY "Users can read messages in their threads" ON messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM threads t WHERE t.id = thread_id AND (SELECT auth.uid())::text = ANY(t.participant_ids))
);
DROP POLICY IF EXISTS "Users can send messages to their threads" ON messages;
CREATE POLICY "Users can send messages to their threads" ON messages FOR INSERT WITH CHECK (
  (SELECT auth.uid())::text = sender_id AND
  EXISTS (SELECT 1 FROM threads t WHERE t.id = thread_id AND (SELECT auth.uid())::text = ANY(t.participant_ids))
);

DROP POLICY IF EXISTS "Users can read their own notifications" ON notifications;
CREATE POLICY "Users can read their own notifications" ON notifications FOR SELECT USING ((SELECT auth.uid())::text = user_id);
DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
CREATE POLICY "Users can update their own notifications" ON notifications FOR UPDATE USING ((SELECT auth.uid())::text = user_id);

DROP POLICY IF EXISTS "Users can create reports" ON reports;
CREATE POLICY "Users can create reports" ON reports FOR INSERT WITH CHECK ((SELECT auth.uid())::text = reporter_id);
DROP POLICY IF EXISTS "Users can read their own reports" ON reports;
CREATE POLICY "Users can read their own reports" ON reports FOR SELECT USING ((SELECT auth.uid())::text = reporter_id);

DROP POLICY IF EXISTS "Users can read their own applications" ON applications;
CREATE POLICY "Users can read their own applications" ON applications FOR SELECT USING ((SELECT auth.uid())::text = user_id);
DROP POLICY IF EXISTS "Users can create applications" ON applications;
CREATE POLICY "Users can create applications" ON applications FOR INSERT WITH CHECK ((SELECT auth.uid())::text = user_id);
DROP POLICY IF EXISTS "Users can update their own applications" ON applications;
CREATE POLICY "Users can update their own applications" ON applications FOR UPDATE USING ((SELECT auth.uid())::text = user_id);
DROP POLICY IF EXISTS "Companies can read applications for their internships" ON applications;
CREATE POLICY "Companies can read applications for their internships" ON applications FOR SELECT USING (
  EXISTS (SELECT 1 FROM internships i WHERE i.id = internship_id AND i.company_id = (SELECT auth.uid())::text)
);

DROP POLICY IF EXISTS "Anyone can read reviews" ON reviews;
CREATE POLICY "Anyone can read reviews" ON reviews FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can create reviews" ON reviews;
CREATE POLICY "Users can create reviews" ON reviews FOR INSERT WITH CHECK ((SELECT auth.uid())::text = reviewer_id);

-- Bookings policies
DROP POLICY IF EXISTS "Students can create bookings" ON bookings;
CREATE POLICY "Students can create bookings" ON bookings FOR INSERT WITH CHECK ((SELECT auth.uid())::text = student_id);
DROP POLICY IF EXISTS "Users can read their own bookings" ON bookings;
CREATE POLICY "Users can read their own bookings" ON bookings FOR SELECT USING (
  (SELECT auth.uid())::text = student_id OR (SELECT auth.uid())::text = obog_id
);
DROP POLICY IF EXISTS "Users can update their own bookings" ON bookings;
CREATE POLICY "Users can update their own bookings" ON bookings FOR UPDATE USING (
  (SELECT auth.uid())::text = student_id OR (SELECT auth.uid())::text = obog_id
);

-- Availability policies
DROP POLICY IF EXISTS "Anyone can read availability" ON availability;
CREATE POLICY "Anyone can read availability" ON availability FOR SELECT USING (true);
DROP POLICY IF EXISTS "OBOGs can manage their own availability" ON availability;
CREATE POLICY "OBOGs can manage their own availability" ON availability FOR ALL USING (
  EXISTS (
    SELECT 1 FROM obog_profiles op
    JOIN users u ON u.id = op.id
    WHERE (SELECT auth.uid())::text = op.id
    AND (
      alumni_name = op.nickname
      OR alumni_name = u.name
      OR alumni_name = TRIM(COALESCE(op.nickname,'') || ' ' || COALESCE(u.name,''))
    )
  )
);

-- Saved items policies (students only)
DROP POLICY IF EXISTS "Students can manage their own saved items" ON saved_items;
CREATE POLICY "Students can manage their own saved items" ON saved_items FOR ALL USING ((SELECT auth.uid())::text = student_id);

-- Browsing history policies (students only)
DROP POLICY IF EXISTS "Students can manage their own browsing history" ON browsing_history;
CREATE POLICY "Students can manage their own browsing history" ON browsing_history FOR ALL USING ((SELECT auth.uid())::text = student_id);

-- Notification settings policies
DROP POLICY IF EXISTS "Users can manage their own notification settings" ON notification_settings;
CREATE POLICY "Users can manage their own notification settings" ON notification_settings FOR ALL USING ((SELECT auth.uid())::text = user_id);

-- Email queue (user-scoped; cron should use createAdminClient to bypass RLS)
DROP POLICY IF EXISTS "Users can manage own email queue" ON email_notification_queue;
CREATE POLICY "Users can manage own email queue" ON email_notification_queue FOR ALL USING ((SELECT auth.uid())::text = user_id);

-- User settings policies
DROP POLICY IF EXISTS "Users can manage their own settings" ON user_settings;
CREATE POLICY "Users can manage their own settings" ON user_settings FOR ALL USING ((SELECT auth.uid())::text = user_id);

-- PART 8: GRANTS
GRANT USAGE ON TYPE user_role TO anon, authenticated, service_role, supabase_auth_admin;
GRANT USAGE ON TYPE obog_type TO anon, authenticated, service_role, supabase_auth_admin;
GRANT USAGE ON TYPE compensation_type TO anon, authenticated, service_role, supabase_auth_admin;
GRANT USAGE ON TYPE internship_type TO anon, authenticated, service_role, supabase_auth_admin;
GRANT USAGE ON TYPE application_status TO anon, authenticated, service_role, supabase_auth_admin;
GRANT USAGE ON TYPE report_status TO anon, authenticated, service_role, supabase_auth_admin;
GRANT USAGE ON TYPE notification_type TO anon, authenticated, service_role, supabase_auth_admin;

GRANT EXECUTE ON FUNCTION update_updated_at_column() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO supabase_auth_admin, service_role;
GRANT EXECUTE ON FUNCTION public.handle_user_deletion() TO supabase_auth_admin, service_role;
GRANT EXECUTE ON FUNCTION generate_availability_id() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION record_browsing_history(TEXT, TEXT, TEXT) TO authenticated, service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;

GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role, supabase_auth_admin;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role, supabase_auth_admin;
GRANT USAGE ON SCHEMA public TO supabase_auth_admin;

GRANT ALL ON public.users, public.student_profiles, public.obog_profiles, public.company_profiles,
  public.internships, public.threads, public.messages, public.notifications,
  public.reports, public.applications, public.reviews, public.bookings, public.availability,
  public.saved_items, public.browsing_history, public.notification_settings,
  public.email_notification_queue, public.user_settings
  TO authenticated, supabase_auth_admin;

GRANT SELECT ON public.users, public.student_profiles, public.obog_profiles, public.company_profiles,
  public.internships, public.reviews, public.availability TO anon;
