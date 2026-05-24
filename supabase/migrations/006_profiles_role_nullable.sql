-- New OAuth users must be able to create a profile before choosing a role.
ALTER TABLE public.profiles
  ALTER COLUMN role DROP DEFAULT,
  ALTER COLUMN role DROP NOT NULL,
  ALTER COLUMN onboarding_complete SET DEFAULT FALSE;

UPDATE public.profiles
SET onboarding_complete = FALSE,
    onboarding_step = 'select_role'
WHERE role IS NULL;

