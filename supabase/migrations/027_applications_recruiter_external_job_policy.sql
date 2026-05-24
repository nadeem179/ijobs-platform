-- Keep recruiter application visibility aligned with both supported job identity columns.

DROP POLICY IF EXISTS "Recruiters can select applications for own jobs" ON public.applications;
CREATE POLICY "Recruiters can select applications for own jobs"
  ON public.applications FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR candidate_id = auth.uid()
    OR EXISTS (
      SELECT 1
      FROM public.jobs j
      WHERE (
          j.id = applications.job_id
          OR j.id::text = applications.job_external_id
        )
        AND (
          j.recruiter_profile_id = auth.uid()
          OR j.recruiter_id = auth.uid()
        )
    )
  );

DROP POLICY IF EXISTS "Recruiters can update applications for own jobs" ON public.applications;
CREATE POLICY "Recruiters can update applications for own jobs"
  ON public.applications FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.jobs j
      WHERE (
          j.id = applications.job_id
          OR j.id::text = applications.job_external_id
        )
        AND (
          j.recruiter_profile_id = auth.uid()
          OR j.recruiter_id = auth.uid()
        )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.jobs j
      WHERE (
          j.id = applications.job_id
          OR j.id::text = applications.job_external_id
        )
        AND (
          j.recruiter_profile_id = auth.uid()
          OR j.recruiter_id = auth.uid()
        )
    )
  );

NOTIFY pgrst, 'reload schema';
