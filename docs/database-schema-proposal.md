# iJobs MVP Database Schema Proposal

Prisma is not installed in this project, so this is a proposal only. The current app uses Supabase with SQL migrations under `supabase/migrations`, so the schema below is written for PostgreSQL/Supabase and keeps the existing `profiles`, `recruiters`, `jobs`, `applications`, and `saved_jobs` direction.

## Goals

- Support the required MVP models: User, CandidateProfile, RecruiterProfile, Company, Job, Application, SavedJob, RecruiterActivity, Payment, and AdminAction.
- Keep auth anchored to Supabase `auth.users`.
- Preserve current UI assumptions where possible, including public active jobs and user-owned profiles.
- Make business rules enforceable at the database or service boundary.

## Model Map

| Required model | Proposed table | Notes |
| --- | --- | --- |
| User | `profiles` | Extends Supabase `auth.users`; existing table can be expanded. |
| CandidateProfile | `candidate_profiles` | Candidate-only profile details and preferences. |
| RecruiterProfile | `recruiter_profiles` | Replaces or supersets current `recruiters` table. |
| Company | `companies` | Company data belongs outside jobs for reuse and verification. |
| Job | `jobs` | Existing table can be expanded with lifecycle and payment fields. |
| Application | `applications` | Existing table can be expanded with daily-limit enforcement. |
| SavedJob | `saved_jobs` | Existing table is sufficient with candidate ownership checks. |
| RecruiterActivity | `recruiter_activities` | Tracks recruiter actions and last activity per recruiter/job. |
| Payment | `payments` | Tracks extra job post charges and other monetization events. |
| AdminAction | `admin_actions` | Audit log for moderation and admin changes. |

## Enums

```sql
CREATE TYPE user_role AS ENUM ('candidate', 'recruiter', 'admin');
CREATE TYPE job_status AS ENUM ('draft', 'active', 'inactive', 'paused', 'closed', 'pending_confirmation');
CREATE TYPE application_status AS ENUM ('applied', 'reviewing', 'shortlisted', 'interview', 'rejected', 'hired', 'withdrawn');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded');
CREATE TYPE payment_purpose AS ENUM ('extra_job_post');
CREATE TYPE recruiter_activity_type AS ENUM ('login', 'job_created', 'job_updated', 'application_reviewed', 'candidate_contacted');
```

## Tables

### `profiles`

User model. Existing `profiles` already covers much of this.

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL DEFAULT '',
  phone TEXT,
  avatar_url TEXT,
  role user_role,
  onboarding_complete BOOLEAN NOT NULL DEFAULT FALSE,
  disabled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### `candidate_profiles`

```sql
CREATE TABLE candidate_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  headline TEXT NOT NULL DEFAULT '',
  about TEXT NOT NULL DEFAULT '',
  location TEXT NOT NULL DEFAULT '',
  resume_url TEXT,
  experience_level TEXT NOT NULL DEFAULT 'Mid',
  skills TEXT[] NOT NULL DEFAULT '{}',
  expected_salary_min INT,
  expected_salary_max INT,
  open_to_remote BOOLEAN NOT NULL DEFAULT TRUE,
  actively_looking BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### `companies`

```sql
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  logo_url TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  website_url TEXT,
  industry TEXT NOT NULL DEFAULT '',
  size TEXT NOT NULL DEFAULT '',
  location TEXT NOT NULL DEFAULT '',
  verified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### `recruiter_profiles`

