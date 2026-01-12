-- Supabase Schema for SenpaiCareer
-- Run this SQL in your Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE user_role AS ENUM ('student', 'obog', 'company', 'admin');
CREATE TYPE obog_type AS ENUM ('working-professional', 'job-offer-holder');
CREATE TYPE compensation_type AS ENUM ('hourly', 'monthly', 'project', 'other');
CREATE TYPE internship_type AS ENUM ('internship', 'new-grad');
CREATE TYPE application_status AS ENUM ('pending', 'accepted', 'rejected', 'withdrawn');
CREATE TYPE report_status AS ENUM ('pending', 'reviewed', 'resolved', 'dismissed');
CREATE TYPE notification_type AS ENUM ('internship', 'new-grad', 'message', 'system', 'application');

-- Users table (base table for all user types)
CREATE TABLE users (
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

-- Student profiles
CREATE TABLE student_profiles (
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
  profile_photo TEXT
);

-- OBOG profiles
CREATE TABLE obog_profiles (
  id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  nickname TEXT,
  type obog_type NOT NULL,
  university TEXT,
  company TEXT,
  nationality TEXT,
  languages TEXT[] DEFAULT '{}',
  topics TEXT[] DEFAULT '{}',
  one_line_message JSONB, -- Supports {en: "", ja: ""} structure
  student_era_summary TEXT,
  profile_photo TEXT
);

-- Company profiles
CREATE TABLE company_profiles (
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
CREATE TABLE internships (
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
CREATE TABLE threads (
  id TEXT PRIMARY KEY,
  participant_ids TEXT[] NOT NULL,
  created_by TEXT REFERENCES users(id) ON DELETE SET NULL,
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages
CREATE TABLE messages (
  id TEXT PRIMARY KEY,
  thread_id TEXT NOT NULL REFERENCES threads(id) ON DELETE CASCADE,
  sender_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  read_by TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications
CREATE TABLE notifications (
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
CREATE TABLE reports (
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
CREATE TABLE applications (
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

-- Reviews (optional - for company/obog reviews)
CREATE TABLE reviews (
  id TEXT PRIMARY KEY,
  reviewer_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reviewee_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_student_profiles_university ON student_profiles(university);
CREATE INDEX idx_obog_profiles_company ON obog_profiles(company);
CREATE INDEX idx_obog_profiles_type ON obog_profiles(type);
CREATE INDEX idx_internships_company_id ON internships(company_id);
CREATE INDEX idx_internships_type ON internships(type);
CREATE INDEX idx_messages_thread_id ON messages(thread_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_applications_user_id ON applications(user_id);
CREATE INDEX idx_applications_internship_id ON applications(internship_id);
CREATE INDEX idx_reports_status ON reports(status);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_internships_updated_at
  BEFORE UPDATE ON internships
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reports_updated_at
  BEFORE UPDATE ON reports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_applications_updated_at
  BEFORE UPDATE ON applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies

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

-- Users policies
CREATE POLICY "Users can read their own data" ON users
  FOR SELECT USING (auth.uid()::text = id);

CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE USING (auth.uid()::text = id);

CREATE POLICY "Anyone can read basic user info" ON users
  FOR SELECT USING (true);

-- Note: For admin operations, you may need service role key or additional policies

-- Student profiles policies
CREATE POLICY "Anyone can read student profiles" ON student_profiles
  FOR SELECT USING (true);

CREATE POLICY "Students can update their own profile" ON student_profiles
  FOR UPDATE USING (auth.uid()::text = id);

CREATE POLICY "Students can insert their own profile" ON student_profiles
  FOR INSERT WITH CHECK (auth.uid()::text = id);

-- OBOG profiles policies
CREATE POLICY "Anyone can read obog profiles" ON obog_profiles
  FOR SELECT USING (true);

CREATE POLICY "OBOGs can update their own profile" ON obog_profiles
  FOR UPDATE USING (auth.uid()::text = id);

CREATE POLICY "OBOGs can insert their own profile" ON obog_profiles
  FOR INSERT WITH CHECK (auth.uid()::text = id);

-- Company profiles policies
CREATE POLICY "Anyone can read company profiles" ON company_profiles
  FOR SELECT USING (true);

CREATE POLICY "Companies can update their own profile" ON company_profiles
  FOR UPDATE USING (auth.uid()::text = id);

CREATE POLICY "Companies can insert their own profile" ON company_profiles
  FOR INSERT WITH CHECK (auth.uid()::text = id);

-- Internships policies
CREATE POLICY "Anyone can read internships" ON internships
  FOR SELECT USING (true);

CREATE POLICY "Companies can manage their own internships" ON internships
  FOR ALL USING (auth.uid()::text = company_id);

-- Threads policies
CREATE POLICY "Users can read their own threads" ON threads
  FOR SELECT USING (auth.uid()::text = ANY(participant_ids));

CREATE POLICY "Users can create threads" ON threads
  FOR INSERT WITH CHECK (auth.uid()::text = created_by);

-- Messages policies
CREATE POLICY "Users can read messages in their threads" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM threads
      WHERE threads.id = messages.thread_id
      AND auth.uid()::text = ANY(threads.participant_ids)
    )
  );

CREATE POLICY "Users can send messages to their threads" ON messages
  FOR INSERT WITH CHECK (
    auth.uid()::text = sender_id AND
    EXISTS (
      SELECT 1 FROM threads
      WHERE threads.id = thread_id
      AND auth.uid()::text = ANY(participant_ids)
    )
  );

-- Notifications policies
CREATE POLICY "Users can read their own notifications" ON notifications
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own notifications" ON notifications
  FOR UPDATE USING (auth.uid()::text = user_id);

-- Reports policies
CREATE POLICY "Users can create reports" ON reports
  FOR INSERT WITH CHECK (auth.uid()::text = reporter_id);

CREATE POLICY "Users can read their own reports" ON reports
  FOR SELECT USING (auth.uid()::text = reporter_id);

-- Applications policies
CREATE POLICY "Users can read their own applications" ON applications
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can create applications" ON applications
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own applications" ON applications
  FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Companies can read applications for their internships" ON applications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM internships
      WHERE internships.id = applications.internship_id
      AND internships.company_id = auth.uid()::text
    )
  );

-- Reviews policies
CREATE POLICY "Anyone can read reviews" ON reviews
  FOR SELECT USING (true);

CREATE POLICY "Users can create reviews" ON reviews
  FOR INSERT WITH CHECK (auth.uid()::text = reviewer_id);
