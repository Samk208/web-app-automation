-- Update status constraint for grant_applications to support HITL and Error states

ALTER TABLE grant_applications DROP CONSTRAINT IF EXISTS grant_applications_status_check;

ALTER TABLE grant_applications ADD CONSTRAINT grant_applications_status_check 
    CHECK (status IN ('ANALYZING', 'DRAFTING', 'REVIEW_REQUIRED', 'COMPLETED', 'FAILED'));
