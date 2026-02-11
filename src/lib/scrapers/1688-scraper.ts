import { createLogger } from "@/lib/logger"
import { ScrapeOwlClient } from "./scrapeowl-client"

// Interface for what we want to return
export interface ScrapedProduct {
    title: string
    price: {
        displayPrice: string
        minPrice: number
        currency: string
    }
    moq: number
    imageUrl: string
    detailUrl: string
    seller: {
        name: string
        years: number
        rating: number
    }
}

export class Alibaba1688Scraper {
    private logger = createLogger({ agent: "1688-scraper" })
    private client: ScrapeOwlClient

    constructor() {
        this.client = new ScrapeOwlClient()
    }

    /**
     * Initialize - essentially a no-op now as we use stateless API, but kept for compatibility
     */
    async init(options: any = {}) {
        // No-op for API based scraper
    }

    /**
     * Close - no-op
     */
    async close() {
        // No-op
    }

    /**
     * Get detailed product info from a 1688 URL
     */
    async getProductDetail(url: string): Promise<any> {
        // Relaxed check to allow Taobao/Shortlinks for testing
        if (!url || (!url.includes("1688.com") && !url.includes("tb.cn") && !url.includes("taobao"))) {
            this.logger.warn("URL might not be 1688.com", { url })
            // throw new Error("Invalid 1688 URL") // Temporarily allowed for testing
        }

        this.logger.info("Fetching product detail via ScrapeOwl", { url })

        try {
            // We use ScrapeOwl's extraction object to get structured data
            // This is more reliable than raw HTML parsing
            const extractionRules = {
                title: { selector: ".d-title", output: "text" },
                price: { selector: ".price-text", output: "text" }, // Fallback selector
                image: { selector: ".main-img-list img", output: "src" },
                specs: { selector: ".offer-attr-list", output: "text" }
            }

            const response = await this.client.scrape(url, {
                render_js: true, // 1688 is heavy SPA
                premium_proxies: true, // Needed for Alibaba/1688 (Plural key required by API)
                country: "cn", // Use China proxy
                wait_for: ".d-title", // Wait for title to load
                elements: [
                    {
                        type: "css",
                        selector: ".d-title",
                        name: "title"
                    },
                    {
                        type: "css",
                        selector: ".price-text", // This selector might vary, 1688 changes often
                        name: "price_raw"
                    },
                    {
                        type: "css",
                        selector: ".main-img-list img",
                        name: "primary_image",
                        attribute: "src"
                    }
                ]
                // Alternative: just get full HTML and parse with Cheerio if extraction is flaky
                // But let's try to get full HTML for the AI to parse if needed.
            })

            // If we requested elements, response.data will be the object.
            // But let's simplify: Get the HTML and let the existing AI logic (in sourcing.ts) 
            // handle some parsing, OR return a structured object here.
            // The `sourcing.ts` logic expects `productRawData`.

            // Let's actually ask ScrapeOwl to return the full HTML content 
            // AND the extraction. But simpler matching: return the raw result and let logic handle it.

            // Actually, `sourcing.ts` currently does:
            // productRawData = await scraper.getProductDetail(task.source_url)
            // And then passes `productRawData` to the LLM prompt.
            // So we can return ANYTHING here. 
            // The best is to return a clean JSON object if possible, or just the extraction result.

            // Let's refine the ScrapeOwl call to just get the body text or extraction
            const smartResponse = await this.client.scrape(url, {
                render_js: true,
                premium_proxies: true,
                country: "cn",
                wait_for: 5000, // Wait 5s for hydration
                // We will return the full extracted text logic + some selectors
                elements: [
                    { type: "css", selector: "h1.d-title", name: "title" },
                    { type: "css", selector: ".price-text", name: "price" },
                    { type: "xpath", selector: "//meta[@property='og:image']", name: "image", attribute: "content" },
                    { type: "css", selector: ".obj-content", name: "description" }
                ]
            })

            // Check if we got data
            if (smartResponse.data) {
                return smartResponse.data
            }

            return { error: "No structured data returned", raw: smartResponse }

        } catch (error: any) {
            // Enhance error message for common ScrapeOwl codes
            if (error.message && error.message.includes("500")) {
                this.logger.error("ScrapeOwl 500 Error: often means invalid URL or premium proxy needed.", { url })
            } else {
                this.logger.error("Failed to scrape 1688 product", error)
            }
            throw error // Let sourcing.ts handle the error
        }
    }

    /**
     * Search currently just throws or returns empty as implementation is complex
     * We focus on Detail scraping first as per requirement
     */
    async search(keyword: string): Promise<ScrapedProduct[]> {
        this.logger.warn("Search not yet implemented with ScrapeOwl")
        return []
    }
}
