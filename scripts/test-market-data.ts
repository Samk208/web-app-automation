
/**
 * Test Script for Korean Market Data API
 * 
 * Usage: npx tsx scripts/test-market-data.ts
 */

import { fetchKOSISMarketData } from '@/lib/market-data/korean-market-api'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

async function runTest() {
    console.log('🚀 Starting Korean Market Data API Test...')

    const industry = "Artificial Intelligence Software"
    console.log(`\n🔍 Fetching data for industry: "${industry}"...`)

    try {
        console.log("1. Fetching Fresh Data...");
        const data = await fetchKOSISMarketData(industry)

        console.log('\n✅ Data Fetched Successfully!')
        console.log('------------------------------------------------')
        console.log(`Source:      ${data.source}`)
        console.log(`TAM:         ₩${data.TAM.toLocaleString()}`)

        console.log("\n2. Testing Cache Set...");
        await cacheMarketData(industry, data);
        console.log("Cache Set Complete.");

        console.log("\n3. Testing Cache Get...");
        const cached = await getCachedMarketData(industry);
        if (cached) {
            console.log("✅ Cache HIT!");
            console.log(`Cached Source: ${cached.source}`);
        } else {
            console.log("❌ Cache MISS (Warning: Redis might not be reachable)");
        }

    } catch (error) {
        console.error('\n❌ TEST FAILED:', error)
    }
}

runTest()
