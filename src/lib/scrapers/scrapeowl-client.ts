import { createLogger } from "@/lib/logger"

const logger = createLogger({ agent: "scrapeowl-client" })

interface ScrapeOwlOptions {
    apiKey?: string
    timeout?: number
}

interface ScrapeOwlResponse {
    data?: any
    content?: string // HTML content
    status: number
    error?: string // On failure
}

export class ScrapeOwlClient {
    private apiKey: string
    private baseUrl = "https://api.scrapeowl.com/v1/scrape"

    constructor(options: ScrapeOwlOptions = {}) {
        this.apiKey = options.apiKey || process.env.SCRAPEOWL_API_KEY || ""
        if (!this.apiKey) {
            logger.warn("SCRAPEOWL_API_KEY is missing. Scraper will fail.")
        }
    }

    /**
     * Scrape a URL using ScrapeOwl
     * @param url The target URL
     * @param options Additional ScrapeOwl options (render_js, premium_proxy, etc.)
     */
    async scrape(url: string, options: any = {}): Promise<ScrapeOwlResponse> {
        if (!this.apiKey) {
            throw new Error("Missing ScrapeOwl API Key")
        }

        const payload = {
            api_key: this.apiKey,
            url: url,
            ...options
        }

        try {
            logger.info("Sending request to ScrapeOwl", { url })

            const response = await fetch(this.baseUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            })

            if (!response.ok) {
                const errorText = await response.text()
                logger.error("ScrapeOwl failed", { status: response.status, error: errorText })
                throw new Error(`ScrapeOwl API Error: ${response.status} - ${errorText}`)
            }

            // ScrapeOwl returns the data directly. Use .text() or .json() based on what we asked for.
            // If extracting elements, it returns JSON. If just scraping HTML, it returns HTML text.
            // But actually, the API response is usually JSON if elements are specified, or just the content?
            // Let's assume standardized JSON output logic or we parse based on content-type.

            const contentType = response.headers.get("content-type")
            if (contentType && contentType.includes("application/json")) {
                const data = await response.json()
                return { status: response.status, data }
            } else {
                const content = await response.text()
                return { status: response.status, content }
            }

        } catch (error: any) {
            logger.error("ScrapeOwl execution error", error)
            throw error
        }
    }
}
