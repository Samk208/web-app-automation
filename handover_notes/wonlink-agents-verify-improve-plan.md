# Wonlink Agent Hardening & Rollout Plan

Date: 2026-01-05  
Owner: Platform Engineering  
Scope: All 10 agents (prioritize Business Plan Master + KakaoTalk CRM)  
Intent: Verify what exists, then improve in small, production-grade increments.

---

## 1) What’s currently implemented (quick verification snapshot)

- Code review (sampled): `business-plan.ts`, `grant-scout.ts`, `k-startup.ts`, `safety-guardian.ts` use `defaultModel` + `generateObject` with Zod schemas; data pulled/persisted via Supabase tables (`business_plans`, `grant_applications`, `program_matches`, `safety_logs`).
- Logic is synchronous LLM calls with minimal branching (e.g., `safety-guardian` only logs when value > 80).
- No retries, timeouts, rate limits, idempotency keys, AV/file checks, or audit trails. Prompts contain policy/format guidance but no deterministic validators beyond Zod shape.
- Mock data still present (program lists, grants). External APIs not yet wired; no queue or HITL path.

Implication: Agents function as demos but are not yet safe or resilient for production/paid traffic.

---

## 2) Principles for staged improvement (do not boil the ocean)

1. Verify first: add health checks, smoke tests, and synthetic journeys per agent before new features.
2. Contain blast radius: per-agent flags, per-tenant namespaces, low default limits.
3. Small increments: one capability at a time with measurable acceptance criteria.
4. Secure by default: vault secrets, AV scan, schema validation, rate limit, audit log.
5. HITL for high-stakes: grants/financial/industrial outputs require approval before release.

---

## 3) Phase plan (sequential, reversible)

**Phase 0 — Baseline verification (1–2 days)**

- Add synthetic tests per agent (happy-path + failure-path) hitting existing endpoints/functions.
- Add structured logging + correlation IDs; log status transitions in DB.
- Wire simple health endpoints and Supabase connectivity checks.

**Phase 1 — Safety & correctness hardening (3–5 days)**

- Enforce input validation with Zod at boundaries; cap token/input sizes; require idempotency keys on writes.
- Add request timeouts, retries with jitter, and DLQ for LLM/DB calls (wrap current actions).
- Add PII/secret scrub + AV scan for uploads (shared middleware).
- Add per-user/org rate limits (Upstash Redis) and per-tenant namespaces in Supabase with RLS.

**Phase 2 — Observability + cost guardrails (2–3 days)**

- Tracing (LangSmith/OTel) + metrics (latency, error rate, token cost, cache hit).
- Dashboards per agent; alerts for error-rate spikes, cost spikes, queue backlogs.
- Cost caps per tenant; monthly/weekly budgets; throttle on breach.

**Phase 3 — Real integrations + HITL (per agent, iterative)**

- Replace mocks with real APIs (Kakao/Clova/Codef/etc) one agent at a time.
- Add HITL review UI + approval queue for high-stakes agents (grants, finance, safety).
- Add caching and queues for long tasks; async UX with progress + resumable jobs.

**Phase 4 — Performance & resilience (ongoing)**

- Load/soak tests; chaos on dependency loss; tune chunking/RAG; CDN for static outputs.
- SLA/SLO definitions per tier; incident runbooks; status page hooks.

---

## 4) Immediate agent targets (order of operations)

**A) Business Plan Master (revenue)**

- Verify: exercise current flow with seed data; ensure status transitions and sections persist.
- Harden: add schema-level section completeness checks; numerical consistency checker for finance inserts.
- Improve: integrate Clova OCR for uploads; DOCX/HWP generation via worker + queue; HITL before final download.

**B) KakaoTalk CRM Bot (volume)**

- Verify: current mock flow; add session store test; ensure RAG answers saved.
- Improve: integrate Kakao i Open Builder webhook; Redis session state; abuse/spam rules; bilingual error paths.

**C) Safety Guardian (risk)**

- Verify: sensor simulation + DB insert; add test for threshold logic.
- Improve: protocol bridge stubs (MQTT) with sandbox; severity/runbook mapping; WORM/immutable log store; alert fan-out.

**D) Grant Scout / K-Startup Navigator**

- Verify: mock program matching writes correct JSON; status transitions.
- Improve: live crawlers for programs; hard rules engine for eligibility; HITL approval before submission.

---

## 5) Platform uplift tasks (shared, reusable)

- AuthZ/RLS: enforce per-tenant row-level security in Supabase; scoped storage buckets.
- Security: secrets in vault; signed webhooks; outbound allowlist; MIME sniff + AV scan; JSON schema validation on all LLM outputs.
- Reliability: retries + DLQ wrapper; idempotency keys; rate limits + concurrency caps; backpressure on queues.
- Observability: structured logs (Pino) with trace IDs; traces to LangSmith/OTel; dashboards + alerts.
- UX: async job pattern with progress + notifications; bilingual errors; audit history per task.

---

## 6) Acceptance criteria (per change set)

- No mock data paths reachable in production routes.
- All writes carry correlation ID, idempotency key, actor, tenant.
- P95 <3s for sync calls; queued flows show progress and never drop silently.
- Safety/finance/grant outputs require HITL approval flag before publish/send.
- All external calls wrapped with timeout/retry/backoff; DLQ visibility.
- Automated tests: unit (validation), integration (Supabase), synthetic E2E per agent; nightly run.

---

## 7) Next concrete steps (actionable, small)

