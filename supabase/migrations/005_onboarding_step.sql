-- Track onboarding route state explicitly.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS onboarding_step TEXT DEFAULT 'select_role';

UPDATE public.profiles
SET onboarding_step = CASE
  WHEN role IS NULL THEN 'select_role'
  WHEN onboarding_complete IS TRUE THEN 'completed'
  WHEN role IN ('candidate', 'job_seeker') THEN 'candidate_resume'
  WHEN role IN ('recruiter', 'employer') THEN 'recruiter_profile'
  ELSE 'select_role'
END
WHERE onboarding_step IS NULL
  OR onboarding_step NOT IN ('select_role', 'candidate_resume', 'candidate_profile', 'recruiter_profile', 'completed');

UPDATE public.profiles
SET role = NULL,
    onboarding_complete = FALSE,
    onboarding_step = 'select_role'
WHERE onboarding_complete IS TRUE
  AND role IS NULL;

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_onboarding_step_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_onboarding_step_check
  CHECK (onboarding_step IS NULL OR onboarding_step IN ('select_role', 'candidate_resume', 'candidate_profile', 'recruiter_profile', 'completed'));
