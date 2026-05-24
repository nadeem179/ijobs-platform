DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'candidate_profiles'
      AND column_name = 'education'
  ) THEN
    ALTER TABLE public.candidate_profiles
      ADD COLUMN education JSONB DEFAULT '[]'::JSONB;
  ELSIF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'candidate_profiles'
      AND column_name = 'education'
      AND data_type <> 'jsonb'
  ) THEN
    ALTER TABLE public.candidate_profiles
      ALTER COLUMN education DROP DEFAULT;

    ALTER TABLE public.candidate_profiles
      ALTER COLUMN education TYPE JSONB
      USING CASE
        WHEN education IS NULL OR btrim(education::TEXT) = '' THEN '[]'::JSONB
        WHEN left(btrim(education::TEXT), 1) IN ('[', '{') THEN education::JSONB
        ELSE jsonb_build_array(
          jsonb_build_object(
            'degree', '',
            'institution', '',
            'field_of_study', '',
            'start_year', '',
            'end_year', '',
            'grade', '',
            'description', education::TEXT
          )
        )
      END;
  END IF;
END $$;

UPDATE public.candidate_profiles
SET education = COALESCE(education, '[]'::JSONB);

ALTER TABLE public.candidate_profiles
  ALTER COLUMN education SET DEFAULT '[]'::JSONB;

NOTIFY pgrst, 'reload schema';
