-- ============================================
-- STUDENT HISTORY SCHEMA
-- For save functionality and browsing history
-- ============================================

-- Saved items type enum
DO $$ BEGIN
  CREATE TYPE saved_item_type AS ENUM ('company', 'recruitment');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Saved items table
CREATE TABLE IF NOT EXISTS saved_items (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  item_type saved_item_type NOT NULL,
  item_id TEXT NOT NULL, -- ID of company or recruitment
  created_at TIMESTAMPTZ DEFAULT NOW(),
  -- Ensure no duplicates
  UNIQUE(student_id, item_type, item_id)
);

-- Indexes for saved items
CREATE INDEX IF NOT EXISTS idx_saved_items_student_id ON saved_items(student_id);
CREATE INDEX IF NOT EXISTS idx_saved_items_item_type ON saved_items(item_type);
CREATE INDEX IF NOT EXISTS idx_saved_items_item_id ON saved_items(item_id);
CREATE INDEX IF NOT EXISTS idx_saved_items_created_at ON saved_items(created_at DESC);

-- Browsing history table
CREATE TABLE IF NOT EXISTS browsing_history (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  item_type saved_item_type NOT NULL,
  item_id TEXT NOT NULL, -- ID of company or recruitment
  viewed_at TIMESTAMPTZ DEFAULT NOW(),
  -- Allow multiple views, but we'll limit via query
  UNIQUE(student_id, item_type, item_id, viewed_at)
);

-- Indexes for browsing history
CREATE INDEX IF NOT EXISTS idx_browsing_history_student_id ON browsing_history(student_id);
CREATE INDEX IF NOT EXISTS idx_browsing_history_item_type ON browsing_history(item_type);
CREATE INDEX IF NOT EXISTS idx_browsing_history_viewed_at ON browsing_history(viewed_at DESC);
CREATE INDEX IF NOT EXISTS idx_browsing_history_student_viewed ON browsing_history(student_id, viewed_at DESC);

-- RLS Policies
ALTER TABLE saved_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE browsing_history ENABLE ROW LEVEL SECURITY;

-- Students can manage their own saved items
DROP POLICY IF EXISTS "Students can manage their own saved items" ON saved_items;
CREATE POLICY "Students can manage their own saved items" ON saved_items
  FOR ALL USING ((select auth.uid())::text = student_id);

-- Students can view their own browsing history
DROP POLICY IF EXISTS "Students can view their own browsing history" ON browsing_history;
CREATE POLICY "Students can view their own browsing history" ON browsing_history
  FOR SELECT USING ((select auth.uid())::text = student_id);

-- System can insert browsing history (via authenticated users)
DROP POLICY IF EXISTS "Students can record their browsing history" ON browsing_history;
CREATE POLICY "Students can record their browsing history" ON browsing_history
  FOR INSERT WITH CHECK (
    (select auth.uid())::text = student_id AND
    (SELECT role FROM users WHERE id = (select auth.uid())::text) = 'student'
  );

-- Grant permissions
GRANT SELECT, INSERT, DELETE ON saved_items TO authenticated;
GRANT SELECT, INSERT ON browsing_history TO authenticated;

-- Function to get or update browsing history (upsert latest view)
CREATE OR REPLACE FUNCTION record_browsing_history(
  p_student_id TEXT,
  p_item_type saved_item_type,
  p_item_id TEXT
)
RETURNS void AS $$
BEGIN
  -- Insert new view record
  INSERT INTO browsing_history (student_id, item_type, item_id, viewed_at)
  VALUES (p_student_id, p_item_type, p_item_id, NOW())
  ON CONFLICT (student_id, item_type, item_id, viewed_at) DO NOTHING;
  
  -- Clean up old history (keep only last 100 records per student)
  -- This prevents unbounded growth
  DELETE FROM browsing_history
  WHERE student_id = p_student_id
  AND id NOT IN (
    SELECT id FROM browsing_history
    WHERE student_id = p_student_id
    ORDER BY viewed_at DESC
    LIMIT 100
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant usage on enum type
GRANT USAGE ON TYPE saved_item_type TO anon, authenticated, service_role, supabase_auth_admin;
