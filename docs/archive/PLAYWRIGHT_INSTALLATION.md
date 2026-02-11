# Playwright Installation Guide

**For Real 1688.com Scraping Integration**

---

## Why Playwright?

Playwright is **already referenced** in the project documentation but not yet installed. It's the recommended choice over Puppeteer for this project because:

1. **Better TypeScript Support** - First-class TypeScript definitions
2. **Modern API** - More developer-friendly than Puppeteer
3. **Multi-browser** - Supports Chromium, Firefox, WebKit out of the box
4. **Active Development** - Maintained by Microsoft
5. **Stealth Mode Built-in** - Better bot detection evasion

---

## Installation

### 1. Install Playwright
```bash
cd web-app
npm install playwright
```

### 2. Install Browser Binaries
```bash
npx playwright install chromium
```

**Note**: Only install Chromium to save disk space (saves ~1GB vs all browsers)

---

## Usage Example for Sourcing Agent

### Current (Mock Data):
```typescript
// src/actions/sourcing.ts
const prompt = `
  Analyze this URL: "${task.source_url}"
  Generate plausible product data...
`
const { object } = await generateObject({ model, schema, prompt })
```

### Future (Real Scraping):
```typescript
// src/actions/sourcing.ts
import { chromium } from 'playwright'

async function scrape1688Product(url: string) {
  const browser = await chromium.launch({
    headless: true,
    proxy: {
      server: process.env.BRIGHT_DATA_PROXY_URL // e.g., 'http://brd.superproxy.io:22225'
    }
  })

  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)...',
    locale: 'zh-CN',
  })

  const page = await context.newPage()

  try {
    await page.goto(url, { waitUntil: 'networkidle' })

    // Extract real data
    const productData = await page.evaluate(() => ({
      title_cn: document.querySelector('.title')?.textContent || '',
      image_url: document.querySelector('.main-image')?.getAttribute('src') || '',
      moq: parseInt(document.querySelector('.moq')?.textContent || '1'),
      price_cny: parseFloat(document.querySelector('.price')?.textContent || '0')
    }))

    return productData
  } finally {
    await browser.close()
  }
}

// Then use AI for translation/analysis
const realData = await scrape1688Product(task.source_url)
const { object } = await generateObject({
  model,
  schema,
  prompt: `Translate this Chinese product data to Korean: ${JSON.stringify(realData)}`
})
```

---

## Integration with Bright Data Proxies

