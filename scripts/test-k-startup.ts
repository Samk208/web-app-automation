
import { KStartupScraper } from '@/lib/scrapers/k-startup-scraper';

async function testKStartup() {
    console.log("🚀 Starting K-Startup Scraper Test...");
    const scraper = new KStartupScraper();

    try {
        const programs = await scraper.scrapeRecentPrograms(1);

        console.log(`✅ Found ${programs.length} programs.`);
        if (programs.length > 0) {
            console.log("Sample Data:", programs[0]);
        } else {
            console.warn("⚠️ No programs found. Selectors might need adjustment.");
        }
    } catch (error) {
        console.error("❌ Test Failed:", error);
    } finally {
        await scraper.close();
    }
}

testKStartup();
