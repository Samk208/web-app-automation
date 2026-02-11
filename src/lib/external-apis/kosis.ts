import { createLogger } from "@/lib/logger"

const KOSIS_BASE_URL = "https://kosis.kr/openapi/Param/statisticsParameterData.do"
const logger = createLogger({ agent: "external-api:kosis" })

export interface MarketData {
    category: string
    year: string
    value: number
    unit: string
    source: "KOSIS"
    updated_at: string
}

// Mapping of common industry keywords to KOSIS Subject Codes (This would be expanded in production)
const INDUSTRY_CODE_MAP: Record<string, { orgId: string, tblId: string, objL1: string }> = {
    // Example: "ICT Industry Production"
    "ICT": { orgId: "12701", tblId: "DT_12701_201", objL1: "ALL" },
    // Example: "Semiconductor" (Placeholder codes)
    "SEMICONDUCTOR": { orgId: "301", tblId: "DT_12345", objL1: "01" },
}

/**
 * Queries KOSIS API for official statistics.
 * Used as Tier 1 Data Source (Government Official).
 */
export async function fetchKosisData(industryKeyword: string): Promise<MarketData | null> {
    const apiKey = process.env.KOSIS_API_KEY
    if (!apiKey) {
        logger.warn("KOSIS_API_KEY not configured, skipping Tier 1 lookup")
        return null
    }

    const key = industryKeyword.toUpperCase()
    const mapping = INDUSTRY_CODE_MAP[key]

    if (!mapping) {
        logger.info(`No KOSIS mapping found for ${industryKeyword}`)
        return null
    }

    try {
        const url = new URL(KOSIS_BASE_URL)
        url.searchParams.append("method", "getList")
        url.searchParams.append("apiKey", apiKey)
        url.searchParams.append("format", "json")
        url.searchParams.append("jsonVD", "Y")
        url.searchParams.append("userStatsId", "antigravity_bot") // Arbitrary ID req by KOSIS
        url.searchParams.append("orgId", mapping.orgId)
        url.searchParams.append("tblId", mapping.tblId)

        // Fetch latest year (usually previous year)
        const currentYear = new Date().getFullYear()
        url.searchParams.append("prdSe", "Y") // Yearly
        url.searchParams.append("startPrdDe", (currentYear - 2).toString())
        url.searchParams.append("endPrdDe", (currentYear - 1).toString())

        const response = await fetch(url.toString())

        if (!response.ok) {
            throw new Error(`KOSIS API Error: ${response.statusText}`)
        }

        const data = await response.json()

        if (!Array.isArray(data) || data.length === 0) {
            return null
        }

        // Get the latest entry
        const latest = data[data.length - 1]

        return {
            category: latest.PRD_DE, // Period
            year: latest.PRD_DE,
            value: parseFloat(latest.DT),
            unit: latest.UNIT_NM || "Unit",
            source: "KOSIS",
            updated_at: new Date().toISOString()
        }

    } catch (err) {
        logger.error("Failed to fetch KOSIS data", err)
        return null // Fail gracefully to allow fallback to Tier 2
    }
}
