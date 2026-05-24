-- Add live job/application compatibility fields for authenticated Supabase flows.
-- The existing project schema keeps recruiter ownership through public.recruiters.

ALTER TABLE public.jobs
  ADD COLUMN IF NOT EXISTS company_name TEXT,
  ADD COLUMN IF NOT EXISTS job_type TEXT,
  ADD COLUMN IF NOT EXISTS salary_range TEXT,
  ADD COLUMN IF NOT EXISTS recruiter_profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

UPDATE public.jobs
SET
  company_name = COALESCE(company_name, company),
  salary_range = COALESCE(
    salary_range,
    salary_currency || ' ' || salary_min::TEXT || ' - ' || salary_max::TEXT
  )
WHERE company_name IS NULL OR salary_range IS NULL;

UPDATE public.jobs AS j
SET recruiter_profile_id = r.user_id
FROM public.recruiters AS r
WHERE j.recruiter_id = r.id
  AND j.recruiter_profile_id IS NULL;

ALTER TABLE public.applications
  ADD COLUMN IF NOT EXISTS candidate_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;

UPDATE public.applications
SET candidate_id = user_id
WHERE candidate_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_jobs_recruiter_profile
  ON public.jobs(recruiter_profile_id);

CREATE INDEX IF NOT EXISTS idx_applications_candidate
  ON public.applications(candidate_id);

CREATE UNIQUE INDEX IF NOT EXISTS applications_job_candidate_key
  ON public.applications(job_id, candidate_id)
  WHERE candidate_id IS NOT NULL;

DROP POLICY IF EXISTS "Candidates can select active jobs" ON public.jobs;
CREATE POLICY "Candidates can select active jobs"
  ON public.jobs FOR SELECT
  USING (status = 'active');

DROP POLICY IF EXISTS "Candidates can select own applications" ON public.applications;
CREATE POLICY "Candidates can select own applications"
  ON public.applications FOR SELECT
  USING (candidate_id = auth.uid() OR user_id = auth.uid());

DROP POLICY IF EXISTS "Candidates can insert own applications" ON public.applications;
CREATE POLICY "Candidates can insert own applications"
  ON public.applications FOR INSERT
  WITH CHECK (candidate_id = auth.uid() OR user_id = auth.uid());

DROP POLICY IF EXISTS "Recruiters can view applications for own jobs" ON public.applications;
CREATE POLICY "Recruiters can view applications for own jobs"
  ON public.applications FOR SELECT
  USING (
    job_id IN (
      SELECT j.id
      FROM public.jobs AS j
      JOIN public.recruiters AS r ON r.id = j.recruiter_id
      WHERE r.user_id = auth.uid()
    )
  );
