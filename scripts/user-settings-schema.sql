-- ============================================
-- USER SETTINGS SCHEMA
-- For storing user preferences and settings
-- ============================================

-- User settings table (general preferences)
CREATE TABLE IF NOT EXISTS user_settings (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  
  -- Display & UI Preferences
  language_preference TEXT DEFAULT 'en', -- 'en' or 'ja'
  theme_preference TEXT DEFAULT 'light', -- 'light' or 'dark' (for future use)
  timezone TEXT DEFAULT 'Asia/Tokyo',
  
  -- Privacy Settings
  profile_visibility TEXT DEFAULT 'public', -- 'public', 'private', 'contacts'
  show_email BOOLEAN DEFAULT FALSE,
  show_phone BOOLEAN DEFAULT FALSE,
  allow_messages_from TEXT DEFAULT 'all', -- 'all', 'contacts', 'none'
  
  -- Notification Preferences (references notification_settings table)
  -- These are kept separate in notification_settings table
  
  -- Account Preferences
  email_updates BOOLEAN DEFAULT TRUE, -- Marketing/announcement emails (separate from transactional)
  two_factor_enabled BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);

-- RLS Policies
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Users can read and update their own settings
DROP POLICY IF EXISTS "Users can manage their own settings" ON user_settings;
CREATE POLICY "Users can manage their own settings" ON user_settings
  FOR ALL USING ((select auth.uid())::text = user_id);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON user_settings TO authenticated;

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on settings changes
DROP TRIGGER IF EXISTS trigger_update_user_settings_updated_at ON user_settings;
CREATE TRIGGER trigger_update_user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_user_settings_updated_at();

-- ============================================
-- HELPER FUNCTION: Get or create user settings
-- ============================================
CREATE OR REPLACE FUNCTION get_or_create_user_settings(p_user_id TEXT)
RETURNS user_settings AS $$
DECLARE
  v_settings user_settings;
BEGIN
  -- Try to get existing settings
  SELECT * INTO v_settings
  FROM user_settings
  WHERE user_id = p_user_id;
  
  -- If no settings exist, create default settings
  IF NOT FOUND THEN
    INSERT INTO user_settings (user_id)
    VALUES (p_user_id)
    RETURNING * INTO v_settings;
  END IF;
  
  RETURN v_settings;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- EXAMPLE QUERIES FOR SAVING USER PREFERENCES
-- ============================================

-- Example 1: Create or update user settings (upsert)
-- INSERT INTO user_settings (user_id, language_preference, profile_visibility, allow_messages_from)
-- VALUES ('user_id_here', 'ja', 'public', 'all')
-- ON CONFLICT (user_id) 
-- DO UPDATE SET 
--   language_preference = EXCLUDED.language_preference,
--   profile_visibility = EXCLUDED.profile_visibility,
--   allow_messages_from = EXCLUDED.allow_messages_from,
--   updated_at = NOW();

-- Example 2: Update specific setting
-- UPDATE user_settings
-- SET language_preference = 'ja',
--     updated_at = NOW()
-- WHERE user_id = 'user_id_here';

-- Example 3: Get user settings
-- SELECT * FROM user_settings WHERE user_id = 'user_id_here';

-- Example 4: Get or create settings (using helper function)
-- SELECT * FROM get_or_create_user_settings('user_id_here');
