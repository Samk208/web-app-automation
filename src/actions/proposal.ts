"use server"

import { defaultModel } from "@/lib/ai"
import { enforceBudgetCap, estimatePromptCost } from "@/lib/ai/cost-guard"
import { trackAICost } from "@/lib/ai/cost-tracker"
import { requireResourceAccess } from "@/lib/auth/authorization"
import { Errors, handleAPIError } from "@/lib/error-handler"
import { createLogger } from "@/lib/logger"
import { generateAndUploadDocument } from "@/lib/mcp/document-helpers"
import { traced, tracedGenerateObject } from "@/lib/observability/langsmith-wrapper"
import { getActiveOrg } from "@/lib/org-context"
import { enforceRateLimit } from "@/lib/rate-limit-redis"
import { createClient } from "@/lib/supabase/server"
import { SafeStringSchema, URLSchema } from "@/lib/validation/schemas"
import { z } from "zod"

const ProposalSchema = z.object({
    brand_voice: z.object({
        tone: z.string().describe("e.g. Professional, Innovative, Empathetic"),
        keywords: z.array(z.string()).describe("Key brand terms found in client URL")
    }),
    content: z.string().describe("The full markdown content of the proposal")
})

export async function createProposal(input: any, opts?: { correlationId?: string }) {
    const logger = createLogger({ agent: "proposal", correlationId: opts?.correlationId })
    try {
        const { organization_id } = await getActiveOrg()
        const supabase = await createClient()

        const { data, error } = await supabase
            .from('proposals')
            .insert({
                title: input.title || `Proposal for ${input.client_name || 'Client'}`,
                project_scope: input.project_scope || input.description || "Consulting services",
                client_name: input.client_name || "Valued Client",
                client_url: input.client_url || null,
                status: 'PENDING',
                organization_id
            })
            .select()
            .single()

        if (error || !data) {
            logger.error("Failed to create proposal", error)
            throw Errors.internal("Failed to create proposal")
        }

        return { success: true, proposal: data }
    } catch (err) {
        const sanitized = handleAPIError(err, { service: "proposal", correlationId: opts?.correlationId })
        return { success: false, error: sanitized.error }
    }
}

