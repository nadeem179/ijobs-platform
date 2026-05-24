-- Candidate settings preferences and account status

CREATE TABLE IF NOT EXISTS public.candidate_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  job_search_status TEXT,
  daily_job_recommendations BOOLEAN NOT NULL DEFAULT TRUE,
  weekly_job_recommendations BOOLEAN NOT NULL DEFAULT FALSE,
  job_status_updates BOOLEAN NOT NULL DEFAULT TRUE,
  recruiter_messages BOOLEAN NOT NULL DEFAULT TRUE,
  profile_views BOOLEAN NOT NULL DEFAULT TRUE,
  promotional_emails BOOLEAN NOT NULL DEFAULT FALSE,
  profile_visible_to_recruiters BOOLEAN NOT NULL DEFAULT TRUE,
  account_status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.candidate_settings
  ADD COLUMN IF NOT EXISTS candidate_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS job_search_status TEXT,
  ADD COLUMN IF NOT EXISTS daily_job_recommendations BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS weekly_job_recommendations BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS job_status_updates BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS recruiter_messages BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS profile_views BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS promotional_emails BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS profile_visible_to_recruiters BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS account_status TEXT NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

CREATE UNIQUE INDEX IF NOT EXISTS candidate_settings_candidate_id_key
  ON public.candidate_settings(candidate_id)
  WHERE candidate_id IS NOT NULL;

ALTER TABLE public.candidate_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Candidates can select own settings" ON public.candidate_settings;
CREATE POLICY "Candidates can select own settings"
  ON public.candidate_settings FOR SELECT
  USING (candidate_id = auth.uid());

DROP POLICY IF EXISTS "Candidates can insert own settings" ON public.candidate_settings;
CREATE POLICY "Candidates can insert own settings"
  ON public.candidate_settings FOR INSERT
  WITH CHECK (candidate_id = auth.uid());

DROP POLICY IF EXISTS "Candidates can update own settings" ON public.candidate_settings;
CREATE POLICY "Candidates can update own settings"
  ON public.candidate_settings FOR UPDATE
  USING (candidate_id = auth.uid())
  WITH CHECK (candidate_id = auth.uid());

DROP TRIGGER IF EXISTS candidate_settings_updated_at ON public.candidate_settings;
CREATE TRIGGER candidate_settings_updated_at
  BEFORE UPDATE ON public.candidate_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

NOTIFY pgrst, 'reload schema';