1. Add synthetic smoke tests + structured logging wrapper around the four reviewed actions.
2. Introduce request guard middleware: Zod validation, size limits, correlation ID, timeout/retry.
3. Implement per-tenant RLS and rate limits for these actions; add cost cap skeleton.
4. Ship a HITL review queue for Business Plan Master (draft -> pending_review -> approved).
5. Replace Kakao mock with real webhook + Redis session; gate via feature flag; test with 1 pilot user.

---

If you approve, I’ll start with Phase 0 on Business Plan Master + KakaoTalk CRM, add guard/middleware, and commit tests so we have measurable verification before any deeper feature work.

---

### Progress log (latest)

- Structured logging + correlation IDs added; actions now emit contextual logs.
- Guardrails: size limits, timeouts, retries, rate limits applied to business-plan, grant-scout, k-startup, safety-guardian.
- Smoke check script added and run (Supabase reachable for core tables).
- HITL: Business Plan Master now enqueues approval_requests; dashboard shows review queue with approve/reject API.
- Correlation header propagated via middleware; API review route enforces schema + correlation + size limits.
- RLS upgrade migration added (`supabase/migrations/20260105000000_agent_rls_upgrade.sql`) to add `organization_id` columns + org-scoped policies for agent tables (null-org still allowed for legacy/demo until code passes org_id).
- Kakao CRM: Webhook endpoint added (signature check, Redis rate limit), org-scoped message logging to new `messages` table (migration `20260105010000_messages_table.sql`), mock route fallback.
- HWP Converter: New `hwp_jobs` table with RLS (migration `20260105011000_hwp_jobs.sql`); API to create jobs with org_id and stub converter action (`processHwpJob`) ready for queue/worker handoff.
- Migrations reapplied locally (`supabase db reset --yes`); smoke tests updated to cover `messages` and `hwp_jobs` and passing.
- Kakao CRM: Webhook now maintains Redis session state and serves simple FAQ/intent replies while continuing to log org-scoped messages; signature check + rate limiting unchanged; latest smoke run still green across core tables.
- HWP: Jobs API now enqueue-only; worker stub added (`scripts/wonlink-hwp-worker-runner.js`) using service-role Supabase client to process queued jobs with placeholder conversion output.
- Kakao: Signed webhook harness added (`scripts/wonlink-kakao-webhook-harness.js`) to exercise the endpoint locally with custom utterances.
- HWP queue/worker upgraded: new retry/backoff metadata (migration `20260105020000_wonlink-hwp-retry-metrics.sql`), worker now claims jobs with retry_at scheduling, exponential backoff, max attempts, and per-run metrics (processed/succeeded/failed/retried).
- HWP DLQ + loop: added DLQ table with RLS (migration `20260105021000_hwp_job_dlq.sql`); worker writes exhausted jobs to DLQ; cron/PM2-friendly loop runner (`scripts/wonlink-hwp-worker-loop.js`) added with configurable interval/max runs.

### Still pending (next targets)

- Apply latest migrations on stage/prod; verify remaining server actions set organization_id.
- Request guard wrapper for other API routes (Stripe/proposals, etc.) and cost-cap scaffolding.
- Kakao CRM: connect full bot logic (RAG/actions), richer session behaviors + proactive replies; add tests for webhook signature and RLS.
- HWP Converter: replace stub conversion with real converter pipeline; add monitoring, DLQ, and structured metrics/export.

---

## Handover summary (2026-01-05)

**Latest changes**

- HWP queue now uses retry/backoff (`attempts`, `retry_at`), writes exhausted jobs to DLQ, and supports cron-friendly loop; forced-failure flag available for testing.
- Kakao webhook keeps Redis session state, FAQ/intent replies, signature + rate limit; signed harness script added.

**Migrations to apply on stage/prod**

- `supabase/migrations/20260105020000_wonlink-hwp-retry-metrics.sql` (adds retry metadata/index on `hwp_jobs`)
- `supabase/migrations/20260105021000_hwp_job_dlq.sql` (adds `hwp_job_dlq` with RLS)
- If not already applied in the target envs: `20260105000000_agent_rls_upgrade.sql`, `20260105010000_messages_table.sql`, `20260105011000_hwp_jobs.sql`
- Note: `supabase db push` was blocked because remote migration versions are missing locally; options:
  - `supabase db pull` to sync, then `supabase db push`, or
  - `supabase migration repair --status reverted 20260102111350 20260102111437 20260102111439 20260102112024` then `supabase db push`.

**Remaining to reach production-grade across the 10 agents**

- Platform: enforce org_id on all writes, complete request guards (Zod + size + timeout/retry) for all API routes, rate limits + cost caps, tracing/metrics dashboards, DLQ/backoff everywhere, AV/PII scrub for uploads, HITL flags for risky outputs.
- Business Plan Master: finalize HITL workflow (pending_review/approved gating), section completeness + numeric consistency checks, real document generation pipeline.
- Kakao CRM: full bot logic (RAG/actions), richer session and proactive replies, webhook signature/RLS tests, Redis session durability and abuse/spam rules.
- HWP Converter: real conversion worker pipeline with storage, retries, metrics; replace placeholder output URL; add DLQ monitoring/alerts.
- Safety Guardian: protocol bridge stubs to real sensors, severity/runbook mapping, immutable/WORM log, alert fan-out.
- Grant Scout / K-Startup: live program/grant sources, rules engine for eligibility, HITL before submission.
- Merchant/Reconciliation/Proposal/Naver-SEO/Sourcing: apply guardrails, org scoping, timeouts/retries, and add synthetic tests; replace any remaining mock paths.