### Setup Bright Data
1. Sign up at [brightdata.com](https://brightdata.com)
2. Create a residential proxy zone for China
3. Get proxy URL: `brd.superproxy.io:22225`
4. Get credentials: `username-zone-residential:password`

### Add to Environment
```bash
# .env.local
BRIGHT_DATA_PROXY_URL=http://brd.superproxy.io:22225
BRIGHT_DATA_USERNAME=username-zone-residential
BRIGHT_DATA_PASSWORD=your-password
```

### Use in Playwright
```typescript
const browser = await chromium.launch({
  proxy: {
    server: process.env.BRIGHT_DATA_PROXY_URL,
    username: process.env.BRIGHT_DATA_USERNAME,
    password: process.env.BRIGHT_DATA_PASSWORD
  }
})
```

---

## Handling 1688.com Authentication

### Option 1: Cookie-based (Simpler)
```typescript
// Login once manually, export cookies
const cookies = JSON.parse(fs.readFileSync('1688-cookies.json', 'utf8'))

const context = await browser.newContext({
  storageState: { cookies, origins: [] }
})
```

### Option 2: Automated Login (More Robust)
```typescript
async function login1688(page: Page) {
  await page.goto('https://login.1688.com')

  // Fill login form
  await page.fill('input[name="loginId"]', process.env.ALIBABA_1688_USERNAME)
  await page.fill('input[name="password"]', process.env.ALIBABA_1688_PASSWORD)
  await page.click('button[type="submit"]')

  // Wait for redirect
  await page.waitForURL('https://www.1688.com/**')

  // Save session
  const cookies = await page.context().cookies()
  fs.writeFileSync('1688-cookies.json', JSON.stringify(cookies))
}
```

---

## Complete Scraper Example

```typescript
// src/lib/scrapers/1688-scraper.ts
import { chromium, Browser, BrowserContext, Page } from 'playwright'
import { createLogger } from '@/lib/logger'

const logger = createLogger({ service: '1688-scraper' })

export interface Product1688 {
  title_cn: string
  image_url: string
  moq: number
  price_cny: number
  supplier_name: string
  rating: number
}

class Scraper1688 {
  private browser: Browser | null = null
  private context: BrowserContext | null = null

  async init() {
    this.browser = await chromium.launch({
      headless: true,
      proxy: {
        server: process.env.BRIGHT_DATA_PROXY_URL || '',
        username: process.env.BRIGHT_DATA_USERNAME,
        password: process.env.BRIGHT_DATA_PASSWORD
      }
    })

    this.context = await this.browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      locale: 'zh-CN',
      viewport: { width: 1920, height: 1080 }
    })

    // Load cookies if available
    try {
      const cookies = JSON.parse(fs.readFileSync('1688-cookies.json', 'utf8'))
      await this.context.addCookies(cookies)
      logger.info('Loaded 1688 cookies')
    } catch {
      logger.warn('No cookies found, scraping as guest')
    }
  }

  async scrapeProduct(url: string): Promise<Product1688> {
    if (!this.context) throw new Error('Scraper not initialized')

    const page = await this.context.newPage()

    try {
      logger.info('Scraping product', { url })

      await page.goto(url, {
        waitUntil: 'networkidle',
        timeout: 30000
      })

      // Wait for product data to load
      await page.waitForSelector('.detail-title', { timeout: 10000 })

      const productData = await page.evaluate(() => {
        const title = document.querySelector('.detail-title')?.textContent?.trim() || ''
        const image = document.querySelector('.detail-gallery img')?.getAttribute('src') || ''
        const moqText = document.querySelector('.moq-value')?.textContent || '1'
        const priceText = document.querySelector('.price-value')?.textContent || '0'
        const supplier = document.querySelector('.supplier-name')?.textContent?.trim() || ''
        const ratingText = document.querySelector('.rating-score')?.textContent || '0'

        return {
          title_cn: title,
          image_url: image,
          moq: parseInt(moqText.replace(/\D/g, '')),
          price_cny: parseFloat(priceText.replace(/[^\d.]/g, '')),
          supplier_name: supplier,
          rating: parseFloat(ratingText)
        }
      })

      logger.info('Product scraped successfully', { title: productData.title_cn })
      return productData

    } catch (error) {
      logger.error('Failed to scrape product', error)
      throw error
    } finally {
      await page.close()
    }
  }

  async close() {
    if (this.browser) {
      await this.browser.close()
      this.browser = null
      this.context = null
    }
  }
}

export const scraper1688 = new Scraper1688()
```

---

## Updating Sourcing Agent

```typescript
// src/actions/sourcing.ts
import { scraper1688 } from '@/lib/scrapers/1688-scraper'

export async function processSourcing(taskId: string) {
  // ... existing code ...

  try {
    // Remove ensureMockDataAllowed() once real scraper is implemented

    // Real scraping
    await scraper1688.init()
    const realProductData = await scraper1688.scrapeProduct(task.source_url)
    await scraper1688.close()

    // Use AI for translation/localization only
    const { object } = await generateObject({
      model: defaultModel,
      schema: SourcingResultSchema,
      prompt: `
        Translate and localize this Chinese product for Korean market:

        Chinese Title: ${realProductData.title_cn}
        Price (CNY): ${realProductData.price_cny}
        MOQ: ${realProductData.moq}

        Generate:
        1. Korean title (optimized for Naver Smart Store)
        2. Korean description (enticing, SEO-friendly)
        3. Key selling points in Korean
        4. Search tags for Korean market
      `
    })

    // Update database with real + translated data
    await supabase.from('sourcing_tasks').update({
      status: 'COMPLETED',
      product_data: realProductData,
      translated_content: object.translated_content,
      landed_cost_analysis: calculateLandedCost(realProductData.price_cny)
    })
  }
}
```

---

## Cost Estimate

### Playwright (Free)
- ✅ Open source, no licensing cost

### Bright Data (Paid)
- Residential Proxies: **$8.40/GB** (China zone)
- Typical product page: ~2MB
- **~$0.017 per product scraped** (negligible)

### Comparison
- Mock data (AI hallucination): **$0.0001/product** but unreliable
- Real scraping: **$0.017/product** but accurate

**ROI**: Accurate product data = higher margins + fewer customer complaints

---

## Testing

```bash
# Test Playwright installation
npx playwright --version

# Test browser installation
npx playwright install --with-deps chromium

# Run test scraper
node scripts/test-1688-scraper.js
```

---

## Next Steps

1. [ ] Install Playwright: `npm install playwright`
2. [ ] Sign up for Bright Data account
3. [ ] Create scraper class in `src/lib/scrapers/1688-scraper.ts`
4. [ ] Update `src/actions/sourcing.ts` to use real scraper
5. [ ] Remove `ensureMockDataAllowed()` guard once implemented
6. [ ] Test with real 1688.com URLs
7. [ ] Monitor scraping success rate and adjust selectors as needed

---

## Troubleshooting

### "Executable doesn't exist" error
```bash
npx playwright install chromium
```

### Proxy connection timeout
- Check Bright Data credentials
- Verify proxy URL format
- Test proxy independently: `curl -x http://user:pass@proxy:port https://1688.com`

### Bot detection / Captcha
- Use residential proxies (not datacenter)
- Rotate user agents
- Add random delays between requests
- Use cookie-based authentication

---

**Status**: Ready to implement
**Estimated Work**: 1-2 days for full scraper + integration
