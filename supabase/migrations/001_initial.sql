-- seeper wiki — initial database schema
-- Run this via the Supabase dashboard SQL editor or Supabase CLI

-- ============================================================
-- HELPER FUNCTION: is_admin()
-- Used in RLS policies to avoid infinite recursion.
-- Reads profiles.role for the current authenticated user.
-- ============================================================
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- ============================================================
-- TABLE: profiles
-- Extends auth.users with seeper-specific fields.
-- ============================================================
CREATE TABLE profiles (
  id           UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name    TEXT,
  display_name TEXT,
  role         TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  department   TEXT CHECK (department IN ('creative', 'production', 'tech', 'business', 'operations')),
  avatar_url   TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-create a profile when a new user signs up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO profiles (id, full_name)
  VALUES (new.id, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();

-- ============================================================
-- TABLE: wiki_pages
-- ============================================================
CREATE TABLE wiki_pages (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug           TEXT UNIQUE NOT NULL,
  title          TEXT NOT NULL,
  content        TEXT,
  excerpt        TEXT,
  category       TEXT CHECK (category IN ('creative', 'production', 'tech', 'business', 'ai', 'general')),
  tags           TEXT[],
  author_id      UUID REFERENCES profiles(id) ON DELETE SET NULL,
  last_edited_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  views          INTEGER NOT NULL DEFAULT 0,
  published      BOOLEAN NOT NULL DEFAULT true,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX wiki_pages_category_idx ON wiki_pages(category);
CREATE INDEX wiki_pages_published_idx ON wiki_pages(published);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER wiki_pages_updated_at
  BEFORE UPDATE ON wiki_pages
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at();

-- ============================================================
-- TABLE: prompts
-- ============================================================
CREATE TABLE prompts (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title      TEXT NOT NULL,
  content    TEXT NOT NULL,
  category   TEXT CHECK (category IN ('image-gen', 'copy', 'code', 'research', 'video', '3d', 'general')),
  ai_tool    TEXT CHECK (ai_tool IN ('claude', 'midjourney', 'runway', 'sora', 'dalle', 'other')),
  tags       TEXT[],
  upvotes    INTEGER NOT NULL DEFAULT 0,
  author_id  UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: newsletter_issues
-- ============================================================
CREATE TABLE newsletter_issues (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title        TEXT NOT NULL,
  content      TEXT,
  issue_number INTEGER,
  published    BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMPTZ,
  author_id    UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: news_cache
-- Populated by service role only via API routes (Phase 2).
-- ============================================================
CREATE TABLE news_cache (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title        TEXT NOT NULL,
  url          TEXT UNIQUE NOT NULL,
  source       TEXT,
  summary      TEXT,
  category     TEXT,
  published_at TIMESTAMPTZ,
  fetched_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: daily_digest
-- One row per day. Populated by service role from digest API.
-- ============================================================
CREATE TABLE daily_digest (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content      TEXT NOT NULL,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  date         DATE UNIQUE NOT NULL DEFAULT CURRENT_DATE
);

-- ============================================================
-- TABLE: activity_log
-- Phase 1: schema only. Phase 2: event writes added.
-- ============================================================
CREATE TABLE activity_log (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id        UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action         TEXT NOT NULL CHECK (action IN ('created_wiki', 'edited_wiki', 'added_prompt', 'published_newsletter')),
  resource_type  TEXT,
  resource_id    UUID,
  resource_title TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE profiles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE wiki_pages        ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompts           ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_cache        ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_digest      ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log      ENABLE ROW LEVEL SECURITY;

-- profiles
CREATE POLICY "profiles: authenticated read all"
  ON profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "profiles: user update own"
  ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- wiki_pages
CREATE POLICY "wiki_pages: authenticated read"
  ON wiki_pages FOR SELECT TO authenticated USING (true);
CREATE POLICY "wiki_pages: authenticated insert"
  ON wiki_pages FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "wiki_pages: owner or admin update"
  ON wiki_pages FOR UPDATE TO authenticated
  USING (auth.uid() = author_id OR is_admin());
CREATE POLICY "wiki_pages: owner or admin delete"
  ON wiki_pages FOR DELETE TO authenticated
  USING (auth.uid() = author_id OR is_admin());

-- prompts
CREATE POLICY "prompts: authenticated read"
  ON prompts FOR SELECT TO authenticated USING (true);
CREATE POLICY "prompts: authenticated insert"
  ON prompts FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "prompts: owner or admin update"
  ON prompts FOR UPDATE TO authenticated
  USING (auth.uid() = author_id OR is_admin());
CREATE POLICY "prompts: owner or admin delete"
  ON prompts FOR DELETE TO authenticated
  USING (auth.uid() = author_id OR is_admin());

-- newsletter_issues
CREATE POLICY "newsletter_issues: authenticated read"
  ON newsletter_issues FOR SELECT TO authenticated USING (true);
CREATE POLICY "newsletter_issues: authenticated insert"
  ON newsletter_issues FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "newsletter_issues: owner or admin update"
  ON newsletter_issues FOR UPDATE TO authenticated
  USING (auth.uid() = author_id OR is_admin());
CREATE POLICY "newsletter_issues: owner or admin delete"
  ON newsletter_issues FOR DELETE TO authenticated
  USING (auth.uid() = author_id OR is_admin());

-- news_cache: read-only for authenticated; writes via service role only
CREATE POLICY "news_cache: authenticated read"
  ON news_cache FOR SELECT TO authenticated USING (true);

-- daily_digest: read-only for authenticated; writes via service role only
CREATE POLICY "daily_digest: authenticated read"
  ON daily_digest FOR SELECT TO authenticated USING (true);

-- activity_log
CREATE POLICY "activity_log: authenticated read"
  ON activity_log FOR SELECT TO authenticated USING (true);
CREATE POLICY "activity_log: authenticated insert own"
  ON activity_log FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
