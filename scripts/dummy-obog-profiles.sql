-- ============================================
-- DUMMY OBOG PROFILES
-- Adds dummy alumni entries to users and obog_profiles tables
-- These match the dummy data in the availability table
-- ============================================

-- Generate dummy password hash (bcrypt hash of "password123")
-- This is a valid bcrypt hash for testing purposes only
-- In production, users would set their own passwords
DO $$
DECLARE
  -- Valid bcrypt hash for "password123" (cost 10)
  dummy_password_hash TEXT := '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy';
  user_id TEXT;
BEGIN
  -- Insert dummy OBOG users
  -- John Smith
  user_id := 'dummy-obog-001';
  INSERT INTO users (id, email, password_hash, name, role, credits, created_at, updated_at)
  VALUES (
    user_id,
    'john.smith@example.com',
    dummy_password_hash,
    'John Smith',
    'obog',
    0,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO obog_profiles (id, nickname, type, university, company, nationality, languages, topics, one_line_message, student_era_summary)
  VALUES (
    user_id,
    'John Smith',
    'working-professional',
    'University of Tokyo',
    'Sony Corporation',
    'American',
    ARRAY['English', 'Japanese'],
    ARRAY['Career Advice', 'Tech Industry', 'Networking'],
    '{"en": "Experienced software engineer helping students navigate the tech industry in Japan.", "ja": "経験豊富なソフトウェアエンジニアが、日本のテクノロジー業界をナビゲートする学生を支援します。"}',
    'I graduated from University of Tokyo and have been working in the tech industry for over 10 years. I specialize in software development and have experience working at both startups and large corporations.'
  )
  ON CONFLICT (id) DO NOTHING;

  -- Sarah Johnson
  user_id := 'dummy-obog-002';
  INSERT INTO users (id, email, password_hash, name, role, credits, created_at, updated_at)
  VALUES (
    user_id,
    'sarah.johnson@example.com',
    dummy_password_hash,
    'Sarah Johnson',
    'obog',
    0,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO obog_profiles (id, nickname, type, university, company, nationality, languages, topics, one_line_message, student_era_summary)
  VALUES (
    user_id,
    'Sarah Johnson',
    'working-professional',
    'Waseda University',
    'Rakuten',
    'British',
    ARRAY['English', 'Japanese', 'French'],
    ARRAY['Business Strategy', 'E-commerce', 'Leadership'],
    '{"en": "Business strategist with expertise in e-commerce and digital marketing.", "ja": "Eコマースとデジタルマーケティングの専門知識を持つビジネス戦略家。"}',
    'I studied business at Waseda and have been working in the e-commerce sector for 8 years. I love helping students understand the business side of tech companies.'
  )
  ON CONFLICT (id) DO NOTHING;

  -- Michael Chen
  user_id := 'dummy-obog-003';
  INSERT INTO users (id, email, password_hash, name, role, credits, created_at, updated_at)
  VALUES (
    user_id,
    'michael.chen@example.com',
    dummy_password_hash,
    'Michael Chen',
    'obog',
    0,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO obog_profiles (id, nickname, type, university, company, nationality, languages, topics, one_line_message, student_era_summary)
  VALUES (
    user_id,
    'Michael Chen',
    'job-offer-holder',
    'Keio University',
    'Google Japan',
    'Chinese',
    ARRAY['Mandarin', 'English', 'Japanese'],
    ARRAY['Software Engineering', 'Interview Prep', 'Career Transition'],
    '{"en": "Recent graduate with job offer at Google, happy to share my job hunting experience.", "ja": "Googleで内定を獲得した新卒者。就職活動の経験を共有します。"}',
    'I just graduated from Keio and received a job offer from Google Japan. I went through the entire job hunting process as an international student and want to help others succeed.'
  )
  ON CONFLICT (id) DO NOTHING;

  -- Emily Davis
  user_id := 'dummy-obog-004';
  INSERT INTO users (id, email, password_hash, name, role, credits, created_at, updated_at)
  VALUES (
    user_id,
    'emily.davis@example.com',
    dummy_password_hash,
    'Emily Davis',
    'obog',
    0,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO obog_profiles (id, nickname, type, university, company, nationality, languages, topics, one_line_message, student_era_summary)
  VALUES (
    user_id,
    'Emily Davis',
    'working-professional',
    'Sophia University',
    'Nintendo',
    'American',
    ARRAY['English', 'Japanese'],
    ARRAY['Game Development', 'Creative Industries', 'Work-Life Balance'],
    '{"en": "Game developer passionate about helping students enter the creative tech industry.", "ja": "クリエイティブなテクノロジー業界に参入する学生を支援することに情熱を注ぐゲーム開発者。"}',
    'I work as a game developer at Nintendo and love what I do. I want to help students who are interested in the creative side of technology and gaming industry.'
  )
  ON CONFLICT (id) DO NOTHING;

  -- David Kim
  user_id := 'dummy-obog-005';
  INSERT INTO users (id, email, password_hash, name, role, credits, created_at, updated_at)
  VALUES (
    user_id,
    'david.kim@example.com',
    dummy_password_hash,
    'David Kim',
    'obog',
    0,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO obog_profiles (id, nickname, type, university, company, nationality, languages, topics, one_line_message, student_era_summary)
  VALUES (
    user_id,
    'David Kim',
    'working-professional',
    'Tokyo Institute of Technology',
    'Toyota',
    'Korean',
    ARRAY['Korean', 'English', 'Japanese'],
    ARRAY['Engineering', 'Automotive Industry', 'Research & Development'],
    '{"en": "Engineer at Toyota specializing in automotive technology and innovation.", "ja": "自動車技術とイノベーションを専門とするトヨタのエンジニア。"}',
    'I work in R&D at Toyota and have been in Japan for over 12 years. I specialize in automotive engineering and can help students interested in traditional Japanese companies.'
  )
  ON CONFLICT (id) DO NOTHING;

END $$;

-- Verify the inserts
SELECT 
  u.id,
  u.name,
  u.email,
  u.role,
  op.nickname,
  op.type,
  op.university,
  op.company
FROM users u
JOIN obog_profiles op ON u.id = op.id
WHERE u.role = 'obog'
ORDER BY u.created_at DESC;
