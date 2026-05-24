ALTER TABLE public.candidate_profiles
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS profile_image_url TEXT,
  ADD COLUMN IF NOT EXISTS headline TEXT,
  ADD COLUMN IF NOT EXISTS summary TEXT,
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS location TEXT,
  ADD COLUMN IF NOT EXISTS total_experience TEXT,
  ADD COLUMN IF NOT EXISTS current_company TEXT,
  ADD COLUMN IF NOT EXISTS notice_period TEXT,
  ADD COLUMN IF NOT EXISTS current_salary TEXT,
  ADD COLUMN IF NOT EXISTS preferred_locations TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS job_type_preference TEXT,
  ADD COLUMN IF NOT EXISTS work_mode_preference TEXT,
  ADD COLUMN IF NOT EXISTS tools TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS languages TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS industry TEXT,
  ADD COLUMN IF NOT EXISTS functional_area TEXT,
  ADD COLUMN IF NOT EXISTS experiences JSONB DEFAULT '[]'::JSONB,
  ADD COLUMN IF NOT EXISTS education JSONB DEFAULT '[]'::JSONB,
  ADD COLUMN IF NOT EXISTS certifications JSONB DEFAULT '[]'::JSONB,
  ADD COLUMN IF NOT EXISTS projects JSONB DEFAULT '[]'::JSONB;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'candidate_profiles'
      AND column_name = 'education'
      AND data_type <> 'jsonb'
  ) THEN
    ALTER TABLE public.candidate_profiles
      ALTER COLUMN education TYPE JSONB
      USING CASE
        WHEN education IS NULL OR btrim(education::TEXT) = '' THEN '[]'::JSONB
        ELSE jsonb_build_array(jsonb_build_object('description', education::TEXT))
      END;
  END IF;
END $$;

UPDATE public.candidate_profiles
SET
  preferred_locations = COALESCE(preferred_locations, ARRAY[]::TEXT[]),
  tools = COALESCE(tools, ARRAY[]::TEXT[]),
  languages = COALESCE(languages, ARRAY[]::TEXT[]),
  experiences = COALESCE(experiences, '[]'::JSONB),
  certifications = COALESCE(certifications, '[]'::JSONB),
  projects = COALESCE(projects, '[]'::JSONB),
  education = COALESCE(education, '[]'::JSONB),
  profile_completion = COALESCE(profile_completion, 0);

ALTER TABLE public.candidate_profiles
  ALTER COLUMN preferred_locations SET DEFAULT ARRAY[]::TEXT[],
  ALTER COLUMN tools SET DEFAULT ARRAY[]::TEXT[],
  ALTER COLUMN languages SET DEFAULT ARRAY[]::TEXT[],
  ALTER COLUMN experiences SET DEFAULT '[]'::JSONB,
  ALTER COLUMN certifications SET DEFAULT '[]'::JSONB,
  ALTER COLUMN projects SET DEFAULT '[]'::JSONB,
  ALTER COLUMN education SET DEFAULT '[]'::JSONB;
