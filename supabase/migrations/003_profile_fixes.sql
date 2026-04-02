-- seeper wiki — profile schema fixes
-- Run via Supabase dashboard SQL editor AFTER 002_phase2.sql

-- Add job_title column (separate from role which is admin/member auth level)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS job_title TEXT;

-- Add missing profile columns
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS display_name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS projects    TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS interests   TEXT[];

-- Expand department CHECK to include finance
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_department_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_department_check
  CHECK (department IN ('creative', 'production', 'tech', 'business', 'operations', 'finance'));

-- Add INSERT policy so upsert works for authenticated users
CREATE POLICY "profiles: user insert own"
  ON profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
