# Implementation Plan: "Agentic OS" Production Upgrade

This plan outlines the roadmap to transform the current MVP into an award-winning, production-grade platform for the "AI Automation Agency". The focus is on **Deep Tech Aesthetics**, **Self-Correcting Architectures**, and **Active Learning Interfaces**.

## User Review Required

> [!IMPORTANT]
> **Tech Stack Additions**: This plan assumes adding `framer-motion` for animations and expanding the UI component library significantly (based on Radix UI / shadcn patterns).
> **New Concept**: We are introducing a "Teaching Station" UI where users can explicitly modify the "Rules" agents have learned.

## Proposed Changes

### 1. Foundation & Design System (Global)
**Goal:** Establish a premium, "trustworthy technical" design language.

#### Fast-Follow Dependencies
- [ ] Install `framer-motion` (for complex layout transitions, vital for showing "Thinking").
- [ ] Install `clsx` and `tailwind-merge` (if not fully utilized).
- [ ] Add `Inter` (sans) and `JetBrains Mono` (mono) via `next/font`.

#### [MODIFY] [globals.css](file:///c:/Users/Lenovo/Desktop/AI%20Automation%20Agency/PRD/web-app/src/app/globals.css)
- **Design Tokens**: Refine HSL variables for a richer Dark Mode (using `slate-950` as base).
- **Utilities**: Add custom utility classes for:
    - `.glass-panel`: Border-lit, blurred background.
    - `.text-gradient`: Gold/Silver/Blue text gradients for headers.
    - `.animate-shine`: Skeleton loading and highlight effects.

#### [NEW] [src/components/ui](file:///c:/Users/Lenovo/Desktop/AI%20Automation%20Agency/PRD/web-app/src/components/ui)
- Expand the component library to include:
    - `Card` (interactive, hover-responsive).
    - `Badge` (status indicators).
    - `ScrollArea` (for logs).
    - `ConfidenceGauge` (Custom circular progress showing Agent certainty).

---

### 2. "Deep Tech" Homepage Overhaul
**Goal:** A landing page that sells "Intelligence", not just "Automation".

#### [MODIFY] [src/app/page.tsx](file:///c:/Users/Lenovo/Desktop/AI%20Automation%20Agency/PRD/web-app/src/app/page.tsx)
- **Hero Section**:
    - **Value Prop**: "Agents that Learn, Reason, and Correct Themselves."
    - **Visual**: A "Cognitive Process Map" (not just a flowchart) showing an agent *fixing its own mistake* in real-time.
- **"Deep Tech" Feature Showcase**:
    - **Slide 1: Reliability**: Show the "Confidence Gauge" pausing a workflow.
    - **Slide 2: Memory**: Show the "Teaching Station" saving a user rule.

---

### 3. Advanced Agentic Features (The "Differentiators")
**Goal:** Show specific UI patterns that prove "Smart" agents.

#### [NEW] [src/components/features/CognitiveVisualizer.tsx](file:///c:/Users/Lenovo/Desktop/AI%20Automation%20Agency/PRD/web-app/src/components/features/CognitiveVisualizer.tsx)
- Use `framer-motion` to show the **Reflection Loop**:
    - Step 1: "Generating Draft..." (Opacity 100%)
    - Step 2: "Critiquing..." (Red accents show on Draft)
    - Step 3: "Refining..." (Text morphs into final version)
- **Why**: Proves the "Self-Correction" value prop instantly.

#### [NEW] [src/components/features/TeachingStation.tsx](file:///c:/Users/Lenovo/Desktop/AI%20Automation%20Agency/PRD/web-app/src/components/features/TeachingStation.tsx)
- A dashboard showing "Learned Rules".
- User can "Edit" or "Delete" what the agent has learned.
- **Visual**: A list of "If/Then" cards that look like logic circuits.

#### [NEW] [src/app/(dashboard)/dashboard/canary/page.tsx](file:///c:/Users/Lenovo/Desktop/AI%20Automation%20Agency/PRD/web-app/src/app/(dashboard)/dashboard/canary/page.tsx)
- A hidden/beta page to demonstrate the "Active Learning" capability with a mock "Trade Doc Helper" that asks for feedback on HS Codes.

---

### 4. SEO & Mobile Optimization
**Goal:** Rank for "AI Automation Agency" and provide app-like feel on phones.

#### [NEW] [src/app/sitemap.ts](file:///c:/Users/Lenovo/Desktop/AI%20Automation%20Agency/PRD/web-app/src/app/sitemap.ts)
- Dynamic sitemap generation.

