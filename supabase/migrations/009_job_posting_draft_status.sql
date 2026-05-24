-- Keep the job posting UI and DB constraint aligned for draft/publish flows.
ALTER TABLE public.jobs
  DROP CONSTRAINT IF EXISTS jobs_status_check;

ALTER TABLE public.jobs
  ADD CONSTRAINT jobs_status_check
  CHECK (status IN ('draft', 'active', 'inactive', 'paused', 'closed', 'filled'));

ALTER TABLE public.jobs
  ADD COLUMN IF NOT EXISTS screening_questions TEXT[] NOT NULL DEFAULT '{}';