```sql
CREATE TABLE recruiter_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE RESTRICT,
  title TEXT NOT NULL DEFAULT '',
  verified BOOLEAN NOT NULL DEFAULT FALSE,
  response_rate INT NOT NULL DEFAULT 0 CHECK (response_rate BETWEEN 0 AND 100),
  free_job_post_used BOOLEAN NOT NULL DEFAULT FALSE,
  last_active_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### `jobs`

```sql
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recruiter_id UUID NOT NULL REFERENCES recruiter_profiles(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE RESTRICT,
  payment_id UUID,
  title TEXT NOT NULL,
  location TEXT NOT NULL,
  location_type TEXT NOT NULL DEFAULT 'Remote' CHECK (location_type IN ('Remote', 'Hybrid', 'On-site')),
  salary_min INT NOT NULL,
  salary_max INT NOT NULL,
  salary_currency TEXT NOT NULL DEFAULT 'INR',
  salary_period TEXT NOT NULL DEFAULT 'year' CHECK (salary_period IN ('year', 'month', 'hour')),
  experience_level TEXT NOT NULL DEFAULT 'Mid' CHECK (experience_level IN ('Entry', 'Mid', 'Senior', 'Lead', 'Staff')),
  skills TEXT[] NOT NULL DEFAULT '{}',
  description TEXT NOT NULL DEFAULT '',
  responsibilities TEXT[] NOT NULL DEFAULT '{}',
  requirements TEXT[] NOT NULL DEFAULT '{}',
  preferred_qualifications TEXT[] NOT NULL DEFAULT '{}',
  benefits TEXT[] NOT NULL DEFAULT '{}',
  status job_status NOT NULL DEFAULT 'draft',
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  applicants_count INT NOT NULL DEFAULT 0,
  last_recruiter_activity_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  confirmation_due_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 days'),
  confirmed_at TIMESTAMPTZ,
  inactive_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### `applications`

```sql
CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status application_status NOT NULL DEFAULT 'applied',
  cover_letter TEXT,
  resume_url TEXT,
  applied_on DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(job_id, candidate_id)
);
```

### `saved_jobs`

```sql
CREATE TABLE saved_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(candidate_id, job_id)
);
```

### `recruiter_activities`

```sql
CREATE TABLE recruiter_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recruiter_id UUID NOT NULL REFERENCES recruiter_profiles(id) ON DELETE CASCADE,
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  activity_type recruiter_activity_type NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### `payments`

Payment model. Extra job post amount is stored in paise to avoid floating-point money values.

```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recruiter_id UUID NOT NULL REFERENCES recruiter_profiles(id) ON DELETE CASCADE,
  job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
  purpose payment_purpose NOT NULL DEFAULT 'extra_job_post',
  amount_paise INT NOT NULL DEFAULT 50000,
  currency TEXT NOT NULL DEFAULT 'INR',
  status payment_status NOT NULL DEFAULT 'pending',
  provider TEXT,
  provider_payment_id TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (amount_paise = 50000),
  CHECK (currency = 'INR')
);

ALTER TABLE jobs
  ADD CONSTRAINT jobs_payment_fk
  FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE SET NULL;
```

### `admin_actions`

```sql
CREATE TABLE admin_actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  target_table TEXT NOT NULL,
  target_id UUID NOT NULL,
  action TEXT NOT NULL,
  reason TEXT,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

## Business Rule Enforcement

### Candidate can apply to max 5 jobs/day

Use a trigger on `applications` before insert. This keeps the rule enforceable even if multiple clients exist.

```sql
CREATE OR REPLACE FUNCTION enforce_daily_application_limit()
RETURNS TRIGGER AS $$
BEGIN
  IF (
    SELECT COUNT(*)
    FROM applications
    WHERE candidate_id = NEW.candidate_id
      AND applied_on = CURRENT_DATE
  ) >= 5 THEN
    RAISE EXCEPTION 'Candidates can apply to a maximum of 5 jobs per day';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER applications_daily_limit
  BEFORE INSERT ON applications
  FOR EACH ROW EXECUTE FUNCTION enforce_daily_application_limit();
```

### Recruiter first job post is free, extra job post costs INR 500

Recommended service flow:

1. Count prior created jobs for the recruiter.
2. If count is `0`, create the job and set `free_job_post_used = TRUE`.
3. If count is greater than `0`, require a `payments` row with `status = 'paid'`, `purpose = 'extra_job_post'`, `amount_paise = 50000`, and the same recruiter before publishing the job.

Database guard:

```sql
CREATE OR REPLACE FUNCTION can_publish_job(recruiter UUID, payment UUID)
RETURNS BOOLEAN AS $$
DECLARE
  existing_jobs INT;
BEGIN
  SELECT COUNT(*) INTO existing_jobs
  FROM jobs
  WHERE recruiter_id = recruiter;

  IF existing_jobs = 0 THEN
    RETURN TRUE;
  END IF;

  RETURN EXISTS (
    SELECT 1
    FROM payments
    WHERE id = payment
      AND recruiter_id = recruiter
      AND purpose = 'extra_job_post'
      AND amount_paise = 50000
      AND currency = 'INR'
      AND status = 'paid'
  );
END;
$$ LANGUAGE plpgsql STABLE;
```