#### [NEW] [src/app/robots.ts](file:///c:/Users/Lenovo/Desktop/AI%20Automation%20Agency/PRD/web-app/src/app/robots.ts)
- SEO directives.

#### [MODIFY] [src/app/layout.tsx](file:///c:/Users/Lenovo/Desktop/AI%20Automation%20Agency/PRD/web-app/src/app/layout.tsx)
- **Metadata**: Add extensive OpenGraph (OG) tags, Twitter cards.

---

### 5. Backend Integration (Supabase)
**Goal:** Persist agent state and demonstrate "Time-Travel" debugging.

#### [NEW] [src/lib/supabase](file:///c:/Users/Lenovo/Desktop/AI%20Automation%20Agency/PRD/web-app/src/lib/supabase)
- `client.ts`: `@supabase/ssr` browser client.
- `server.ts`: `@supabase/ssr` server client with cookie management.

#### [NEW] [supabase/migrations](file:///c:/Users/Lenovo/Desktop/AI%20Automation%20Agency/PRD/web-app/supabase/migrations)
- `init_trade_schema.sql`:
    - Table `orders`: Tracks agent processing status (`ANALYZING`, `BLOCKED`, `APPROVED`).
    - Table `trade_audits`: Immutable log of every agent "thought" (logs for LiveLogViewer).
    - RLS Policies for secure access.

#### [MODIFY] [src/app/(dashboard)/dashboard/trade-agent/page.tsx](file:///c:/Users/Lenovo/Desktop/AI%20Automation%20Agency/PRD/web-app/src/app/(dashboard)/dashboard/trade-agent/page.tsx)
- Refactor to read/write real data from Supabase.
- Simulate "Agent Worker" via client-side `useEffect` that updates `orders` table to demonstrate progress.

---

### 6. Blueprint #2: Global Merchant (Localization Agent)
**Goal:** Demonstrate "Cultural Intelligence" in automation.

#### [NEW] [supabase/migrations](file:///c:/Users/Lenovo/Desktop/AI%20Automation%20Agency/PRD/web-app/supabase/migrations)
- `20260103_global_merchant.sql`:
    - Table `localizations`: Stores source text, target market, agent reasoning, and adapted content.

#### [NEW] [src/app/(dashboard)/dashboard/global-merchant/page.tsx](file:///c:/Users/Lenovo/Desktop/AI%20Automation%20Agency/PRD/web-app/src/app/(dashboard)/dashboard/global-merchant/page.tsx)
- **UI Layout**: Split pane (Source vs. TARGET).
- **Visualization**: "Concept Mapping" - showing how a phrase like "Cheap" is re-mapped to "Value-focused" for the Japanese market.
- **Micro-Interaction**: User can hover over highlighted words to see *why* the agent changed them (e.g., "Avoided aggressive sales language for JP market").

- **Micro-Interaction**: User can hover over highlighted words to see *why* the agent changed them (e.g., "Avoided aggressive sales language for JP market").

---

### 7. Phase 7: Korean Market Agents (Blueprints #3 & #4)
**Goal:** Automate the "China-to-Korea" e-commerce pipeline.

#### [NEW] [src/app/(dashboard)/dashboard/china-source/page.tsx](file:///c:/Users/Lenovo/Desktop/AI%20Automation%20Agency/PRD/web-app/src/app/(dashboard)/dashboard/china-source/page.tsx)
- **Blueprint #3: ChinaSource Pro**:
    - **Current State**: Mock UI with `setTimeout`.
    - **Implementation Goals**:
        1.  **Server Action (`src/actions/sourcing.ts`)**:
            -   `processSourcing(taskId: string)`:
            -   **Fetch**: Get `source_url` from DB.
            -   **Analyze**: Use Gemini to simulate 1688 scraping/analysis. Input: URL + product keywords (simulated). Output: JSON with `title_cn`, `price_cny`, `moq`, `image_url`.
            -   **Translate**: Use Gemini to translate product details to Korean (Contextual Commerce tone).
            -   **Calculate**: 
                -   `unit_price_krw` = `unit_price_cny` * 192 (Fixed Rate)
                -   `landed_cost` = `unit_price_krw` + Shipping (1200 KRW/unit) + Duty (if > 150 USD).
            -   **Save**: Update `sourcing_tasks` with `product_data`, `landed_cost_analysis`, `translated_content`.
        2.  **Frontend Update**:
            -   Connect "Analyze" button to Server Action.
            -   Display real-time processing logs from Server Action (via `streaming` or polling DB status).

    - **Verification**:
        -   Start Sourcing -> Wait for "COMPLETED" status.
        -   Verify "Profitability Scorecard" shows correct math (CNY * 192).
        -   Verify "Naver Draft" contains Korean text.

