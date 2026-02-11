# Production Upgrade Plan: Naver SEO Master (Marketing)

## 1. Goal
Upgrade **Naver SEO Master** to align with **Naver's 2025 Smart Store Algorithm**, focusing on AI-driven personalization, "DIA+" ranking logic, and visual engagement metrics.

## 2. Production Grade Requirements

### A. Core Features
1.  **DIA+ Logic Alignment (Deep Intent Analysis)**:
    *   Analyze product descriptions not just for keywords, but for "Expertise," "Experience," and "Trustworthiness" signals Naver values.
    *   Score content based on "Helpfulness" – does it answer potential buyer questions?
2.  **Visual SEO Audit**:
    *   Analyze thumbnails: Is text readable? Is it high contrast? (Naver rewards high-CTR images).
    *   Check for "Gif/Video" inclusion in detail pages (a massive ranking boost factor).
3.  **Keyword "Golden Ratio" Check**:
    *   Ensure keywords are placed naturally in Title, Tags, and top 100 characters of description without "Keyword Stuffing" penalties.
4.  **Trend Monitoring**:
    *   Monitor "Naver DataLab" trends (via scraping/API if possible, or Perplexity) to suggest rising keywords.

### B. Advanced Capabilities
*   **Competitor Gap Analysis**: Scrape top 3 ranking products for a keyword and output a "Gap Report" (e.g., "They all have 5+ GIFs, you have 0").
*   **Mobile Optimization Check**: Simulate mobile view rendering to ensure readability on small screens (crucial for Korean e-commerce).

## 3. Tech Stack & APIs
*   **Scraping**: ScrapeOwl (Korea proxy essential).
*   **AI**: Gemini 1.5 Flash (Analysis), Perplexity (Trend verification).
*   **Vision**: Google Cloud Vision or Gemini Vision for thumbnail scoring.

## 4. Implementation Strategy

### Phase 1: Advanced Audit Engine
1.  Update `naver-seo.ts` to act as a "Virtual Crawler".
2.  Implement `checkVisualDensity`: Count images/gifs per 100 words.
3.  Implement `checkMobileReadability`: heuristics for paragraph length and font size (if HTML provided).

### Phase 2: Content Optimization
1.  Action: `generateOptimizedTitle`: produce 3 title candidates mixing "Main Keyword" + "Emotional Adjective" + "Product Type".
2.  Action: `suggestReviewIncentives`: AI suggests strategies to get more reviews (vital for Naver SEO).

### Phase 3: Competitor Tracking
1.  Recurring job: Check rank of user's product for target keywords daily.

## 5. Verification Plan
*   **Algorithm Alignment**: Verify that the customized advice (e.g., "Add more Gif") actually correlates with Naver best practices.
*   **Scraping Reliability**: Test scraping a real Naver Smart Store page to ensures selectors are current.
*   **Output Quality**: User blind test of "Old Title" vs "AI Title" for clickability.
