-- Ensure Easy Apply persistence, event timestamps, and recruiter visibility are available.

CREATE TABLE IF NOT EXISTS public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
  job_external_id TEXT,
  candidate_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'applied',
  viewed_at TIMESTAMPTZ,
  resume_downloaded_at TIMESTAMPTZ,
  shortlisted_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  hired_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.applications
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS job_external_id TEXT,
  ADD COLUMN IF NOT EXISTS candidate_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'applied',
  ADD COLUMN IF NOT EXISTS viewed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS resume_downloaded_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS shortlisted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS hired_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

ALTER TABLE public.applications
  ALTER COLUMN job_id DROP NOT NULL;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'applications'
      AND column_name = 'user_id'
  ) THEN
    EXECUTE '
      UPDATE public.applications
      SET candidate_id = COALESCE(candidate_id, user_id)
      WHERE candidate_id IS NULL
    ';
  END IF;
END $$;

ALTER TABLE public.applications
  DROP CONSTRAINT IF EXISTS applications_status_check;

ALTER TABLE public.applications
  ADD CONSTRAINT applications_status_check
  CHECK (status IN ('applied', 'shortlisted', 'rejected', 'hired'));

CREATE INDEX IF NOT EXISTS idx_applications_candidate
  ON public.applications(candidate_id);

CREATE INDEX IF NOT EXISTS idx_applications_job
  ON public.applications(job_id);

CREATE INDEX IF NOT EXISTS idx_applications_created_at
  ON public.applications(created_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS applications_job_candidate_key
  ON public.applications(job_id, candidate_id)
  WHERE candidate_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS applications_external_job_candidate_key
  ON public.applications(job_external_id, candidate_id)
  WHERE job_id IS NULL
    AND job_external_id IS NOT NULL
    AND candidate_id IS NOT NULL;

ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Candidates can select own applications" ON public.applications;
CREATE POLICY "Candidates can select own applications"
  ON public.applications FOR SELECT
  USING (
    candidate_id = auth.uid()
    OR user_id = auth.uid()
  );

DROP POLICY IF EXISTS "Candidates can insert own applications" ON public.applications;
CREATE POLICY "Candidates can insert own applications"
  ON public.applications FOR INSERT
  WITH CHECK (
    candidate_id = auth.uid()
    OR user_id = auth.uid()
  );

DROP POLICY IF EXISTS "Recruiters can select applications for own jobs" ON public.applications;
CREATE POLICY "Recruiters can select applications for own jobs"
  ON public.applications FOR SELECT
  USING (
    job_id IN (
      SELECT j.id
      FROM public.jobs j
      WHERE j.recruiter_profile_id = auth.uid()
         OR j.recruiter_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Recruiters can update applications for own jobs" ON public.applications;
CREATE POLICY "Recruiters can update applications for own jobs"
  ON public.applications FOR UPDATE
  USING (
    job_id IN (
      SELECT j.id
      FROM public.jobs j
      WHERE j.recruiter_profile_id = auth.uid()
         OR j.recruiter_id = auth.uid()
    )
  )
  WITH CHECK (
    job_id IN (
      SELECT j.id
      FROM public.jobs j
      WHERE j.recruiter_profile_id = auth.uid()
         OR j.recruiter_id = auth.uid()
    )
  );

NOTIFY pgrst, 'reload schema';
