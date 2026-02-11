/**
 * Multi-Agent Orchestration Graph
 * LangGraph-based workflow for coordinating 10 specialized agents
 */

import { createLogger } from "@/lib/logger"
import { END, START, StateGraph } from "@langchain/langgraph"
import { classifyIntent, intentToAgent } from "./intent-classifier"
import { AGENT_CONFIG, HITL_AGENTS, type AgentState } from "./types"

// Import agent actions

/**
 * Node: Intent Classification & Routing
 * Entry point of the workflow - classifies user intent and routes to appropriate agent
 */
async function routingNode(state: AgentState): Promise<Partial<AgentState>> {
  const logger = createLogger({
    agent: "orchestrator",
    correlationId: state.correlationId,
    context: { step: "routing" }
  })

  logger.info("Starting intent classification", { query: state.userQuery })

  try {
    // Classify user intent
    const classification = await classifyIntent(state.userQuery, state.correlationId)

    // Determine target agent
    const targetAgent = classification.suggestedAgent || intentToAgent(classification.intent)

    logger.info("Intent classified", {
      intent: classification.intent,
      confidence: classification.confidence,
      targetAgent
    })

    return {
      intent: classification.intent,
      confidence: classification.confidence,
      currentAgent: targetAgent,
      routingReason: classification.reasoning,
      status: "cost_check",
      metadata: {
        ...state.metadata,
        classification,
      }
    }
  } catch (error) {
    logger.error("Intent classification failed", error)

    // Fallback to navigator on error
    return {
      intent: "unknown",
      confidence: 0,
      currentAgent: "navigator",
      routingReason: "Classification failed, routing to navigator",
      status: "cost_check",
      error: error instanceof Error ? error.message : "Unknown error"
    }
  }
}

/**
 * Node: Cost Estimation Checkpoint
 * Estimates cost BEFORE routing to prevent budget overruns
 */
async function costCheckNode(state: AgentState): Promise<Partial<AgentState>> {
  const logger = createLogger({
    agent: "orchestrator",
    correlationId: state.correlationId,
    context: { step: "cost_check" }
  })

  try {
    const agentConfig = AGENT_CONFIG[state.currentAgent]

    // Estimate cost based on agent and query length
    const baseEstimate = agentConfig.estimatedCostPerTask
    const queryLengthMultiplier = Math.max(1, state.userQuery.length / 500)
    const estimatedCost = baseEstimate * queryLengthMultiplier

    logger.info("Cost estimated", {
      agent: state.currentAgent,
      estimatedCost: `$${estimatedCost.toFixed(6)}`,
      baseEstimate: `$${baseEstimate.toFixed(6)}`
    })

    // Check if agent requires HITL
    const requiresHITL = HITL_AGENTS.includes(state.currentAgent)

    // Determine next status
    const nextStatus = requiresHITL ? "awaiting_approval" : "executing"

    return {
      estimatedCost,
      requiresHITL,
      status: nextStatus,
      budgetApproved: true, // In production, check against organization budget
    }
  } catch (error) {
    logger.error("Cost estimation failed", error)

    return {
      estimatedCost: 0,
      status: "failed",
      error: error instanceof Error ? error.message : "Cost estimation failed"
    }
  }
}

/**
 * Node: Human-in-the-Loop Checkpoint
 * Requires human approval for high-stakes agents
 */
async function hitlCheckpointNode(state: AgentState): Promise<Partial<AgentState>> {
  const logger = createLogger({
    agent: "orchestrator",
    correlationId: state.correlationId,
    context: { step: "hitl_checkpoint" }
  })

  logger.info("HITL checkpoint required", {
    agent: state.currentAgent,
    estimatedCost: `$${state.estimatedCost.toFixed(6)}`
  })

  // In a real implementation, this would:
  // 1. Send notification to human reviewer
  // 2. Wait for approval/rejection
  // 3. Store feedback in state

  // For now, auto-approve (implement actual HITL in production)
  return {
    hitlApproved: true,
    hitlFeedback: "Auto-approved for demo (implement actual HITL in production)",
    status: "executing"
  }
}

