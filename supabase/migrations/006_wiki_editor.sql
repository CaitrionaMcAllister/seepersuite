-- supabase/migrations/006_wiki_editor.sql
-- Adds rich-editor columns to wiki_pages and creates wiki_upvotes table

ALTER TABLE wiki_pages
  ADD COLUMN IF NOT EXISTS content_json  JSONB,
  ADD COLUMN IF NOT EXISTS upvotes       INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS table_of_contents JSONB;

CREATE TABLE IF NOT EXISTS wiki_upvotes (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  page_id    UUID REFERENCES wiki_pages(id) ON DELETE CASCADE,
  user_id    UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(page_id, user_id)
);

ALTER TABLE wiki_upvotes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "wiki_upvotes: authenticated read"
  ON wiki_upvotes FOR SELECT TO authenticated USING (true);
CREATE POLICY "wiki_upvotes: authenticated insert"
  ON wiki_upvotes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "wiki_upvotes: user delete own"
  ON wiki_upvotes FOR DELETE TO authenticated USING (auth.uid() = user_id);
