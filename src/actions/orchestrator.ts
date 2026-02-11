"use server"

/**
 * Multi-Agent Orchestrator Server Action
 * Exposes LangGraph workflow as a Next.js server action
 */

import { enforceSize } from "@/lib/guard"
import { createLogger } from "@/lib/logger"
import { traced } from "@/lib/observability/langsmith-wrapper"
import { executeWorkflow } from "@/lib/orchestrator/multi-agent-graph"
import { saveWorkflowState } from "@/lib/orchestrator/state-persistence"
import type { AgentState } from "@/lib/orchestrator/types"
import { enforceRateLimit } from "@/lib/rate-limit"
import { createClient } from "@/lib/supabase/server"
import { randomUUID } from "crypto"

export interface OrchestratorRequest {
  userQuery: string
  organizationId?: string
  sessionId?: string
  correlationId?: string
}

export interface OrchestratorResponse {
  success: boolean
  correlationId: string
  state: AgentState
  output: string
  agent: string
  estimatedCost: number
  actualCost: number
  error?: string
}

/**
 * Process user query through multi-agent orchestrator
 * Routes to appropriate agent based on intent
 */
export const processWithOrchestrator = traced(
  'orchestrator-main',
  async (request: OrchestratorRequest): Promise<OrchestratorResponse> => {
    const correlationId = request.correlationId || randomUUID()
    const logger = createLogger({
      agent: "orchestrator",
      correlationId,
      context: { userQuery: request.userQuery }
    })

    // Validate input
    enforceSize(request.userQuery, 10000, "userQuery")

    logger.info("Orchestrator request received", {
      queryLength: request.userQuery.length,
      orgId: request.organizationId
    })

    try {
      const supabase = await createClient()

      // Get or create organization ID
      let organizationId = request.organizationId

      if (!organizationId) {
        // Get current user's organization
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          throw new Error("Authentication required")
        }

        // Get user's organization membership
        const { data: membership } = await supabase
          .from("organization_members")
          .select("organization_id")
          .eq("user_id", user.id)
          .single()

        if (!membership) {
          throw new Error("User not associated with any organization")
        }

        organizationId = membership.organization_id
      }

      // Rate limiting
      await enforceRateLimit(organizationId as string, 60)

      logger.info("Starting workflow execution", { organizationId })

      // Execute LangGraph workflow
      const finalState = await executeWorkflow(
        request.userQuery,
        organizationId as string,
        correlationId
      )

      // Persist state to Supabase
      await saveWorkflowState(finalState)

      logger.info("Workflow completed", {
        status: finalState.status,
        agent: finalState.currentAgent,
        intent: finalState.intent
      })

      // Return response
      return {
        success: finalState.status === "completed",
        correlationId: finalState.correlationId,
        state: finalState,
        output: finalState.finalOutput || "No output generated",
        agent: finalState.currentAgent,
        estimatedCost: finalState.estimatedCost,
        actualCost: finalState.actualCost,
        error: finalState.error
      }
    } catch (error) {
      logger.error("Orchestrator execution failed", error)

      return {
        success: false,
        correlationId,
        state: {
          correlationId,
          organizationId: request.organizationId || "unknown",
          userQuery: request.userQuery,
          intent: "unknown",
          confidence: 0,
          currentAgent: "navigator",
          agentHistory: [],
          routingReason: "Execution failed",
          results: {},
          estimatedCost: 0,
          actualCost: 0,
          budgetApproved: false,
          requiresHITL: false,
          hitlApproved: false,
          status: "failed",
          error: error instanceof Error ? error.message : "Unknown error",
          startedAt: new Date(),
          metadata: {}
        },
        output: "Failed to process query",
        agent: "navigator",
        estimatedCost: 0,
        actualCost: 0,
        error: error instanceof Error ? error.message : "Unknown error"
      }
    }
  }, { tags: ['agent', 'orchestrator'] })

/**
 * Get workflow history for current user's organization
 */
export async function getWorkflowHistory(limit: number = 20) {
  const logger = createLogger({ agent: "orchestrator", context: { action: "get_history" } })

  try {
    const supabase = await createClient()

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      throw new Error("Authentication required")
    }

    // Get user's organization
    const { data: membership } = await supabase
      .from("organization_members")
      .select("organization_id")
      .eq("user_id", user.id)
      .single()

    if (!membership) {
      throw new Error("User not associated with any organization")
    }

    // Query workflow states
    const { data, error } = await supabase
      .from("workflow_states")
      .select("*")
      .eq("organization_id", membership.organization_id)
      .order("started_at", { ascending: false })
      .limit(limit)

    if (error) {
      logger.error("Failed to fetch workflow history", error)
      return []
    }

    return data || []
  } catch (error) {
    logger.error("Error fetching workflow history", error)
    return []
  }
}

/**
 * Get workflow statistics for current user's organization
 */
export async function getWorkflowStats() {
  const logger = createLogger({ agent: "orchestrator", context: { action: "get_stats" } })

  try {
    const supabase = await createClient()

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      throw new Error("Authentication required")
    }

    // Get user's organization
    const { data: membership } = await supabase
      .from("organization_members")
      .select("organization_id")
      .eq("user_id", user.id)
      .single()

    if (!membership) {
      throw new Error("User not associated with any organization")
    }

    // Call RPC function
    const { data, error } = await supabase.rpc("get_workflow_stats", {
      org_id: membership.organization_id
    })

    if (error) {
      logger.error("Failed to fetch workflow stats", error)
      return null
    }

    return data
  } catch (error) {
    logger.error("Error fetching workflow stats", error)
    return null
  }
}
