import dotenv from 'dotenv';
import path from 'path';
import { Alibaba1688Scraper } from '../src/lib/scrapers/1688-scraper';
import { KStartupScraper } from '../src/lib/scrapers/k-startup-scraper';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function testScrapeOwl() {
    console.log("🧪 Testing ScrapeOwl (1688/Taobao)...");
    const scraper = new Alibaba1688Scraper();

    // User provided Taobao Shortlink
    const testUrl = "https://e.tb.cn/h.7i07xeVGJFlMDZJ?tk=CpuHUYJWKFi";

    try {
        console.log(`   Target: ${testUrl}`);
        const result = await scraper.getProductDetail(testUrl);
        console.log("✅ ScrapeOwl Connection Successful");
        console.log("   Result:", result ? (result.title || "Got Data") : "No Data");
        if (result && result.raw) console.log("   (Raw content available)");
    } catch (error: any) {
        // We expect an error if the URL is fake, but we want to see the error message from ScrapeOwl/Class
        console.log("⚠️ ScrapeOwl Attempted (May fail on fake URL, check logs)");
        console.log("   Error:", error.message);
    }
}

async function testKStartup() {
    console.log("\n🧪 Testing K-Startup Scraper (Playwright)...");
    const scraper = new KStartupScraper();

    try {
        const programs = await scraper.fetchLatestPrograms();
        console.log(`✅ K-Startup Scraper Successful. Found ${programs.length} programs.`);
        if (programs.length === 0) {
            console.log("   (Check debug logs for page content snippet)");
        }
        if (programs.length > 0) {
            console.log("   Example:", programs[0]);
        }
    } catch (error: any) {
        console.log("❌ K-Startup Scraper Failed");
        console.log("   Error:", error.message);
    } finally {
        await scraper.close();
    }
}

async function run() {
    console.log("🚀 Starting Scraper Smoke Tests...");
    await testScrapeOwl();
    await testKStartup();
}

run();
