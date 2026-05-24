ALTER TABLE public.candidate_profiles
  ADD COLUMN IF NOT EXISTS total_experience_years INTEGER,
  ADD COLUMN IF NOT EXISTS total_experience_months INTEGER,
  ADD COLUMN IF NOT EXISTS current_salary_currency TEXT,
  ADD COLUMN IF NOT EXISTS current_salary_amount NUMERIC,
  ADD COLUMN IF NOT EXISTS expected_salary_currency TEXT,
  ADD COLUMN IF NOT EXISTS expected_salary_amount NUMERIC,
  ADD COLUMN IF NOT EXISTS preferred_locations TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS job_type_preference TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS work_mode_preference TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS industries TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS skills TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS tools TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS languages JSONB DEFAULT '[]'::JSONB,
  ADD COLUMN IF NOT EXISTS experiences JSONB DEFAULT '[]'::JSONB,
  ADD COLUMN IF NOT EXISTS profile_image_url TEXT,
  ADD COLUMN IF NOT EXISTS resume_url TEXT;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'candidate_profiles'
      AND column_name = 'job_type_preference' AND data_type <> 'ARRAY'
  ) THEN
    ALTER TABLE public.candidate_profiles
      ALTER COLUMN job_type_preference TYPE TEXT[]
      USING CASE
        WHEN job_type_preference IS NULL OR btrim(job_type_preference::TEXT) = '' THEN ARRAY[]::TEXT[]
        ELSE ARRAY[job_type_preference::TEXT]
      END;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'candidate_profiles'
      AND column_name = 'work_mode_preference' AND data_type <> 'ARRAY'
  ) THEN
    ALTER TABLE public.candidate_profiles
      ALTER COLUMN work_mode_preference TYPE TEXT[]
      USING CASE
        WHEN work_mode_preference IS NULL OR btrim(work_mode_preference::TEXT) = '' THEN ARRAY[]::TEXT[]
        ELSE ARRAY[work_mode_preference::TEXT]
      END;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'candidate_profiles'
      AND column_name = 'languages' AND data_type <> 'jsonb'
  ) THEN
    ALTER TABLE public.candidate_profiles
      ALTER COLUMN languages TYPE JSONB
      USING CASE
        WHEN languages IS NULL THEN '[]'::JSONB
        WHEN pg_typeof(languages)::TEXT = 'text[]' THEN to_jsonb(languages)
        ELSE jsonb_build_array(languages::TEXT)
      END;
  END IF;
END $$;

UPDATE public.candidate_profiles
SET
  preferred_locations = COALESCE(preferred_locations, ARRAY[]::TEXT[]),
  job_type_preference = COALESCE(job_type_preference, ARRAY[]::TEXT[]),
  work_mode_preference = COALESCE(work_mode_preference, ARRAY[]::TEXT[]),
  industries = COALESCE(industries, ARRAY[]::TEXT[]),
  skills = COALESCE(skills, ARRAY[]::TEXT[]),
  tools = COALESCE(tools, ARRAY[]::TEXT[]),
  languages = COALESCE(languages, '[]'::JSONB),
  experiences = COALESCE(experiences, '[]'::JSONB);
