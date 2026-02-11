# WonLink Agents – Handover & Production Implementation Plan

## Scope
- Project: WonLink AI Automation Agency (Next.js 16, Supabase, LangGraph, MCP, Playwright)
- Local stack: healthy; analytics/vector disabled; storage volume reset; tables present (mostly empty except `hwp_jobs` 4, `hwp_job_dlq` 1).
- Recent changes: Business Plan Master budget enforcement + cost tracking; HWP enqueue flag-gated; frontend shows budget/HWP status.

## Environment Flags & Keys
- Enable HWP conversion when ready: `ENABLE_HWP_CONVERTER=true`, `NEXT_PUBLIC_ENABLE_HWP_CONVERTER=true`
- CloudConvert (for HWP): `CLOUD_CONVERT_API_KEY=<key>`
- Proxy-dependent scrapers: set `PROXY_URL` (and related, e.g., `WEBSHARE_API_KEY`/ScrapeOwl if used).

## Agent-by-Agent Status & Gaps
1) **Business Plan Master**
   - Backend: Supabase + rate limit + PSST generator + diagrams + MCP DOCX; budget enforcement added; cost tracking added; HWP enqueue now behind flag.
   - Gaps: Real HWP conversion pipeline still stubbed unless CloudConvert is configured; token usage not threaded from PSST generator (estimated only); HITL present.
   - Frontend: Shows errors/budget messages; HWP status (disabled/converting/ready).

2) **Proposal Architect**
   - Backend: Budget/cost tracking; MCP DOCX; RAG uses simple keyword filter (no vector).
   - Gaps: Stronger retrieval (vector), HITL for risky outputs, better client URL parsing; optional pricing guardrails/UI.

3) **ChinaSource Pro (1688)**
   - Backend: Optional real scrape via `Alibaba1688Scraper`; AI fallback if scrape fails.
   - Gaps: Enforce proxy requirement in prod; clear failure mode (don’t silently fall back); retry/backoff; real landed cost data; PII/secret scrub.
   - Frontend: Should show “proxy required / scraping / fallback” states.

4) **Grant Scout**
   - Backend: Uses mock `startup_programs`; guarded by `ensureMockDataAllowed`.
   - Gaps: Daily scraper for K-Startup/NIPA; eligibility rules engine; remove mock path in prod; cost/rate limits.
   - Frontend: Indicate data freshness/live vs mock.

5) **K-Startup Navigator**
   - Backend: Reads `startup_programs` (assumes populated); no mock guard.
   - Gaps: Same as Grant Scout (scraper + rules); org scoping checks; rate/cost guards.
   - Frontend: Data freshness indicator; live vs cached.

6) **NaverSEO Pro**
   - Backend: Simulated audit; `ensureMockDataAllowed`; no crawler/SERP.
   - Gaps: Real crawler (Lighthouse/Playwright) + SERP (DataForSEO/SerpApi for Naver); rank tracking job; budget/cost guards; hitl optional.
   - Frontend: Show crawl status/errors; live metrics.

7) **Safety Guardian**
   - Backend: Threshold >80 logs to `safety_logs`; rate limit + org required.
   - Gaps: Real sensor ingest (MQTT/edge stubs), alert fan-out (email/SMS/webhook), AV/PII guard, severity/runbook mapping, storage immutability.
   - Frontend: Alert states, runbook hints.

8) **Global Merchant**
   - Backend: AI localization; no rate limit/cost tracking; uses anon org.
   - Gaps: Add org scoping, rate/cost guard, glossary/QA, source/target validation.
   - Frontend: Status + error toasts.

9) **Ledger Logic**
   - Backend: Local fuzzy reconciliation of provided bank/receipt data; no external feeds.
   - Gaps: External feeds (Plaid/Codef) optional; HITL for finance; org scoping/rate/cost guard; audit log.
   - Frontend: Present matches/unreconciled with confidence; allow HITL decisions.

10) **HWP Converter (worker)**
    - Worker supports CloudConvert; retries/backoff/DLQ implemented.
    - Gaps: Enable flags + bucket check; monitor DLQ; optional switch to on-prem converter if CloudConvert not allowed.

## Backend Implementation Plan (Prioritized)
1) Business Plan Master
   - Enable HWP: set flags + `CLOUD_CONVERT_API_KEY`, ensure bucket (`business-plans`) exists, run worker loop (PM2/cron).
   - Thread actual token usage from PSST generator (expose usage from `generateObject` or wrap with `withCostEnforcement`).
2) ChinaSource Pro
   - Enforce proxy presence in prod; fail-fast without proxy; add retry/backoff; explicit error to UI; gate AI fallback behind dev flag.
3) Grant Scout / K-Startup
   - Add scraper (K-Startup/NIPA) + cron; store programs; implement eligibility rules engine; guard mock in prod.
4) NaverSEO Pro
   - Add crawler + SERP (DataForSEO/SerpApi); rank tracker job; surface results; guard mock in prod.
5) Safety Guardian
   - Add alert fan-out + severity mapping; ingest stub (MQTT); AV/PII guard; RLS check sweep.
6) Proposal Architect
   - Add vector retrieval for `knowledge_base`; optional HITL gate for high-stakes; budget UI hooks.
7) Global Merchant / Ledger Logic
   - Add rate/cost guards and org scoping; improve validation and HITL for financial outputs.

## Frontend Implementation Plan (Prioritized)
- Business Plan Master: Already shows budget/HWP status; add clearer budget-exceeded copy; show DLQ/failure if HWP job fails.
- ChinaSource / Grant / K-Startup: Add banners for “proxy required” / “live data unavailable”; progress + error states.
- NaverSEO: Show crawl status (queued/running/failed), display live metrics; badge for mock vs live.
- Safety Guardian: Display live alerts, severity badge, recommended action/runbook link.
- Proposal: Surface review/HITL states and vector-powered snippets when added.
- Global Merchant / Ledger: Add status/error toasts; show org context; HITL for finance.

## Quick Ops Checklist
- Set flags: `ENABLE_HWP_CONVERTER`, `NEXT_PUBLIC_ENABLE_HWP_CONVERTER`.
- Configure CloudConvert key and bucket.
- Configure proxy (`PROXY_URL`) for scraping agents.
- Monitor DLQ (`hwp_job_dlq`) after enabling worker.
- Apply mock guards in prod for agents using seeded data (Grant, NaverSEO).

## Table State (post-reset)
- `business_plans`: 0, `grant_applications`: 0, `program_matches`: 0, `safety_logs`: 0, `workflow_states/definitions`: 0, `messages`: 0, `hwp_jobs`: 4, `hwp_job_dlq`: 1 (legacy). Clean slate expected.