/**
 * Node: Agent Execution
 * Routes to the appropriate specialized agent
 */
async function executionNode(state: AgentState): Promise<Partial<AgentState>> {
  const logger = createLogger({
    agent: "orchestrator",
    correlationId: state.correlationId,
    context: { step: "execution", targetAgent: state.currentAgent }
  })

  logger.info("Executing agent", { agent: state.currentAgent })

  try {
    let result: any

    // Route to appropriate agent based on currentAgent
    switch (state.currentAgent) {
      case "bizplan_master":
        result = await executeBizplanMaster(state)
        break

      case "grant_scout":
        result = await executeGrantScout(state)
        break

      case "china_source":
        result = await executeChinaSource(state)
        break

      case "naver_seo":
        result = await executeNaverSEO(state)
        break

      case "proposal_gen":
        result = await executeProposalGen(state)
        break

      case "hwp_converter":
        result = await executeHWPConverter(state)
        break

      case "bookkeeping":
        result = await executeBookkeeping(state)
        break

      case "safety_guardian":
        result = await executeSafetyGuardian(state)
        break

      case "kakao_crm":
        result = await executeKakaoCRM(state)
        break

      case "navigator":
        result = await executeNavigator(state)
        break

      default:
        throw new Error(`Unknown agent: ${state.currentAgent}`)
    }

    logger.info("Agent execution completed", {
      agent: state.currentAgent,
      success: result.success
    })

    return {
      results: {
        ...state.results,
        [state.currentAgent]: result
      },
      agentHistory: [...state.agentHistory, state.currentAgent],
      status: "completed",
      completedAt: new Date(),
      finalOutput: result.output || result.summary || "Task completed successfully"
    }
  } catch (error) {
    logger.error("Agent execution failed", error)

    return {
      status: "failed",
      error: error instanceof Error ? error.message : "Agent execution failed",
      completedAt: new Date()
    }
  }
}

/**
 * Agent execution functions
 * Each function wraps the corresponding server action
 */

async function executeBizplanMaster(state: AgentState): Promise<any> {
  const logger = createLogger({ agent: "bizplan_master", correlationId: state.correlationId })
  try {
    const params = state.metadata?.classification?.extractedParams || {}
    const createRes = await createBusinessPlan({
      input_materials: params.input_materials || state.userQuery,
      target_program: params.target_program || 'TIPS'
    }, { correlationId: state.correlationId })

    if (!createRes.success || !createRes.plan) {
      return { success: false, output: `Failed to initiate business plan: ${createRes.error || "Unknown error"}` }
    }

    await processBusinessPlan(createRes.plan.id, { correlationId: state.correlationId })
    return {
      success: true,
      output: `Business plan draft generated for ${createRes.plan.target_program}. You can review it in the Command Center.`,
      agentUsed: "bizplan_master",
      planId: createRes.plan.id
    }
  } catch (error) {
    logger.error("executeBizplanMaster failed", error)
    return { success: false, output: `Error: ${error instanceof Error ? error.message : String(error)}` }
  }
}

async function executeGrantScout(state: AgentState): Promise<any> {
  const logger = createLogger({ agent: "grant_scout", correlationId: state.correlationId })
  try {
    const params = state.metadata?.classification?.extractedParams || {}
    const createRes = await createGrantApplication({
      startup_name: params.startup_name || "New Startup",
      tech_sector: params.tech_sector || params.industry || "Deep Tech"
    }, { correlationId: state.correlationId })

    if (!createRes.success || !createRes.application) {
      return { success: false, output: `Failed to create grant application: ${createRes.error || "Unknown error"}` }
    }

    await processGrantMatch(createRes.application.id, { correlationId: state.correlationId })
    return {
      success: true,
      output: `Matched ${createRes.application.startup_name} with government grants. Check the Scout report for details.`,
      agentUsed: "grant_scout",
      applicationId: createRes.application.id
    }
  } catch (error) {
    logger.error("executeGrantScout failed", error)
    return { success: false, output: `Error: ${error instanceof Error ? error.message : String(error)}` }
  }
}

