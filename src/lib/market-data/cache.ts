import { Redis } from '@upstash/redis'

const redis = new Redis({
    url: process.env.REDIS_URL!,
    token: process.env.REDIS_TOKEN!
})

const CACHE_TTL = 86400 // 24 hours

// Define the type here as it's not exported from the API file as a named type efficiently yet
interface MarketDataResult {
    TAM: number
    growthRate: number
    year: number
    source: string
    url: string
}

/**
 * Get cached market data
 */
export async function getCachedMarketData(
    industry: string
): Promise<MarketDataResult | null> {

    try {
        const key = `market-data:${industry.toLowerCase().trim()}`
        const cached = await redis.get(key)

        if (cached) {
            console.log('✅ Using cached market data for:', industry)
            return cached as MarketDataResult
        }

        return null

    } catch (error) {
        // console.error('Cache read failed:', error)
        // Fail silently to allow fresh fetch
        return null
    }
}

/**
 * Cache market data
 */
export async function cacheMarketData(
    industry: string,
    data: MarketDataResult
): Promise<void> {

    try {
        const key = `market-data:${industry.toLowerCase().trim()}`
        await redis.set(key, data, { ex: CACHE_TTL })

    } catch (error) {
        console.error('Cache write failed:', error)
    }
}
