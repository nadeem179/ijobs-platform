-- Add explicit candidate resume step before the candidate profile form.
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_onboarding_step_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_onboarding_step_check
  CHECK (onboarding_step IS NULL OR onboarding_step IN ('select_role', 'candidate_resume', 'candidate_profile', 'recruiter_profile', 'completed'));

UPDATE public.profiles
SET onboarding_step = 'candidate_resume'
WHERE role IN ('candidate', 'job_seeker')
  AND onboarding_complete IS FALSE
  AND (onboarding_step IS NULL OR onboarding_step = 'candidate_profile');

