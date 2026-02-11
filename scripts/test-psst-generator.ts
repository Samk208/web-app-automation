
import { generatePSSTBusinessPlan } from '@/lib/bizplan/psst-generator';
import dotenv from 'dotenv';

// Load environment variables for real API test
dotenv.config({ path: '.env.local' });

async function testPSSTGenerator() {
    console.log("🚀 Starting PSST Generator Test...");

    const mockInput = {
        companyInfo: {
            name: "Pixel Pioneers",
            industry: "Gaming / SaaS",
            product: "AI-powered game asset creation tool",
            stage: "Pre-Seed",
            teamSize: 3,
            founder: "Jane Doe, Ex-Blizzard Developer"
        },
        englishNotes: "We use generative AI to help indie developers create 2D assets instantly. We need 50M KRW for server costs and hiring a UI designer."
    };

    try {
        const psst = await generatePSSTBusinessPlan(mockInput);

        console.log("✅ Generation Successful!");

        // Validate key fields
        console.log("------------------------------------------------");
        console.log("PROBLEM (Pain Point):", psst.problem.background.painPoint);
        console.log("TAM:", psst.problem.targetMarket.tam.toLocaleString(), "KRW");

        console.log("------------------------------------------------");
        console.log("SCALE-UP (Fund Requirements):");
        psst.scaleUp.fundRequirements.forEach(f => {
            console.log(`- [${f.category}] ${f.purpose}: ₩${f.amount.toLocaleString()} (Grant: ₩${f.source.government.toLocaleString()})`);
            console.log(`  Calculation: ${f.calculationBasis}`);
        });

        console.log("------------------------------------------------");
        console.log("TEAM (Social Value):");
        console.log("Profit Sharing:", psst.team.socialValue.profitSharing.programName);
        console.log("Job Creation:", psst.team.socialValue.jobCreation.map(j => `${j.year}: ${j.count}`).join(', '));

    } catch (error) {
        console.error("❌ Test Failed:", error);
    }
}

testPSSTGenerator();
