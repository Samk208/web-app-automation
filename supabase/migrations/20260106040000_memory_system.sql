-- Migration: Create User History Table for Long-Term Memory
-- Purpose: Store permanent record of user interactions for RAG and Audit
-- Date: 2026-01-06

CREATE TABLE IF NOT EXISTS public.user_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    
    -- Interaction Data
    session_id UUID NOT NULL, -- Correlates with Redis Session
    event_type TEXT NOT NULL, -- 'user_message', 'agent_response', 'system_event'
    content JSONB NOT NULL,   -- The actual message content or event payload
    
    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb, -- Token counts, agent names, cost info
    
    -- Temporal
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_user_history_user ON public.user_history(user_id);
CREATE INDEX idx_user_history_org ON public.user_history(organization_id);
CREATE INDEX idx_user_history_session ON public.user_history(session_id);
CREATE INDEX idx_user_history_created ON public.user_history(created_at DESC);

-- RLS Policies
ALTER TABLE public.user_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own history"
    ON public.user_history FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own history"
    ON public.user_history FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role has full access"
    ON public.user_history FOR ALL
    USING (auth.role() = 'service_role');

-- Comments
COMMENT ON TABLE public.user_history IS 'Long-term memory storage for user interactions';
