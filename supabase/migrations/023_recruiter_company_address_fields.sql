-- Add structured recruiter company address fields for onboarding and profile editing.

ALTER TABLE public.recruiter_profiles
  ADD COLUMN IF NOT EXISTS company_country TEXT,
  ADD COLUMN IF NOT EXISTS company_state_or_region TEXT,
  ADD COLUMN IF NOT EXISTS company_city TEXT,
  ADD COLUMN IF NOT EXISTS company_street_address TEXT,
  ADD COLUMN IF NOT EXISTS company_postal_code TEXT;

NOTIFY pgrst, 'reload schema';
