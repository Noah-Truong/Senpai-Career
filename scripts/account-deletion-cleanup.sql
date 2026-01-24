-- ============================================
-- ACCOUNT DELETION CLEANUP SCRIPT
-- This script provides SQL queries to manually clean up
-- user data that isn't automatically handled by CASCADE
-- ============================================

-- ============================================
-- MANUAL CLEANUP FUNCTIONS
-- Use these when deleting a user account
-- ============================================

-- Function to clean up threads for a specific user
CREATE OR REPLACE FUNCTION cleanup_user_threads(p_user_id TEXT)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER := 0;
BEGIN
  -- Delete threads where user is a participant
  DELETE FROM threads 
  WHERE p_user_id = ANY(participant_ids);
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up availability for a specific OB/OG
CREATE OR REPLACE FUNCTION cleanup_user_availability(p_user_id TEXT)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER := 0;
  v_alumni_name TEXT;
BEGIN
  -- Get alumni name (nickname or name)
  SELECT COALESCE(
    (SELECT nickname FROM obog_profiles WHERE id = p_user_id),
    (SELECT name FROM users WHERE id = p_user_id)
  ) INTO v_alumni_name;
  
  -- Delete availability records
  IF v_alumni_name IS NOT NULL THEN
    DELETE FROM availability 
    WHERE alumni_name = v_alumni_name;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
  END IF;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- COMPLETE USER DELETION FUNCTION
-- This function handles all cleanup before deleting the user
-- ============================================

CREATE OR REPLACE FUNCTION delete_user_complete(p_user_id TEXT)
RETURNS JSON AS $$
DECLARE
  v_user_role TEXT;
  v_threads_deleted INTEGER := 0;
  v_availability_deleted INTEGER := 0;
  result JSON;
BEGIN
  -- Get user role
  SELECT role INTO v_user_role FROM users WHERE id = p_user_id;
  
  IF v_user_role IS NULL THEN
    RETURN json_build_object('error', 'User not found');
  END IF;
  
  -- Clean up threads
  SELECT cleanup_user_threads(p_user_id) INTO v_threads_deleted;
  
  -- Clean up availability (only for OB/OG)
  IF v_user_role = 'obog' THEN
    SELECT cleanup_user_availability(p_user_id) INTO v_availability_deleted;
  END IF;
  
  -- Delete user (CASCADE will handle the rest)
  DELETE FROM users WHERE id = p_user_id;
  
  -- Return summary
  result := json_build_object(
    'success', true,
    'user_id', p_user_id,
    'threads_deleted', v_threads_deleted,
    'availability_deleted', v_availability_deleted,
    'message', 'User and all associated data deleted successfully'
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- VERIFICATION QUERIES
-- Use these to check what data exists for a user
-- ============================================

-- Check all data associated with a user (replace 'user_id_here' with actual user ID)
/*
SELECT 
  'users' as table_name,
  COUNT(*) as record_count
FROM users WHERE id = 'user_id_here'

UNION ALL

SELECT 
  'student_profiles' as table_name,
  COUNT(*) as record_count
FROM student_profiles WHERE id = 'user_id_here'

UNION ALL

SELECT 
  'obog_profiles' as table_name,
  COUNT(*) as record_count
FROM obog_profiles WHERE id = 'user_id_here'

UNION ALL

SELECT 
  'company_profiles' as table_name,
  COUNT(*) as record_count
FROM company_profiles WHERE id = 'user_id_here'

UNION ALL

SELECT 
  'internships' as table_name,
  COUNT(*) as record_count
FROM internships WHERE company_id = 'user_id_here'

UNION ALL

SELECT 
  'messages' as table_name,
  COUNT(*) as record_count
FROM messages WHERE sender_id = 'user_id_here'

UNION ALL

SELECT 
  'notifications' as table_name,
  COUNT(*) as record_count
FROM notifications WHERE user_id = 'user_id_here'

UNION ALL

SELECT 
  'reports' as table_name,
  COUNT(*) as record_count
FROM reports WHERE reporter_id = 'user_id_here' OR reported_user_id = 'user_id_here'

UNION ALL

SELECT 
  'applications' as table_name,
  COUNT(*) as record_count
FROM applications WHERE user_id = 'user_id_here'

UNION ALL

SELECT 
  'reviews' as table_name,
  COUNT(*) as record_count
FROM reviews WHERE reviewer_id = 'user_id_here' OR reviewee_id = 'user_id_here'

UNION ALL

SELECT 
  'bookings' as table_name,
  COUNT(*) as record_count
FROM bookings WHERE student_id = 'user_id_here' OR obog_id = 'user_id_here'

UNION ALL

SELECT 
  'meetings' as table_name,
  COUNT(*) as record_count
FROM meetings WHERE student_id = 'user_id_here' OR obog_id = 'user_id_here'

UNION ALL

SELECT 
  'meeting_operation_logs' as table_name,
  COUNT(*) as record_count
FROM meeting_operation_logs WHERE user_id = 'user_id_here'

UNION ALL

SELECT 
  'user_settings' as table_name,
  COUNT(*) as record_count
FROM user_settings WHERE user_id = 'user_id_here'

UNION ALL

SELECT 
  'notification_settings' as table_name,
  COUNT(*) as record_count
FROM notification_settings WHERE user_id = 'user_id_here'

UNION ALL

SELECT 
  'email_notification_queue' as table_name,
  COUNT(*) as record_count
FROM email_notification_queue WHERE user_id = 'user_id_here'

UNION ALL

SELECT 
  'threads' as table_name,
  COUNT(*) as record_count
FROM threads WHERE 'user_id_here' = ANY(participant_ids)

UNION ALL

SELECT 
  'availability' as table_name,
  COUNT(*) as record_count
FROM availability 
WHERE alumni_name = COALESCE(
  (SELECT nickname FROM obog_profiles WHERE id = 'user_id_here'),
  (SELECT name FROM users WHERE id = 'user_id_here')
);
*/

-- ============================================
-- USAGE EXAMPLES
-- ============================================

-- Example 1: Delete a user and all associated data
-- SELECT delete_user_complete('user_id_here');

-- Example 2: Just clean up threads for a user
-- SELECT cleanup_user_threads('user_id_here');

-- Example 3: Just clean up availability for an OB/OG
-- SELECT cleanup_user_availability('user_id_here');

-- Example 4: Verify data before deletion (uncomment the verification query above and replace 'user_id_here')
