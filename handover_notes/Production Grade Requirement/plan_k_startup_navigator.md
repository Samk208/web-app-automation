# Production Upgrade Plan: K-Startup Navigator (GovTech)

## 1. Goal
Upgrade **K-Startup Navigator** from a simple search tool to a **Predictive Grant Consultant**. It will match startups to government programs (TIPS/OASIS) and *predict* their win rate based on historical data alignment.

## 2. Production Grade Requirements

### A. Core Features
1.  **Predictive Eligibility Scoring**:
    *   Analyze detailed startup metrics (Team PhDs, Patents, Revenue, Sector) against specific grant requirements.
    *   Output a "Win Probability Score" (e.g., "85% - High Fit") with concrete gap analysis (e.g., "Missing a patent in AI sector").
2.  **Dynamic Database**:
    *   Aggregating K-Startup, BizInfo, and other portals.
    *   **Auto-Update**: Daily cron job to scrape/fetch new notices so data is never stale.
3.  **Application drafter**:
    *   Auto-generate the "First Draft" of the core application forms (PSST common sections) based on the startup's profile.

### B. Advanced Capabilities
*   **Hyle (HWP) Native Support**:
    *   Since Korean gov't uses HWP, integration with the HWP Converter is critical. Can read/write HWP requirements directly.
*   **Timeline Manager**:
    *   "Grant Calendar" visualization: Alert user 2 weeks, 1 week, and 3 days before deadline.

## 3. Tech Stack & APIs
*   **Database**: Supabase `grants` (vectorized embeddings for semantic search).
*   **External Data**: Simulated or Scraped feed from K-Startup.
*   **AI**: Gemini 1.5 Pro (Reasoning for eligibility). Cladue 3.5 Sonnet (optional, good for Korean writing).

## 4. Implementation Strategy

### Phase 1: Data Pipeline
1.  Implement `ingest_kstartup_feed` (scraper/API).
2.  Vectorize all Grant Notices: `description`, `eligibility_criteria`.
3.  Store metadata: `deadline`, `max_funding`, `sector`.

### Phase 2: Matching Intelligence
1.  Enhance `k-startup.ts` with `calculateWinProbability`.
2.  **Critic Loop**: Compare User Profile vs. Grant Requirements. List "Fatal Flaws" (e.g., User is 8 years old, grant is for <7 years).

### Phase 3: Application Assistance
1.  Reuse "Business Plan Master" engine to generate specific answers for specific grant questions.

## 5. Verification Plan
*   **Accuracy Test**: Create a "Dummy Startup" (e.g., 8-year old Mfg company) and ensure it is REJECTED by "Youth Startup <3 Years" grants.
*   **Data Freshness**: Verify that a grant posted today appears in the search within 24 hours.
*   **Scoring Logic**: Verify that a perfect match returns a high score (>90%).