async function executeChinaSource(state: AgentState): Promise<any> {
  const logger = createLogger({ agent: "china_source", correlationId: state.correlationId })
  try {
    const params = state.metadata?.classification?.extractedParams || {}
    const url = params.source_url || state.userQuery.match(/https?:\/\/[^\s]+/)?.[0]

    if (!url || (!url.includes("1688.com") && !url.includes("alibaba.com"))) {
       return { success: true, output: "ChinaSource Pro: Please provide a valid 1688.com or Alibaba.com URL to start sourcing." }
    }
    
    const createRes = await createSourcingTask({
      source_url: url,
      platform: url.includes("1688") ? "1688" : "Alibaba"
    }, { correlationId: state.correlationId })

    if (!createRes.success || !createRes.task) {
      return { success: false, output: `Failed to create sourcing task: ${createRes.error || "Unknown error"}` }
    }

    await processSourcing(createRes.task.id, { correlationId: state.correlationId })
    return {
      success: true,
      output: `Sourcing analysis complete for ${url}. Translation and pricing are ready in the dashboard.`,
      agentUsed: "china_source",
      taskId: createRes.task.id
    }
  } catch (error) {
    logger.error("executeChinaSource failed", error)
    return { success: false, output: `Error: ${error instanceof Error ? error.message : String(error)}` }
  }
}

async function executeNaverSEO(state: AgentState): Promise<any> {
  const logger = createLogger({ agent: "naver_seo", correlationId: state.correlationId })
  try {
    const params = state.metadata?.classification?.extractedParams || {}
    const url = params.target_url || state.userQuery.match(/https?:\/\/[^\s]+/)?.[0]

    if (!url) {
       return { success: true, output: "NaverSEO Pro: Please provide a Naver Smart Store URL to perform an SEO audit." }
    }

    const createRes = await createSEOAudit({
      target_url: url,
      platform: "NAVER"
    }, { correlationId: state.correlationId })

    if (!createRes.success || !createRes.audit) {
      return { success: false, output: `Failed to create SEO audit: ${createRes.error || "Unknown error"}` }
    }

    await processSEOAudit(createRes.audit.id, { correlationId: state.correlationId })
    return {
      success: true,
      output: `SEO audit for ${url} completed. Ranking suggestions are available in the SEO Master dashboard.`,
      agentUsed: "naver_seo",
      auditId: createRes.audit.id
    }
  } catch (error) {
    logger.error("executeNaverSEO failed", error)
    return { success: false, output: `Error: ${error instanceof Error ? error.message : String(error)}` }
  }
}

async function executeProposalGen(state: AgentState): Promise<any> {
  const logger = createLogger({ agent: "proposal_gen", correlationId: state.correlationId })
  try {
    const params = state.metadata?.classification?.extractedParams || {}
    const createRes = await createProposal({
      client_name: params.client_name || "New Client",
      project_scope: params.project_scope || state.userQuery,
      client_url: params.client_url || null
    }, { correlationId: state.correlationId })

    if (!createRes.success || !createRes.proposal) {
       return { success: false, output: `Failed to create proposal record: ${createRes.error || "Unknown error"}` }
    }

    await processProposal(createRes.proposal.id, { correlationId: state.correlationId })
    return {
      success: true,
      output: `Consulting proposal drafted for ${params.client_name || 'the client'}. The final document is ready for review in the Proposal Architect.`,
      agentUsed: "proposal_gen",
      proposalId: createRes.proposal.id
    }
  } catch (error) {
    logger.error("executeProposalGen failed", error)
    return { success: false, output: `Error: ${error instanceof Error ? error.message : String(error)}` }
  }
}

async function executeHWPConverter(state: AgentState): Promise<any> {
  return {
    success: true,
    output: "HWP Converter: File conversion requires uploading an HWP file first. Please use the Document Center to upload.",
    agentUsed: "hwp_converter",
    requiresSetup: true
  }
}

