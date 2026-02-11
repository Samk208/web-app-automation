
import { Alibaba1688Scraper } from '@/lib/scrapers/1688-scraper';
import { config } from 'dotenv';
config({ path: '.env.local' });

async function testScraper() {
    console.log("Starting 1688 Scraper Test...");
    const scraper = new Alibaba1688Scraper();

    try {
        // Test 1: Search
        console.log("\n1. Testing Search (Keyword: 'iphone case')...");
        try {
            await scraper.init({ headless: true, useProxy: !!process.env.BRIGHT_DATA_PROXY_URL });
            const products = await scraper.search("iphone case");
            console.log(`Found ${products.length} products:`);
            products.forEach(p => console.log(` - ${p.title} (${p.price.displayPrice})`));
        } catch (e: any) {
            console.error("Search failed:", e.message);
        }

        // Test 2: Detail
        console.log("\n2. Testing Detail (URL)...");
        const testUrl = "https://detail.1688.com/offer/673468579973.html";
        try {
            const detail = await scraper.getProductDetail(testUrl);
            console.log("Detail Result:", detail ? "Success" : "Failed/Empty");
            if (detail) console.log(detail);
        } catch (e: any) {
            console.error("Detail failed:", e.message);
        }

    } catch (err) {
        console.error("Test Suite Error:", err);
    } finally {
        await scraper.close();
        console.log("\nTest Completed.");
    }
}

testScraper();
