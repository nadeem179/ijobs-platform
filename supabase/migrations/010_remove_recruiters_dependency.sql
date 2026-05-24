-- Move job ownership/RLS away from the removed public.recruiters table.
-- This migration intentionally does not recreate public.recruiters.

ALTER TABLE public.jobs
  ADD COLUMN IF NOT EXISTS recruiter_profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.jobs
  ADD COLUMN IF NOT EXISTS recruiter_id UUID;

DO $$
DECLARE
  constraint_name TEXT;
  recruiters_table OID := to_regclass('public.recruiters');
BEGIN
  IF recruiters_table IS NOT NULL THEN
    FOR constraint_name IN
      SELECT conname
      FROM pg_constraint
      WHERE conrelid = 'public.jobs'::regclass
        AND contype = 'f'
        AND confrelid = recruiters_table
    LOOP
      EXECUTE format('ALTER TABLE public.jobs DROP CONSTRAINT %I', constraint_name);
    END LOOP;
  END IF;
END $$;

ALTER TABLE public.jobs
  ALTER COLUMN recruiter_id DROP NOT NULL;

UPDATE public.jobs
SET recruiter_profile_id = COALESCE(recruiter_profile_id, recruiter_id)
WHERE recruiter_profile_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_jobs_recruiter_profile
  ON public.jobs(recruiter_profile_id);

CREATE INDEX IF NOT EXISTS idx_jobs_recruiter_id
  ON public.jobs(recruiter_id);

ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Active jobs are publicly readable" ON public.jobs;
DROP POLICY IF EXISTS "Recruiters manage their own jobs" ON public.jobs;
DROP POLICY IF EXISTS "Recruiters update their own jobs" ON public.jobs;
DROP POLICY IF EXISTS "Candidates can select active jobs" ON public.jobs;
DROP POLICY IF EXISTS "Recruiters can select own jobs" ON public.jobs;
DROP POLICY IF EXISTS "Recruiters can insert own jobs" ON public.jobs;
DROP POLICY IF EXISTS "Recruiters can update own jobs" ON public.jobs;

CREATE POLICY "Candidates can select active jobs"
  ON public.jobs FOR SELECT
  USING (
    status = 'active'
    OR recruiter_profile_id = auth.uid()
    OR recruiter_id = auth.uid()
  );

CREATE POLICY "Recruiters can insert own jobs"
  ON public.jobs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role = 'recruiter'
    )
    AND (
      recruiter_profile_id = auth.uid()
      OR recruiter_id = auth.uid()
    )
  );

CREATE POLICY "Recruiters can update own jobs"
  ON public.jobs FOR UPDATE
  USING (
    recruiter_profile_id = auth.uid()
    OR recruiter_id = auth.uid()
  )
  WITH CHECK (
    recruiter_profile_id = auth.uid()
    OR recruiter_id = auth.uid()
  );

DROP POLICY IF EXISTS "Users see their own applications" ON public.applications;
DROP POLICY IF EXISTS "Recruiters can update application status" ON public.applications;
DROP POLICY IF EXISTS "Recruiters can view applications for own jobs" ON public.applications;
DROP POLICY IF EXISTS "Recruiters can select applications for own jobs" ON public.applications;
DROP POLICY IF EXISTS "Recruiters can update applications for own jobs" ON public.applications;

CREATE POLICY "Recruiters can select applications for own jobs"
  ON public.applications FOR SELECT
  USING (
    user_id = auth.uid()
    OR candidate_id = auth.uid()
    OR job_id IN (
      SELECT j.id
      FROM public.jobs j
      WHERE j.recruiter_profile_id = auth.uid()
        OR j.recruiter_id = auth.uid()
    )
  );

CREATE POLICY "Recruiters can update applications for own jobs"
  ON public.applications FOR UPDATE
  USING (
    job_id IN (
      SELECT j.id
      FROM public.jobs j
      WHERE j.recruiter_profile_id = auth.uid()
        OR j.recruiter_id = auth.uid()
    )
  );

DO $$
BEGIN
  IF to_regclass('public.recruiter_job_activities') IS NOT NULL THEN
    DROP POLICY IF EXISTS "Recruiters can read their own job activities" ON public.recruiter_job_activities;
    DROP POLICY IF EXISTS "Recruiters can create their own job activities" ON public.recruiter_job_activities;

    CREATE POLICY "Recruiters can read their own job activities"
      ON public.recruiter_job_activities FOR SELECT
      USING (
        job_id IN (
          SELECT j.id
          FROM public.jobs j
          WHERE j.recruiter_profile_id = auth.uid()
            OR j.recruiter_id = auth.uid()
        )
      );

    CREATE POLICY "Recruiters can create their own job activities"
      ON public.recruiter_job_activities FOR INSERT
      WITH CHECK (
        job_id IN (
          SELECT j.id
          FROM public.jobs j
          WHERE j.recruiter_profile_id = auth.uid()
            OR j.recruiter_id = auth.uid()
        )
      );
  END IF;
END $$;