#### [NEW] [src/app/(dashboard)/dashboard/naver-seo/page.tsx](file:///c:/Users/Lenovo/Desktop/AI%20Automation%20Agency/PRD/web-app/src/app/(dashboard)/dashboard/naver-seo/page.tsx)
- **Blueprint #4: NaverSEO Pro**:
    - **Current State**: Mock UI with `setTimeout`.
    - **Implementation Goals**:
        1.  **Server Action (`src/actions/naver-seo.ts`)**:
            -   `processSEOAudit(auditId: string)`:
            -   **Fetch**: Get `target_url` from DB.
            -   **Simulate Crawl**: Use Gemini to "analyze" the provided URL (simulated HTML parsing).
            -   **Analyze**: Evaluate Title optimization, Keyword Density, Image Count, and competitive gaps.
            -   **Report**: Generate `optimization_report` with critical/warning issues and a `optimized_title_candidate`.
        2.  **Frontend Update**:
            -   Connect "Start Audit" button to Server Action.
            -   Render real `suggestions` and `metrics` from the DB.

    - **Verification**:
        -   Input URL -> "ANALYZING" -> "COMPLETED".
        -   Verify "Optimization Score" and "Action Plan" are generated by AI (not hardcoded).


---

### 8. Phase 8: Professional Services Agents (Blueprints #5 & #6)
**Goal:** High-value "White Collar" automation for Finance & Consulting.

#### [NEW] [supabase/migrations](file:///c:/Users/Lenovo/Desktop/AI%20Automation%20Agency/PRD/web-app/supabase/migrations)
- `20260103_professional_services.sql`:
    - Table `reconciliation_jobs`: Stores bank CSV data and receipt matches.
    - Table `proposals`: Stores generated proposal drafts and client inputs.

#### [NEW] [src/app/(dashboard)/dashboard/reconciliation/page.tsx](file:///c:/Users/Lenovo/Desktop/AI%20Automation%20Agency/PRD/web-app/src/app/(dashboard)/dashboard/reconciliation/page.tsx)
- **Blueprint #5: Ledger Logic**:
    - **Current State**: Mock UI.
    - **Implementation Goals**:
        1.  **Server Action (`src/actions/reconciliation.ts`)**:
            -   `processReconciliation(jobId: string)`:
            -   **Fetch**: Get `bank_statement_data` and `receipt_data`.
            -   **Fuzzy Logic Engine**:
                -   Iterate through Bank Txs.
                -   Find Receipt where: `ABS(tx.amount) == receipt.amount` AND `Date Diff < 3 days` AND `Vendor Similiarity > 0.8`.
            -   **Update**: Save matches to `match_results`.
        2.  **Frontend Update**:
            -   Connect "Start" buttons to Action.
            -   Display detailed "Confidence Score" for each match.

#### [NEW] [src/app/(dashboard)/dashboard/proposal-gen/page.tsx](file:///c:/Users/Lenovo/Desktop/AI%20Automation%20Agency/PRD/web-app/src/app/(dashboard)/dashboard/proposal-gen/page.tsx)
- **Blueprint #6: Proposal Architect**:
    - **Current State**: Mock UI.
    - **Implementation Goals**:
        1.  **Server Action (`src/actions/proposal.ts`)**:
            -   `processProposal(proposalId: string)`:
            -   **Simulate RAG**: "Search" a hardcoded knowledge base for case studies relevant to `project_scope`.
            -   **Draft**: Use Gemini to write a 4-section Proposal (Exec Summary, Solution, Pricing, Timeline) combining Scope + Retrieved Case Studies.
        2.  **Frontend Update**:
            -   Render Markdown formatted proposal.
            -   Enable "Accept" flow (Mock Stripe Invoice).

#### [NEW] [src/lib/stripe](file:///c:/Users/Lenovo/Desktop/AI%20Automation%20Agency/PRD/web-app/src/lib/stripe)
- **Feature**: "Deal-Closer Autopilot" Integration.
- `client.ts`: Stripe initialization.
- `actions.ts`: Server actions for converting Proposals to Subscriptions.

#### [MODIFY] [supabase/migrations](file:///c:/Users/Lenovo/Desktop/AI%20Automation%20Agency/PRD/web-app/supabase/migrations)
- Update `organizations` table:
    - Add column `stripe_customer_id` (text, nullable).
    - Add column `subscription_status` (text, default 'inactive').

