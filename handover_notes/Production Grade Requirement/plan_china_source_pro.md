# Production Upgrade Plan: China Source Pro (Sourcing)

## 1. Goal
Upgrade **China Source Pro** into an end-to-end autonomous dropshipping sourcing agent that doesn't just "find" products but calculates total profitability (Landed Cost) and validates suppliers.

## 2. Production Grade Requirements

### A. Core Features
1.  **Deep Supplier Vetting**:
    *   Analyze supplier age, return rates, response times, and badges (e.g., "Bull's Head" on 1688).
    *   Use verified data sources (Perplexity/Search) to check for scam reports on factory names.
2.  **True Landed Cost Calculator**:
    *   Move beyond "Unit Price". Calculate: Unit Price + Domestic Shipping (China) + Int'l Shipping (Air/Sea) + Tariffs (HS Code lookup) + VAT.
3.  **Real-Time Stock Monitoring**:
    *   Mechanism to periodically re-check URLs for stock status and price changes.
4.  **Content "Transcreation"**:
    *   Convert "Chinglish" product specs into native, marketing-ready Korean/English descriptions (not just direct translation).

### B. Advanced Capabilities
*   **Image Search / Visual Sourcing**: Allow user to upload an image of a competitor product and find the factory source on 1688.
*   **Trend Spotting**: Cross-reference sourced items with current "Rising Trends" on Google Trends or social media (simulated via Perplexity research).

## 3. Tech Stack & APIs
*   **Scraping**: ScrapeOwl or ZenRows (for 1688/Taobao access - critical).
*   **AI**: Gemini 1.5 Flash (Translation), Perplexity (Supplier Vetting).
*   **Shipping API**: External shipping calculator API or strict logic tables for weight-based estimation.

## 4. Implementation Strategy

### Phase 1: Robust Scraping Engine
1.  Integrate ScrapeOwl/ZenRows specifically configured for 1688.com (anti-bot bypass).
2.  Build parsers for complex variants (Color/Size pricing matrices).

### Phase 2: Landed Cost & Logic
1.  Create `HS_Code` lookup table/logic to estimate tariffs.
2.  Implement `calculateProfitability` action that takes a target retail price and returns Margin %.

### Phase 3: Supplier Vetting Agent
1.  Create a sub-agent that takes a Seller Name and queries the web/Perplexity for reputation.
2.  Generate a "Supplier Trust Score" (A-F grade).

## 5. Verification Plan
*   **Live Sourcing Test**: Source a real item (e.g., "Portable Humidifier"), verify the extracted Price/MOQ matches the live 1688 page.
*   **Math Check**: Manually verify Landed Cost calculation for a 1kg package to Korea.
*   **Language Check**: Ensure "Transcreated" description reads naturally in Korean, not machine-translated.
