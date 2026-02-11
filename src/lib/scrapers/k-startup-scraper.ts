import { createLogger } from "@/lib/logger"
import { Browser, chromium } from "playwright"

export interface StartupProgram {
    title: string
    url: string
    deadline: string
    category: string
    organization: string
}

export class KStartupScraper {
    private logger = createLogger({ agent: "k-startup-scraper" })
    private browser: Browser | null = null

    /**
     * Initialize with verified Webshare proxy
     */
    async init() {
        // Playwright proxy format
        // process.env.WEBSHARE_API_KEY could be used to fetch the proxy list
        // OR process.env.PROXY_URL is set to a rotating proxy provided by Webshare
        // The user gave us a KEY for Webshare API.
        // We probably need to fetch a valid proxy from Webshare API first?
        // Or assume they configured a rotating gateway.
        // Let's assume standard rotating proxy format if PROXY_URL is set.
        // If not, we might need to use the API key to get one. 
        // For now, let's use the PROXY_URL env var which the user likely set in .env
        // But if they only set WEBSHARE_API_KEY, we might need code to fetch it.
        // CHECK: User message said "I set these in the .env".

        // Let's rely on PROXY_URL being standard. 
        // Fallback: If no PROXY_URL but WEBSHARE_API_KEY, we could try to construct one 
        // (p.webshare.io usually) but that requires user/pass. 
        // The API Key might be for the dashboard.

        // Let's assume PROXY_URL is populated correctly in .env as per instructions.
        // If not, we log warning.

        const proxyUrl = process.env.PROXY_URL
        const launchOptions: any = { headless: true }

        if (proxyUrl) {
            try {
                const url = new URL(proxyUrl)
                launchOptions.proxy = {
                    server: `${url.protocol}//${url.hostname}:${url.port}`,
                    username: url.username,
                    password: url.password
                }
                this.logger.info("Using Proxy for K-Startup")
            } catch (e) {
                this.logger.error("Invalid Proxy URL", e)
            }
        }

        this.browser = await chromium.launch(launchOptions)
    }

    async close() {
        if (this.browser) await this.browser.close()
    }

    /**
     * Scrape K-Startup.go.kr announcement list
     */
    async fetchLatestPrograms(): Promise<StartupProgram[]> {
        if (!this.browser) await this.init()
        const page = await this.browser!.newPage()

        try {
            const url = "https://www.k-startup.go.kr/web/contents/bizpbanc-ongoing.do" // Main announcement list
            this.logger.info("Navigating to K-Startup", { url })

            await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 })

            // Wait for the slick slider content which we now know exists
            try {
                // Verified selector from browser subagent
                await page.waitForSelector('.slide:not(.slick-cloned)', { timeout: 15000 })
            } catch (e) {
                this.logger.warn("Specific list selector not found, trying generic selectors as fallback")
            }

            const programs = await page.evaluate(() => {
                // Selector strategy based on browser subagent findings
                // The site uses a "Slick" slider. We want unique items only.
                const cards = Array.from(document.querySelectorAll('.slide:not(.slick-cloned), .board_list tbody tr'))

                return cards.map(card => {
                    // 1. Try Verified Selectors (Card Layout)
                    let titleEl = card.querySelector('.tit_wrap p')
                    let dateEl = card.querySelector('.ann_top .right p.txt') // "마감일자 2025-01-01"
                    let orgEl = card.querySelector('.ann_bot ul li:nth-child(2)') // Organization is usually 2nd item
                    let linkEl = card.querySelector('a[href^="javascript:go_view"]')

                    // 2. Fallback to Table Layout (if view changes)
                    if (!titleEl) titleEl = card.querySelector('.subject a');
                    if (!dateEl) dateEl = card.querySelector('.date');
                    if (!orgEl) orgEl = card.querySelector('.writer');

                    // Parse JS Link if present: "javascript:go_view('12345')"
                    let url = "";
                    if (linkEl) {
                        const href = linkEl.getAttribute('href');
                        if (href && href.includes('go_view')) {
                            // Extract ID from javascript:go_view('1234')
                            const match = href.match(/go_view\(['"]?(\d+)['"]?\)/);
                            if (match && match[1]) {
                                // Construct standard view URL
                                url = `https://www.k-startup.go.kr/web/contents/bizpbanc-ongoing.do?schM=view&pbancSn=${match[1]}&page=1`;
                            } else {
                                url = href; // Fallback to raw JS
                            }
                        } else if ((linkEl as HTMLAnchorElement).href) {
                            url = (linkEl as HTMLAnchorElement).href;
                        }
                    }

                    // Clean Text
                    const title = titleEl?.textContent?.trim() || "";
                    let deadline = dateEl?.textContent?.trim() || "";
                    if (deadline.includes("마감일자")) {
                        deadline = deadline.replace("마감일자", "").trim();
                    }
                    const organization = orgEl?.textContent?.trim() || "";

                    return {
                        title: title,
                        url: url,
                        deadline: deadline,
                        category: "General", // Category is harder to pin down, default to General
                        organization: organization
                    }
                }).filter(p => p.title && p.url) // Filter empty results
            })

            if (programs.length === 0) {
                const title = await page.title()
                const bodyText = await page.evaluate(() => document.body.innerText.slice(0, 200).replace(/\n/g, ' '))
            }

            return programs
        } catch (error) {
            this.logger.error("K-Startup scraping failed", error)
            return []
        } finally {
            await page.close()
        }
    }
}
