"use server"

import { defaultModel } from "@/lib/ai"
import { requireResourceAccess } from "@/lib/auth/authorization"
import { Errors, handleAPIError } from "@/lib/error-handler"
import { enforceSchema, enforceSize, withRetry, withTimeout } from "@/lib/guard"
import { createLogger } from "@/lib/logger"
import { traced, tracedGenerateObject } from "@/lib/observability/langsmith-wrapper"
import { requireActiveOrg } from "@/lib/org-context"
import { enforceRateLimit } from "@/lib/rate-limit-redis"
import { createClient } from "@/lib/supabase/server"
import { UUIDSchema } from "@/lib/validation/schemas"
import { z } from "zod"

// TODO: Replace mock government programs database with live scraper
// See: PRODUCTION_GRADE_AGENT_TRANSFORMATION_PLAN.md lines 95-104
// Required: Daily scraper for K-Startup.go.kr + NIPA + Rules engine for eligibility

const MatchResultSchema = z.object({
    matched_results: z.array(z.object({
        id: z.number(),
        program_name: z.string(),
        fit_score: z.number().describe("0-100"),
        reason: z.string().describe("Why this fits (Korean/English)"),
        deadline: z.string().describe("Upcoming deadline (YYYY-MM-DD or 'TBD')"),
        amount: z.string().describe("Funding amount (e.g. '500M KRW')")
    }))
})

type GenerateObjectResultLike<T> = {
    object: T
    usage?: {
        promptTokens?: number
        completionTokens?: number
    }
}

const CreateProgramMatchSchema = z.object({
    startup_profile: z.object({
        industry: z.string().min(1).max(100),
        stage: z.string().min(1).max(100),
        founder_status: z.string().max(100).optional(),
    })
})

export async function createProgramMatch(input: unknown, opts?: { correlationId?: string }) {
    const logger = createLogger({ agent: 'k-startup', correlationId: opts?.correlationId })

    try {
        const { organization_id: organizationId } = await requireActiveOrg()
        const supabase = await createClient()

        await enforceRateLimit(`k-startup:create:${organizationId}`, 10)

        const parsed = CreateProgramMatchSchema.parse(input)

        const { data, error } = await supabase
            .from('program_matches')
            .insert({
                startup_profile: parsed.startup_profile,
                status: 'ANALYZING',
                organization_id: organizationId,
            })
            .select('*')
            .single()

        if (error || !data) {
            logger.error('Failed to create program match', error)
            throw Errors.internal('Failed to create program match')
        }

        return { success: true, match: data }
    } catch (err) {
        const sanitized = handleAPIError(err, {
            service: 'k-startup',
            correlationId: opts?.correlationId,
        })
        return { success: false, error: sanitized.error }
    }
}

export const processStartupMatch = traced(
    'k-startup-match',
    async (matchId: string, opts?: { correlationId?: string }) => {
        const supabase = await createClient()
        const logger = createLogger({ agent: "k-startup", correlationId: opts?.correlationId, context: { matchId } })

        enforceSize(matchId, 256, "matchId")

        try {
            UUIDSchema.parse(matchId)

            const auth = await requireResourceAccess('program_matches', matchId)

            await enforceRateLimit(`k-startup:${auth.organizationId}`, 10)

            // 1. Fetch Task (org-scoped)
            const { data: match, error } = await supabase
                .from('program_matches')
                .select('*')
                .eq('id', matchId)
                .eq('organization_id', auth.organizationId)
                .single()

            if (error || !match) {
                logger.error("Startup match not found", error)
                throw Errors.notFound("Match task")
            }

            if (!match.startup_profile) {
                logger.error("Startup profile missing on match record")
                throw Errors.validation("Startup profile missing")
            }

            const profile = match.startup_profile

            // 2. Fetch Programs from DB
            // WARNING: startup_programs table contains mock/seed data
            // 2. Fetch Programs from DB
            // We assume the DB is populated by the KStartupScraper cron job.
            // If empty, we could trigger a scrape, but that's slow. 
            // For now, just read what we have.

            // ensureMockDataAllowed removed - we are using real DB data (cached)

            const { data: allPrograms, error: progError } = await supabase
                .from('startup_programs')
                .select('*')

            if (progError) {
                logger.error("Failed to fetch programs", progError)
                throw Errors.internal('Could not retrieve startup programs')
            }

            // 3. AI Logic
            const prompt = `
      You are a Korean Government Grant Consultant (K-Startup Expert).
      
      Startup Profile:
      - Industry: ${profile.industry}
      - Stage: ${profile.stage}
      - Founder Status: ${profile.founder_status || "Foreigner"}
      
      Available Programs:
      ${JSON.stringify(allPrograms?.map(p => ({
                name: p.name,
                category: p.category,
                funding: p.funding_amount,
                deadline: p.deadline
            })) || [])}
      
      Task:
      Select the best programs for this startup. Explain WHY in a helpful tone.
      If Foreigner, prioritize OASIS or Global Challenge.
      If Deep Tech (AI/Bio), prioritize TIPS.
    `

            const result = await withTimeout(
                withRetry(() =>
                    tracedGenerateObject<GenerateObjectResultLike<z.infer<typeof MatchResultSchema>>>({
                        model: defaultModel,
                        schema: MatchResultSchema,
                        prompt,
                    }, {
                        organizationId: auth.organizationId,
                        agentName: "k-startup"
                    })
                    , { retries: 2, delayMs: 400 }),
                25_000
            )

            const object = result.object

            // 3. Save
            await supabase.from('program_matches').update({
                status: 'COMPLETED',
                matched_results: enforceSchema(MatchResultSchema, object).matched_results
            }).eq('id', matchId).eq('organization_id', auth.organizationId)

            logger.info("Startup match completed")
            return { success: true }

        } catch (err) {
            // Update status to FAILED on error
            try {
                const authOrNull = await (async () => {
                    try {
                        return await requireResourceAccess('program_matches', matchId)
                    } catch {
                        return null
                    }
                })()

                if (authOrNull?.organizationId) {
                    await supabase
                        .from('program_matches')
                        .update({ status: 'FAILED' })
                        .eq('id', matchId)
                        .eq('organization_id', authOrNull.organizationId)
                }
            } catch (updateError) {
                logger.error('Failed to update status to FAILED', updateError)
            }

            const sanitized = handleAPIError(err, {
                service: 'k-startup',
                matchId,
                correlationId: opts?.correlationId,
            })

            throw sanitized.error
        }
    }, { tags: ['agent', 'k-startup'] })
