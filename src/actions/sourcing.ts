"use server"

import { defaultModel } from "@/lib/ai"
import { requireResourceAccess } from "@/lib/auth/authorization"
import { Errors, handleAPIError } from "@/lib/error-handler"
import { ensureMockDataAllowed } from "@/lib/feature-flags"
import { createLogger } from "@/lib/logger"
import { traced, tracedGenerateObject } from "@/lib/observability/langsmith-wrapper"
import { requireActiveOrg } from "@/lib/org-context"
import { enforceRateLimit } from "@/lib/rate-limit-redis"
import { Alibaba1688Scraper } from "@/lib/scrapers/1688-scraper"
import { createClient } from "@/lib/supabase/server"
import { ProductURLSchema, UUIDSchema } from "@/lib/validation/schemas"
import { z } from "zod"

// Schema for the Sourcing Result
const SourcingResultSchema = z.object({
    product_data: z.object({
        title_cn: z.string(),
        image_url: z.string(), // Simulating extraction
        moq: z.number(),
        category: z.string()
    }),
    translated_content: z.object({
        title_kr: z.string(),
        description_kr: z.string(),
        key_selling_points: z.array(z.string()),
        search_tags_kr: z.array(z.string())
    }),
    price_analysis: z.object({
        unit_price_cny: z.number(),
        estimated_weight_kg: z.number()
    })
})

type GenerateObjectResultLike<T> = {
    object: T
    usage?: {
        promptTokens?: number
        completionTokens?: number
    }
}

const CreateSourcingTaskSchema = z.object({
    source_url: ProductURLSchema,
    platform: z.string().max(50).optional(),
})

