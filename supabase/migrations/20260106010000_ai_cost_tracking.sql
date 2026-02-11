-- AI Usage Tracking and Cost Management
-- Tracks every AI call for billing, monitoring, and budget enforcement

CREATE TABLE IF NOT EXISTS ai_usage_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    agent_name TEXT NOT NULL,
    model TEXT NOT NULL,
    input_tokens INTEGER NOT NULL CHECK (input_tokens >= 0),
    output_tokens INTEGER NOT NULL CHECK (output_tokens >= 0),
    cost_usd NUMERIC(10, 6) NOT NULL CHECK (cost_usd >= 0),
    correlation_id TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index for fast org-scoped queries (monthly usage, etc.)
CREATE INDEX idx_ai_usage_org_date
ON ai_usage_logs(organization_id, created_at DESC);

-- Index for correlation ID lookups (debugging)
CREATE INDEX idx_ai_usage_correlation
ON ai_usage_logs(correlation_id)
WHERE correlation_id IS NOT NULL;

-- Index for agent analytics
CREATE INDEX idx_ai_usage_agent
ON ai_usage_logs(agent_name, created_at DESC);

-- Comments for documentation
COMMENT ON TABLE ai_usage_logs IS 'Tracks all AI API calls for cost monitoring and budget enforcement';
COMMENT ON COLUMN ai_usage_logs.organization_id IS 'Organization that made the AI call (for multi-tenant billing)';
COMMENT ON COLUMN ai_usage_logs.user_id IS 'User who triggered the AI call (can be null for system calls)';
COMMENT ON COLUMN ai_usage_logs.agent_name IS 'Which agent made the call (business-plan, proposal, etc.)';
COMMENT ON COLUMN ai_usage_logs.model IS 'AI model used (gemini-1.5-flash, gpt-4o, etc.)';
COMMENT ON COLUMN ai_usage_logs.cost_usd IS 'Calculated cost in USD based on token usage and model pricing';
COMMENT ON COLUMN ai_usage_logs.correlation_id IS 'Request correlation ID for tracing';
COMMENT ON COLUMN ai_usage_logs.metadata IS 'Additional context (prompt preview, completion preview, etc.)';

-- Row-Level Security (RLS)
ALTER TABLE ai_usage_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view logs from their organizations
CREATE POLICY ai_usage_logs_select_policy
ON ai_usage_logs
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM memberships
        WHERE memberships.organization_id = ai_usage_logs.organization_id
        AND memberships.user_id = auth.uid()
    )
);

-- Policy: Service role can insert logs (server-side tracking)
CREATE POLICY ai_usage_logs_insert_policy
ON ai_usage_logs
FOR INSERT
WITH CHECK (true); -- No restriction on INSERT (logs are system-generated)

-- Policy: Admins/owners can delete logs (for GDPR compliance)
CREATE POLICY ai_usage_logs_delete_policy
ON ai_usage_logs
FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM memberships
        WHERE memberships.organization_id = ai_usage_logs.organization_id
        AND memberships.user_id = auth.uid()
        AND memberships.role IN ('owner', 'admin')
    )
);

-- Materialized view for fast monthly cost aggregation (optional optimization)
CREATE MATERIALIZED VIEW IF NOT EXISTS monthly_ai_costs AS
SELECT
    organization_id,
    DATE_TRUNC('month', created_at) AS month,
    COUNT(*) AS call_count,
    SUM(input_tokens) AS total_input_tokens,
    SUM(output_tokens) AS total_output_tokens,
    SUM(cost_usd) AS total_cost_usd,
    ARRAY_AGG(DISTINCT agent_name) AS agents_used,
    ARRAY_AGG(DISTINCT model) AS models_used
FROM ai_usage_logs
GROUP BY organization_id, DATE_TRUNC('month', created_at);

-- Index on materialized view for fast lookups
CREATE UNIQUE INDEX idx_monthly_ai_costs_org_month
ON monthly_ai_costs(organization_id, month DESC);

COMMENT ON MATERIALIZED VIEW monthly_ai_costs IS 'Pre-aggregated monthly AI costs for fast budget checks (refresh hourly)';

-- Function to refresh materialized view (call from cron or after batch inserts)
CREATE OR REPLACE FUNCTION refresh_monthly_ai_costs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY monthly_ai_costs;
END;
$$;

COMMENT ON FUNCTION refresh_monthly_ai_costs IS 'Refreshes the monthly_ai_costs materialized view (call hourly via pg_cron)';