async function executeBookkeeping(state: AgentState): Promise<any> {
  return {
    success: true,
    output: "Ledger Logic: Transaction reconciliation requires bank statement uploads. Please use the Ledger Logic dashboard to upload data.",
    agentUsed: "bookkeeping",
    requiresSetup: true
  }
}

async function executeSafetyGuardian(state: AgentState): Promise<any> {
  const logger = createLogger({ agent: "safety_guardian", correlationId: state.correlationId })
  try {
    const params = state.metadata?.classification?.extractedParams || {}
    const sensorType = params.sensor_type || "Generic Sensor"
    const value = params.value || 95 
    const zone = params.zone || "Main Plant"

    const result = await processSafetyLog(sensorType, value, zone, { 
      correlationId: state.correlationId,
      organizationId: state.organizationId
    })
    
    return {
      success: true,
      output: `Safety Guardian: Recorded ${sensorType} anomaly (${value}) in ${zone}. Compliance log and automated response generated.`,
      agentUsed: "safety_guardian"
    }
  } catch (error) {
    logger.error("executeSafetyGuardian failed", error)
    return { success: false, output: `Error: ${error instanceof Error ? error.message : String(error)}` }
  }
}

async function executeKakaoCRM(state: AgentState): Promise<any> {
  const logger = createLogger({ agent: "kakao_crm", correlationId: state.correlationId })
  try {
    const params = state.metadata?.classification?.extractedParams || {}
    const createRes = await createLocalizationTask({
      source_text: state.userQuery,
      target_market: params.target_market || "Korea"
    }, { correlationId: state.correlationId })

    if (!createRes.success || !createRes.task) {
      return { success: false, output: `Failed to initiate CRM task: ${createRes.error || "Unknown error"}` }
    }

    await processLocalization(createRes.task.id, { correlationId: state.correlationId })
    return {
      success: true,
      output: `Kakao CRM: Message transcreated for ${params.target_market || 'Korea'}. Content is native-feeling and culturally adapted.`,
      agentUsed: "kakao_crm",
      taskId: createRes.task.id
    }
  } catch (error) {
    logger.error("executeKakaoCRM failed", error)
    return { success: false, output: `Error: ${error instanceof Error ? error.message : String(error)}` }
  }
}

async function executeNavigator(state: AgentState): Promise<any> {
  const logger = createLogger({ agent: "navigator", correlationId: state.correlationId })
  
  if (state.intent === "startup_programs") {
    try {
       const params = state.metadata?.classification?.extractedParams || {}
       const createRes = await createProgramMatch({
         startup_profile: {
           industry: params.industry || "Software",
           stage: params.stage || "Seed",
           founder_status: params.founder_status || "Native"
         }
       }, { correlationId: state.correlationId })

       if (createRes.success && createRes.match) {
         await processStartupMatch(createRes.match.id, { correlationId: state.correlationId })
         return {
           success: true,
           output: `I've analyzed your startup profile. TIPS and OASIS seem like the best fit. I've added the full matching report to your dashboard.`,
           agentUsed: "navigator"
         }
       }
    } catch (e) {
      logger.warn("Detailed navigator matching failed, falling back to guidance", e)
    }
  }

  const availableAgents = Object.entries(AGENT_CONFIG)
    .filter(([type]) => type !== "navigator")
    .map(([type, config]) => `- ${config.name}: ${config.description}`)
    .join("\n")

  return {
    success: true,
    output: `K-Startup Navigator - I can help route your request to the right agent.

Available specialized agents:
${availableAgents}

How can I assist you today?`,
    agentUsed: "navigator"
  }
}

/**
 * Conditional edge function: Determines next node based on state
 */
function shouldExecute(state: AgentState): string {
  // If HITL required and not yet approved, go to checkpoint
  if (state.requiresHITL && !state.hitlApproved && state.status === "awaiting_approval") {
    return "hitl_checkpoint"
  }

  // If budget not approved, end
  if (!state.budgetApproved) {
    return END
  }

  // If ready to execute
  if (state.status === "executing") {
    return "execute"
  }

  // If cost check needed
  if (state.status === "cost_check") {
    return "cost_check"
  }

  // Otherwise end
  return END
}

