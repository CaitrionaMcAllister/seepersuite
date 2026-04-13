-- supabase/migrations/008_game_scores.sql
-- Daily game scores for scored games (seeWord, seeQuiz, seeLinks, seeScope)

CREATE TABLE IF NOT EXISTS game_scores (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id      UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  game         TEXT NOT NULL CHECK (game IN ('seeWord', 'seeQuiz', 'seeLinks', 'seeScope')),
  day_index    INTEGER NOT NULL,
  score        INTEGER NOT NULL DEFAULT 0,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, game, day_index)
);

ALTER TABLE game_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "game_scores: authenticated read"
  ON game_scores FOR SELECT TO authenticated USING (true);

CREATE POLICY "game_scores: authenticated insert"
  ON game_scores FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "game_scores: user update own"
  ON game_scores FOR UPDATE TO authenticated USING (auth.uid() = user_id);
