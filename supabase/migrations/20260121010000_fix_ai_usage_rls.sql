-- Security Fix: ai_usage_logs RLS
-- Fixes: "RLS Policy Always True" lint warning
-- Restricts INSERTs to authenticated users for their own organizations only.

ALTER TABLE public.ai_usage_logs ENABLE ROW LEVEL SECURITY;

-- 1. Drop insecure "Always True" policies
DROP POLICY IF EXISTS "ai_usage_logs_insert_policy" ON public.ai_usage_logs;
-- Also checking for any other potential names from previous migrations
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.ai_usage_logs; 

-- 2. Create Strict INSERT Policy
CREATE POLICY "Users can log usage for their organizations"
ON public.ai_usage_logs FOR INSERT
TO authenticated
WITH CHECK (
  organization_id IN (
    SELECT organization_id FROM public.memberships
    WHERE user_id = auth.uid()
  )
);

-- 3. Ensure SELECT/DELETE policies are also strict (Review)
-- Existing delete/select policies usually check membership, which is fine.
-- We only touched INSERT as per the critical valid warning.
