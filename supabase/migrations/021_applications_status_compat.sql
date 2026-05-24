-- Repair compatibility for environments where applications.status was missed or schema cache lagged.

ALTER TABLE public.applications
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'applied';

UPDATE public.applications
SET status = 'applied'
WHERE status IS NULL;

ALTER TABLE public.applications
  DROP CONSTRAINT IF EXISTS applications_status_check;

ALTER TABLE public.applications
  ADD CONSTRAINT applications_status_check
  CHECK (status IN ('applied', 'shortlisted', 'rejected', 'hired'));

CREATE INDEX IF NOT EXISTS idx_applications_status
  ON public.applications(status);

NOTIFY pgrst, 'reload schema';
