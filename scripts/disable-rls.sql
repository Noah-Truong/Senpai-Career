-- ============================================
-- DISABLE RLS ON SPECIFIC TABLES (IF NEEDED)
-- Only run this if you're experiencing RLS permission errors
-- and have confirmed auth is enforced in your API routes.
-- ============================================

-- RECOMMENDATION: Keep RLS on all tables in schema.sql
-- The core tables (users, profiles, internships, threads, messages, 
-- notifications, reports, applications, reviews) should all keep RLS enabled.

-- Optional: Disable RLS only if you're experiencing permission errors:

-- 1. Availability table (if OB/OGs can't save availability from client)
-- ALTER TABLE availability DISABLE ROW LEVEL SECURITY;

-- 2. Bookings table (if you use it and have permission issues)
-- ALTER TABLE bookings DISABLE ROW LEVEL SECURITY;

-- NOTE: meetings and meeting_operation_logs tables were consolidated into bookings.
-- If you have old meetings tables, you can drop them:
-- DROP TABLE IF EXISTS meeting_operation_logs CASCADE;
-- DROP TABLE IF EXISTS meetings CASCADE;

-- To re-enable RLS later:
-- ALTER TABLE availability ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
