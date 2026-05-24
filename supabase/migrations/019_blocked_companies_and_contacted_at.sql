-- Add contacted application event and candidate company blocking.

ALTER TABLE public.applications
  ADD COLUMN IF NOT EXISTS contacted_at TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS public.blocked_companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  company_id UUID,
  company_name TEXT NOT NULL,
  recruiter_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.blocked_companies
  ADD COLUMN IF NOT EXISTS candidate_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS company_id UUID,
  ADD COLUMN IF NOT EXISTS company_name TEXT,
  ADD COLUMN IF NOT EXISTS recruiter_id UUID,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

CREATE UNIQUE INDEX IF NOT EXISTS blocked_companies_candidate_company_key
  ON public.blocked_companies(candidate_id, company_name)
  WHERE candidate_id IS NOT NULL
    AND company_name IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_blocked_companies_candidate
  ON public.blocked_companies(candidate_id);

CREATE INDEX IF NOT EXISTS idx_blocked_companies_company_name
  ON public.blocked_companies(company_name);

ALTER TABLE public.blocked_companies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Candidates can select own blocked companies" ON public.blocked_companies;
CREATE POLICY "Candidates can select own blocked companies"
  ON public.blocked_companies FOR SELECT
  USING (candidate_id = auth.uid());

DROP POLICY IF EXISTS "Candidates can insert own blocked companies" ON public.blocked_companies;
CREATE POLICY "Candidates can insert own blocked companies"
  ON public.blocked_companies FOR INSERT
  WITH CHECK (candidate_id = auth.uid());

DROP POLICY IF EXISTS "Candidates can delete own blocked companies" ON public.blocked_companies;
CREATE POLICY "Candidates can delete own blocked companies"
  ON public.blocked_companies FOR DELETE
  USING (candidate_id = auth.uid());

NOTIFY pgrst, 'reload schema';
