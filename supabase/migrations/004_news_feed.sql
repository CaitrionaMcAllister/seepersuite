-- Migration 004: Rich news feed
-- Extends news_cache with full article metadata

ALTER TABLE news_cache
  ADD COLUMN IF NOT EXISTS author      TEXT,
  ADD COLUMN IF NOT EXISTS image_url   TEXT,
  ADD COLUMN IF NOT EXISTS tags        TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS upvotes     INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS source_url  TEXT,
  ADD COLUMN IF NOT EXISTS is_featured BOOLEAN NOT NULL DEFAULT false;

-- Allow authenticated users to update upvote count via API
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'news_cache'
    AND policyname = 'news_cache: authenticated update'
  ) THEN
    CREATE POLICY "news_cache: authenticated update"
      ON news_cache FOR UPDATE TO authenticated USING (true);
  END IF;
END $$;
