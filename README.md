# WonLink AI Automation Agency

**Multi-Agent AI Platform for Korean Business Automation**

10 specialized AI agents across 4 sectors: E-commerce, Startup Funding, Consulting, Safety & Compliance.

Built with Next.js 16, Supabase, LangGraph, and Vercel AI SDK.

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Copy environment variables
cp .env.example .env.local
# Fill in your Supabase, AI, and Redis credentials

# 3. Apply database migrations
supabase db reset --yes

# 4. Start development server
npm run dev

# 5. Open http://localhost:3000
```

---

## Agents

| # | Agent | Sector | Status |
|---|-------|--------|--------|
| 1 | Business Plan Master | Startup | Production-ready |
| 2 | Global Merchant | E-commerce | Production-ready |
| 3 | ChinaSource Pro | E-commerce | Needs proxy |
| 4 | NaverSEO Pro | E-commerce | Needs crawler |
| 5 | Ledger Logic | Finance | Production-ready |
| 6 | Proposal Architect | Consulting | Production-ready |
| 7 | R&D Grant Scout | Startup | Needs proxy |
| 8 | Safety Guardian | Compliance | Production-ready |
| 9 | K-Startup Navigator | Startup | Needs proxy |
| 10 | HWP Converter | Compliance | Partial |

**6/10 production-ready** | **4/10 need real data integrations**

---

## Tech Stack

- **Framework:** Next.js 16.1.1 + React 19 + TypeScript
- **Database:** Supabase (PostgreSQL + Auth + Storage + RLS)
- **AI:** Vercel AI SDK 6.0, Gemini 1.5 Flash, GPT-4o
- **Orchestration:** LangGraph 1.0.7
- **Scraping:** Playwright 1.57
- **Payments:** Stripe
- **Rate Limiting:** Upstash Redis
- **Styling:** Tailwind CSS 4

---

## Documentation

All documentation lives in [`docs/`](./docs/README.md):

| Document | Purpose |
|----------|---------|
| [Handover](docs/HANDOVER_2026-02-11.md) | Complete project state and technical details |
| [Gap Analysis](docs/Gaps/GAP_ANALYSIS_2026-02-11.md) | 12 identified gaps scored by severity |
| [Implementation Plan](docs/IMPLEMENTATION_PLAN_2026-02-11.md) | 6-phase roadmap to production (~18 days) |
| [Expansion Strategy](docs/Expansion/CRITICAL_REASSESSMENT_2026-02-11.md) | Service-first monetization strategy |

Historical notes are in [`docs/archive/`](./docs/archive/) and [`handover_notes/`](./handover_notes/).

---

## Project Structure

```
src/
├── actions/          # 10 agent server actions
├── app/
│   ├── (dashboard)/  # Protected dashboard routes
│   ├── api/          # API routes
│   ├── auth/         # Auth pages
│   ├── blog/         # Blog (placeholder)
│   ├── docs/         # Docs (placeholder)
│   └── pricing/      # Pricing page
├── components/       # Shared UI components
├── lib/              # Core libraries (auth, AI, rate-limit, validation)
├── types/            # TypeScript type definitions
└── utils/            # Utility functions

supabase/
└── migrations/       # 24 database migrations

scripts/              # Dev/test scripts
docs/                 # All documentation (source of truth)
```

---

## Environment Variables

See [`.env.example`](./.env.example) for the full list.

**Required:** Supabase URL + keys, AI API keys, Upstash Redis

**Optional:** Proxy URL (for scrapers), Stripe keys, CloudConvert key

---

## Scripts

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run lint         # ESLint
npm run smoke        # Smoke test all agents
npm run test:scrapers # Test scraper integrations
```

---

## License

Proprietary - WonLink AI Automation Agency

**Status:** ~75% production-ready | **Last Updated:** February 12, 2026
