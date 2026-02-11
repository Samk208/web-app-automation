/**
 * State Persistence Layer for Multi-Agent Orchestrator
 * Stores workflow state in Supabase for audit trails and recovery
 */

import { createClient } from "@/lib/supabase/server"
import { createLogger } from "@/lib/logger"
import type { AgentState } from "./types"

/**
 * Save workflow state to Supabase
 * Stores complete state for audit and recovery purposes
 */
export async function saveWorkflowState(state: AgentState): Promise<void> {
  const logger = createLogger({
    agent: "orchestrator",
    correlationId: state.correlationId,
    context: { action: "save_state" }
  })

  try {
    const supabase = await createClient()

    const record = {
      correlation_id: state.correlationId,
      organization_id: state.organizationId,
      session_id: state.sessionId,
      user_query: state.userQuery,
      intent: state.intent,
      confidence: state.confidence,
      current_agent: state.currentAgent,
      agent_history: state.agentHistory,
      routing_reason: state.routingReason,
      results: state.results,
      final_output: state.finalOutput,
      estimated_cost: state.estimatedCost,
      actual_cost: state.actualCost,
      budget_approved: state.budgetApproved,
      requires_hitl: state.requiresHITL,
      hitl_approved: state.hitlApproved,
      hitl_feedback: state.hitlFeedback,
      status: state.status,
      error: state.error,
      started_at: state.startedAt.toISOString(),
      completed_at: state.completedAt?.toISOString(),
      metadata: state.metadata,
    }

    const { error } = await supabase
      .from("workflow_states")
      .upsert(record, { onConflict: "correlation_id" })

    if (error) {
      logger.error("Failed to save workflow state", error)
      // Don't throw - state persistence is non-critical
    } else {
      logger.info("Workflow state saved", { correlationId: state.correlationId })
    }
  } catch (error) {
    logger.error("State persistence error", error)
    // Non-fatal - continue execution
  }
}

/**
 * Load workflow state from Supabase
 * Allows resuming interrupted workflows
 */
export async function loadWorkflowState(
  correlationId: string
): Promise<AgentState | null> {
  const logger = createLogger({
    agent: "orchestrator",
    context: { action: "load_state", correlationId }
  })

  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("workflow_states")
      .select("*")
      .eq("correlation_id", correlationId)
      .single()

    if (error || !data) {
      logger.warn("Workflow state not found", { correlationId })
      return null
    }

    // Reconstruct AgentState from database record
    const state: AgentState = {
      correlationId: data.correlation_id,
      organizationId: data.organization_id,
      sessionId: data.session_id,
      userQuery: data.user_query,
      intent: data.intent,
      confidence: data.confidence,
      currentAgent: data.current_agent,
      agentHistory: data.agent_history || [],
      routingReason: data.routing_reason,
      results: data.results || {},
      finalOutput: data.final_output,
      estimatedCost: data.estimated_cost,
      actualCost: data.actual_cost,
      budgetApproved: data.budget_approved,
      requiresHITL: data.requires_hitl,
      hitlApproved: data.hitl_approved,
      hitlFeedback: data.hitl_feedback,
      status: data.status,
      error: data.error,
      startedAt: new Date(data.started_at),
      completedAt: data.completed_at ? new Date(data.completed_at) : undefined,
      metadata: data.metadata || {},
    }

    logger.info("Workflow state loaded", { correlationId })
    return state
  } catch (error) {
    logger.error("Failed to load workflow state", error)
    return null
  }
}

/**
 * Query workflow states by organization
 * Useful for dashboards and analytics
 */
export async function getOrganizationWorkflows(
  organizationId: string,
  limit: number = 50
): Promise<AgentState[]> {
  const logger = createLogger({
    agent: "orchestrator",
    context: { action: "query_workflows", organizationId }
  })

  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("workflow_states")
      .select("*")
      .eq("organization_id", organizationId)
      .order("started_at", { ascending: false })
      .limit(limit)

    if (error) {
      logger.error("Failed to query workflows", error)
      return []
    }

    // Map to AgentState array
    return (
      data?.map((record) => ({
        correlationId: record.correlation_id,
        organizationId: record.organization_id,
        sessionId: record.session_id,
        userQuery: record.user_query,
        intent: record.intent,
        confidence: record.confidence,
        currentAgent: record.current_agent,
        agentHistory: record.agent_history || [],
        routingReason: record.routing_reason,
        results: record.results || {},
        finalOutput: record.final_output,
        estimatedCost: record.estimated_cost,
        actualCost: record.actual_cost,
        budgetApproved: record.budget_approved,
        requiresHITL: record.requires_hitl,
        hitlApproved: record.hitl_approved,
        hitlFeedback: record.hitl_feedback,
        status: record.status,
        error: record.error,
        startedAt: new Date(record.started_at),
        completedAt: record.completed_at ? new Date(record.completed_at) : undefined,
        metadata: record.metadata || {},
      })) || []
    )
  } catch (error) {
    logger.error("Failed to query workflows", error)
    return []
  }
}

/**
 * Get workflow statistics for an organization
 * Useful for analytics and monitoring
 */
export async function getWorkflowStats(organizationId: string) {
  const logger = createLogger({
    agent: "orchestrator",
    context: { action: "workflow_stats", organizationId }
  })

  try {
    const supabase = await createClient()

    // Query aggregated statistics
    const { data, error } = await supabase.rpc("get_workflow_stats", {
      org_id: organizationId,
    })

    if (error) {
      logger.warn("Stats RPC not available, using basic query", error)

      // Fallback to basic query
      const { data: workflows } = await supabase
        .from("workflow_states")
        .select("status, current_agent, estimated_cost, actual_cost")
        .eq("organization_id", organizationId)

      if (!workflows) return null

      // Calculate basic stats
      return {
        totalWorkflows: workflows.length,
        completedWorkflows: workflows.filter((w) => w.status === "completed").length,
        failedWorkflows: workflows.filter((w) => w.status === "failed").length,
        totalEstimatedCost: workflows.reduce((sum, w) => sum + (w.estimated_cost || 0), 0),
        totalActualCost: workflows.reduce((sum, w) => sum + (w.actual_cost || 0), 0),
        agentUsage: workflows.reduce((acc, w) => {
          acc[w.current_agent] = (acc[w.current_agent] || 0) + 1
          return acc
        }, {} as Record<string, number>),
      }
    }

    return data
  } catch (error) {
    logger.error("Failed to get workflow stats", error)
    return null
  }
}
