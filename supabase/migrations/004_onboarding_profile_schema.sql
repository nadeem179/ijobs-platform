-- Align Supabase profile tables with onboarding/profile code.
-- Forward-only and additive where possible; preserves existing rows.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT,
  onboarding_complete BOOLEAN DEFAULT FALSE,
  onboarding_step TEXT DEFAULT 'select_role',
  phone TEXT,
  location TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS full_name TEXT,
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS role TEXT,
  ADD COLUMN IF NOT EXISTS onboarding_complete BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS onboarding_step TEXT DEFAULT 'select_role',
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS location TEXT,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'profiles'
      AND column_name = 'name'
  ) THEN
    UPDATE public.profiles
    SET full_name = COALESCE(full_name, name)
    WHERE full_name IS NULL;
  END IF;
END $$;

ALTER TABLE public.profiles
  ALTER COLUMN email DROP NOT NULL,
  ALTER COLUMN full_name DROP NOT NULL,
  ALTER COLUMN avatar_url DROP NOT NULL,
  ALTER COLUMN role DROP NOT NULL,
  ALTER COLUMN onboarding_complete SET DEFAULT FALSE,
  ALTER COLUMN onboarding_step SET DEFAULT 'select_role',
  ALTER COLUMN phone DROP NOT NULL,
  ALTER COLUMN location DROP NOT NULL,
  ALTER COLUMN created_at SET DEFAULT NOW(),
  ALTER COLUMN updated_at SET DEFAULT NOW();

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_onboarding_step_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_onboarding_step_check
  CHECK (onboarding_step IS NULL OR onboarding_step IN ('select_role', 'candidate_resume', 'candidate_profile', 'recruiter_profile', 'completed'));

CREATE TABLE IF NOT EXISTS public.candidate_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  resume_url TEXT,
  current_title TEXT,
  experience_level TEXT,
  skills TEXT[],
  education TEXT,
  expected_salary TEXT,
  job_preferences JSONB,
  profile_completion INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.candidate_profiles
  ADD COLUMN IF NOT EXISTS id UUID DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS user_id UUID,
  ADD COLUMN IF NOT EXISTS resume_url TEXT,
  ADD COLUMN IF NOT EXISTS current_title TEXT,
  ADD COLUMN IF NOT EXISTS experience_level TEXT,
  ADD COLUMN IF NOT EXISTS skills TEXT[],
  ADD COLUMN IF NOT EXISTS education TEXT,
  ADD COLUMN IF NOT EXISTS expected_salary TEXT,
  ADD COLUMN IF NOT EXISTS job_preferences JSONB,
  ADD COLUMN IF NOT EXISTS profile_completion INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'candidate_profiles'
      AND column_name = 'job_preferences'
      AND data_type <> 'jsonb'
  ) THEN
    ALTER TABLE public.candidate_profiles
      ALTER COLUMN job_preferences TYPE JSONB
      USING CASE
        WHEN job_preferences IS NULL OR btrim(job_preferences::TEXT) = '' THEN NULL
        ELSE to_jsonb(job_preferences::TEXT)
      END;
  END IF;
END $$;

UPDATE public.candidate_profiles
SET
  id = COALESCE(id, gen_random_uuid()),
  skills = COALESCE(skills, ARRAY[]::TEXT[]),
  profile_completion = COALESCE(profile_completion, 0),
  created_at = COALESCE(created_at, NOW()),
  updated_at = COALESCE(updated_at, NOW());

ALTER TABLE public.candidate_profiles
  ALTER COLUMN id SET DEFAULT gen_random_uuid(),
  ALTER COLUMN id SET NOT NULL,
  ALTER COLUMN skills SET DEFAULT ARRAY[]::TEXT[],
  ALTER COLUMN profile_completion SET DEFAULT 0,
  ALTER COLUMN created_at SET DEFAULT NOW(),
  ALTER COLUMN updated_at SET DEFAULT NOW();

CREATE TABLE IF NOT EXISTS public.recruiter_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  company_name TEXT,
  company_website TEXT,
  company_size TEXT,
  industry TEXT,
  hiring_title TEXT,
  company_logo_url TEXT,
  location TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.recruiter_profiles
  ADD COLUMN IF NOT EXISTS id UUID DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS user_id UUID,
  ADD COLUMN IF NOT EXISTS company_name TEXT,
  ADD COLUMN IF NOT EXISTS company_website TEXT,
  ADD COLUMN IF NOT EXISTS company_size TEXT,
  ADD COLUMN IF NOT EXISTS industry TEXT,
  ADD COLUMN IF NOT EXISTS hiring_title TEXT,
  ADD COLUMN IF NOT EXISTS company_logo_url TEXT,
  ADD COLUMN IF NOT EXISTS location TEXT,
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

UPDATE public.recruiter_profiles
SET
  id = COALESCE(id, gen_random_uuid()),
  created_at = COALESCE(created_at, NOW()),
  updated_at = COALESCE(updated_at, NOW());

