-- Normalize the jobs table for recruiter posting, dashboards, applications, and activity checks.
-- Safe to run repeatedly; all app-optional columns use IF NOT EXISTS.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

ALTER TABLE public.jobs
  ADD COLUMN IF NOT EXISTS recruiter_id UUID,
  ADD COLUMN IF NOT EXISTS recruiter_profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS title TEXT,
  ADD COLUMN IF NOT EXISTS company TEXT,
  ADD COLUMN IF NOT EXISTS company_name TEXT,
  ADD COLUMN IF NOT EXISTS company_logo TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS company_description TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS company_size TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS company_industry TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS location TEXT,
  ADD COLUMN IF NOT EXISTS location_type TEXT DEFAULT 'Remote',
  ADD COLUMN IF NOT EXISTS job_type TEXT,
  ADD COLUMN IF NOT EXISTS salary_min INTEGER,
  ADD COLUMN IF NOT EXISTS salary_max INTEGER,
  ADD COLUMN IF NOT EXISTS salary_range TEXT,
  ADD COLUMN IF NOT EXISTS salary_currency TEXT DEFAULT '$',
  ADD COLUMN IF NOT EXISTS salary_period TEXT DEFAULT 'year',
  ADD COLUMN IF NOT EXISTS experience_level TEXT DEFAULT 'Mid',
  ADD COLUMN IF NOT EXISTS skills TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS description TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS responsibilities TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS requirements TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS preferred_qualifications TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS benefits TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS screening_questions TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS applicants_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_recruiter_activity_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS confirmation_due_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days'),
  ADD COLUMN IF NOT EXISTS confirmation_requested_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS requires_confirmation BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS inactive_reason TEXT,
  ADD COLUMN IF NOT EXISTS closed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS filled_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

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
  ALTER COLUMN recruiter_id DROP NOT NULL,
  ALTER COLUMN title DROP NOT NULL,
  ALTER COLUMN company DROP NOT NULL,
  ALTER COLUMN location DROP NOT NULL,
  ALTER COLUMN salary_min DROP NOT NULL,
  ALTER COLUMN salary_max DROP NOT NULL,
  ALTER COLUMN skills SET DEFAULT ARRAY[]::TEXT[],
  ALTER COLUMN responsibilities SET DEFAULT ARRAY[]::TEXT[],
  ALTER COLUMN requirements SET DEFAULT ARRAY[]::TEXT[],
  ALTER COLUMN preferred_qualifications SET DEFAULT ARRAY[]::TEXT[],
  ALTER COLUMN benefits SET DEFAULT ARRAY[]::TEXT[],
  ALTER COLUMN screening_questions SET DEFAULT ARRAY[]::TEXT[],
  ALTER COLUMN status SET DEFAULT 'active',
  ALTER COLUMN applicants_count SET DEFAULT 0,
  ALTER COLUMN featured SET DEFAULT FALSE,
  ALTER COLUMN last_recruiter_activity_at SET DEFAULT NOW(),
  ALTER COLUMN confirmation_due_at SET DEFAULT (NOW() + INTERVAL '30 days'),
  ALTER COLUMN requires_confirmation SET DEFAULT FALSE,
  ALTER COLUMN created_at SET DEFAULT NOW(),
  ALTER COLUMN updated_at SET DEFAULT NOW();

UPDATE public.jobs
SET
  company = COALESCE(company, company_name, 'Company'),
  company_name = COALESCE(company_name, company, 'Company'),
  location = COALESCE(location, ''),
  location_type = COALESCE(location_type, 'Remote'),
  job_type = COALESCE(job_type, 'Full-time'),
  salary_currency = COALESCE(salary_currency, '$'),
  salary_period = COALESCE(salary_period, 'year'),
  experience_level = COALESCE(experience_level, 'Mid'),
  skills = COALESCE(skills, ARRAY[]::TEXT[]),
  description = COALESCE(description, ''),
  responsibilities = COALESCE(responsibilities, ARRAY[]::TEXT[]),
  requirements = COALESCE(requirements, ARRAY[]::TEXT[]),
  preferred_qualifications = COALESCE(preferred_qualifications, ARRAY[]::TEXT[]),
  benefits = COALESCE(benefits, ARRAY[]::TEXT[]),
  screening_questions = COALESCE(screening_questions, ARRAY[]::TEXT[]),
  status = COALESCE(status, 'active'),
  featured = COALESCE(featured, FALSE),
  applicants_count = COALESCE(applicants_count, 0),
  last_recruiter_activity_at = COALESCE(last_recruiter_activity_at, updated_at, created_at, NOW()),
  confirmation_due_at = COALESCE(confirmation_due_at, created_at + INTERVAL '30 days', NOW() + INTERVAL '30 days'),
  requires_confirmation = COALESCE(requires_confirmation, FALSE),
  created_at = COALESCE(created_at, NOW()),
  updated_at = COALESCE(updated_at, NOW())
WHERE TRUE;

UPDATE public.jobs
SET salary_range = COALESCE(
  salary_range,
  CASE
    WHEN salary_min IS NOT NULL AND salary_max IS NOT NULL
      THEN COALESCE(salary_currency, '$') || ' ' || salary_min::TEXT || ' - ' || salary_max::TEXT
    ELSE salary_range
  END
)
WHERE salary_range IS NULL;

UPDATE public.jobs
SET recruiter_profile_id = recruiter_id
WHERE recruiter_profile_id IS NULL
  AND recruiter_id IS NOT NULL
  AND EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = public.jobs.recruiter_id
  );

ALTER TABLE public.jobs
  DROP CONSTRAINT IF EXISTS jobs_status_check;

ALTER TABLE public.jobs
  ADD CONSTRAINT jobs_status_check
  CHECK (status IN ('draft', 'active', 'inactive', 'paused', 'closed', 'filled'));

ALTER TABLE public.jobs
  DROP CONSTRAINT IF EXISTS jobs_location_type_check;

ALTER TABLE public.jobs
  ADD CONSTRAINT jobs_location_type_check
  CHECK (location_type IS NULL OR location_type IN ('Remote', 'Hybrid', 'On-site'));

ALTER TABLE public.jobs
  DROP CONSTRAINT IF EXISTS jobs_salary_period_check;

ALTER TABLE public.jobs
  ADD CONSTRAINT jobs_salary_period_check
  CHECK (salary_period IS NULL OR salary_period IN ('year', 'hour'));

ALTER TABLE public.jobs
  DROP CONSTRAINT IF EXISTS jobs_experience_level_check;

ALTER TABLE public.jobs
  ADD CONSTRAINT jobs_experience_level_check
  CHECK (experience_level IS NULL OR experience_level IN ('Entry', 'Mid', 'Senior', 'Lead', 'Staff'));

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS jobs_updated_at ON public.jobs;
CREATE TRIGGER jobs_updated_at
  BEFORE UPDATE ON public.jobs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE INDEX IF NOT EXISTS idx_jobs_recruiter_profile
  ON public.jobs(recruiter_profile_id);

CREATE INDEX IF NOT EXISTS idx_jobs_recruiter_id
  ON public.jobs(recruiter_id);

CREATE INDEX IF NOT EXISTS idx_jobs_status
  ON public.jobs(status);

CREATE INDEX IF NOT EXISTS idx_jobs_created_at
  ON public.jobs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_jobs_skills
  ON public.jobs USING GIN(skills);
