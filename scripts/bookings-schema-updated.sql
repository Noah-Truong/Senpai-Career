-- ============================================
-- UPDATED BOOKINGS SCHEMA
-- Includes meeting data directly in bookings table
-- Run migrate-meetings-to-bookings.sql first to migrate existing data
-- ============================================

-- Booking status enum
DO $$ BEGIN
  CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Bookings table (updated to include meeting data)
CREATE TABLE IF NOT EXISTS bookings (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  obog_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  thread_id TEXT, -- References threads (file-based, so no FK constraint)
  -- Booking time slot
  booking_date_time TEXT NOT NULL, -- Format: "YYYY-MM-DD HH:MM"
  duration_minutes INTEGER DEFAULT 60, -- Duration in minutes (15, 30, 60, or 1440 for full day)
  -- Status and metadata
  status booking_status DEFAULT 'pending',
  notes TEXT, -- Optional notes/description from student
  -- Meeting data (stored directly in bookings)
  meeting_url TEXT, -- Meeting URL (e.g., Google Meet, Zoom)
  meeting_status TEXT DEFAULT 'unconfirmed' CHECK (meeting_status IN ('unconfirmed', 'confirmed', 'completed', 'cancelled', 'no-show')),
  -- Post-meeting status (both parties can mark independently)
  student_post_status TEXT CHECK (student_post_status IN ('completed', 'no-show')),
  obog_post_status TEXT CHECK (obog_post_status IN ('completed', 'no-show')),
  student_post_status_at TIMESTAMPTZ,
  obog_post_status_at TIMESTAMPTZ,
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  cancelled_at TIMESTAMPTZ,
  cancelled_by TEXT REFERENCES users(id) ON DELETE SET NULL,
  cancellation_reason TEXT,
  -- Ensure one booking per time slot per OB/OG
  UNIQUE(obog_id, booking_date_time)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_bookings_student_id ON bookings(student_id);
CREATE INDEX IF NOT EXISTS idx_bookings_obog_id ON bookings(obog_id);
CREATE INDEX IF NOT EXISTS idx_bookings_thread_id ON bookings(thread_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_date_time ON bookings(booking_date_time);
CREATE INDEX IF NOT EXISTS idx_bookings_meeting_status ON bookings(meeting_status);
CREATE INDEX IF NOT EXISTS idx_bookings_obog_post_status ON bookings(obog_post_status);
CREATE INDEX IF NOT EXISTS idx_bookings_student_post_status ON bookings(student_post_status);

-- RLS Policies
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Users can read bookings they're part of
DROP POLICY IF EXISTS "Users can read their own bookings" ON bookings;
CREATE POLICY "Users can read their own bookings" ON bookings
  FOR SELECT USING (
    (select auth.uid())::text = student_id OR 
    (select auth.uid())::text = obog_id OR
    (SELECT role FROM users WHERE id = (select auth.uid())::text) = 'admin'
  );

-- Students can create bookings
DROP POLICY IF EXISTS "Students can create bookings" ON bookings;
CREATE POLICY "Students can create bookings" ON bookings
  FOR INSERT WITH CHECK (
    (select auth.uid())::text = student_id AND
    (SELECT role FROM users WHERE id = (select auth.uid())::text) = 'student' AND
    (SELECT role FROM users WHERE id = obog_id) = 'obog'
  );

-- Both parties can update bookings (for status changes, cancellation, meeting completion)
DROP POLICY IF EXISTS "Users can update their bookings" ON bookings;
CREATE POLICY "Users can update their bookings" ON bookings
  FOR UPDATE USING (
    (select auth.uid())::text = student_id OR 
    (select auth.uid())::text = obog_id OR
    (SELECT role FROM users WHERE id = (select auth.uid())::text) = 'admin'
  );

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON bookings TO authenticated;
