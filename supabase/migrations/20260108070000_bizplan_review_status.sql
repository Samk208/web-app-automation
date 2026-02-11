
-- Update business_plans table status check constraint
ALTER TABLE business_plans
DROP CONSTRAINT IF EXISTS business_plans_status_check;

ALTER TABLE business_plans
ADD CONSTRAINT business_plans_status_check 
CHECK (status IN ('PROCESSING', 'GENERATING', 'REVIEW_REQUIRED', 'COMPLETED', 'FAILED'));