export const processProposal = traced(
    'proposal-generation',
    async (proposalId: string, opts?: { correlationId?: string }) => {
        const logger = createLogger({
            agent: "proposal",
            correlationId: opts?.correlationId,
            context: { proposalId }
        })

        try {
            // 1. Validate proposalId format
            const idSchema = z.string().uuid("Invalid proposal ID format")
            idSchema.parse(proposalId)

            // 2. Verify authorization - user must have access to this proposal
            const auth = await requireResourceAccess('proposals', proposalId)

            logger.info("Authorization verified", {
                userId: auth.userId,
                organizationId: auth.organizationId,
                role: auth.role
            })

            const supabase = await createClient()

            // 3. Fetch proposal with ownership verification
            const { data: proposal, error } = await supabase
                .from('proposals')
                .select('*')
                .eq('id', proposalId)
                .eq('organization_id', auth.organizationId) // Double-check ownership
                .single()

            if (error || !proposal) {
                logger.error("Proposal not found", { proposalId, error })
                throw Errors.notFound("Proposal")
            }

            // 4. Rate limiting (10 requests per minute per org)
            await enforceRateLimit(`proposal:${auth.organizationId}`, 10)

            // 5. Validate input fields
            if (!proposal.project_scope || proposal.project_scope.length < 20) {
                logger.error("Project scope too short", {
                    proposalId,
                    length: proposal.project_scope?.length || 0
                })
                throw Errors.validation("Project scope must be at least 20 characters")
            }

            if (proposal.project_scope.length > 10000) {
                logger.error("Project scope too long", {
                    proposalId,
                    length: proposal.project_scope.length
                })
                throw Errors.validation("Project scope too long (max 10,000 characters)")
            }

            // Validate client URL if provided
            if (proposal.client_url) {
                try {
                    URLSchema.parse(proposal.client_url)
                } catch {
                    logger.error("Invalid client URL", {
                        proposalId,
                        url: proposal.client_url
                    })
                    throw Errors.validation("Invalid client URL format")
                }
            }

            // 6. Update status to DRAFTING
            await supabase
                .from('proposals')
                .update({ status: 'DRAFTING' })
                .eq('id', proposalId)
                .eq('organization_id', auth.organizationId)

            logger.info("Status set to DRAFTING")

            // 7. RAG (Retrieval) - Organization-scoped knowledge base
            const scopeLower = proposal.project_scope.toLowerCase()

            // Fetch organization-scoped KB items
            // TODO: Upgrade to pgvector for semantic search in production
            const { data: kbItems, error: kbError } = await supabase
                .from('knowledge_base')
                .select('*')
                .eq('organization_id', auth.organizationId)

            if (kbError) {
                logger.warn("Knowledge base query failed", {
                    error: kbError,
                    organizationId: auth.organizationId
                })
            }

            // Simple keyword matching (upgrade to vector search later)
            const retrievedDocs = (kbItems || []).filter((doc: any) =>
                Array.isArray(doc.tags) &&
                doc.tags.some((tag: string) => scopeLower.includes(tag.toLowerCase()))
            )

            // Fallback to most recent doc if no tag match
            const contextDocs = retrievedDocs.length > 0
                ? retrievedDocs
                : (kbItems || []).slice(0, 1)

            logger.info("Knowledge retrieval complete", {
                totalKbItems: kbItems?.length || 0,
                matchedDocs: retrievedDocs.length,
                usingDocs: contextDocs.length
            })

            // 8. AI Generation with sanitized inputs
            const sanitizedScope = SafeStringSchema.parse(proposal.project_scope)
            const sanitizedUrl = proposal.client_url || "N/A"

            const prompt = `
You are a Senior Partner at a Top-Tier Consulting Firm (like McKinsey/BCG).
Write a winning proposal for a client.

Client URL: ${sanitizedUrl}
Project Scope: "${sanitizedScope}"

Use this Internal Knowledge (Success Stories) to prove our capability:
${JSON.stringify(contextDocs.map((d: any) => d.content).slice(0, 5))}

Structure (Markdown):
# Proposal for [Client Name]
## Executive Summary
## Our Understanding of the Challenge
## Proposed Solution (Phased Approach)
## Why Us? (Cite the success stories provided)
## Investment Estimate (in KRW)

Tone: Professional, confident, high-value.
            `.trim()

            // 9. Budget check before AI call
            const estimatedCost = estimatePromptCost(defaultModel.modelId, prompt.length)

            try {
                await enforceBudgetCap(auth.organizationId, estimatedCost, opts?.correlationId)
                logger.info("Budget check passed", {
                    estimatedCost: `$${estimatedCost.toFixed(6)}`,
                    organizationId: auth.organizationId
                })
            } catch (budgetError) {
                logger.error("Budget check failed", {
                    estimatedCost,
                    organizationId: auth.organizationId,
                    error: budgetError
                })
                throw budgetError
            }

            // 10. AI generation with organization context
            const { object, usage } = await tracedGenerateObject<any>({
                model: defaultModel,
                schema: ProposalSchema,
                prompt,
            }, {
                organizationId: auth.organizationId,
                agentName: "proposal"
            })

            // 11. Cost tracking (best-effort)
            try {
                if (usage) {
                    await trackAICost({
                        organizationId: auth.organizationId,
                        agent: "proposal",
                        model: defaultModel.modelId,
                        inputTokens: usage.promptTokens,
                        outputTokens: usage.completionTokens,
                        correlationId: opts?.correlationId,
                        metadata: {
                            client_url: proposal.client_url,
                            proposal_id: proposalId,
                        },
                    })
                }
            } catch (costError) {
                logger.error("Cost tracking failed (non-fatal)", costError)
            }

            // 12. Generate DOCX document with proper organization context
            logger.info("Generating proposal DOCX via MCP...")

            let downloadUrl: string | null = null
            try {
                const uploadResult = await generateAndUploadDocument(object.content, {
                    organizationId: auth.organizationId,
                    resourceId: proposalId,
                    resourceType: 'proposal',
                    title: `Proposal - ${proposal.client_url || 'Client'}`,
                    template: 'proposal',
                })

                downloadUrl = uploadResult.downloadUrl
                logger.info("Proposal document generated successfully", {
                    url: uploadResult.downloadUrl,
                    organizationId: auth.organizationId
                })
            } catch (docError: any) {
                logger.error("Proposal document generation failed (non-fatal)", {
                    error: docError,
                    organizationId: auth.organizationId
                })
                // Non-fatal - continue with text content only
            }

            // 13. Save results with ownership check
            await supabase
                .from('proposals')
                .update({
                    status: 'COMPLETED',
                    scraped_brand_voice: object.brand_voice,
                    retrieved_knowledge: contextDocs.map((d: any) => d.id),
                    generated_content: object.content,
                    document_url: downloadUrl,
                })
                .eq('id', proposalId)
                .eq('organization_id', auth.organizationId)

            logger.info("Proposal generation completed successfully", {
                proposalId,
                organizationId: auth.organizationId,
                hasDocument: !!downloadUrl,
                kbDocsUsed: contextDocs.length
            })

            return { success: true, proposalId, downloadUrl }

        } catch (err: any) {
            // Update status to FAILED with ownership check
            try {
                const supabase = await createClient()
                await supabase
                    .from('proposals')
                    .update({ status: 'FAILED' })
                    .eq('id', proposalId)
            } catch (updateError) {
                logger.error("Failed to update proposal status to FAILED", updateError)
            }

            // Use error handler for proper logging and sanitization
            const sanitized = handleAPIError(err, {
                service: 'proposal',
                proposalId,
                correlationId: opts?.correlationId
            })

            throw sanitized.error
        }
    }, { tags: ['agent', 'proposal'] })
