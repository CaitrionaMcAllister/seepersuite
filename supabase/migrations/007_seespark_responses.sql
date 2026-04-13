-- supabase/migrations/007_seespark_responses.sql
-- Anonymous seeSpark prompt responses (no user_id — fully anonymous)

CREATE TABLE IF NOT EXISTS seespark_responses (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  prompt_index INTEGER NOT NULL,
  response     TEXT NOT NULL,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE seespark_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "seespark_responses: authenticated read"
  ON seespark_responses FOR SELECT TO authenticated USING (true);

CREATE POLICY "seespark_responses: authenticated insert"
  ON seespark_responses FOR INSERT TO authenticated WITH CHECK (true);
