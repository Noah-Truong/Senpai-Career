-- ============================================
-- NOTIFICATION SETTINGS SCHEMA
-- For email notification preferences and settings
-- ============================================

-- Notification frequency enum
DO $$ BEGIN
  CREATE TYPE notification_frequency AS ENUM ('immediate', 'weekly_summary', 'off');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Notification settings table
CREATE TABLE IF NOT EXISTS notification_settings (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  -- Email settings
  email_notifications_enabled BOOLEAN DEFAULT TRUE,
  notification_email TEXT, -- Separate email for notifications (defaults to user email)
  -- Frequency settings
  notification_frequency notification_frequency DEFAULT 'immediate',
  -- Category preferences (for future use)
  email_application_updates BOOLEAN DEFAULT TRUE,
  email_message_notifications BOOLEAN DEFAULT TRUE,
  email_meeting_notifications BOOLEAN DEFAULT TRUE,
  email_internship_postings BOOLEAN DEFAULT TRUE,
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_notification_settings_user_id ON notification_settings(user_id);

-- RLS Policies
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;

-- Users can read and update their own notification settings
DROP POLICY IF EXISTS "Users can manage their own notification settings" ON notification_settings;
CREATE POLICY "Users can manage their own notification settings" ON notification_settings
  FOR ALL USING ((select auth.uid())::text = user_id);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON notification_settings TO authenticated;

-- Email notification queue (for delayed/late-night emails)
CREATE TABLE IF NOT EXISTS email_notification_queue (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  notification_id TEXT REFERENCES notifications(id) ON DELETE CASCADE,
  email_address TEXT NOT NULL,
  subject TEXT NOT NULL,
  html_content TEXT NOT NULL,
  text_content TEXT,
  scheduled_send_at TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,
  send_attempts INTEGER DEFAULT 0,
  last_error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for email queue
CREATE INDEX IF NOT EXISTS idx_email_queue_user_id ON email_notification_queue(user_id);
CREATE INDEX IF NOT EXISTS idx_email_queue_scheduled_send_at ON email_notification_queue(scheduled_send_at);
CREATE INDEX IF NOT EXISTS idx_email_queue_sent_at ON email_notification_queue(sent_at);

-- RLS Policies for email queue
ALTER TABLE email_notification_queue ENABLE ROW LEVEL SECURITY;

-- Only system/service role can manage email queue
DROP POLICY IF EXISTS "Service role can manage email queue" ON email_notification_queue;
CREATE POLICY "Service role can manage email queue" ON email_notification_queue
  FOR ALL USING (true); -- In production, restrict to service_role

-- Grant permissions (service role only in production)
GRANT SELECT, INSERT, UPDATE ON email_notification_queue TO service_role;
GRANT SELECT ON email_notification_queue TO authenticated; -- Users can see their queued emails
