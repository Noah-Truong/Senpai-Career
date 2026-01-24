-- ============================================
-- DISABLE RLS FOR MEETINGS (optional)
-- ============================================
-- Use only if meeting create/update fails due to RLS.
-- The meetings INSERT policy requires thread_id to exist in DB `threads`;
-- the app uses file-based threads, so that check often fails.
--
-- All meeting access goes through your API (auth enforced there).
-- ============================================

ALTER TABLE meeting_operation_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE meetings DISABLE ROW LEVEL SECURITY;

-- To re-enable later, run:
-- ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE meeting_operation_logs ENABLE ROW LEVEL SECURITY;
-- Then re-run meetings-schema.sql RLS policy section.
