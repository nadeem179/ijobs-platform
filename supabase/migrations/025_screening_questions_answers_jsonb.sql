-- Store structured recruiter screening questions and candidate answers.
-- Existing text[] questions are preserved as optional free-text questions.

DO $$
DECLARE
  screening_questions_type TEXT;
BEGIN
  SELECT udt_name
  INTO screening_questions_type
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'jobs'
    AND column_name = 'screening_questions';

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'jobs'
      AND column_name = 'screening_questions'
      AND udt_name <> 'jsonb'
  ) THEN
    ALTER TABLE public.jobs
      ALTER COLUMN screening_questions DROP DEFAULT;

    IF screening_questions_type = '_text' THEN
      EXECUTE $sql$
        ALTER TABLE public.jobs
          ALTER COLUMN screening_questions TYPE jsonb
          USING (
            COALESCE(
              (
                SELECT jsonb_agg(
                  jsonb_build_object(
                    'id', 'legacy-' || ordinality::text,
                    'question', question,
                    'type', 'text',
                    'required', false,
                    'options', '[]'::jsonb
                  )
                )
                FROM unnest(screening_questions) WITH ORDINALITY AS legacy(question, ordinality)
                WHERE btrim(question) <> ''
              ),
              '[]'::jsonb
            )
          )
      $sql$;
    ELSE
      EXECUTE $sql$
        ALTER TABLE public.jobs
          ALTER COLUMN screening_questions TYPE jsonb
          USING COALESCE(to_jsonb(screening_questions), '[]'::jsonb)
      $sql$;
    END IF;
  END IF;
END $$;

ALTER TABLE public.jobs
  ADD COLUMN IF NOT EXISTS screening_questions jsonb DEFAULT '[]'::jsonb;

ALTER TABLE public.jobs
  ALTER COLUMN screening_questions SET DEFAULT '[]'::jsonb;

UPDATE public.jobs
SET screening_questions = '[]'::jsonb
WHERE screening_questions IS NULL;

ALTER TABLE public.applications
  ADD COLUMN IF NOT EXISTS screening_answers jsonb DEFAULT '[]'::jsonb;

ALTER TABLE public.applications
  ALTER COLUMN screening_answers SET DEFAULT '[]'::jsonb;

UPDATE public.applications
SET screening_answers = '[]'::jsonb
WHERE screening_answers IS NULL;

NOTIFY pgrst, 'reload schema';