---

### 8.2 Phase 8.2: The "Growth Engine" (Smart Lead Gen)
**Goal**: Automated prospecting and outreach (from Smart Solutions #4).

#### [NEW] [supabase/migrations](file:///c:/Users/Lenovo/Desktop/AI%20Automation%20Agency/PRD/web-app/supabase/migrations)
- `20260103_growth_engine.sql`:
    - Table `leads`: Stores scraped domains, enrichment data, and deal status.
    - Table `outreach_campaigns`: Tracks email drafts and sent status.

#### [NEW] [src/agents/growth-engine](file:///c:/Users/Lenovo/Desktop/AI%20Automation%20Agency/PRD/web-app/src/agents/growth-engine)
- `harvester.ts`: Browser Subagent task for directory scraping (Naver/LinkedIn).
- `enricher.ts`: "Deep Dive" agent that visits lead URL to extract stack/news.
- `copywriter.ts`: Generates personalized icebreakers.

---

### 9. Phase 9: Deep Tech Agents (Blueprints #7 & #8)
**Goal:** Industrial-Grade Automation for R&D and Manufacturing.

#### [NEW] [supabase/migrations](file:///c:/Users/Lenovo/Desktop/AI%20Automation%20Agency/PRD/web-app/supabase/migrations)
- `20260103_deep_tech_schema.sql`:
    - Table `grant_applications`: Stores pitch deck metadata and generated HWP drafts.
    - Table `safety_logs`: Stores IoT sensor text streams and compliance flags.

#### [NEW] [src/app/(dashboard)/dashboard/grant-scout/page.tsx](file:///c:/Users/Lenovo/Desktop/AI%20Automation%20Agency/PRD/web-app/src/app/(dashboard)/dashboard/grant-scout/page.tsx)
- **Blueprint #7: R&D Grant Scout**:
    - **UI**: Document Upload + "Category Matcher".
    - **Logic**: Maps startup tech to Gov "Strategic Guidelines" (simulated vector search).

#### [NEW] [src/app/(dashboard)/dashboard/smart-factory/page.tsx](file:///c:/Users/Lenovo/Desktop/AI%20Automation%20Agency/PRD/web-app/src/app/(dashboard)/dashboard/smart-factory/page.tsx)
- **Blueprint #8: Safety Guardian**:
    - **UI**: Real-time "Sensor Stream" dashboard.
    - **Logic**: Detects outliers (Temp > 80C) and generates legal compliance log.

    - **Logic**: Detects outliers (Temp > 80C) and generates legal compliance log.

---

### 10. Phase 10: Startup Support Agents (Blueprints #9 & #10)
**Goal:** Empowering Startups with Government Funding Automation.

#### [NEW] [supabase/migrations](file:///c:/Users/Lenovo/Desktop/AI%20Automation%20Agency/PRD/web-app/supabase/migrations)
- `20260103_startup_support_schema.sql`:
    - Table `startup_programs`: Database of K-Startup/TIPS grants.
    - Table `program_matches`: Stores eligibility results for specific startups.
    - Table `business_plans`: Stores generated HWP content sections.

#### [NEW] [src/app/(dashboard)/dashboard/k-startup-navigator/page.tsx](file:///c:/Users/Lenovo/Desktop/AI%20Automation%20Agency/PRD/web-app/src/app/(dashboard)/dashboard/k-startup-navigator/page.tsx)
- **Blueprint #9: K-Startup Navigator**:
    - **UI**: Startup Profile Form + Roadmap Visualization.
    - **Logic**: Matches startup criteria vs. Program DB Rules.

#### [NEW] [src/app/(dashboard)/dashboard/business-plan-master/page.tsx](file:///c:/Users/Lenovo/Desktop/AI%20Automation%20Agency/PRD/web-app/src/app/(dashboard)/dashboard/business-plan-master/page.tsx)
- **Blueprint #10: Business Plan Master**:
    - **UI**: Deck Upload + "Section Generator".
    - **Logic**: Transforms English text to "Korean Gov Standard" HWP structure.

---

## Verification Plan

### Automated Tests
- `npm run lint`: Ensure no accessibility (a11y) violations.
- `npm run build`: Verify no type errors in new strict components.

### Manual Verification
- **Visual Check**:
    - Verify `CognitiveVisualizer` animation loop plays smoothly.
    - Check `ConfidenceGauge` color changes (Green > 90, Yellow > 70, Red < 50).
- **Mobile Check**: Open on iOS Simulator/Device. Check "Teaching Station" cards are touch-friendly.
