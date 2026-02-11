-- Add missing 'agent' column to approval_requests table
-- This is required for HITL (Human-in-the-Loop) workflows

-- Check if table exists, if not create it
CREATE TABLE IF NOT EXISTS approval_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    resource_type TEXT NOT NULL,
    resource_id UUID NOT NULL,
    agent TEXT, -- This column was missing
    summary TEXT NOT NULL,
    data JSONB,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    reviewed_by UUID REFERENCES auth.users(id),
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add agent column if it doesn't exist (for existing tables)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'approval_requests' AND column_name = 'agent'
    ) THEN
        ALTER TABLE approval_requests ADD COLUMN agent TEXT;
    END IF;
END $$;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_approval_requests_organization
ON approval_requests(organization_id);

CREATE INDEX IF NOT EXISTS idx_approval_requests_status
ON approval_requests(status) WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS idx_approval_requests_agent
ON approval_requests(agent) WHERE agent IS NOT NULL;

-- Enable RLS
ALTER TABLE approval_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their org's approval requests"
ON approval_requests
FOR SELECT
TO authenticated
USING (
    organization_id IN (
        SELECT organization_id
        FROM memberships
        WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Agents can create approval requests"
ON approval_requests
FOR INSERT
TO authenticated
WITH CHECK (
    organization_id IN (
        SELECT organization_id
        FROM memberships
        WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Admins can update approval requests"
ON approval_requests
FOR UPDATE
TO authenticated
USING (
    organization_id IN (
        SELECT organization_id
        FROM memberships
        WHERE user_id = auth.uid()
        AND role IN ('admin', 'owner')
    )
)
WITH CHECK (
    organization_id IN (
        SELECT organization_id
        FROM memberships
        WHERE user_id = auth.uid()
        AND role IN ('admin', 'owner')
    )
);

COMMENT ON TABLE approval_requests IS 'HITL approval queue for agent-generated content';
COMMENT ON COLUMN approval_requests.agent IS 'Name of the agent that created this request (e.g., business-plan, proposal)';
