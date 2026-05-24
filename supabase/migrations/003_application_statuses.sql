-- Align application statuses with the candidate application flow.
UPDATE applications
SET status = 'shortlisted'
WHERE status IN ('reviewing', 'interview');

ALTER TABLE applications
DROP CONSTRAINT IF EXISTS applications_status_check;

ALTER TABLE applications
ADD CONSTRAINT applications_status_check
CHECK (status IN ('applied', 'shortlisted', 'rejected', 'hired'));

