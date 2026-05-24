ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS name TEXT,
  ADD COLUMN IF NOT EXISTS full_name TEXT,
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS headline TEXT,
  ADD COLUMN IF NOT EXISTS about TEXT,
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS location TEXT,
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS resume_url TEXT,
  ADD COLUMN IF NOT EXISTS skills TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS experience_level TEXT,
  ADD COLUMN IF NOT EXISTS role TEXT,
  ADD COLUMN IF NOT EXISTS onboarding_complete BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS onboarding_step TEXT DEFAULT 'select_role',
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

UPDATE public.profiles
SET
  name = COALESCE(name, full_name, email, ''),
  full_name = COALESCE(full_name, name, email, ''),
  headline = COALESCE(headline, ''),
  about = COALESCE(about, ''),
  location = COALESCE(location, ''),
  skills = COALESCE(skills, ARRAY[]::TEXT[]),
  experience_level = COALESCE(experience_level, 'Mid'),
  onboarding_complete = COALESCE(onboarding_complete, FALSE),
  onboarding_step = COALESCE(onboarding_step, 'select_role'),
  created_at = COALESCE(created_at, NOW()),
  updated_at = COALESCE(updated_at, NOW());

ALTER TABLE public.profiles
  ALTER COLUMN skills SET DEFAULT ARRAY[]::TEXT[],
  ALTER COLUMN onboarding_complete SET DEFAULT FALSE,
  ALTER COLUMN onboarding_step SET DEFAULT 'select_role',
  ALTER COLUMN created_at SET DEFAULT NOW(),
  ALTER COLUMN updated_at SET DEFAULT NOW();

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_onboarding_step_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_onboarding_step_check
  CHECK (
    onboarding_step IS NULL OR onboarding_step IN (
      'select_role',
      'candidate_resume',
      'candidate_profile',
      'recruiter_profile',
      'completed'
    )
  );
