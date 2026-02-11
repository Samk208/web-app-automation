-- Add reviewer_note to approval_requests
-- This column is required by the frontend interface but was missing in previous migrations

ALTER TABLE approval_requests 
ADD COLUMN IF NOT EXISTS reviewer_note TEXT;

COMMENT ON COLUMN approval_requests.reviewer_note IS 'Optional note added by the reviewer when approving or rejecting';
