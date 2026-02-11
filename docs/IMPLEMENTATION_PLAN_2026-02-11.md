# Implementation Plan — February 11, 2026

> Prioritized roadmap to take WonLink from ~75% to production-ready.

---

## Phase 0: Immediate (Day 1) — Critical Security & Hygiene

**Goal:** Eliminate critical risks and clean up the repo.

| Task | Gap Ref | Effort | Owner |
|---|---|---|---|
| Rotate all API keys (Supabase, AI, Stripe, Redis, Scraping) | GAP-03 | 30 min | DevOps |
| Delete temp/debug files from repo root (logs, SQL, debug output) | GAP-11 | 30 min | Dev |
| Update `.gitignore` with: `*.log`, `nul`, `status.*`, `debug_*`, `dump_*`, `temp_*`, `check_*` | GAP-11 | 15 min | Dev |
| Delete `pnpm-lock.yaml` (keep npm as package manager) | GAP-12 | 5 min | Dev |
| Verify all env vars are set per handover doc section 12 | GAP-03 | 15 min | DevOps |

**Deliverable:** Clean repo, rotated keys, verified environment.

---

## Phase 1: Testing Foundation (Days 2-4)

**Goal:** Establish automated testing to prevent regressions.

### 1.1 Setup Test Infrastructure

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom @playwright/test
```

Create:
- `vitest.config.ts` — unit/integration test runner
- `playwright.config.ts` — E2E test config
- `src/__tests__/` — test directory

### 1.2 Priority Test Targets

| Test Type | Target | Files | Why |
|---|---|---|---|
| Unit | Server actions (business logic) | `src/actions/*.test.ts` | Core revenue-generating logic |
| Unit | Validation schemas | `src/lib/validation/*.test.ts` | Security boundary |
| Unit | Cost tracking / budget enforcement | `src/lib/ai/*.test.ts` | Financial accuracy |
| Integration | API routes | `src/app/api/**/*.test.ts` | External-facing endpoints |
| Integration | Auth flow | `src/middleware.test.ts` | Security critical |
| E2E | Login → Dashboard → Agent workflow | `e2e/agent-flow.spec.ts` | Happy path validation |
| E2E | Orchestrator chat | `e2e/orchestrator.spec.ts` | Multi-agent routing |

### 1.3 Test Coverage Targets

| Area | Target |
|---|---|
| Server actions | 80% line coverage |
| Validation / guards | 90% line coverage |
| API routes | 70% line coverage |
| E2E critical paths | 5 core user journeys |

**Deliverable:** Test suite with 50+ tests covering critical paths.

---

## Phase 2: CI/CD Pipeline (Day 5)

**Goal:** Automated build validation and deployment.

### 2.1 GitHub Actions Workflow

Create `.github/workflows/ci.yml`:

```yaml
name: CI
on: [push, pull_request]
jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: npx tsc --noEmit          # Type check
      - run: npm run lint               # ESLint
      - run: npx vitest run             # Unit/integration tests
      - run: npm run build              # Build validation

  e2e:
    runs-on: ubuntu-latest
    needs: quality
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npx playwright test
```

### 2.2 Vercel Deployment

- Connect GitHub repo to Vercel
- Configure environment variables in Vercel dashboard
- Set up preview deployments for PRs
- Set up production deployment from `main` branch

**Deliverable:** Every push runs lint + typecheck + tests + build. Merges to `main` auto-deploy.

---

## Phase 3: Data Integration (Days 6-10)

**Goal:** Replace mock/simulated data with real sources for remaining agents.

### 3.1 Scraper Proxy Setup (GAP-04)

| Scraper | Target | Proxy Needed | Fallback |
|---|---|---|---|
| 1688 Scraper | 1688.com | Yes (China firewall) | ScrapeOwl API |
| K-Startup Scraper | k-startup.go.kr | Yes (rate limiting) | Cached seed data |
| Naver SEO Crawler | smartstore.naver.com | Maybe | Simulated analysis |

**Action items:**
1. Sign up for proxy service (Bright Data or ScraperAPI)
2. Add `PROXY_URL` and `PROXY_USERNAME`/`PROXY_PASSWORD` to env
3. Update `src/lib/scrapers/1688-scraper.ts` to use proxy
4. Update `src/lib/scrapers/k-startup-scraper.ts` to use proxy
5. Update Naver SEO action to use real crawler instead of simulation
6. Add retry logic and fallback to cached data on scraper failure
7. Test each scraper against live targets

### 3.2 Real Input Handlers (GAP-05)

| Agent | Current Input | Target Input | Changes Needed |
|---|---|---|---|
| Safety Guardian | Simulated `setInterval` | CSV upload or webhook | Add file upload component + parser |
| Ledger Logic | Mock CSV strings | Real file upload | Add Supabase Storage upload + CSV parse |
| Trade Agent | Simulated orders | CSV/manual entry | Add order import form or CSV upload |

**Action items for each:**
1. Add file upload UI component (reuse across agents)
2. Upload to Supabase Storage
3. Parse CSV server-side
4. Feed parsed data to existing processing logic

### 3.3 Shared File Upload Component

Create a reusable `<FileUpload />` component:
- Drag & drop zone
- File type validation (CSV, XLSX, PDF)
- Upload progress indicator
- Supabase Storage integration
- Returns file URL for server action consumption

**Deliverable:** All 10 agents process real or realistic data. Scrapers work with proxy.

---

## Phase 4: Stripe & Monetization (Days 11-13)

**Goal:** Complete end-to-end payment flow.

### 4.1 Stripe Checkout (GAP-06)

| Task | File |
|---|---|
| Create Checkout Session API | `src/app/api/stripe/checkout/route.ts` |
| Create Stripe Webhook handler | `src/app/api/stripe/webhook/route.ts` |
| Update pricing page with Stripe price IDs | `src/app/pricing/page.tsx` |
| Create billing portal redirect | `src/app/api/stripe/portal/route.ts` |
| Add subscription status to org context | `src/lib/org.ts` |
| Enforce plan limits in server actions | `src/actions/*.ts` |

### 4.2 Webhook Events to Handle

```
checkout.session.completed    → Activate subscription
invoice.paid                  → Continue access
invoice.payment_failed        → Warn user, grace period
customer.subscription.deleted → Downgrade to free tier
```

### 4.3 Plan Enforcement

| Tier | Agents | AI Budget | Storage |
|---|---|---|---|
| Starter ($49/mo) | 3 agents | $10/month | 1 GB |
| Pro ($149/mo) | All agents | $100/month | 10 GB |
| Enterprise (custom) | All + custom | $1000/month | Unlimited |

**Deliverable:** Users can subscribe, pay, and access features based on their plan.

---

## Phase 5: Content & Polish (Days 14-16)

**Goal:** Fill remaining UI gaps and polish for launch.

### 5.1 Dashboard Settings Page (GAP-09)

Create `/dashboard/settings` with tabs:
- **Profile:** Name, email, avatar
- **Organization:** Org name, members, roles
- **Billing:** Current plan, usage, upgrade/downgrade
- **API Keys:** View/regenerate API keys
- **Notifications:** Email/Kakao notification preferences

### 5.2 Blog Page (GAP-07)

Options (pick one):
- **A) MDX Blog:** Create `src/app/blog/[slug]/page.tsx` with MDX content
- **B) Headless CMS:** Connect to Sanity/Contentful
- **C) Remove:** Delete blog link from navigation if not ready

Minimum content for launch:
1. "Introducing WonLink: AI Automation for Korean Business"
2. "How Multi-Agent Systems Transform Business Operations"
3. "Getting Started with WonLink Agents"

### 5.3 Docs Page (GAP-07)

Options (pick one):
- **A) Nextra/Fumadocs:** Dedicated docs site
- **B) In-app docs:** Simple page with agent guides
- **C) Remove:** Delete docs link from navigation if not ready

Minimum for launch:
- Getting started guide
- Agent descriptions and use cases
- API reference (for webhook integrations)

### 5.4 HWP Worker (GAP-08)

Simplest path: Use CloudConvert API (already in `package.json`):
1. Update HWP worker to use `cloudconvert` package
2. Convert DOCX → HWP via API
3. Store result in Supabase Storage
4. Update `hwp_jobs` status

**Deliverable:** No dead-end pages. Settings, Blog, and Docs are functional.

---

## Phase 6: Production Deployment (Days 17-18)

**Goal:** Deploy to production with monitoring.

### 6.1 Pre-Deployment Checklist

- [ ] All tests pass
- [ ] Build succeeds without warnings
- [ ] Environment variables set in production
- [ ] API keys are rotated production keys (not dev)
- [ ] Supabase project is on paid plan (if needed)
- [ ] Stripe is in live mode (not test)
- [ ] Domain configured with SSL
- [ ] Error tracking set up (Sentry or equivalent)

### 6.2 Monitoring Setup

| What | Tool | Config |
|---|---|---|
| Error tracking | Sentry | `@sentry/nextjs` |
| Uptime monitoring | UptimeRobot / Vercel | Check `/` and `/api/observability/stats` |
| AI cost alerts | Custom + Supabase | Query `ai_usage_logs` daily |
| Database monitoring | Supabase Dashboard | Enable slow query alerts |
| Log aggregation | Vercel Logs / Axiom | Already uses structured logging |

### 6.3 Post-Deployment Verification

1. Sign up as new user → verify auto-join to org
2. Run each agent from dashboard → verify results
3. Check AI cost tracking → verify budget enforcement
4. Test Kakao webhook → verify message storage
5. Test Stripe checkout → verify subscription activation
6. Load test with 10 concurrent users → verify rate limiting

**Deliverable:** Production deployment with monitoring and alerting.

---

## Timeline Summary

| Phase | Days | Focus | Outcome |
|---|---|---|---|
| 0 | Day 1 | Security & hygiene | Clean repo, rotated keys |
| 1 | Days 2-4 | Testing | 50+ tests, coverage baseline |
| 2 | Day 5 | CI/CD | Automated pipeline |
| 3 | Days 6-10 | Data integration | All agents use real data |
| 4 | Days 11-13 | Stripe / payments | End-to-end monetization |
| 5 | Days 14-16 | Content & polish | No dead ends, settings page |
| 6 | Days 17-18 | Deployment | Live in production |

**Total estimated effort: ~18 working days (3.5 weeks)**

---

## Quick Wins (Can Be Done Anytime)

These are low-effort, high-impact improvements:

| Task | Effort | Impact |
|---|---|---|
| Delete stale root files | 30 min | Cleaner repo |
| Update `.gitignore` | 15 min | Prevent future clutter |
| Delete `pnpm-lock.yaml` | 5 min | Remove confusion |
| Install `@radix-ui/react-select` | 1 hr | Better Select UX |
| Add `robots.txt` refinements | 15 min | SEO |
| Add OpenGraph images | 1 hr | Social sharing |
| Add loading skeletons to dashboard | 2 hrs | Perceived performance |

---

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Scrapers blocked by target sites | High | High | Use proxy service + fallback to cached data |
| AI costs exceed budget during testing | Medium | Medium | Use mock data flag during development |
| Supabase free tier limits hit | Medium | Medium | Monitor usage, upgrade early |
| Stripe webhook delivery failures | Low | High | Implement webhook retry logic |
| Korean text encoding issues in HWP | Medium | Medium | Test with diverse Korean content |
| LangGraph state corruption | Low | High | Add state validation + recovery logic |
