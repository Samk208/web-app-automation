import { fetchActiveGrants } from "@/lib/external-apis/k-startup"
import { fetchKosisData } from "@/lib/external-apis/kosis"
import { queryPerplexity } from "@/lib/external-apis/perplexity"
import * as dotenv from 'dotenv'

// Load environment variables for local testing
dotenv.config({ path: '.env.local' })

async function runSmokeTest() {
    console.log("🚀 Starting Data Pipeline Smoke Test...\n")

    // 1. Test KOSIS (Tier 1)
    console.log("--- Testing KOSIS (Tier 1) ---")
    const kosisKey = process.env.KOSIS_API_KEY ? "✅ Configured" : "❌ Missing"
    console.log(`API Key: ${kosisKey}`)

    if (process.env.KOSIS_API_KEY) {
        const kosisData = await fetchKosisData("ICT")
        if (kosisData) {
            console.log("✅ KOSIS Fetch Success:")
            console.log(kosisData)
        } else {
            console.log("⚠️ KOSIS Fetch returned null (Key might be invalid or service down)")
        }
    } else {
        console.log("⏭️ Skipping KOSIS test")
    }
    console.log("\n")

    // 2. Test Perplexity (Tier 2/Research)
    console.log("--- Testing Perplexity (Tier 2) ---")
    const pplxKey = process.env.PERPLEXITY_API_KEY ? "✅ Configured" : "❌ Missing"
    console.log(`API Key: ${pplxKey}`)

    if (process.env.PERPLEXITY_API_KEY) {
        try {
            console.log("Sending query: 'What is the capital of South Korea?'...")
            const res = await queryPerplexity("What is the capital of South Korea?", { maxTokens: 50 })
            console.log("✅ Perplexity Response Received:")
            console.log(`Content: ${res.content.substring(0, 100)}...`)
            console.log(`Citations: ${res.citations.length}`)
        } catch (err: any) {
            console.log(`❌ Perplexity Failed: ${err.message}`)
        }
    } else {
        console.log("⏭️ Skipping Perplexity test")
    }
    console.log("\n")

    // 3. Test K-Startup (Auto-Fallback)
    console.log("--- Testing K-Startup (Grant Search) ---")
    console.log("Searching for 'AI' grants via fallbacks...")
    const grants = await fetchActiveGrants("Artificial Intelligence")
    console.log(`Found ${grants.length} potential grants`)
    if (grants.length > 0) {
        console.log("✅ First Match:", grants[0])
    }
    console.log("\n")

    console.log("🏁 Smoke Test Complete")
}

runSmokeTest().catch(console.error)
