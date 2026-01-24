-- ============================================
-- CLEAR ALL DATA FROM PUBLIC TABLES
-- Run in Supabase SQL Editor to remove all rows.
-- Does NOT touch auth.users (Supabase Auth).
-- ============================================

-- Truncate in dependency order: child tables first, then parents.
-- CASCADE truncates any table that has a foreign key to these tables.
TRUNCATE TABLE
  reviews,
  bookings,
  applications,
  reports,
  notifications,
  email_notification_queue,
  notification_settings,
  user_settings,
  saved_items,
  browsing_history,
  messages,
  threads,
  internships,
  availability,
  student_profiles,
  obog_profiles,
  company_profiles,
  users
RESTART IDENTITY
CASCADE;