ALTER TABLE public.recruiter_profiles
  ALTER COLUMN id SET DEFAULT gen_random_uuid(),
  ALTER COLUMN id SET NOT NULL,
  ALTER COLUMN created_at SET DEFAULT NOW(),
  ALTER COLUMN updated_at SET DEFAULT NOW();

DO $$
DECLARE
  constraint_name TEXT;
BEGIN
  -- Convert old user_id primary-key onboarding tables to id primary key.
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = 'public.candidate_profiles'::regclass
      AND contype = 'p'
      AND conkey = ARRAY[
        (
          SELECT attnum
          FROM pg_attribute
          WHERE attrelid = 'public.candidate_profiles'::regclass
            AND attname = 'id'
        )
      ]::SMALLINT[]
  ) THEN
    SELECT conname INTO constraint_name
    FROM pg_constraint
    WHERE conrelid = 'public.candidate_profiles'::regclass
      AND contype = 'p';

    IF constraint_name IS NOT NULL THEN
      EXECUTE format('ALTER TABLE public.candidate_profiles DROP CONSTRAINT %I', constraint_name);
    END IF;

    ALTER TABLE public.candidate_profiles
      ADD CONSTRAINT candidate_profiles_pkey PRIMARY KEY (id);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = 'public.recruiter_profiles'::regclass
      AND contype = 'p'
      AND conkey = ARRAY[
        (
          SELECT attnum
          FROM pg_attribute
          WHERE attrelid = 'public.recruiter_profiles'::regclass
            AND attname = 'id'
        )
      ]::SMALLINT[]
  ) THEN
    SELECT conname INTO constraint_name
    FROM pg_constraint
    WHERE conrelid = 'public.recruiter_profiles'::regclass
      AND contype = 'p';

    IF constraint_name IS NOT NULL THEN
      EXECUTE format('ALTER TABLE public.recruiter_profiles DROP CONSTRAINT %I', constraint_name);
    END IF;

    ALTER TABLE public.recruiter_profiles
      ADD CONSTRAINT recruiter_profiles_pkey PRIMARY KEY (id);
  END IF;
END $$;

DO $$
DECLARE
  constraint_name TEXT;
BEGIN
  -- Replace any existing user_id foreign keys so onboarding rows point at profiles.
  FOR constraint_name IN
    SELECT conname
    FROM pg_constraint
    WHERE conrelid = 'public.candidate_profiles'::regclass
      AND contype = 'f'
      AND conkey = ARRAY[
        (
          SELECT attnum
          FROM pg_attribute
          WHERE attrelid = 'public.candidate_profiles'::regclass
            AND attname = 'user_id'
        )
      ]::SMALLINT[]
  LOOP
    EXECUTE format('ALTER TABLE public.candidate_profiles DROP CONSTRAINT %I', constraint_name);
  END LOOP;

  ALTER TABLE public.candidate_profiles
    ADD CONSTRAINT candidate_profiles_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

  FOR constraint_name IN
    SELECT conname
    FROM pg_constraint
    WHERE conrelid = 'public.recruiter_profiles'::regclass
      AND contype = 'f'
      AND conkey = ARRAY[
        (
          SELECT attnum
          FROM pg_attribute
          WHERE attrelid = 'public.recruiter_profiles'::regclass
            AND attname = 'user_id'
        )
      ]::SMALLINT[]
  LOOP
    EXECUTE format('ALTER TABLE public.recruiter_profiles DROP CONSTRAINT %I', constraint_name);
  END LOOP;

  ALTER TABLE public.recruiter_profiles
    ADD CONSTRAINT recruiter_profiles_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS candidate_profiles_user_id_key
  ON public.candidate_profiles(user_id);

CREATE UNIQUE INDEX IF NOT EXISTS recruiter_profiles_user_id_key
  ON public.recruiter_profiles(user_id);

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS candidate_profiles_updated_at ON public.candidate_profiles;
CREATE TRIGGER candidate_profiles_updated_at
  BEFORE UPDATE ON public.candidate_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS recruiter_profiles_updated_at ON public.recruiter_profiles;
CREATE TRIGGER recruiter_profiles_updated_at
  BEFORE UPDATE ON public.recruiter_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recruiter_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Profiles are publicly readable" ON public.profiles;
DROP POLICY IF EXISTS "Users can select their own profile" ON public.profiles;
CREATE POLICY "Users can select their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can select their own candidate profile" ON public.candidate_profiles;
CREATE POLICY "Users can select their own candidate profile"
  ON public.candidate_profiles FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own candidate profile" ON public.candidate_profiles;
CREATE POLICY "Users can insert their own candidate profile"
  ON public.candidate_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own candidate profile" ON public.candidate_profiles;
CREATE POLICY "Users can update their own candidate profile"
  ON public.candidate_profiles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can select their own recruiter profile" ON public.recruiter_profiles;
CREATE POLICY "Users can select their own recruiter profile"
  ON public.recruiter_profiles FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own recruiter profile" ON public.recruiter_profiles;
CREATE POLICY "Users can insert their own recruiter profile"
  ON public.recruiter_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own recruiter profile" ON public.recruiter_profiles;
CREATE POLICY "Users can update their own recruiter profile"
  ON public.recruiter_profiles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
