-- ─────────────────────────────────────────────────────────────
-- JobPortal — Initial Schema
-- Supabase Migration (run in Supabase SQL Editor)
-- ─────────────────────────────────────────────────────────────

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ───── Profiles (extends auth.users) ─────
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  headline TEXT NOT NULL DEFAULT '',
  about TEXT NOT NULL DEFAULT '',
  location TEXT NOT NULL DEFAULT '',
  phone TEXT,
  avatar_url TEXT,
  resume_url TEXT,
  experience_level TEXT NOT NULL DEFAULT 'Mid',
  skills TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ───── Experience ─────
CREATE TABLE experiences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  company TEXT NOT NULL,
  role TEXT NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT,
  current BOOLEAN NOT NULL DEFAULT FALSE,
  description TEXT NOT NULL DEFAULT '',
  skills TEXT[] NOT NULL DEFAULT '{}',
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ───── Education ─────
CREATE TABLE education (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  institution TEXT NOT NULL,
  degree TEXT NOT NULL,
  field TEXT NOT NULL DEFAULT '',
  start_year INT NOT NULL,
  end_year INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ───── Portfolio Projects ─────
CREATE TABLE portfolio_projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  image_url TEXT,
  project_url TEXT,
  tools TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ───── Certifications ─────
CREATE TABLE certifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  issuer TEXT NOT NULL,
  year INT NOT NULL,
  credential_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ───── Social Links ─────
CREATE TABLE social_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  url TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT 'link',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ───── Recruiters ─────
CREATE TABLE recruiters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company TEXT NOT NULL,
  verified BOOLEAN NOT NULL DEFAULT FALSE,
  response_rate INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

-- ───── Jobs ─────
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recruiter_id UUID NOT NULL REFERENCES recruiters(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  company_logo TEXT NOT NULL DEFAULT '',
  company_description TEXT NOT NULL DEFAULT '',
  company_size TEXT NOT NULL DEFAULT '',
  company_industry TEXT NOT NULL DEFAULT '',
  location TEXT NOT NULL,
  location_type TEXT NOT NULL DEFAULT 'Remote' CHECK (location_type IN ('Remote', 'Hybrid', 'On-site')),
  salary_min INT NOT NULL,
  salary_max INT NOT NULL,
  salary_currency TEXT NOT NULL DEFAULT '$',
  salary_period TEXT NOT NULL DEFAULT 'year' CHECK (salary_period IN ('year', 'hour')),
  experience_level TEXT NOT NULL DEFAULT 'Mid' CHECK (experience_level IN ('Entry', 'Mid', 'Senior', 'Lead', 'Staff')),
  skills TEXT[] NOT NULL DEFAULT '{}',
  description TEXT NOT NULL DEFAULT '',
  responsibilities TEXT[] NOT NULL DEFAULT '{}',
  requirements TEXT[] NOT NULL DEFAULT '{}',
  preferred_qualifications TEXT[] NOT NULL DEFAULT '{}',
  benefits TEXT[] NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'draft', 'paused', 'closed')),
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  applicants_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ───── Applications ─────
CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'applied' CHECK (status IN ('applied', 'reviewing', 'interview', 'rejected', 'hired')),
  cover_letter TEXT,
  resume_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(job_id, user_id)
);

-- ───── Saved Jobs ─────
CREATE TABLE saved_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, job_id)
);

-- ───── Triggers: updated_at ─────

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER jobs_updated_at
  BEFORE UPDATE ON jobs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER applications_updated_at
  BEFORE UPDATE ON applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ───── Indexes ─────

CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_created_at ON jobs(created_at DESC);
CREATE INDEX idx_jobs_recruiter ON jobs(recruiter_id);
CREATE INDEX idx_jobs_skills ON jobs USING GIN(skills);
CREATE INDEX idx_applications_user ON applications(user_id);
CREATE INDEX idx_applications_job ON applications(job_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_saved_jobs_user ON saved_jobs(user_id);
CREATE INDEX idx_experiences_profile ON experiences(profile_id);
CREATE INDEX idx_portfolio_profile ON portfolio_projects(profile_id);
CREATE INDEX idx_recruiters_user ON recruiters(user_id);

-- ───── Row Level Security ─────

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE education ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE recruiters ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_jobs ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read any profile, update only own
CREATE POLICY "Profiles are publicly readable"
  ON profiles FOR SELECT USING (TRUE);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT WITH CHECK (id = auth.uid());

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE USING (id = auth.uid());

-- Experiences: profile owner manages, others can read
CREATE POLICY "Experiences are readable by everyone"
  ON experiences FOR SELECT USING (TRUE);

CREATE POLICY "Users manage their own experiences"
  ON experiences FOR ALL USING (profile_id = auth.uid());

-- Education: same as experiences
CREATE POLICY "Education is readable by everyone"
  ON education FOR SELECT USING (TRUE);

CREATE POLICY "Users manage their own education"
  ON education FOR ALL USING (profile_id = auth.uid());

-- Portfolio: same
CREATE POLICY "Portfolio is readable by everyone"
  ON portfolio_projects FOR SELECT USING (TRUE);

CREATE POLICY "Users manage their own portfolio"
  ON portfolio_projects FOR ALL USING (profile_id = auth.uid());

-- Certifications: same
CREATE POLICY "Certifications are readable by everyone"
  ON certifications FOR SELECT USING (TRUE);

CREATE POLICY "Users manage their own certifications"
  ON certifications FOR ALL USING (profile_id = auth.uid());

-- Social links: same
CREATE POLICY "Social links are readable by everyone"
  ON social_links FOR SELECT USING (TRUE);

CREATE POLICY "Users manage their own social links"
  ON social_links FOR ALL USING (profile_id = auth.uid());

-- Recruiters: readable by everyone, recruiter manages own
CREATE POLICY "Recruiters are publicly readable"
  ON recruiters FOR SELECT USING (TRUE);

CREATE POLICY "Recruiters can manage their own record"
  ON recruiters FOR ALL USING (user_id = auth.uid());

-- Jobs: active jobs visible to all, recruiters manage own
CREATE POLICY "Active jobs are publicly readable"
  ON jobs FOR SELECT USING (status = 'active' OR recruiter_id IN (
    SELECT id FROM recruiters WHERE user_id = auth.uid()
  ));

CREATE POLICY "Recruiters manage their own jobs"
  ON jobs FOR INSERT WITH CHECK (recruiter_id IN (
    SELECT id FROM recruiters WHERE user_id = auth.uid()
  ));

CREATE POLICY "Recruiters update their own jobs"
  ON jobs FOR UPDATE USING (recruiter_id IN (
    SELECT id FROM recruiters WHERE user_id = auth.uid()
  ));

-- Applications: user sees own, recruiter sees for their jobs
CREATE POLICY "Users see their own applications"
  ON applications FOR SELECT USING (
    user_id = auth.uid() OR
    job_id IN (
      SELECT j.id FROM jobs j
      JOIN recruiters r ON r.id = j.recruiter_id
      WHERE r.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create applications"
  ON applications FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Recruiters can update application status"
  ON applications FOR UPDATE USING (
    job_id IN (
      SELECT j.id FROM jobs j
      JOIN recruiters r ON r.id = j.recruiter_id
      WHERE r.user_id = auth.uid()
    )
  );

-- Saved jobs: user manages own
CREATE POLICY "Users manage their saved jobs"
  ON saved_jobs FOR ALL USING (user_id = auth.uid());