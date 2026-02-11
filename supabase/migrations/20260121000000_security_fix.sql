-- Security Hardening Migration
-- Fixes: RLS disabled, Function Search Paths, Permissive Policies, Missing Ownership Columns

-- 1. Fix Function Search Paths (Security Best Practice)
ALTER FUNCTION public.refresh_monthly_ai_costs() SET search_path = public;
ALTER FUNCTION public.update_workflow_states_updated_at() SET search_path = public;
ALTER FUNCTION public.get_workflow_stats(uuid) SET search_path = public;
ALTER FUNCTION public.is_org_member(uuid, uuid) SET search_path = public;
ALTER FUNCTION public.has_org_role(uuid, text) SET search_path = public;

-- 2. Secure Materialized View
-- Revoke public access to raw view data (should access via RPC or secure API)
REVOKE SELECT ON TABLE public.monthly_ai_costs FROM anon, authenticated;

-- 3. Secure 'integrations' table
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Integrations are viewable by authenticated users"
ON public.integrations FOR SELECT
TO authenticated
USING (true);

-- 4. Fix 'proposals' table (Missing organization_id)
-- Code already attempts to write this, but schema was missing it.
ALTER TABLE public.proposals 
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id);

ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;

-- Drop permissive policy if exists
DROP POLICY IF EXISTS "Enable all access for all users" ON public.proposals;

-- Add strict Organization-scoped policy
CREATE POLICY "Users can only access their organization's proposals"
ON public.proposals FOR ALL
TO authenticated
USING (
  organization_id IN (
    SELECT organization_id FROM public.memberships
    WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  organization_id IN (
    SELECT organization_id FROM public.memberships
    WHERE user_id = auth.uid()
  )
);

-- 5. Fix 'orders' table (Missing user_id for Trade Agent Demo)
-- Add user_id with default to current user to support client-side inserts
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid();

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable all access for all users" ON public.orders;

CREATE POLICY "Users can only access their own orders"
ON public.orders FOR ALL
TO authenticated
USING (user_id = auth.uid());

-- 6. Fix 'trade_audits'
ALTER TABLE public.trade_audits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable all access for all users" ON public.trade_audits;

-- Link audit access to the order's owner
CREATE POLICY "Users can view audits for their orders"
ON public.trade_audits FOR SELECT
TO authenticated
USING (
  order_id IN (
    SELECT id FROM public.orders WHERE user_id = auth.uid()
  )
);

-- 7. Fix 'startup_programs' (Catalog)
ALTER TABLE public.startup_programs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for all users" ON public.startup_programs;

-- Public Read
CREATE POLICY "Public Read Access"
ON public.startup_programs FOR SELECT
TO public
USING (true);

-- Service Role / Admin Write Only
CREATE POLICY "Service Role Write Access"
ON public.startup_programs FOR INSERT
TO service_role
WITH CHECK (true);

CREATE POLICY "Service Role Update Access"
ON public.startup_programs FOR UPDATE
TO service_role
USING (true);
