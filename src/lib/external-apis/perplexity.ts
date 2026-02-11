import { createLogger } from "@/lib/logger"

const PERPLEXITY_API_URL = "https://api.perplexity.ai/chat/completions"
const MODEL_ID = "sonar-reasoning-pro" // Tier 2 Verified Research Model

const logger = createLogger({ agent: "external-api:perplexity" })

export interface PerplexitySource {
    url: string
    name: string
    snippet?: string
}

export interface PerplexityResponse {
    content: string
    citations: string[]
    usage: {
        prompt_tokens: number
        completion_tokens: number
        total_tokens: number
    }
}

/**
 * Queries Perplexity API for deep research and verification.
 * Used as Tier 2 Data Source (Verified Research).
 */
export async function queryPerplexity(
    query: string,
    opts?: {
        systemPrompt?: string
        temperature?: number
        maxTokens?: number
    }
): Promise<PerplexityResponse> {
    const apiKey = process.env.PERPLEXITY_API_KEY
    if (!apiKey) {
        throw new Error("PERPLEXITY_API_KEY is not configured")
    }

    try {
        const payload = {
            model: MODEL_ID,
            messages: [
                {
                    role: "system",
                    content: opts?.systemPrompt || "You are a precise research assistant. Prioritize official government sources, major news outlets, and industry reports. Always cite your sources."
                },
                {
                    role: "user",
                    content: query
                }
            ],
            temperature: opts?.temperature || 0.1, // Low temp for factual accuracy
            max_tokens: opts?.maxTokens || 1024,
            return_citations: true
        }

        const response = await fetch(PERPLEXITY_API_URL, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        })

        if (!response.ok) {
            const error = await response.text()
            logger.error("Perplexity API Error", { status: response.status, error })
            throw new Error(`Perplexity API Error: ${response.statusText}`)
        }

        const data = await response.json()
        const choice = data.choices[0]

        return {
            content: choice.message.content,
            citations: data.citations || [],
            usage: data.usage
        }

    } catch (err) {
        logger.error("Failed to query Perplexity", err)
        throw err
    }
}

/**
 * Specialized function to verify a specific claim using Perplexity.
 * Returns a confidence assessment and corrected value if found.
 */
export async function verifyClaim(claim: string, context?: string) {
    const prompt = `
    Verify the following claim: "${claim}".
    Context: ${context || "South Korean Market"}
    
    Task:
    1. Search for recent (2024-2025) data from reliable sources.
    2. Determine if the claim is True, False, or Outdated.
    3. If numerical, provide the latest verified number and source.
    
    Return JSON format:
    {
        "verdict": "supported" | "contradicted" | "uncertain",
        "verified_value": string | null,
        "source_url": string | null,
        "explanation": string
    }
    `
    // Note: We'd typically parse the JSON output here, 
    // but for now we return the raw response for the agent to process.
    return queryPerplexity(prompt)
}
