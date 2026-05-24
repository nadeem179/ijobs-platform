-- Add recruiter onboarding/profile fields for the multi-step recruiter setup flow.

ALTER TABLE public.recruiter_profiles
  ADD COLUMN IF NOT EXISTS recruiter_full_name TEXT,
  ADD COLUMN IF NOT EXISTS recruiter_title TEXT,
  ADD COLUMN IF NOT EXISTS company_location TEXT,
  ADD COLUMN IF NOT EXISTS company_description TEXT,
  ADD COLUMN IF NOT EXISTS hiring_roles TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS hiring_model TEXT,
  ADD COLUMN IF NOT EXISTS hiring_locations TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS remote_policy TEXT,
  ADD COLUMN IF NOT EXISTS monthly_hiring_volume TEXT,
  ADD COLUMN IF NOT EXISTS preferred_experience_levels TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS preferred_skills TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS common_salary_range TEXT,
  ADD COLUMN IF NOT EXISTS urgent_hiring BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS onboarding_step INTEGER DEFAULT 1;

UPDATE public.recruiter_profiles
SET
  recruiter_title = COALESCE(recruiter_title, hiring_title),
  company_location = COALESCE(company_location, location),
  hiring_roles = COALESCE(hiring_roles, ARRAY[]::TEXT[]),
  hiring_locations = COALESCE(hiring_locations, ARRAY[]::TEXT[]),
  preferred_experience_levels = COALESCE(preferred_experience_levels, ARRAY[]::TEXT[]),
  preferred_skills = COALESCE(preferred_skills, ARRAY[]::TEXT[]),
  urgent_hiring = COALESCE(urgent_hiring, FALSE),
  onboarding_completed = COALESCE(onboarding_completed, FALSE),
  onboarding_step = COALESCE(onboarding_step, 1);

NOTIFY pgrst, 'reload schema';