export async function createSourcingTask(input: unknown, opts?: { correlationId?: string }) {
    const logger = createLogger({ agent: 'sourcing-1688', correlationId: opts?.correlationId })

    try {
        const { organization_id: organizationId } = await requireActiveOrg()
        const supabase = await createClient()

        await enforceRateLimit(`sourcing:create:${organizationId}`, 10)

        const parsed = CreateSourcingTaskSchema.parse(input)

        const { data, error } = await supabase
            .from('sourcing_tasks')
            .insert({
                source_url: parsed.source_url,
                platform: parsed.platform ?? '1688',
                status: 'PENDING',
                organization_id: organizationId,
            })
            .select('*')
            .single()

        if (error || !data) {
            logger.error('Failed to create sourcing task', error)
            throw Errors.internal('Failed to create sourcing task')
        }

        return { success: true, task: data }
    } catch (err) {
        const sanitized = handleAPIError(err, {
            service: 'sourcing-1688',
            correlationId: opts?.correlationId,
        })
        return { success: false, error: sanitized.error }
    }
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const processSourcing = traced(
    'sourcing-analysis',
    async (taskId: string, opts?: { correlationId?: string }) => {
        const logger = createLogger({ agent: 'sourcing-1688', correlationId: opts?.correlationId, context: { taskId } })
        const supabase = await createClient()

        const scraper = new Alibaba1688Scraper()

        try {
            UUIDSchema.parse(taskId)

            const auth = await requireResourceAccess('sourcing_tasks', taskId)

            await enforceRateLimit(`sourcing:${auth.organizationId}`, 10)

            const { data: task, error } = await supabase
                .from('sourcing_tasks')
                .select('*')
                .eq('id', taskId)
                .eq('organization_id', auth.organizationId)
                .single()

            if (error || !task) {
                throw Errors.notFound('Sourcing task')
            }

            // Validate URL format and supported domains
            ProductURLSchema.parse(task.source_url)

            await supabase
                .from('sourcing_tasks')
                .update({ status: 'SEARCHING' })
                .eq('id', taskId)
                .eq('organization_id', auth.organizationId)

            // Enforce proxy presence in production
            if (process.env.NODE_ENV === 'production' && !process.env.PROXY_URL) {
                throw Errors.internal('Proxy required for production scraping. Configure PROXY_URL.')
            }

            // 1) Scrape with retry/backoff
            let productRawData: unknown = null
            let scrapeErrorLast: unknown = null

            const maxAttempts = 3
            for (let attempt = 1; attempt <= maxAttempts; attempt++) {
                try {
                    await scraper.init()
                    productRawData = await scraper.getProductDetail(task.source_url)
                    await scraper.close()
                    scrapeErrorLast = null
                    break
                } catch (err) {
                    scrapeErrorLast = err
                    try {
                        await scraper.close()
                    } catch {
                        // ignore
                    }
                    if (attempt === maxAttempts) break
                    await sleep(Math.pow(2, attempt) * 500)
                }
            }

            // If scraping failed, do not silently fallback in production.
            if (!productRawData) {
                ensureMockDataAllowed(
                    'sourcing',
                    '1688.com scraping fallback',
                    'Working proxy (PROXY_URL) + ScrapeOwl premium proxies'
                )

                logger.warn('Scraping failed; continuing with simulated inference (non-production only)', {
                    domain: new URL(task.source_url).hostname,
                    organizationId: auth.organizationId,
                })

                if (scrapeErrorLast) {
                    logger.warn('Last scraping error (redacted)', { error: scrapeErrorLast instanceof Error ? scrapeErrorLast.message : String(scrapeErrorLast) })
                }
            }

            await supabase
                .from('sourcing_tasks')
                .update({ status: 'CALCULATING' })
                .eq('id', taskId)
                .eq('organization_id', auth.organizationId)

            const prompt = `
You are an expert dropshipping sourcing agent in China.

Input Context:
- Source URL: "${task.source_url}"
- Scraped Data JSON: ${JSON.stringify(productRawData || {})}

Tasks:
1. ANALYZE the input data. If Scraped Data is present, USE IT as the source of truth for Title, Price, MOQ, and Image.
2. If Scraped Data is empty, INFER details from the URL/context.
3. TRANSLATE & LOCALIZE for the Korean Market (Naver Smart Store).
4. ESTIMATE typical wholesale price (CNY) and weight (kg) if missing.

Target Market: South Korea.
Tone: Professional, enticing for e-commerce.
            `.trim()

            const result = await tracedGenerateObject<GenerateObjectResultLike<z.infer<typeof SourcingResultSchema>>>(
                {
                    model: defaultModel,
                    schema: SourcingResultSchema,
                    prompt,
                },
                {
                    organizationId: auth.organizationId,
                    agentName: 'sourcing-1688',
                }
            )

            const object = result.object

            // 5. Calculate Landed Cost
            const EXCHANGE_RATE_CNY_KRW = 195.5 // Dynamic in prod, static for demo
            const SHIPPING_PER_KG_KRW = 6000 // CJ Logistics Bulk Rate
            const DUTY_THRESHOLD_USD = 150

            const unit_price_krw = Math.ceil(object.price_analysis.unit_price_cny * EXCHANGE_RATE_CNY_KRW)
            const est_shipping = Math.ceil(object.price_analysis.estimated_weight_kg * SHIPPING_PER_KG_KRW)

            // Simple Duty Logic (approximate)
            const total_value_usd = (unit_price_krw / 1350)
            const customs_duty = total_value_usd > DUTY_THRESHOLD_USD ? (unit_price_krw * 0.18) : 0 // 18% VAT+Duty if over $150

            const landed_cost = unit_price_krw + est_shipping + customs_duty
            const suggested_retail = Math.ceil(landed_cost * 1.6) // 60% Margin target
            const margin_percent = Math.round(((suggested_retail - landed_cost) / suggested_retail) * 100)

            const landed_cost_analysis = {
                unit_price_cny: object.price_analysis.unit_price_cny,
                unit_price_krw,
                shipping_per_unit: est_shipping,
                customs_duty,
                landed_cost,
                suggested_retail,
                margin_percent
            }

            // 6. Update Status to COMPLETED
            const { error: updateError } = await supabase
                .from('sourcing_tasks')
                .update({
                    status: 'COMPLETED',
                    product_data: object.product_data,
                    translated_content: object.translated_content,
                    landed_cost_analysis
                })
                .eq('id', taskId)
                .eq('organization_id', auth.organizationId)

            if (updateError) throw updateError

            return { success: true, data: { ...object, landed_cost_analysis } }

        } catch (err) {
            try {
                const authOrNull = await (async () => {
                    try {
                        return await requireResourceAccess('sourcing_tasks', taskId)
                    } catch {
                        return null
                    }
                })()

                if (authOrNull?.organizationId) {
                    await supabase
                        .from('sourcing_tasks')
                        .update({ status: 'FAILED' })
                        .eq('id', taskId)
                        .eq('organization_id', authOrNull.organizationId)
                }
            } catch (updateError) {
                logger.error('Failed to update sourcing task status to FAILED', updateError)
            }

            const sanitized = handleAPIError(err, {
                service: 'sourcing-1688',
                taskId,
                correlationId: opts?.correlationId,
            })

            throw sanitized.error
        } finally {
            try {
                await scraper.close()
            } catch {
                // ignore
            }
        }
    }, { tags: ['agent', 'sourcing'] })
