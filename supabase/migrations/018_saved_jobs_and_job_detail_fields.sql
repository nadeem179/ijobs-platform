-- Persist candidate saved jobs and complete optional job detail fields.

CREATE TABLE IF NOT EXISTS public.saved_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
  job_external_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.saved_jobs
  ADD COLUMN IF NOT EXISTS candidate_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS job_external_id TEXT,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

ALTER TABLE public.saved_jobs
  ALTER COLUMN job_id DROP NOT NULL;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'saved_jobs'
      AND column_name = 'user_id'
  ) THEN
    EXECUTE '
      UPDATE public.saved_jobs
      SET candidate_id = COALESCE(candidate_id, user_id)
      WHERE candidate_id IS NULL
    ';
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS saved_jobs_candidate_job_key
  ON public.saved_jobs(candidate_id, job_id)
  WHERE candidate_id IS NOT NULL
    AND job_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS saved_jobs_candidate_external_job_key
  ON public.saved_jobs(candidate_id, job_external_id)
  WHERE candidate_id IS NOT NULL
    AND job_external_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_saved_jobs_candidate
  ON public.saved_jobs(candidate_id);

ALTER TABLE public.jobs
  ADD COLUMN IF NOT EXISTS company_logo TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS company_description TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS company_size TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS company_industry TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS salary_verified BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS response_rate INTEGER;

ALTER TABLE public.saved_jobs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Candidates can select own saved jobs" ON public.saved_jobs;
CREATE POLICY "Candidates can select own saved jobs"
  ON public.saved_jobs FOR SELECT
  USING (candidate_id = auth.uid() OR user_id = auth.uid());

DROP POLICY IF EXISTS "Candidates can insert own saved jobs" ON public.saved_jobs;
CREATE POLICY "Candidates can insert own saved jobs"
  ON public.saved_jobs FOR INSERT
  WITH CHECK (candidate_id = auth.uid() OR user_id = auth.uid());

DROP POLICY IF EXISTS "Candidates can delete own saved jobs" ON public.saved_jobs;
CREATE POLICY "Candidates can delete own saved jobs"
  ON public.saved_jobs FOR DELETE
  USING (candidate_id = auth.uid() OR user_id = auth.uid());

NOTIFY pgrst, 'reload schema';
