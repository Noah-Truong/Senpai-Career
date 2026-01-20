-- ============================================
-- AVAILABILITY CALENDAR SCHEMA
-- Simplified structure: One row per alumni with CSV times
-- ============================================

-- Availability table - stores availability as CSV format
CREATE TABLE IF NOT EXISTS availability (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  alumni_name TEXT NOT NULL,
  times_csv TEXT NOT NULL DEFAULT '', -- CSV format: "2024-01-15 09:00,2024-01-15 10:00,2024-01-16 14:00"
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(alumni_name)
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_availability_alumni_name ON availability(alumni_name);

-- RLS Policies
ALTER TABLE availability ENABLE ROW LEVEL SECURITY;

-- Anyone can view availability (for students to see when alumni are available)
DROP POLICY IF EXISTS "Anyone can view availability" ON availability;
CREATE POLICY "Anyone can view availability" ON availability
  FOR SELECT USING (true);

-- OBOGs can insert their own availability (only if they are OBOG role)
DROP POLICY IF EXISTS "OBOGs can insert their own availability" ON availability;
CREATE POLICY "OBOGs can insert their own availability" ON availability
  FOR INSERT WITH CHECK (
    (SELECT role FROM users WHERE id = (select auth.uid())::text) = 'obog'
  );

-- OBOGs can update their own availability (only if they are OBOG role and name matches)
DROP POLICY IF EXISTS "OBOGs can update their own availability" ON availability;
CREATE POLICY "OBOGs can update their own availability" ON availability
  FOR UPDATE USING (
    (SELECT role FROM users WHERE id = (select auth.uid())::text) = 'obog' AND
    (
      alumni_name = COALESCE((SELECT nickname FROM obog_profiles WHERE id = (select auth.uid())::text), (SELECT name FROM users WHERE id = (select auth.uid())::text)) OR
      alumni_name = (SELECT name FROM users WHERE id = (select auth.uid())::text)
    )
  );

-- OBOGs can delete their own availability (only if they are OBOG role)
DROP POLICY IF EXISTS "OBOGs can delete their own availability" ON availability;
CREATE POLICY "OBOGs can delete their own availability" ON availability
  FOR DELETE USING (
    (SELECT role FROM users WHERE id = (select auth.uid())::text) = 'obog' AND
    (
      alumni_name = COALESCE((SELECT nickname FROM obog_profiles WHERE id = (select auth.uid())::text), (SELECT name FROM users WHERE id = (select auth.uid())::text)) OR
      alumni_name = (SELECT name FROM users WHERE id = (select auth.uid())::text)
    )
  );

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON availability TO authenticated;
GRANT SELECT ON availability TO anon;

-- Insert dummy data for testing
-- Format: CSV of "YYYY-MM-DD HH:MM" strings
-- These dates will show availability for the next 3 weeks
-- Update these dates to match current/future dates when running

-- Generate dates dynamically based on current date
DO $$
DECLARE
  base_date DATE := CURRENT_DATE;
  dates_csv TEXT := '';
  i INTEGER;
  day_offset INTEGER;
BEGIN
  -- Generate availability for next 21 days (3 weeks)
  FOR i IN 0..20 LOOP
    day_offset := i;
    -- Add different time slots for variety
    IF dates_csv != '' THEN dates_csv := dates_csv || ','; END IF;
    
    -- Add 2-4 time slots per day
    dates_csv := dates_csv || 
      (base_date + day_offset)::text || ' 09:00,' ||
      (base_date + day_offset)::text || ' 10:00,' ||
      (base_date + day_offset)::text || ' 14:00';
    
    -- Add afternoon slot for some days
    IF i % 2 = 0 THEN
      dates_csv := dates_csv || ',' || (base_date + day_offset)::text || ' 15:00';
    END IF;
  END LOOP;
  
  -- Insert dummy data for 5 alumni
  INSERT INTO availability (alumni_name, times_csv) VALUES
    ('John Smith', dates_csv),
    ('Sarah Johnson', dates_csv),
    ('Michael Chen', dates_csv),
    ('Emily Davis', dates_csv),
    ('David Kim', dates_csv)
  ON CONFLICT (alumni_name) DO UPDATE SET times_csv = EXCLUDED.times_csv;
END $$;
