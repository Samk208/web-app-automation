-- Add stripe_price_id column to proposals table
-- This is required for Stripe payment integration when accepting proposals

ALTER TABLE proposals
ADD COLUMN IF NOT EXISTS stripe_price_id TEXT;

COMMENT ON COLUMN proposals.stripe_price_id IS 'Stripe Price ID for the proposal payment (e.g., price_1234567890abcdef)';

-- Add index for faster Stripe ID lookups
CREATE INDEX IF NOT EXISTS idx_proposals_stripe_price_id
ON proposals(stripe_price_id)
WHERE stripe_price_id IS NOT NULL;
