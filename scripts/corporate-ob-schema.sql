-- ============================================
-- CORPORATE OB ROLE - DATABASE SCHEMA
-- Run this in Supabase SQL Editor after schema.sql
-- Adds Corporate OB role and related tables
-- ============================================

-- PART 1: UPDATE USER_ROLE ENUM
-- Add 'corporate_ob' to existing user_role enum
DO $$ 
BEGIN
  -- Check if 'corporate_ob' already exists in the enum
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'corporate_ob' 
    AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_role')
  ) THEN
    ALTER TYPE user_role ADD VALUE 'corporate_ob';
  END IF;
END $$;

-- PART 2: CREATE COMPANIES TABLE
-- Separate companies table (not company_profiles which is for company users)
CREATE TABLE IF NOT EXISTS companies (
  id TEXT PRIMARY KEY DEFAULT ('company_' || gen_random_uuid()::text),
  name TEXT NOT NULL,
  logo_url TEXT,
  industry TEXT,
  description TEXT,
  website TEXT,
  stripe_customer_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PART 3: CREATE CORPORATE_OBS TABLE
CREATE TABLE IF NOT EXISTS corporate_obs (
  id TEXT PRIMARY KEY DEFAULT ('corp_ob_' || gen_random_uuid()::text),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company_id TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, company_id)
);

-- PART 4: CREATE CONVERSATIONS TABLE
-- For Corporate OB to Student direct messaging
CREATE TABLE IF NOT EXISTS conversations (
  id TEXT PRIMARY KEY DEFAULT ('conv_' || gen_random_uuid()::text),
  corporate_ob_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(corporate_ob_id, student_id)
);

-- PART 5: CREATE CHARGES TABLE
-- For pay-per-message billing (¥500 per message)
CREATE TABLE IF NOT EXISTS charges (
  id TEXT PRIMARY KEY DEFAULT ('charge_' || gen_random_uuid()::text),
  company_id TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  corporate_ob_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message_id TEXT NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL, -- in yen
  stripe_payment_intent_id TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'succeeded', 'failed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PART 6: INDEXES
CREATE INDEX IF NOT EXISTS idx_corporate_obs_user_id ON corporate_obs(user_id);
CREATE INDEX IF NOT EXISTS idx_corporate_obs_company_id ON corporate_obs(company_id);
CREATE INDEX IF NOT EXISTS idx_companies_industry ON companies(industry);
CREATE INDEX IF NOT EXISTS idx_conversations_corporate_ob_id ON conversations(corporate_ob_id);
CREATE INDEX IF NOT EXISTS idx_conversations_student_id ON conversations(student_id);
CREATE INDEX IF NOT EXISTS idx_conversations_status ON conversations(status);
CREATE INDEX IF NOT EXISTS idx_charges_company_id ON charges(company_id);
CREATE INDEX IF NOT EXISTS idx_charges_corporate_ob_id ON charges(corporate_ob_id);
CREATE INDEX IF NOT EXISTS idx_charges_status ON charges(status);
CREATE INDEX IF NOT EXISTS idx_charges_created_at ON charges(created_at);

-- PART 7: TRIGGERS
-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER SET search_path = '' LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_companies_updated_at ON companies;
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_conversations_updated_at ON conversations;
CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_charges_updated_at ON charges;
CREATE TRIGGER update_charges_updated_at BEFORE UPDATE ON charges FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- PART 8: ROW LEVEL SECURITY
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE corporate_obs ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE charges ENABLE ROW LEVEL SECURITY;

-- Companies: Anyone can read, admins and service role can manage
DROP POLICY IF EXISTS "Anyone can read companies" ON companies;
CREATE POLICY "Anyone can read companies" ON companies FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage companies" ON companies;
-- Allow service role (auth.uid() is null) OR authenticated admin users
CREATE POLICY "Admins can manage companies" ON companies 
FOR ALL 
USING (
  (SELECT auth.uid()) IS NULL OR
  (SELECT auth.uid())::text IN (SELECT id FROM users WHERE role = 'admin')
);

-- Corporate OBs: Anyone can read, admins can manage
-- Service role (used by createAdminClient) bypasses RLS, but we add policies for regular authenticated users
DROP POLICY IF EXISTS "Anyone can read corporate OBs" ON corporate_obs;
CREATE POLICY "Anyone can read corporate OBs" ON corporate_obs FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage corporate OBs" ON corporate_obs;
-- Allow service role (auth.uid() is null) OR authenticated admin users
CREATE POLICY "Admins can manage corporate OBs" ON corporate_obs 
FOR ALL 
USING (
  (SELECT auth.uid()) IS NULL OR
  (SELECT auth.uid())::text IN (SELECT id FROM users WHERE role = 'admin')
);

-- Conversations: Participants can read their own conversations
DROP POLICY IF EXISTS "Users can read their own conversations" ON conversations;
CREATE POLICY "Users can read their own conversations" ON conversations FOR SELECT USING (
  (SELECT auth.uid())::text = corporate_ob_id OR (SELECT auth.uid())::text = student_id
);

DROP POLICY IF EXISTS "Corporate OBs can create conversations" ON conversations;
CREATE POLICY "Corporate OBs can create conversations" ON conversations FOR INSERT WITH CHECK (
  (SELECT auth.uid())::text = corporate_ob_id AND
  EXISTS (SELECT 1 FROM corporate_obs WHERE user_id = (SELECT auth.uid())::text)
);

DROP POLICY IF EXISTS "Users can update their own conversations" ON conversations;
CREATE POLICY "Users can update their own conversations" ON conversations FOR UPDATE USING (
  (SELECT auth.uid())::text = corporate_ob_id OR (SELECT auth.uid())::text = student_id
);

-- Charges: Company admins and corporate OBs can read their charges
DROP POLICY IF EXISTS "Users can read their company charges" ON charges;
CREATE POLICY "Users can read their company charges" ON charges FOR SELECT USING (
  (SELECT auth.uid())::text = corporate_ob_id OR
  EXISTS (
    SELECT 1 FROM corporate_obs co
    JOIN companies c ON c.id = co.company_id
    WHERE co.user_id = (SELECT auth.uid())::text AND co.company_id = charges.company_id
  )
);

-- PART 9: GRANTS
-- Grant permissions to service_role (for admin operations)
GRANT ALL ON companies TO service_role;
GRANT ALL ON corporate_obs TO service_role;
GRANT ALL ON conversations TO service_role;
GRANT ALL ON charges TO service_role;

-- Grant permissions to authenticated and anon users
GRANT SELECT ON companies TO authenticated, anon;
GRANT SELECT ON corporate_obs TO authenticated, anon;
GRANT SELECT, INSERT, UPDATE ON conversations TO authenticated;
GRANT SELECT ON charges TO authenticated;
