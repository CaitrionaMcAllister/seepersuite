-- seeper wiki — Phase 2 schema additions
-- Run via Supabase dashboard SQL editor AFTER 001_initial.sql

-- ============================================================
-- TABLE: tools
-- ============================================================
CREATE TABLE IF NOT EXISTS tools (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name         TEXT NOT NULL,
  category     TEXT NOT NULL,
  description  TEXT,
  url          TEXT,
  version      TEXT,
  licence_info TEXT,
  upvotes      INTEGER NOT NULL DEFAULT 0,
  copy_count   INTEGER NOT NULL DEFAULT 0,
  added_by     UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER tools_updated_at
  BEFORE UPDATE ON tools
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at();

-- ============================================================
-- TABLE: resources
-- ============================================================
CREATE TABLE IF NOT EXISTS resources (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title       TEXT NOT NULL,
  type        TEXT NOT NULL CHECK (type IN ('PDF', 'DOC', 'Link', 'Video', 'Image')),
  category    TEXT NOT NULL,
  description TEXT,
  url         TEXT,
  file_path   TEXT,
  upvotes     INTEGER NOT NULL DEFAULT 0,
  added_by    UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER resources_updated_at
  BEFORE UPDATE ON resources
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at();

-- ============================================================
-- TABLE: anonymous_votes
-- ============================================================
CREATE TABLE IF NOT EXISTS anonymous_votes (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  resource_type TEXT NOT NULL CHECK (resource_type IN ('news','prompt','tool','resource','wiki')),
  resource_id   TEXT NOT NULL,
  browser_id    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(resource_type, resource_id, browser_id)
);

-- ============================================================
-- TABLE: notifications
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type          TEXT NOT NULL,
  title         TEXT NOT NULL,
  body          TEXT,
  read          BOOLEAN NOT NULL DEFAULT false,
  resource_type TEXT,
  resource_id   UUID,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX notifications_user_id_idx ON notifications(user_id);
CREATE INDEX notifications_read_idx ON notifications(read);

-- ============================================================
-- TABLE: tool_endorsements
-- ============================================================
CREATE TABLE IF NOT EXISTS tool_endorsements (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tool_id    UUID REFERENCES tools(id) ON DELETE CASCADE,
  user_id    UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tool_id, user_id)
);

-- ============================================================
-- TABLE: contributions
-- ============================================================
CREATE TABLE IF NOT EXISTS contributions (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  submitter_name TEXT NOT NULL,
  title          TEXT NOT NULL,
  category       TEXT NOT NULL,
  description    TEXT NOT NULL,
  tags           TEXT[],
  url            TEXT,
  file_path      TEXT,
  status         TEXT NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending','approved','rejected')),
  reviewed_by    UUID REFERENCES profiles(id) ON DELETE SET NULL,
  reviewed_at    TIMESTAMPTZ,
  submitted_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- ALTER existing tables
-- ============================================================
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS bio                TEXT,
  ADD COLUMN IF NOT EXISTS skills             TEXT[],
  ADD COLUMN IF NOT EXISTS location           TEXT,
  ADD COLUMN IF NOT EXISTS linkedin_url       TEXT,
  ADD COLUMN IF NOT EXISTS avatar_color       TEXT DEFAULT '#ED693A',
  ADD COLUMN IF NOT EXISTS notifications_prefs JSONB DEFAULT '{}';

ALTER TABLE prompts
  ADD COLUMN IF NOT EXISTS copy_count INTEGER NOT NULL DEFAULT 0;

-- Update activity_log action enum to include Phase 2 actions
-- (Postgres CHECK constraints must be dropped and re-added)
ALTER TABLE activity_log
  DROP CONSTRAINT IF EXISTS activity_log_action_check;
ALTER TABLE activity_log
  ADD CONSTRAINT activity_log_action_check
  CHECK (action IN (
    'created_wiki','edited_wiki','added_prompt','published_newsletter',
    'contributed','upvoted','signed_in'
  ));

-- ============================================================
-- ROW LEVEL SECURITY for new tables
-- ============================================================
ALTER TABLE tools              ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources          ENABLE ROW LEVEL SECURITY;
ALTER TABLE anonymous_votes    ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications      ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_endorsements  ENABLE ROW LEVEL SECURITY;
ALTER TABLE contributions      ENABLE ROW LEVEL SECURITY;

-- tools: authenticated read, authenticated insert, owner/admin update
CREATE POLICY "tools: authenticated read"
  ON tools FOR SELECT TO authenticated USING (true);
CREATE POLICY "tools: authenticated insert"
  ON tools FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "tools: owner or admin update"
  ON tools FOR UPDATE TO authenticated
  USING (auth.uid() = added_by OR is_admin());
CREATE POLICY "tools: owner or admin delete"
  ON tools FOR DELETE TO authenticated
  USING (auth.uid() = added_by OR is_admin());

-- resources: same pattern
CREATE POLICY "resources: authenticated read"
  ON resources FOR SELECT TO authenticated USING (true);
CREATE POLICY "resources: authenticated insert"
  ON resources FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "resources: owner or admin update"
  ON resources FOR UPDATE TO authenticated
  USING (auth.uid() = added_by OR is_admin());
CREATE POLICY "resources: owner or admin delete"
  ON resources FOR DELETE TO authenticated
  USING (auth.uid() = added_by OR is_admin());

-- anonymous_votes: public read, public insert (no auth required)
CREATE POLICY "anonymous_votes: public read"
  ON anonymous_votes FOR SELECT USING (true);
CREATE POLICY "anonymous_votes: public insert"
  ON anonymous_votes FOR INSERT WITH CHECK (true);

-- notifications: user reads own
CREATE POLICY "notifications: user reads own"
  ON notifications FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "notifications: user updates own"
  ON notifications FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "notifications: user deletes own"
  ON notifications FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- tool_endorsements: authenticated read/insert
CREATE POLICY "tool_endorsements: authenticated read"
  ON tool_endorsements FOR SELECT TO authenticated USING (true);
CREATE POLICY "tool_endorsements: authenticated insert"
  ON tool_endorsements FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "tool_endorsements: user delete own"
  ON tool_endorsements FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- contributions: authenticated read, public insert (no auth needed to submit)
CREATE POLICY "contributions: authenticated read"
  ON contributions FOR SELECT TO authenticated USING (true);
CREATE POLICY "contributions: public insert"
  ON contributions FOR INSERT WITH CHECK (true);
CREATE POLICY "contributions: admin update"
  ON contributions FOR UPDATE TO authenticated USING (is_admin());
