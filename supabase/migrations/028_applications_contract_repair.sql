-- Repair the applications table contract used by apply, candidate reads, and recruiter reads.
-- Additive only: supports existing live schemas without dropping production columns.

ALTER TABLE public.applications
  ADD COLUMN IF NOT EXISTS job_external_id TEXT,
  ADD COLUMN IF NOT EXISTS user_id UUID,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS resume_url TEXT,
  ADD COLUMN IF NOT EXISTS screening_answers JSONB DEFAULT '[]'::JSONB,
  ADD COLUMN IF NOT EXISTS contacted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS hired_at TIMESTAMPTZ;

UPDATE public.applications
SET
  created_at = COALESCE(created_at, applied_at, NOW()),
  updated_at = COALESCE(updated_at, applied_at, NOW()),
  user_id = COALESCE(user_id, candidate_id)
WHERE created_at IS NULL
  OR updated_at IS NULL
  OR user_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_applications_user_id
  ON public.applications(user_id);

CREATE INDEX IF NOT EXISTS idx_applications_candidate_id
  ON public.applications(candidate_id);

CREATE INDEX IF NOT EXISTS idx_applications_job_id
  ON public.applications(job_id);

CREATE INDEX IF NOT EXISTS idx_applications_job_external_id
  ON public.applications(job_external_id);

CREATE INDEX IF NOT EXISTS idx_applications_created_at
  ON public.applications(created_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS applications_job_candidate_key
  ON public.applications(job_id, candidate_id)
  WHERE job_id IS NOT NULL
    AND candidate_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS applications_external_job_candidate_key
  ON public.applications(job_external_id, candidate_id)
  WHERE job_id IS NULL
    AND job_external_id IS NOT NULL
    AND candidate_id IS NOT NULL;

NOTIFY pgrst, 'reload schema';
