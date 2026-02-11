import { createLogger } from "@/lib/logger"
import { queryPerplexity } from "./perplexity"

const logger = createLogger({ agent: "external-api:k-startup" })

export interface GrantProgram {
    id: string
    title: string
    organization: string
    deadline: string
    categories: string[]
    funding_amount_max?: string
    url?: string
    source_type: "API" | "PERPLEXITY_RESEARCH"
}

/**
 * Fetches active government R&D grants.
 * Strategy:
 * 1. Try K-Startup API (Tier 1)
 * 2. Fallback to Perplexity "Deep Research" (Tier 2) to scan k-startup.go.kr
 */
export async function fetchActiveGrants(sector: string): Promise<GrantProgram[]> {
    const apiKey = process.env.K_STARTUP_API_KEY
    const programs: GrantProgram[] = []

    // 1. Try Official API
    if (apiKey) {
        try {
            // Placeholder: In production, implementing the actual K-Startup OpenAPI request logic
            // const apiRes = await fetch(`http://apis.data.go.kr/...`)
            logger.info("K-Startup API configured, but specific endpoint implementation pending. Falling back to Perplexity.")
        } catch (err) {
            logger.warn("K-Startup API failed, falling back", err)
        }
    }

    // 2. Fallback: Perplexity Deep Research
    // This effectively uses Perplexity as a "Intelligent Scraper"
    try {
        logger.info(`Searching for active grants in ${sector} using Perplexity...`)

        const prompt = `
        Find currently ACTIVE (not closed) South Korean government R&D grants for the "${sector}" sector.
        Sources: k-startup.go.kr, nipa.kr, smtech.go.kr.
        
        Return a JSON list of top 3 programs. Format:
        [
          {
            "title": "Program Name",
            "organization": "agency name (e.g. TIPS, NIPA)",
            "deadline": "YYYY-MM-DD",
            "funding_max": "approx amount in KRW",
            "url": "link to announcement"
          }
        ]
        `

        const result = await queryPerplexity(prompt, {
            temperature: 0.0,
            systemPrompt: "You are a JSON-only data extraction bot. Output ONLY valid JSON. No markdown."
        })

        // Clean-up potentially markdown-wrapped JSON
        const rawJson = result.content.replace(/```json/g, "").replace(/```/g, "").trim()
        const parsed = JSON.parse(rawJson)

        if (Array.isArray(parsed)) {
            parsed.forEach((p, idx) => {
                programs.push({
                    id: `search-${idx}`,
                    title: p.title,
                    organization: p.organization,
                    deadline: p.deadline,
                    categories: [sector], // Inferred
                    funding_amount_max: p.funding_max,
                    url: p.url,
                    source_type: "PERPLEXITY_RESEARCH"
                })
            })
        }

    } catch (err) {
        logger.error("Perplexity grant search failed", err)
    }

    return programs
}
