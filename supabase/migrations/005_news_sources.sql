-- Migration 005: Manageable news sources table
CREATE TABLE IF NOT EXISTS news_sources (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name       TEXT NOT NULL,
  feed_url   TEXT UNIQUE NOT NULL,
  site_url   TEXT NOT NULL DEFAULT '',
  active     BOOLEAN NOT NULL DEFAULT true,
  added_by   UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE news_sources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "news_sources: authenticated read"
  ON news_sources FOR SELECT TO authenticated USING (true);

CREATE POLICY "news_sources: admin all"
  ON news_sources FOR ALL TO authenticated USING (is_admin());

-- Seed with the current hardcoded feeds
INSERT INTO news_sources (name, feed_url, site_url) VALUES
  ('The Verge',            'https://www.theverge.com/rss/index.xml',      'https://www.theverge.com'),
  ('MIT Technology Review','https://www.technologyreview.com/feed/',       'https://www.technologyreview.com'),
  ('Wired',                'https://www.wired.com/feed/rss',               'https://www.wired.com'),
  ('Hugging Face',         'https://huggingface.co/blog/feed.xml',         'https://huggingface.co/blog'),
  ('Dezeen',               'https://www.dezeen.com/feed/',                 'https://www.dezeen.com'),
  ('80.lv',                'https://80.lv/feed/',                          'https://80.lv')
ON CONFLICT (feed_url) DO NOTHING;
