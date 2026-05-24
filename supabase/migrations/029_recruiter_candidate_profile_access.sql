ALTER TABLE public.candidate_profiles
  ADD COLUMN IF NOT EXISTS linkedin_url text,
  ADD COLUMN IF NOT EXISTS github_url text,
  ADD COLUMN IF NOT EXISTS dribbble_url text,
  ADD COLUMN IF NOT EXISTS portfolio_url text,
  ADD COLUMN IF NOT EXISTS website_url text;

DROP POLICY IF EXISTS "Recruiters can select candidate profiles for own applicants" ON public.candidate_profiles;
CREATE POLICY "Recruiters can select candidate profiles for own applicants"
  ON public.candidate_profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.applications applications
      JOIN public.jobs jobs
        ON jobs.id = applications.job_id
        OR applications.job_external_id = jobs.id::text
      LEFT JOIN public.recruiter_profiles recruiter_profiles
        ON recruiter_profiles.user_id = auth.uid()
      WHERE (
        applications.candidate_id = candidate_profiles.user_id
        OR applications.user_id = candidate_profiles.user_id
        OR applications.candidate_id = candidate_profiles.id
      )
      AND (
        jobs.recruiter_profile_id = auth.uid()
        OR jobs.recruiter_id = auth.uid()
        OR jobs.recruiter_profile_id = recruiter_profiles.id
        OR jobs.recruiter_id = recruiter_profiles.id
      )
    )
  );

DROP POLICY IF EXISTS "Recruiters can select profiles for own applicants" ON public.profiles;
CREATE POLICY "Recruiters can select profiles for own applicants"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.applications applications
      JOIN public.jobs jobs
        ON jobs.id = applications.job_id
        OR applications.job_external_id = jobs.id::text
      LEFT JOIN public.recruiter_profiles recruiter_profiles
        ON recruiter_profiles.user_id = auth.uid()
      LEFT JOIN public.candidate_profiles candidate_profiles
        ON candidate_profiles.id = applications.candidate_id
      WHERE (
        applications.candidate_id = profiles.id
        OR applications.user_id = profiles.id
        OR candidate_profiles.user_id = profiles.id
      )
      AND (
        jobs.recruiter_profile_id = auth.uid()
        OR jobs.recruiter_id = auth.uid()
        OR jobs.recruiter_profile_id = recruiter_profiles.id
        OR jobs.recruiter_id = recruiter_profiles.id
      )
    )
  );

NOTIFY pgrst, 'reload schema';
