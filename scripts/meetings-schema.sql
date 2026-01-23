-- ============================================
-- MEETINGS SCHEMA
-- For OB Visit meeting flow (meetingflow.md)
-- ============================================

-- Meeting status enum
DO $$ BEGIN
  CREATE TYPE meeting_status AS ENUM ('unconfirmed', 'confirmed', 'completed', 'cancelled', 'no-show');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Meeting operation type enum (for logging)
DO $$ BEGIN
  CREATE TYPE meeting_operation_type AS ENUM ('create', 'update_date', 'update_url', 'update_status', 'confirm', 'complete', 'cancel', 'mark_no_show', 'accept_terms');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Meetings table
CREATE TABLE IF NOT EXISTS meetings (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  thread_id TEXT NOT NULL REFERENCES threads(id) ON DELETE CASCADE,
  student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  obog_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  meeting_date_time TEXT, -- Text input for date/time (flexible format)
  meeting_url TEXT, -- Meeting URL (no strict validation)
  status meeting_status DEFAULT 'unconfirmed',
  -- Terms agreement tracking
  student_terms_accepted BOOLEAN DEFAULT FALSE,
  student_terms_accepted_at TIMESTAMPTZ,
  obog_terms_accepted BOOLEAN DEFAULT FALSE,
  obog_terms_accepted_at TIMESTAMPTZ,
  -- Post-meeting status (both parties can mark independently)
  student_post_status TEXT, -- 'completed' or 'no-show' or NULL
  obog_post_status TEXT, -- 'completed' or 'no-show' or NULL
  student_post_status_at TIMESTAMPTZ,
  obog_post_status_at TIMESTAMPTZ,
  -- Evaluation (triggered when user marks complete)
  student_evaluated BOOLEAN DEFAULT FALSE,
  obog_evaluated BOOLEAN DEFAULT FALSE,
  student_rating INTEGER CHECK (student_rating IS NULL OR (student_rating >= 1 AND student_rating <= 5)),
  obog_rating INTEGER CHECK (obog_rating IS NULL OR (obog_rating >= 1 AND obog_rating <= 5)),
  student_evaluation_comment TEXT,
  obog_evaluation_comment TEXT,
  student_evaluated_at TIMESTAMPTZ,
  obog_evaluated_at TIMESTAMPTZ,
  -- Additional question for international students
  student_additional_question_answered BOOLEAN DEFAULT FALSE,
  student_offered_opportunity BOOLEAN, -- Yes/No to main question
  student_opportunity_types TEXT[], -- Multi-select options
  student_opportunity_other TEXT, -- Free text for "Other"
  student_evidence_screenshot TEXT, -- Optional screenshot URL
  student_evidence_description TEXT, -- Optional text description
  student_additional_question_answered_at TIMESTAMPTZ,
  -- Flagging for admin review
  requires_review BOOLEAN DEFAULT FALSE,
  review_reason TEXT, -- Why it was flagged
  admin_reviewed BOOLEAN DEFAULT FALSE,
  admin_reviewed_at TIMESTAMPTZ,
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(thread_id) -- One meeting per thread
);

-- Meeting operation logs (for audit trail)
CREATE TABLE IF NOT EXISTS meeting_operation_logs (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  meeting_id TEXT NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  operation_type meeting_operation_type NOT NULL,
  old_value JSONB, -- Previous state (optional)
  new_value JSONB, -- New state (optional)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_meetings_thread_id ON meetings(thread_id);
CREATE INDEX IF NOT EXISTS idx_meetings_student_id ON meetings(student_id);
CREATE INDEX IF NOT EXISTS idx_meetings_obog_id ON meetings(obog_id);
CREATE INDEX IF NOT EXISTS idx_meetings_status ON meetings(status);
CREATE INDEX IF NOT EXISTS idx_meetings_requires_review ON meetings(requires_review);
CREATE INDEX IF NOT EXISTS idx_meeting_operation_logs_meeting_id ON meeting_operation_logs(meeting_id);
CREATE INDEX IF NOT EXISTS idx_meeting_operation_logs_user_id ON meeting_operation_logs(user_id);

-- RLS Policies
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_operation_logs ENABLE ROW LEVEL SECURITY;

-- Users can read meetings they're part of
DROP POLICY IF EXISTS "Users can read their own meetings" ON meetings;
CREATE POLICY "Users can read their own meetings" ON meetings
  FOR SELECT USING (
    (select auth.uid())::text = student_id OR 
    (select auth.uid())::text = obog_id
  );

-- Students can create meetings in their threads
DROP POLICY IF EXISTS "Students can create meetings" ON meetings;
CREATE POLICY "Students can create meetings" ON meetings
  FOR INSERT WITH CHECK (
    (select auth.uid())::text = student_id AND
    EXISTS (
      SELECT 1 FROM threads
      WHERE threads.id = thread_id
      AND (select auth.uid())::text = ANY(threads.participant_ids)
    )
  );

-- Both parties can update meetings in their threads
DROP POLICY IF EXISTS "Users can update their meetings" ON meetings;
CREATE POLICY "Users can update their meetings" ON meetings
  FOR UPDATE USING (
    (select auth.uid())::text = student_id OR 
    (select auth.uid())::text = obog_id
  );

-- Users can read operation logs for their meetings
DROP POLICY IF EXISTS "Users can read their meeting logs" ON meeting_operation_logs;
CREATE POLICY "Users can read their meeting logs" ON meeting_operation_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM meetings
      WHERE meetings.id = meeting_operation_logs.meeting_id
      AND (
        (select auth.uid())::text = meetings.student_id OR 
        (select auth.uid())::text = meetings.obog_id
      )
    )
  );

-- System can insert operation logs (via service role or authenticated users)
DROP POLICY IF EXISTS "Users can log meeting operations" ON meeting_operation_logs;
CREATE POLICY "Users can log meeting operations" ON meeting_operation_logs
  FOR INSERT WITH CHECK (
    (select auth.uid())::text = user_id AND
    EXISTS (
      SELECT 1 FROM meetings
      WHERE meetings.id = meeting_operation_logs.meeting_id
      AND (
        (select auth.uid())::text = meetings.student_id OR 
        (select auth.uid())::text = meetings.obog_id
      )
    )
  );

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON meetings TO authenticated;
GRANT SELECT, INSERT ON meeting_operation_logs TO authenticated;
