-- ============================================
-- MIGRATION: Move meeting data to bookings table
-- This removes the need for separate meetings table
-- ============================================

-- Step 1: Add new columns to bookings table
ALTER TABLE bookings 
  ADD COLUMN IF NOT EXISTS meeting_url TEXT,
  ADD COLUMN IF NOT EXISTS meeting_status TEXT DEFAULT 'unconfirmed' CHECK (meeting_status IN ('unconfirmed', 'confirmed', 'completed', 'cancelled', 'no-show')),
  ADD COLUMN IF NOT EXISTS student_post_status TEXT CHECK (student_post_status IN ('completed', 'no-show')),
  ADD COLUMN IF NOT EXISTS obog_post_status TEXT CHECK (obog_post_status IN ('completed', 'no-show')),
  ADD COLUMN IF NOT EXISTS student_post_status_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS obog_post_status_at TIMESTAMPTZ;

-- Step 2: Migrate data from meetings table to bookings
-- Copy meeting_url, status, and post_statuses from meetings to bookings
UPDATE bookings b
SET 
  meeting_url = m.meeting_url,
  meeting_status = m.status,
  student_post_status = m.student_post_status,
  obog_post_status = m.obog_post_status,
  student_post_status_at = m.student_post_status_at,
  obog_post_status_at = m.obog_post_status_at
FROM meetings m
WHERE b.meeting_id = m.id;

-- Step 3: Remove foreign key constraint on meeting_id
ALTER TABLE bookings 
  DROP CONSTRAINT IF EXISTS bookings_meeting_id_fkey;

-- Step 4: Drop the meeting_id column (no longer needed)
ALTER TABLE bookings 
  DROP COLUMN IF EXISTS meeting_id;

-- Step 5: Update booking status enum to include 'completed' and 'no-show' if needed
-- Note: The enum already includes these, but we'll use meeting_status for meeting-specific status

-- Step 6: Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_bookings_meeting_status ON bookings(meeting_status);
CREATE INDEX IF NOT EXISTS idx_bookings_obog_post_status ON bookings(obog_post_status);
CREATE INDEX IF NOT EXISTS idx_bookings_student_post_status ON bookings(student_post_status);

-- Step 7: Optional - Drop meetings and meeting_operation_logs tables
-- Uncomment these lines if you want to completely remove the meetings system:
-- DROP TABLE IF EXISTS meeting_operation_logs CASCADE;
-- DROP TABLE IF EXISTS meetings CASCADE;

-- Step 8: Update any existing bookings that don't have meeting_status set
UPDATE bookings 
SET meeting_status = 
  CASE 
    WHEN status = 'confirmed' THEN 'confirmed'
    WHEN status = 'cancelled' THEN 'cancelled'
    WHEN status = 'completed' THEN 'completed'
    ELSE 'unconfirmed'
  END
WHERE meeting_status IS NULL;

-- Verification queries (run these to check the migration)
-- SELECT COUNT(*) as total_bookings FROM bookings;
-- SELECT COUNT(*) as bookings_with_meeting_url FROM bookings WHERE meeting_url IS NOT NULL;
-- SELECT meeting_status, COUNT(*) FROM bookings GROUP BY meeting_status;
-- SELECT obog_post_status, COUNT(*) FROM bookings WHERE obog_post_status IS NOT NULL GROUP BY obog_post_status;
