-- supabase/migrations/009_profile_birthday.sql
-- Adds birthday (MM-DD) to profiles for personalised greetings

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS birthday TEXT CHECK (birthday ~ '^\d{2}-\d{2}$');
