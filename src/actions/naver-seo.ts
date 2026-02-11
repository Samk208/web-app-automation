"use server"

import { defaultModel } from "@/lib/ai"
import { requireResourceAccess } from "@/lib/auth/authorization"
import { Errors, handleAPIError } from "@/lib/error-handler"
import { ensureMockDataAllowed } from "@/lib/feature-flags"
import { createLogger } from "@/lib/logger"
import { traced, tracedGenerateObject } from "@/lib/observability/langsmith-wrapper"
import { enforceRateLimit } from "@/lib/rate-limit-redis"
import { createClient } from "@/lib/supabase/server"
import { URLSchema, UUIDSchema } from "@/lib/validation/schemas"
import { z } from "zod"

type GenerateObjectResultLike<T> = {
    object: T
    usage?: {
        promptTokens?: number
        completionTokens?: number
    }
}

const CreateSEOAuditSchema = z.object({
    target_url: URLSchema,
    platform: z.string().max(50).optional(),
})

export async function createSEOAudit(input: unknown, opts?: { correlationId?: string }) {
    const logger = createLogger({ agent: 'naver-seo', correlationId: opts?.correlationId })

    try {
        const supabase = await createClient()
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError || !user) {
            throw Errors.unauthorized('Unauthorized: Please log in')
        }

        const { data: membership, error: membershipError } = await supabase
            .from('organization_members')
            .select('organization_id')
            .eq('user_id', user.id)
            .order('created_at', { ascending: true })
            .limit(1)
            .single()

        const organizationId = membership?.organization_id
        if (membershipError || !organizationId) {
            throw Errors.forbidden('Forbidden: You do not have an organization')
        }

        await enforceRateLimit(`naver-seo:create:${organizationId}`, 10)

        const parsed = CreateSEOAuditSchema.parse(input)

        const { data, error } = await supabase
            .from('seo_audits')
            .insert({
                target_url: parsed.target_url,
                platform: parsed.platform ?? 'NAVER',
                status: 'ANALYZING',
                organization_id: organizationId,
            })
            .select('*')
            .single()

        if (error || !data) {
            logger.error('Failed to create SEO audit', error)
            throw Errors.internal('Failed to create SEO audit')
        }

        return { success: true, audit: data }
    } catch (err) {
        const sanitized = handleAPIError(err, {
            service: 'naver-seo',
            correlationId: opts?.correlationId,
        })
        return { success: false, error: sanitized.error }
    }
}

// Schema for the SEO Audit Result
const AuditResultSchema = z.object({
    current_metrics: z.object({
        score: z.number().describe("Overall SEO score out of 100"),
        keyword_density: z.string().describe("e.g. 'Low (1.2%)' or 'Good (3.5%)'"),
        image_count: z.number().describe("Number of product images detected"),
        review_velocity: z.string().describe("e.g. 'High', 'Medium', 'Low'")
    }),
    optimization_report: z.object({
        score: z.number(),
        suggestions: z.array(z.object({
            type: z.enum(['critical', 'warning', 'info']),
            msg: z.string()
        })),
        optimized_title_candidate: z.string().describe("A rewrite of the product title optimized for Naver SEO")
    })
})

export const processSEOAudit = traced(
    'naver-seo-audit',
    async (auditId: string, opts?: { correlationId?: string }) => {
        const supabase = await createClient()
        const logger = createLogger({ agent: 'naver-seo', correlationId: opts?.correlationId, context: { auditId } })

        try {
            UUIDSchema.parse(auditId)

            const auth = await requireResourceAccess('seo_audits', auditId)

            await enforceRateLimit(`naver-seo:${auth.organizationId}`, 10)

            // 1. Fetch Task (org-scoped)
            const { data: audit, error } = await supabase
                .from('seo_audits')
                .select('*')
                .eq('id', auditId)
                .eq('organization_id', auth.organizationId)
                .single()

            if (error || !audit) {
                throw Errors.notFound('Audit task')
            }

            // Validate URL defensively
            URLSchema.parse(audit.target_url)

            // 2. Update Status to ANALYZING
            await supabase
                .from('seo_audits')
                .update({ status: 'ANALYZING' })
                .eq('id', auditId)
                .eq('organization_id', auth.organizationId)

            // 3. AI Simulation of "Crawling + Analysis"
            // TODO: Replace with real SEO crawler + SERP API
            // See: PRODUCTION_GRADE_AGENT_TRANSFORMATION_PLAN.md lines 56-66
            // Required: Real crawler (Python/Golang) + Lighthouse + DataForSEO/SerpApi

            ensureMockDataAllowed(
                "naver-seo",
                "SEO audit and crawling",
                "Real crawler (Lighthouse) + DataForSEO API for Naver search volume + Rank tracker"
            )

            logger.warn("SEO audit is simulated - real crawler not yet implemented", {
                url: audit.target_url,
                organizationId: auth.organizationId,
            })

            // In a real app, we would scrape the HTML of audit.target_url here.
            // For now, we ask Gemini to infer/simulate the audit based on the URL.

            const prompt = `
      You are a specialized Naver Smart Store SEO Expert.
      Perform a simulated SEO audit for this URL: "${audit.target_url}"
      
      Tasks:
      1. INFER the likely product and its current SEO state (Title, Images, Keywords).
      2. GENERATE a realistic Audit Report as if you scraped the page.
      3. Naver SEO Rules to apply:
         - Title format: [Brand] + [Main Keyword] + [Attributes]
         - Keyword Density: 3-5% is ideal.
         - Image Count: At least 10+ images (details + lifestyle) required for top rank.
         - Recent Reviews matter heavily.

      Provide specific, actionable suggestions.
    `

            const result = await tracedGenerateObject<GenerateObjectResultLike<z.infer<typeof AuditResultSchema>>>(
                {
                    model: defaultModel,
                    schema: AuditResultSchema,
                    prompt,
                },
                {
                    organizationId: auth.organizationId,
                    agentName: "naver-seo"
                }
            )

            const object = result.object

            // 4. Update Status to COMPLETED
            const { error: updateError } = await supabase
                .from('seo_audits')
                .update({
                    status: 'COMPLETED',
                    current_metrics: object.current_metrics,
                    optimization_report: object.optimization_report
                })
                .eq('id', auditId)
                .eq('organization_id', auth.organizationId)

            if (updateError) throw updateError

            return { success: true, data: object }

        } catch (err) {
            try {
                const authOrNull = await (async () => {
                    try {
                        return await requireResourceAccess('seo_audits', auditId)
                    } catch {
                        return null
                    }
                })()

                if (authOrNull?.organizationId) {
                    await supabase
                        .from('seo_audits')
                        .update({ status: 'FAILED' })
                        .eq('id', auditId)
                        .eq('organization_id', authOrNull.organizationId)
                }
            } catch (updateError) {
                logger.error('Failed to update SEO audit status to FAILED', updateError)
            }

            const sanitized = handleAPIError(err, {
                service: 'naver-seo',
                auditId,
                correlationId: opts?.correlationId,
            })

            throw sanitized.error
        }
    }, { tags: ['agent', 'naver-seo'] })