### Job becomes inactive after 5 days recruiter inactivity

Track recruiter actions in `recruiter_activities` and update `jobs.last_recruiter_activity_at` for job-specific events. Run a scheduled Supabase cron or backend job daily:

```sql
UPDATE jobs
SET status = 'inactive',
    inactive_reason = 'recruiter_inactive_5_days',
    updated_at = NOW()
WHERE status = 'active'
  AND last_recruiter_activity_at < NOW() - INTERVAL '5 days';
```

### Job requires confirmation after 30 days

Set `confirmation_due_at = created_at + interval '30 days'` when a job is created. Run a scheduled job daily:

```sql
UPDATE jobs
SET status = 'pending_confirmation',
    updated_at = NOW()
WHERE status = 'active'
  AND confirmation_due_at <= NOW()
  AND confirmed_at IS NULL;
```

When the recruiter confirms:

```sql
UPDATE jobs
SET status = 'active',
    confirmed_at = NOW(),
    confirmation_due_at = NOW() + INTERVAL '30 days',
    last_recruiter_activity_at = NOW(),
    updated_at = NOW()
WHERE id = :job_id
  AND recruiter_id = :recruiter_id;
```

## Indexes

```sql
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_candidate_profiles_user ON candidate_profiles(user_id);
CREATE INDEX idx_recruiter_profiles_user ON recruiter_profiles(user_id);
CREATE INDEX idx_recruiter_profiles_company ON recruiter_profiles(company_id);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_company ON jobs(company_id);
CREATE INDEX idx_jobs_recruiter ON jobs(recruiter_id);
CREATE INDEX idx_jobs_confirmation_due ON jobs(confirmation_due_at);
CREATE INDEX idx_jobs_last_activity ON jobs(last_recruiter_activity_at);
CREATE INDEX idx_jobs_skills ON jobs USING GIN(skills);
CREATE INDEX idx_applications_candidate_day ON applications(candidate_id, applied_on);
CREATE INDEX idx_applications_job ON applications(job_id);
CREATE INDEX idx_saved_jobs_candidate ON saved_jobs(candidate_id);
CREATE INDEX idx_recruiter_activities_recruiter ON recruiter_activities(recruiter_id, created_at DESC);
CREATE INDEX idx_recruiter_activities_job ON recruiter_activities(job_id, created_at DESC);
CREATE INDEX idx_payments_recruiter ON payments(recruiter_id, created_at DESC);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_admin_actions_target ON admin_actions(target_table, target_id);
```

## RLS Policy Outline

- `profiles`: users can read public profile fields; users update their own profile; admins can manage all.
- `candidate_profiles`: candidates manage their own profile; recruiters can read candidate profiles only through permitted application/candidate search flows.
- `companies`: public read; verified recruiters for the company can update limited fields; admins can verify.
- `recruiter_profiles`: public read of verified recruiter basics; recruiter updates own record; admins can verify.
- `jobs`: public can read `active` jobs; owning recruiter can read and manage all their jobs; admins can manage all.
- `applications`: candidates can create/read their own applications; recruiters can read/update applications for their own jobs.
- `saved_jobs`: candidates manage their own saved jobs.
- `recruiter_activities`: owning recruiter can create/read own activity; admins can read all.
- `payments`: recruiter can read own payments; payment webhooks/service role update status; admins can read all.
- `admin_actions`: admins can create/read; normal users cannot access.

## Migration Notes

- Current `profiles` can become the User model with role expanded to include `admin`.
- Current `recruiters` can either be renamed in a future migration to `recruiter_profiles` or kept as-is and expanded. Renaming is not required for MVP if code already depends on `recruiters`.
- Current job company fields can remain during transition, but `company_id` should become the source of truth.
- Current `applications.user_id` and `saved_jobs.user_id` map to `candidate_id` in this proposal.
- Add database triggers after table changes, then update service code to use the new RPC/guard flow for paid job posting.
