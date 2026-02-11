'use server'

import { defaultModel } from '@/lib/ai'
import { requireAuth, requireResourceAccess } from '@/lib/auth/authorization'
import { Errors, handleAPIError } from '@/lib/error-handler'
import { createLogger } from '@/lib/logger'
import { traced, tracedGenerateObject } from "@/lib/observability/langsmith-wrapper"
import { getActiveOrg } from '@/lib/org-context'
import { enforceRateLimit } from '@/lib/rate-limit-redis'
import { createClient } from '@/lib/supabase/server'
import { SafeShortStringSchema, SafeTextAreaSchema, UUIDSchema } from '@/lib/validation/schemas'
import { z } from 'zod'

const LocalizationResultSchema = z.object({
    adapted_text: z.string().describe("The localized version of the content"),
    cultural_reasoning: z.object({
        strategy: z.string().describe("Explanation of the cultural adaptation strategy used"),
        avoided: z.array(z.string()).describe("List of words or concepts from original that were avoided"),
        improved: z.array(z.string()).describe("List of new concepts or words added for resonance"),
    }),
    confidence_score: z.number().min(0).max(100).describe("Confidence score between 0 and 100"),
})

type LocalizationResult = z.infer<typeof LocalizationResultSchema>

type GenerateObjectResultLike<T> = {
    object: T
    usage?: {
        promptTokens?: number
        completionTokens?: number
    }
}

const SourceTextSchema = z
    .string()
    .min(10, 'Source text too short')
    .max(10000, 'Source text too long')
    .transform((v) => SafeTextAreaSchema.parse(v))

const TargetMarketSchema = z
    .string()
    .min(2, 'Target market too short')
    .max(100, 'Target market too long')
    .transform((v) => SafeShortStringSchema.parse(v))

const CreateLocalizationTaskSchema = z.object({
    source_text: SourceTextSchema,
    target_market: TargetMarketSchema,
})

export async function createLocalizationTask(input: unknown, opts?: { correlationId?: string }) {
    const logger = createLogger({
        agent: 'merchant-localization',
        correlationId: opts?.correlationId,
    })

    try {
        await requireAuth()
        const { organization_id } = await getActiveOrg()

        await enforceRateLimit(`merchant:create:${organization_id}`, 10)

        const parsed = CreateLocalizationTaskSchema.parse(input)

        const supabase = await createClient()

        const { data, error } = await supabase
            .from('localizations')
            .insert({
                source_text: parsed.source_text,
                target_market: parsed.target_market,
                status: 'PENDING',
                organization_id,
            })
            .select('*')
            .single()

        if (error || !data) {
            logger.error('Failed to create localization task', error)
            throw Errors.internal('Failed to create localization task')
        }

        return { success: true, task: data }
    } catch (err) {
        const sanitized = handleAPIError(err, {
            service: 'merchant-localization',
            correlationId: opts?.correlationId,
        })
        return { success: false, error: sanitized.error }
    }
}

export const processLocalization = traced(
    'merchant-localization',
    async (taskId: string, opts?: { correlationId?: string }) => {
        const logger = createLogger({
            agent: 'merchant-localization',
            correlationId: opts?.correlationId,
            context: { taskId },
        })

        const supabase = await createClient()

        try {
            UUIDSchema.parse(taskId)

            const auth = await requireResourceAccess('localizations', taskId)

            await enforceRateLimit(`merchant:${auth.organizationId}`, 10)

            const { data: task, error } = await supabase
                .from('localizations')
                .select('*')
                .eq('id', taskId)
                .eq('organization_id', auth.organizationId)
                .single()

            if (error || !task) {
                logger.error('Localization task not found', error)
                throw Errors.notFound('Localization task')
            }

            // Validate stored fields defensively
            const safeSourceText = SourceTextSchema.parse(task.source_text)
            const safeTargetMarket = TargetMarketSchema.parse(task.target_market)

            await supabase
                .from('localizations')
                .update({ status: 'ANALYZING' })
                .eq('id', taskId)
                .eq('organization_id', auth.organizationId)

            const prompt = `
You are a professional localization expert for the ${safeTargetMarket} market.
Adapt the following source text to be culturally resonant, persuasive, and native-feeling.
Do not just translate; transcreate.

Source Text: "${safeSourceText}"
Target Market: ${safeTargetMarket}
            `.trim()

            const result = await tracedGenerateObject<GenerateObjectResultLike<LocalizationResult>>(
                {
                    model: defaultModel,
                    schema: LocalizationResultSchema,
                    prompt,
                },
                {
                    organizationId: auth.organizationId,
                    agentName: 'merchant-localization',
                }
            )

            const object = result.object

            await supabase
                .from('localizations')
                .update({
                    status: 'COMPLETED',
                    adapted_text: object.adapted_text,
                    cultural_reasoning: object.cultural_reasoning,
                    confidence_score: object.confidence_score,
                })
                .eq('id', taskId)
                .eq('organization_id', auth.organizationId)

            return { success: true, data: object }
        } catch (err) {
            try {
                const authOrNull = await (async () => {
                    try {
                        return await requireResourceAccess('localizations', taskId)
                    } catch {
                        return null
                    }
                })()

                if (authOrNull?.organizationId) {
                    await supabase
                        .from('localizations')
                        .update({
                            status: 'FAILED',
                            cultural_reasoning: {
                                error: err instanceof Error ? err.message : String(err),
                                strategy: 'Failed',
                                avoided: [],
                                improved: [],
                            },
                        })
                        .eq('id', taskId)
                        .eq('organization_id', authOrNull.organizationId)
                }
            } catch (updateError) {
                logger.error('Failed to update localization status to FAILED', updateError)
            }

            const sanitized = handleAPIError(err, {
                service: 'merchant-localization',
                taskId,
                correlationId: opts?.correlationId,
            })

            throw sanitized.error
        }
    }, { tags: ['agent', 'merchant'] })
