ALTER TABLE candidate_profiles
  ADD COLUMN IF NOT EXISTS experience_level TEXT,
  ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
  ADD COLUMN IF NOT EXISTS github_url TEXT,
  ADD COLUMN IF NOT EXISTS dribbble_url TEXT,
  ADD COLUMN IF NOT EXISTS portfolio_url TEXT;

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS experience_level TEXT;

NOTIFY pgrst, 'reload schema';
