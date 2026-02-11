/**
 * Intent Classification for Multi-Agent Routing
 * Uses AI to classify user queries and route to appropriate agents
 */

import { defaultModel } from "@/lib/ai"
import { generateObject } from "ai"
import { z } from "zod"
import { AGENT_CONFIG, type IntentType, type AgentType } from "./types"
import { createLogger } from "@/lib/logger"

/**
 * Schema for intent classification result
 */
const IntentClassificationSchema = z.object({
  intent: z.enum([
    "business_plan",
    "grant_application",
    "product_sourcing",
    "seo_optimization",
    "proposal_writing",
    "document_conversion",
    "bookkeeping",
    "safety_compliance",
    "crm_automation",
    "startup_programs",
    "unknown"
  ]),
  confidence: z.number().min(0).max(1),
  reasoning: z.string().describe("Explanation of why this intent was chosen"),
  suggestedAgent: z.enum([
    "navigator",
    "hwp_converter",
    "kakao_crm",
    "china_source",
    "naver_seo",
    "bookkeeping",
    "proposal_gen",
    "grant_scout",
    "safety_guardian",
    "bizplan_master"
  ]),
  extractedParams: z.record(z.string(), z.any()).describe("Extracted parameters from query")
})

type IntentClassification = z.infer<typeof IntentClassificationSchema>

/**
 * Classify user intent using AI
 * Returns intent type, confidence score, and suggested agent
 */
export async function classifyIntent(
  userQuery: string,
  correlationId: string
): Promise<IntentClassification> {
  const logger = createLogger({ agent: "intent-classifier", correlationId })

  // First try keyword-based classification (fast path)
  const keywordResult = classifyByKeywords(userQuery)
  if (keywordResult.confidence > 0.8) {
    logger.info("Intent classified via keywords", {
      intent: keywordResult.intent,
      confidence: keywordResult.confidence
    })
    return keywordResult
  }

  // Fall back to AI classification for complex queries
  logger.info("Using AI for intent classification")

  const prompt = `
You are an intent classifier for a multi-agent AI system for Korean business automation.

User Query: "${userQuery}"

Available Agents and Their Capabilities:
${Object.entries(AGENT_CONFIG).map(([type, config]) => `
- ${config.name} (${type}): ${config.description}
  Keywords: ${config.keywords.join(", ")}
`).join("\n")}

Task:
1. Classify the user's intent into one of the predefined categories
2. Determine which agent should handle this query
3. Extract any relevant parameters from the query
4. Provide a confidence score (0-1)

Example Classifications:
- "Generate a business plan for TIPS" → intent: business_plan, agent: bizplan_master
- "Find me a supplier on 1688 for phone cases" → intent: product_sourcing, agent: china_source
- "Convert this HWP file to PDF" → intent: document_conversion, agent: hwp_converter
- "Match my startup to government grants" → intent: grant_application, agent: grant_scout
- "Optimize my Naver Smart Store SEO" → intent: seo_optimization, agent: naver_seo

If the query is ambiguous or doesn't match any agent's capability, classify as "unknown" and route to "navigator".
`

  try {
    const { object } = await generateObject({
      model: defaultModel,
      schema: IntentClassificationSchema,
      prompt,
    })

    logger.info("Intent classified via AI", {
      intent: object.intent,
      confidence: object.confidence,
      agent: object.suggestedAgent
    })

    return object
  } catch (error) {
    logger.error("AI intent classification failed, using fallback", error)

    // Fallback to keyword-based if AI fails
    return keywordResult.confidence > 0
      ? keywordResult
      : {
          intent: "unknown",
          confidence: 0.5,
          reasoning: "AI classification failed, routing to navigator",
          suggestedAgent: "navigator",
          extractedParams: {}
        }
  }
}

/**
 * Fast keyword-based intent classification
 * Used for common queries to avoid AI API calls
 */
function classifyByKeywords(userQuery: string): IntentClassification {
  const query = userQuery.toLowerCase()

  // Define keyword patterns for each intent
  const patterns: Array<{
    intent: IntentType
    agent: AgentType
    keywords: string[]
    confidence: number
  }> = [
    {
      intent: "business_plan",
      agent: "bizplan_master",
      keywords: ["business plan", "사업계획서", "tips business", "startup plan"],
      confidence: 0.9
    },
    {
      intent: "grant_application",
      agent: "grant_scout",
      keywords: ["grant", "tips", "mss", "nipa", "정부지원", "지원사업", "funding"],
      confidence: 0.85
    },
    {
      intent: "product_sourcing",
      agent: "china_source",
      keywords: ["1688", "alibaba", "sourcing", "supplier", "china"],
      confidence: 0.9
    },
    {
      intent: "seo_optimization",
      agent: "naver_seo",
      keywords: ["naver", "seo", "smart store", "네이버", "optimization"],
      confidence: 0.85
    },
    {
      intent: "proposal_writing",
      agent: "proposal_gen",
      keywords: ["proposal", "consulting", "제안서", "제안"],
      confidence: 0.85
    },
    {
      intent: "document_conversion",
      agent: "hwp_converter",
      keywords: ["hwp", "convert", "한글", "file conversion"],
      confidence: 0.9
    },
    {
      intent: "bookkeeping",
      agent: "bookkeeping",
      keywords: ["bookkeeping", "ledger", "transaction", "reconcile", "accounting"],
      confidence: 0.85
    },
    {
      intent: "safety_compliance",
      agent: "safety_guardian",
      keywords: ["safety", "compliance", "iot", "audit", "안전"],
      confidence: 0.85
    },
    {
      intent: "crm_automation",
      agent: "kakao_crm",
      keywords: ["kakao", "crm", "kakaotalk", "카카오"],
      confidence: 0.85
    },
    {
      intent: "startup_programs",
      agent: "navigator",
      keywords: ["k-startup", "startup program", "foreigner", "visa"],
      confidence: 0.8
    }
  ]

  // Find best matching pattern
  let bestMatch = {
    intent: "unknown" as IntentType,
    agent: "navigator" as AgentType,
    confidence: 0,
    reasoning: "No clear keyword match found",
    extractedParams: {}
  }

  for (const pattern of patterns) {
    const matches = pattern.keywords.filter(keyword =>
      query.includes(keyword.toLowerCase())
    )

    if (matches.length > 0) {
      const matchConfidence = pattern.confidence * (matches.length / pattern.keywords.length)

      if (matchConfidence > bestMatch.confidence) {
        bestMatch = {
          intent: pattern.intent,
          agent: pattern.agent,
          confidence: matchConfidence,
          reasoning: `Matched keywords: ${matches.join(", ")}`,
          extractedParams: { matchedKeywords: matches }
        }
      }
    }
  }

  return {
    intent: bestMatch.intent,
    confidence: bestMatch.confidence,
    reasoning: bestMatch.reasoning,
    suggestedAgent: bestMatch.agent,
    extractedParams: bestMatch.extractedParams
  }
}

/**
 * Map intent to agent type
 * Fallback mapping if AI doesn't provide agent suggestion
 */
export function intentToAgent(intent: IntentType): AgentType {
  const mapping: Record<IntentType, AgentType> = {
    business_plan: "bizplan_master",
    grant_application: "grant_scout",
    product_sourcing: "china_source",
    seo_optimization: "naver_seo",
    proposal_writing: "proposal_gen",
    document_conversion: "hwp_converter",
    bookkeeping: "bookkeeping",
    safety_compliance: "safety_guardian",
    crm_automation: "kakao_crm",
    startup_programs: "navigator",
    unknown: "navigator"
  }

  return mapping[intent]
}
