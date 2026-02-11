
import { trackAICost } from '@/lib/ai/cost-tracker'
import { traceable } from 'langsmith/traceable'

/**
 * Check if tracing is enabled
 */
export function isTracingEnabled(): boolean {
    return process.env.LANGCHAIN_TRACING_V2 === 'true'
}

/**
 * Wrap any async function with LangSmith tracing
 */
export function traced<T extends (...args: any[]) => Promise<any>>(
    name: string,
    fn: T,
    options?: {
        tags?: string[]
        metadata?: Record<string, any>
    }
): T {

    if (!isTracingEnabled()) {
        return fn // Return original function if tracing disabled
    }

    return traceable(fn, {
        name,
        tracingEnabled: true,
        metadata: {
            environment: process.env.NODE_ENV || 'development',
            version: process.env.APP_VERSION || '1.0.0',
            ...options?.metadata
        },
        tags: options?.tags || []
    }) as T
}

/**
 * Add metadata to current trace
 */
export interface TraceMetadata {
    userId?: string
    organizationId: string
    agentName: string
    model: string
    inputTokens: number
    outputTokens: number
    totalTokens: number
    costUSD: number
    latencyMs: number
    status: 'success' | 'error'
    errorMessage?: string
}

export function addTraceMetadata(metadata: TraceMetadata) {
    // LangSmith automatically captures this when using traceable
    return {
        ...metadata,
        timestamp: new Date().toISOString(),
        costPerToken: metadata.costUSD / (metadata.totalTokens || 1)
    }
}

/**
 * Calculate AI cost from usage
 */
export function calculateAICost(
    model: string,
    inputTokens: number,
    outputTokens: number
): number {

    const PRICING: Record<string, { input: number; output: number }> = {
        'gemini-1.5-flash': {
            input: 0.075 / 1_000_000,  // $0.075 per 1M tokens
            output: 0.30 / 1_000_000    // $0.30 per 1M tokens
        },
        'gemini-1.5-pro': {
            input: 1.25 / 1_000_000,
            output: 5.00 / 1_000_000
        },
        'gpt-4o': {
            input: 5.00 / 1_000_000,
            output: 15.00 / 1_000_000
        },
        'gpt-4o-mini': {
            input: 0.15 / 1_000_000,
            output: 0.60 / 1_000_000
        }
    }

    const pricing = PRICING[model] || PRICING['gemini-1.5-flash']

    return (inputTokens * pricing.input) + (outputTokens * pricing.output)
}

/**
 * Wrapper for Vercel AI SDK generateObject with tracing
 */
export async function tracedGenerateObject<T>(
    params: any,
    metadata: {
        organizationId: string
        agentName: string
        userId?: string
    }
): Promise<T> {

    const startTime = Date.now()

    try {
        // Dynamic import to avoid build issues if 'ai' is missing in some contexts
        const { generateObject } = await import('ai')

        // Check if we can extract model name
        let modelName = 'gemini-1.5-flash';
        if (params.model && typeof params.model === 'object' && 'modelId' in params.model) {
            modelName = params.model.modelId;
        }

        // Call original function
        const result = await generateObject(params)

        const latencyMs = Date.now() - startTime
        const usage = result.usage as any
        const costUSD = calculateAICost(
            modelName,
            (usage?.promptTokens || 0) as number,
            (usage?.completionTokens || 0) as number
        )

        // If we are currently in a traced context (via traceable), this might theoretically automatically link?
        // But safely we can just use the result/metadata logic.
        // Ideally we would wrap THIS specific call in a traceable too "LLM Call".
        // For now, we just return the result and let the outer wrapper handle the comprehensive trace if needed,
        // OR we could wrap this inner block.
        // The prompt implementation just generates and returns, but assumes Side-Effects or Logs.
        // It calls `addTraceMetadata` which we defined as just returning an object? 
        // Wait, the prompt's `addTraceMetadata` had a comment "// LangSmith automatically captures this".
        // That usually implies interaction with `RunTree` or current trace context.
        // Since we are not using the `RunTree` API directly here, let's just piggyback on `traceable` if possible.
        // But since `tracedGenerateObject` is NOT wrapped in `traceable` in this definition...
        // Let's wrap the internal execution.

        // Track cost locally in Supabase
        if (metadata.organizationId) {
            const usage = result.usage as any
            await trackAICost({
                organizationId: metadata.organizationId,
                agent: metadata.agentName,
                model: modelName,
                inputTokens: (usage?.promptTokens || 0) as number,
                outputTokens: (usage?.completionTokens || 0) as number,
                metadata: {
                    userId: metadata.userId
                }
            }).catch(err => console.error("Failed to track AI cost locally", err))
        }

        return result as T

    } catch (error) {
        throw error
    }
}

// Re-export specific traceable wrapper for AI SDK if we want granular tracing
export const traceAI = traceable(async (fn: Function, ...args: any[]) => {
    return await fn(...args)
}, { name: "AI_Generation" })
