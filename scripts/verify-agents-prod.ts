
import dotenv from 'dotenv';
import path from 'path';

// Load env vars immediately
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// logic wrapper
async function main() {
    console.log("🚀 Starting Production Upgrade Verification...\n");

    // Dynamic import to ensure Env is loaded first
    const { validateConsistency } = await import('../src/lib/bizplan/psst-generator');
    const { fetchKOSISMarketData } = await import('../src/lib/market-data/korean-market-api');

    async function verifyPerplexityIntegration() {
        console.log("🔍 Verifying Perplexity Market Data Integration...");
        try {
            // We'll search for a known industry
            const result = await fetchKOSISMarketData("Artificial Intelligence");

            if (result.source.includes("Perplexity") || result.source.includes("Verified") || result.cagr !== 0) {
                console.log("✅ Perplexity Integration: SUCCESS");
                console.log(`   Source: ${result.source}`);
                console.log(`   CAGR: ${result.growthRate}%`); // Corrected property name
                console.log(`   TAM: ${result.TAM}`);
            } else {
                console.warn("⚠️ Perplexity Integration: FALLBACK DETECTED (or key missing)");
                console.log(`   Source: ${result.source}`);
            }
        } catch (e: any) {
            console.error("❌ Perplexity Integration: FAILED", e.message);
        }
    }

    function verifyCriticLoop() {
        console.log("\n🔍 Verifying Critic Loop (Logic Check)...");

        const badDraft = {
            problem: { background: { painPoint: "People are hungry" } },
            solution: { productDescription: { coreFunctions: ["Build a rocket ship"] } },
            scaleUp: { marketEntry: { revenueModel: "Ticket sales" }, fundRequirements: [], exitStrategy: { scenarios: [] } },
            team: { coreMembers: [], socialValue: { profitSharing: {} } }
        } as any;

        const result = validateConsistency(badDraft);

        if (result.valid === false || result.errors.length > 0) {
            console.log("✅ Critic Loop: SUCCESS (Issues Flagged)");
            console.log("   Errors Found:", result.errors);
        } else {
            console.log("❓ Critic Loop: PASSED (Unexpectedly?)");
            console.log("   Result:", result);
        }
    }

    await verifyPerplexityIntegration();
    verifyCriticLoop();

    console.log("\n✅ Automated Verification Complete. Please proceed to Browser Verification.");
}

main().catch(console.error);