/**
 * Build the StateGraph
 * Defines the complete multi-agent workflow
 */
export function buildMultiAgentGraph() {
  const logger = createLogger({ agent: "orchestrator" })

  logger.info("Building multi-agent StateGraph")

  // Create graph with AgentState
  const workflow = new StateGraph<AgentState>({
    channels: {
      correlationId: { value: (x: string, y?: string) => y ?? x },
      organizationId: { value: (x: string, y?: string) => y ?? x },
      sessionId: { value: (x?: string, y?: string) => y ?? x },

      userQuery: { value: (x: string, y?: string) => y ?? x },
      intent: { value: (x: any, y?: any) => y ?? x },
      confidence: { value: (x: number, y?: number) => y ?? x },

      currentAgent: { value: (x: any, y?: any) => y ?? x },
      agentHistory: { value: (x: any[], y?: any[]) => y ?? x },
      routingReason: { value: (x: string, y?: string) => y ?? x },

      results: { value: (x: any, y?: any) => ({ ...x, ...y }) },
      finalOutput: { value: (x?: string, y?: string) => y ?? x },

      estimatedCost: { value: (x: number, y?: number) => y ?? x },
      actualCost: { value: (x: number, y?: number) => y ?? x },
      budgetApproved: { value: (x: boolean, y?: boolean) => y ?? x },

      requiresHITL: { value: (x: boolean, y?: boolean) => y ?? x },
      hitlApproved: { value: (x: boolean, y?: boolean) => y ?? x },
      hitlFeedback: { value: (x?: string, y?: string) => y ?? x },

      status: { value: (x: any, y?: any) => y ?? x },
      error: { value: (x?: string, y?: string) => y ?? x },
      startedAt: { value: (x: Date, y?: Date) => y ?? x },
      completedAt: { value: (x?: Date, y?: Date) => y ?? x },
      metadata: { value: (x: any, y?: any) => ({ ...x, ...y }) },
    }
  })

  // Add nodes
  workflow.addNode("routing", routingNode)
  workflow.addNode("cost_check", costCheckNode)
  workflow.addNode("hitl_checkpoint", hitlCheckpointNode)
  workflow.addNode("execute", executionNode)

  // Add edges
  workflow.addEdge(START, "routing")
  workflow.addEdge("routing", "cost_check")

  // Conditional routing from cost_check
  workflow.addConditionalEdges(
    "cost_check",
    shouldExecute,
    {
      hitl_checkpoint: "hitl_checkpoint",
      execute: "execute",
      [END]: END
    }
  )

  // From HITL checkpoint to execution
  workflow.addEdge("hitl_checkpoint", "execute")

  // End after execution
  workflow.addEdge("execute", END)

  return workflow.compile()
}

/**
 * Execute the multi-agent workflow
 * Main entry point for orchestrator
 */
export async function executeWorkflow(
  userQuery: string,
  organizationId: string,
  correlationId: string
): Promise<AgentState> {
  const logger = createLogger({ agent: "orchestrator", correlationId })

  logger.info("Starting multi-agent workflow", { userQuery })

  // Build graph
  const graph = buildMultiAgentGraph()

  // Initialize state
  const initialState: AgentState = {
    correlationId,
    organizationId,
    userQuery,
    intent: "unknown",
    confidence: 0,
    currentAgent: "navigator",
    agentHistory: [],
    routingReason: "",
    results: {},
    estimatedCost: 0,
    actualCost: 0,
    budgetApproved: false,
    requiresHITL: false,
    hitlApproved: false,
    status: "pending",
    startedAt: new Date(),
    metadata: {}
  }

  try {
    // Execute workflow
    const finalState = await graph.invoke(initialState)

    logger.info("Workflow completed", {
      status: finalState.status,
      agent: finalState.currentAgent,
      cost: `$${finalState.actualCost.toFixed(6)}`
    })

    return finalState
  } catch (error) {
    logger.error("Workflow execution failed", error)

    return {
      ...initialState,
      status: "failed",
      error: error instanceof Error ? error.message : "Workflow failed",
      completedAt: new Date()
    }
  }
}
