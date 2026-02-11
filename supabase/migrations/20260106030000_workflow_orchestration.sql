-- Migration: Multi-Agent Workflow Orchestration
-- Purpose: Track LangGraph workflow state for audit trails and recovery
-- Date: 2026-01-06

-- Workflow States Table
-- Stores complete state of each multi-agent workflow execution
CREATE TABLE IF NOT EXISTS public.workflow_states (
  -- Primary identification
  correlation_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  session_id UUID NULL, -- Optional grouping of related workflows

  -- User input
  user_query TEXT NOT NULL,
  intent TEXT NOT NULL, -- IntentType enum value
  confidence NUMERIC(3,2) NOT NULL CHECK (confidence >= 0 AND confidence <= 1),

  -- Routing & execution
  current_agent TEXT NOT NULL, -- AgentType enum value
  agent_history TEXT[] DEFAULT '{}', -- Array of agents visited
  routing_reason TEXT NOT NULL,

  -- Results
  results JSONB DEFAULT '{}'::jsonb, -- Results from each agent
  final_output TEXT NULL,

  -- Cost tracking
  estimated_cost NUMERIC(10,6) DEFAULT 0,
  actual_cost NUMERIC(10,6) DEFAULT 0,
  budget_approved BOOLEAN DEFAULT false,

  -- Human-in-the-loop
  requires_hitl BOOLEAN DEFAULT false,
  hitl_approved BOOLEAN DEFAULT false,
  hitl_feedback TEXT NULL,

  -- Status
  status TEXT NOT NULL, -- WorkflowStatus enum value
  error TEXT NULL,

  -- Timestamps
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ NULL,

  -- Additional metadata
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_workflow_states_org ON public.workflow_states(organization_id);
CREATE INDEX idx_workflow_states_status ON public.workflow_states(status);
CREATE INDEX idx_workflow_states_agent ON public.workflow_states(current_agent);
CREATE INDEX idx_workflow_states_started ON public.workflow_states(started_at DESC);
CREATE INDEX idx_workflow_states_intent ON public.workflow_states(intent);

-- Index for session grouping
CREATE INDEX idx_workflow_states_session ON public.workflow_states(session_id) WHERE session_id IS NOT NULL;

-- Trigger: Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_workflow_states_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER workflow_states_updated_at
  BEFORE UPDATE ON public.workflow_states
  FOR EACH ROW
  EXECUTE FUNCTION update_workflow_states_updated_at();

-- RPC: Get workflow statistics for an organization
CREATE OR REPLACE FUNCTION get_workflow_stats(org_id UUID)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'totalWorkflows', COUNT(*),
    'completedWorkflows', COUNT(*) FILTER (WHERE status = 'completed'),
    'failedWorkflows', COUNT(*) FILTER (WHERE status = 'failed'),
    'pendingWorkflows', COUNT(*) FILTER (WHERE status IN ('pending', 'routing', 'cost_check', 'awaiting_approval', 'executing')),
    'totalEstimatedCost', COALESCE(SUM(estimated_cost), 0),
    'totalActualCost', COALESCE(SUM(actual_cost), 0),
    'avgConfidence', COALESCE(AVG(confidence), 0),
    'hitlRequiredCount', COUNT(*) FILTER (WHERE requires_hitl = true),
    'hitlApprovedCount', COUNT(*) FILTER (WHERE hitl_approved = true),
    'agentUsage', (
      SELECT jsonb_object_agg(current_agent, agent_count)
      FROM (
        SELECT current_agent, COUNT(*) as agent_count
        FROM public.workflow_states
        WHERE organization_id = org_id
        GROUP BY current_agent
      ) agent_stats
    ),
    'intentDistribution', (
      SELECT jsonb_object_agg(intent, intent_count)
      FROM (
        SELECT intent, COUNT(*) as intent_count
        FROM public.workflow_states
        WHERE organization_id = org_id
        GROUP BY intent
      ) intent_stats
    )
  ) INTO result
  FROM public.workflow_states
  WHERE organization_id = org_id;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Row-Level Security (RLS)
ALTER TABLE public.workflow_states ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own organization's workflow states
CREATE POLICY "Users can view own org workflows"
  ON public.workflow_states
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id
      FROM public.memberships
      WHERE user_id = auth.uid()
    )
  );

-- Policy: Users can insert workflow states for their org
CREATE POLICY "Users can create workflows for own org"
  ON public.workflow_states
  FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id
      FROM public.memberships
      WHERE user_id = auth.uid()
    )
  );

-- Policy: Users can update their org's workflow states
CREATE POLICY "Users can update own org workflows"
  ON public.workflow_states
  FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id
      FROM public.memberships
      WHERE user_id = auth.uid()
    )
  );

-- Policy: Service role has full access (for server actions)
CREATE POLICY "Service role has full access"
  ON public.workflow_states
  FOR ALL
  USING (auth.role() = 'service_role');

-- Comments for documentation
COMMENT ON TABLE public.workflow_states IS 'Multi-agent workflow execution state and audit trail';
COMMENT ON COLUMN public.workflow_states.correlation_id IS 'Unique identifier for this workflow execution';
COMMENT ON COLUMN public.workflow_states.agent_history IS 'Sequential list of agents that processed this workflow';
COMMENT ON COLUMN public.workflow_states.results IS 'JSON object mapping agent names to their results';
COMMENT ON COLUMN public.workflow_states.requires_hitl IS 'Whether this workflow requires human-in-the-loop approval';
COMMENT ON COLUMN public.workflow_states.metadata IS 'Additional context and extracted parameters';

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON public.workflow_states TO authenticated;
GRANT ALL ON public.workflow_states TO service_role;
