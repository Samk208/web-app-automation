/*
-- 1. Create Organizations Table (Handled in Base Schema, just adding cols)
-- CREATE TABLE IF NOT EXISTS organizations ...

-- ALTER TABLE organizations ADD COLUMN IF NOT EXISTS email text; -- Contact email for billing
-- ALTER TABLE organizations ADD COLUMN IF NOT EXISTS stripe_customer_id text;
-- ALTER TABLE organizations ADD COLUMN IF NOT EXISTS subscription_status text DEFAULT 'inactive';

-- 2. Add organization_id to Proposals
-- ALTER TABLE proposals 
-- ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES organizations(id);

-- 3. Add Stripe fields to Proposals (to track the closed deal)
-- ALTER TABLE proposals
-- ADD COLUMN IF NOT EXISTS accepted_at timestamptz,
-- ADD COLUMN IF NOT EXISTS stripe_subscription_id text;

-- 4. Enable RLS for Organizations
-- ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Enable all access for all users" ON organizations FOR ALL USING (true);

-- 5. Realtime
-- ALTER PUBLICATION supabase_realtime ADD TABLE organizations;

-- 6. Create Indexes
-- CREATE INDEX IF NOT EXISTS idx_organizations_stripe_customer_id ON organizations(stripe_customer_id);
-- CREATE INDEX IF NOT EXISTS idx_proposals_organization_id ON proposals(organization_id);
*/
