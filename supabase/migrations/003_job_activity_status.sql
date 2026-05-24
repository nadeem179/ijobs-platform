-- Job activity lifecycle
-- Adds inactive/filled support, recruiter activity tracking, and 30-day confirmation fields.

ALTER TABLE jobs
  DROP CONSTRAINT IF EXISTS jobs_status_check;

UPDATE jobs
SET status = 'paused'
WHERE status = 'draft';

ALTER TABLE jobs
  ADD CONSTRAINT jobs_status_check
  CHECK (status IN ('active', 'inactive', 'paused', 'closed', 'filled'));

ALTER TABLE jobs
  ADD COLUMN IF NOT EXISTS last_recruiter_activity_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS confirmation_due_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS confirmation_requested_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS requires_confirmation BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS inactive_reason TEXT,
  ADD COLUMN IF NOT EXISTS closed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS filled_at TIMESTAMPTZ;

UPDATE jobs
SET
  last_recruiter_activity_at = COALESCE(last_recruiter_activity_at, updated_at, created_at, NOW()),
  confirmation_due_at = COALESCE(confirmation_due_at, created_at + INTERVAL '30 days')
WHERE last_recruiter_activity_at IS NULL
  OR confirmation_due_at IS NULL;

ALTER TABLE jobs
  ALTER COLUMN last_recruiter_activity_at SET DEFAULT NOW(),
  ALTER COLUMN confirmation_due_at SET DEFAULT (NOW() + INTERVAL '30 days'),
  ALTER COLUMN last_recruiter_activity_at SET NOT NULL,
  ALTER COLUMN confirmation_due_at SET NOT NULL;

CREATE TABLE IF NOT EXISTS recruiter_job_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recruiter_id UUID NOT NULL REFERENCES recruiters(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (
    activity_type IN (
      'job_created',
      'job_updated',
      'application_reviewed',
      'candidate_contacted',
      'job_confirmed'
    )
  ),
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION update_job_recruiter_activity()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE jobs
  SET
    last_recruiter_activity_at = NEW.created_at,
    requires_confirmation = CASE
      WHEN NEW.activity_type = 'job_confirmed' THEN FALSE
      ELSE requires_confirmation
    END,
    confirmed_at = CASE
      WHEN NEW.activity_type = 'job_confirmed' THEN NEW.created_at
      ELSE confirmed_at
    END,
    confirmation_requested_at = CASE
      WHEN NEW.activity_type = 'job_confirmed' THEN NULL
      ELSE confirmation_requested_at
    END,
    confirmation_due_at = CASE
      WHEN NEW.activity_type = 'job_confirmed' THEN NEW.created_at + INTERVAL '30 days'
      ELSE confirmation_due_at
    END,
    status = CASE
      WHEN NEW.activity_type = 'job_confirmed' AND status = 'inactive' THEN 'active'
      ELSE status
    END,
    inactive_reason = CASE
      WHEN NEW.activity_type = 'job_confirmed' THEN NULL
      ELSE inactive_reason
    END,
    updated_at = NOW()
  WHERE id = NEW.job_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS recruiter_job_activities_update_job ON recruiter_job_activities;
CREATE TRIGGER recruiter_job_activities_update_job
  AFTER INSERT ON recruiter_job_activities
  FOR EACH ROW EXECUTE FUNCTION update_job_recruiter_activity();

CREATE INDEX IF NOT EXISTS idx_jobs_last_recruiter_activity
  ON jobs(last_recruiter_activity_at);

CREATE INDEX IF NOT EXISTS idx_jobs_confirmation_due
  ON jobs(confirmation_due_at);

CREATE INDEX IF NOT EXISTS idx_jobs_requires_confirmation
  ON jobs(requires_confirmation)
  WHERE requires_confirmation = TRUE;

CREATE INDEX IF NOT EXISTS idx_recruiter_job_activities_job
  ON recruiter_job_activities(job_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_recruiter_job_activities_recruiter
  ON recruiter_job_activities(recruiter_id, created_at DESC);

ALTER TABLE recruiter_job_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Recruiters can read their own job activities"
  ON recruiter_job_activities FOR SELECT USING (recruiter_id IN (
    SELECT id FROM recruiters WHERE user_id = auth.uid()
  ));

CREATE POLICY "Recruiters can create their own job activities"
  ON recruiter_job_activities FOR INSERT WITH CHECK (
    recruiter_id IN (SELECT id FROM recruiters WHERE user_id = auth.uid())
    AND job_id IN (SELECT id FROM jobs WHERE recruiter_id IN (
      SELECT id FROM recruiters WHERE user_id = auth.uid()
    ))
  );
