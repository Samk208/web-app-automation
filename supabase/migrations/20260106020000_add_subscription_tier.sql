-- Add subscription_tier to organizations table for budget enforcement

ALTER TABLE organizations
ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free'
CHECK (subscription_tier IN ('free', 'starter', 'pro', 'business', 'enterprise', 'unlimited'));

COMMENT ON COLUMN organizations.subscription_tier IS 'Subscription tier for AI budget limits (free=$10, starter=$50, pro=$100, business=$500, enterprise=$1000)';

-- Index for fast tier lookups
CREATE INDEX IF NOT EXISTS idx_organizations_subscription_tier
ON organizations(subscription_tier);

-- Set existing organizations to 'free' tier if null
UPDATE organizations
SET subscription_tier = 'free'
WHERE subscription_tier IS NULL;
