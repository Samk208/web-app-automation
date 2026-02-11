# WonLink Expansion Strategy — Platform Evolution Plan

> **Date:** February 11, 2026
> **Scope:** Automation templates, workflow builder, site builder, co-editor, MCP integrations
> **Based on:** Research into Latenode, n8n ecosystems, Bolt.diy, GrapesJS, Respira MCP, and open-source alternatives

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Latenode Analysis — What to Learn (Not Copy)](#2-latenode-analysis)
3. [Automation Template Strategy](#3-automation-template-strategy)
4. [Workflow Builder Integration](#4-workflow-builder-integration)
5. [Site Builder Integration](#5-site-builder-integration)
6. [Co-Editor / Multiplayer Collaboration](#6-co-editor)
7. [MCP & AI Agent Integration](#7-mcp-integrations)
8. [Competitive Landscape](#8-competitive-landscape)
9. [Implementation Roadmap](#9-implementation-roadmap)
10. [Architecture Decision Records](#10-architecture-decisions)

---

## 1. Executive Summary

WonLink currently operates as a **vertical AI agent platform** (10 agents for Korean business). The expansion opportunity is to evolve into a **horizontal automation platform** that also offers:

- **Pre-built automation templates** (workflow recipes clients can deploy)
- **A visual workflow builder** (so clients can create their own automations)
- **A site builder** (automating the website creation service you already offer)
- **Collaborative editing** (multiplayer workflow and site design)

**The key insight from Latenode:** Don't try to be Latenode. Instead, steal their 3 smartest ideas:
1. **Compute-based pricing** instead of per-task billing
2. **Template marketplace** as a growth flywheel
3. **AI Copilot** that generates workflow logic from natural language

**The key insight from n8n ecosystem:** The raw template volume (7,888+ on n8n.io) is a commodity. The value is in **curation, security scanning, and one-click deployment** — not the JSON files themselves.

**The key insight about site building:** You already vibe-code sites with Cursor/Claude. The automation opportunity is to **productize your process** — turn your manual steps into a repeatable pipeline using MCP servers, WP-CLI, and Divi JSON templates.

---

## 2. Latenode Analysis — What to Learn (Not Copy)

### What Latenode Does Right

| Strategy | How They Do It | What WonLink Should Adopt |
|---|---|---|
| **Compute pricing** | Credits = 30 seconds of execution time, unlimited operations | Adopt similar model for agent runs: charge per execution window, not per step |
| **AI Copilot** | Context-aware code generation in workflow nodes | Already have LangGraph orchestrator — extend with natural language workflow creation |
| **Template marketplace** | Experts sell workflows ($15-$50), platform takes cut | Build curated template library for Korean business automation |
| **Bundled AI models** | 400+ LLMs in one subscription | Already using Vercel AI SDK with multiple providers — expose as feature |
| **Headless browser** | Puppeteer nodes for scraping SPAs | Already have Playwright — expose as reusable workflow node |
| **White-label** | Embed workflow builder into customer products | Future opportunity for WonLink SaaS clients |

### What NOT to Copy from Latenode

- Don't try to build 6,000+ app connectors — use MCP for universal integration instead
- Don't compete on "general automation" — stay focused on Korean business vertical + site building
- Don't build a full iPaaS — leverage existing open-source engines (n8n, Activepieces, or Windmill)

---

## 3. Automation Template Strategy

### 3.1 Template Sources Evaluated

| Source | Templates | Quality | License | Verdict |
|---|---|---|---|---|
| **n8n.io/workflows** (official) | 7,888 | Vetted, community-rated | Apache 2.0 | Best source for inspiration |
| **Zie619/n8n-workflows** | 4,343 | Unvetted, many outdated | Unknown | Use AI-BOM scanner only; skip templates |
| **wassupjay/n8n-free-templates** | 200+ | Curated, plug-and-play | Open source | Good quality, use selectively |
| **ritik-prog/n8n-automation-templates-5000** | 5,000+ | Production-ready, MIT | MIT | Best open-source collection |
| **n8ntemplates.me** | 9,370+ | AI-generated, premium | Paid | Reference for marketplace model |

### 3.2 Recommended Approach

**Don't ship 5,000 templates.** Ship 50 excellent ones.

**Tier 1 — WonLink Core Templates (Build These)**
Templates that directly serve your Korean business vertical:

| Template | Category | Why It Matters |
|---|---|---|
| Korean gov grant application pipeline | Startup Funding | K-Startup Navigator → doc generation → submission prep |
| 1688 → Naver Smart Store product listing | E-commerce | Source → translate → optimize → list |
| Client onboarding automation | Agency Ops | New client → Supabase row → Slack notify → project scaffold |
| Invoice → reconciliation → report | Finance | Upload CSV → Ledger Logic → PDF report |
| Safety compliance daily digest | Compliance | IoT sensors → AI analysis → Kakao alert |
| Business plan generation pipeline | Consulting | Brief → PSST framework → diagrams → HWP document |
| Competitor price monitoring | E-commerce | Scrape → compare → alert on changes |
| SEO audit weekly report | Marketing | Naver audit → score tracking → improvement suggestions |

**Tier 2 — Curated n8n Templates (Import & Adapt)**
Cherry-pick from `ritik-prog/n8n-automation-templates-5000`:

- AI chatbot with RAG (adapt for Korean)
- CRM lead scoring pipeline
- Social media content scheduler
- Email campaign automation
- Customer review response automation

**Tier 3 — Community Templates (Marketplace)**
Let users submit and sell their own workflow templates (Latenode's marketplace model).

### 3.3 Template Security: AI-BOM Scanner

Before importing ANY third-party template, run through a security pipeline:

```
Template JSON → AI-BOM scan → Flag hardcoded keys → Flag unauthenticated webhooks → Flag dangerous npm packages → Pass/Fail gate → Import to library
```

The `Zie619/n8n-workflows` repo's AI-BOM tool is genuinely useful for this. Extract it as a standalone security scanner.

### 3.4 Template Format Decision

**Decision:** Use n8n-compatible JSON format internally, but expose templates through your own UI.

Why:
- n8n JSON is the de facto standard (7,888+ templates exist in this format)
- Can leverage `n8n-template-builder` (Python) for programmatic generation
- If you ever self-host n8n as your backend engine, templates work natively
- Users never need to see the JSON — your UI abstracts it

---

## 4. Workflow Builder Integration

### 4.1 Three Options Evaluated

| Option | Build Effort | Flexibility | Maintenance |
|---|---|---|---|
| **A) Embed n8n** (self-hosted, iframe) | 1-2 weeks | High (600+ nodes) | Medium (version upgrades) |
| **B) Embed Activepieces** (self-hosted, embed SDK) | 1-2 weeks | Medium (628+ integrations) | Low (simpler architecture) |
| **C) Build custom with React Flow** | 4-8 weeks | Maximum | High (you own everything) |

### 4.2 Recommendation: Hybrid Approach

**Phase 1 (Now):** Self-host **n8n** as your automation backend. Expose workflows through your WonLink dashboard using n8n's API. Users see your UI, n8n runs the workflows.

**Phase 2 (Later):** Build a custom **React Flow** visual editor for your WonLink-specific agent workflows. Use n8n for generic automation and your custom editor for AI agent orchestration.

**Why n8n over Activepieces:**
- Larger template library (7,888 vs 628)
- Stronger developer ecosystem
- Better AI/LangChain integration
- Your project already references n8n in product directives

**Why not Windmill:**
- Windmill is excellent but developer-focused (Python/TypeScript scripts)
- Less suitable for non-technical Korean business users
- Better as an internal tool than a customer-facing product

### 4.3 n8n Self-Hosted Integration Plan

```
┌─────────────────────────────────┐
│       WonLink Dashboard         │
│  (Next.js frontend)             │
│                                 │
│  ┌───────────┐  ┌────────────┐  │
│  │ Agent     │  │ Workflow   │  │
│  │ Pages     │  │ Builder    │  │
│  │ (existing)│  │ (new)      │  │
│  └─────┬─────┘  └─────┬──────┘  │
│        │              │          │
└────────┼──────────────┼──────────┘
         │              │
    ┌────▼────┐   ┌─────▼─────┐
    │ LangGraph│   │ n8n API   │
    │ (agents) │   │ (workflows│
    │          │   │  engine)  │
    └────┬────┘   └─────┬─────┘
         │              │
    ┌────▼──────────────▼────┐
    │      Supabase          │
    │   (shared database)    │
    └────────────────────────┘
```

**Implementation steps:**
1. Deploy n8n via Docker alongside your Next.js app
2. Create n8n API wrapper in `src/lib/n8n/client.ts`
3. Build workflow management UI in `/dashboard/workflows`
4. Connect n8n webhooks to Supabase for data persistence
5. Pre-load curated templates via n8n API

---

## 5. Site Builder Integration

### 5.1 The Problem You're Solving

You build sites manually with Cursor/Claude Code, which is powerful but not scalable. The goal is to **automate the repeatable 80%** and only manually handle the unique 20%.

### 5.2 Two Tracks: WordPress/Divi + Next.js

#### Track A: WordPress + Divi Automation

**Your advantage:** Divi lifetime license.

**Automation pipeline:**

```
Client Brief (form)
    │
    ▼
AI generates content structure (sections, copy, images)
    │
    ▼
WP-CLI script provisions fresh WordPress install
    │
    ▼
Divi JSON template selected from library (based on industry)
    │
    ▼
AI edits JSON template (replaces placeholder text, image URLs, colors)
    │
    ▼
Respira MCP applies refined styling + client branding
    │
    ▼
Playwright MCP runs visual regression tests
    │
    ▼
Human review → approve → deploy
```

**Key tools:**

| Tool | Purpose | Status |
|---|---|---|
| **WP-CLI** | Automated WordPress install + plugin setup | Open source, proven |
| **Respira MCP** (v1.9.1) | AI agent edits Divi/Elementor layouts via MCP | Real, works with Claude/Cursor |
| **Divi JSON templates** | Exportable layouts as JSON (Divi Portability System) | You already have Divi license |
| **Playwright** | Visual testing of generated sites | Already in your project |

**Divi JSON Template Library to build:**

| Template | Industry | Pages |
|---|---|---|
| Korean restaurant | F&B | Home, Menu, About, Contact, Reservations |
| Professional services | Consulting | Home, Services, Team, Case Studies, Contact |
| E-commerce storefront | Retail | Home, Products, About, FAQ, Contact |
| Startup landing page | Tech | Hero, Features, Pricing, Testimonials, CTA |
| Real estate agency | Property | Home, Listings, Agent Profiles, Contact |
| Medical clinic | Healthcare | Home, Services, Doctors, Appointments, Contact |

#### Track B: Next.js Site Automation

**Two sub-options:**

**Option B1: Bolt.diy (Open Source AI Site Builder)**
- MIT-licensed, 19k GitHub stars
- Generates full-stack Next.js apps from prompts
- Supports 19+ AI providers (including your existing Gemini/OpenAI/Anthropic)
- Can self-host via Docker
- Ships with WebContainer sandbox for live preview

**How to integrate:**
1. Self-host Bolt.diy alongside WonLink
2. Create a `/dashboard/site-builder` page that embeds Bolt.diy
3. Pre-configure with your Vercel AI SDK keys
4. Add your custom Next.js templates as starting points
5. Users describe their site → Bolt.diy generates it → review → deploy

**Option B2: GrapesJS Studio SDK (Drag-and-Drop Builder)**
- Open source core, commercial Studio SDK (free with license key)
- Works with Next.js 15+ via `@grapesjs/react` wrapper (supports React 19)
- Exports HTML/CSS/JSON — you compile into Next.js pages
- White-label ready, customizable UI

**How to integrate:**
1. Install `grapesjs` + `@grapesjs/react`
2. Create `/dashboard/page-builder` with GrapesJS editor
3. Add custom blocks for common sections (hero, pricing, testimonials)
4. Export as React components or static HTML
5. Deploy via Vercel API

### 5.3 Recommendation

**Use ALL THREE** for different purposes:

| Use Case | Tool | Why |
|---|---|---|
| WordPress client sites | **WP-CLI + Divi JSON + Respira MCP** | You have Divi license; most Korean SMBs want WordPress |
| Full Next.js apps | **Bolt.diy** (self-hosted) | AI-generated full-stack apps from prompts |
| Landing pages / email templates | **GrapesJS Studio SDK** | Visual drag-and-drop for non-developers |

### 5.4 Next.js Starter Templates to Use

Instead of `create-next-app`, start from production boilerplates:

| Template | Stars | Includes | Best For |
|---|---|---|---|
| **Next-Forge** | Popular | Turborepo, shadcn, Clerk, Prisma, Resend | Full SaaS apps |
| **ChadNext** | 1.3k | shadcn, Lucia Auth, Prisma, Stripe, i18n | Rapid prototyping |
| **Taxonomy** (shadcn) | 18k+ | Next.js 14, Auth.js, Prisma, Stripe | Content platforms |

**Action:** Create a library of your own starter templates based on these, customized for Korean market (i18n, Korean fonts, Naver analytics, Kakao integration).

---

## 6. Co-Editor / Multiplayer Collaboration

### 6.1 The Open Source Multiplayer Stack

| Layer | Technology | Purpose |
|---|---|---|
| **UI** | React Flow | Node-based workflow editor |
| **Sync Engine** | Yjs | CRDT-based conflict-free real-time sync |
| **WebSocket Server** | Hocuspocus | Yjs backend with persistence + auth + presence |
| **Code Editor** | CodeMirror 6 | Lightweight (300KB), mobile-friendly code editing |
| **Awareness** | Yjs awareness protocol | Shows collaborator cursors, selections, presence |

### 6.2 Paid/Embedded Alternatives

| Platform | Model | Cost | Best For |
|---|---|---|---|
| **Prismatic** | Embedded workflow builder for SaaS | Enterprise pricing | If you want to embed workflows in client apps |
| **Cyclr** | White-label integration marketplace | Per-connector pricing | If you want a Zapier-like experience for clients |
| **Liveblocks** | Real-time collaboration SDK | Free tier → $99/mo | Fastest way to add multiplayer to existing app |

### 6.3 Recommendation

**Phase 1:** Add **Liveblocks** (or Yjs directly) to your existing dashboard for collaborative workflow editing. This gives you cursor presence, real-time sync, and conflict resolution with minimal code.

**Phase 2:** Build a custom **React Flow** editor with Yjs sync for your visual workflow builder.

**Why not use Latenode's approach:** They don't offer multiplayer. This is a competitive advantage you can build.

---

## 7. MCP & AI Agent Integrations

### 7.1 MCP Servers to Integrate

These are **real, production-ready** MCP servers that directly help your platform:

| MCP Server | What It Does | How WonLink Uses It |
|---|---|---|
| **Respira** (`respira-mcp`) | Edit WordPress/Divi sites via AI | Automate Divi site building for clients |
| **GitHub** (`@modelcontextprotocol/server-github`) | Create repos, push code, manage PRs | Auto-deploy generated sites to client repos |
| **Vercel** (official) | Deploy and manage web apps | One-click deployment of Next.js sites |
| **Playwright** (`@anthropic/mcp-playwright`) | Browser automation and testing | Visual regression testing of generated sites |
| **Stripe** (official) | Billing and payment management | Manage client subscriptions |
| **Context7** | Version-specific library documentation | Help AI agents write correct code |
| **Supabase** (official) | Database operations | Already in your stack |
| **Sequential Thinking** | Structured problem-solving | Improve agent reasoning quality |

### 7.2 MCP Integration Architecture

```
┌─────────────────────────────────────┐
│         WonLink MCP Hub             │
│                                     │
│  ┌─────────┐  ┌──────────────────┐  │
│  │ Existing │  │ New MCP Servers  │  │
│  │ MCP      │  │                  │  │
│  │ (doc-gen)│  │ • Respira (WP)   │  │
│  │          │  │ • GitHub (deploy) │  │
│  │          │  │ • Vercel (host)   │  │
│  │          │  │ • Playwright (QA) │  │
│  └────┬─────┘  └───────┬──────────┘  │
│       │                │             │
│  ┌────▼────────────────▼──────────┐  │
│  │    MCP Router / Registry       │  │
│  │    (src/lib/mcp/config.ts)     │  │
│  └────────────┬───────────────────┘  │
│               │                      │
└───────────────┼──────────────────────┘
                │
         ┌──────▼──────┐
         │  LangGraph   │
         │  Orchestrator │
         │  (routes to   │
         │   correct MCP) │
         └──────────────┘
```

### 7.3 Cursor/Claude Skills to Create

Build reusable AI skills (`.cursor/skills/`) for your common tasks:

| Skill | What It Automates |
|---|---|
| `wordpress-site-setup` | WP-CLI install → Divi activate → template import → Respira MCP styling |
| `nextjs-site-scaffold` | Next-Forge init → customize theme → add Korean i18n → deploy preview |
| `client-onboarding` | Create Supabase org → generate API keys → send welcome email → scaffold project |
| `seo-audit-report` | Run Naver SEO agent → generate PDF → email to client |
| `deploy-to-production` | Git push → Vercel deploy → run Playwright tests → Slack notification |

---

## 8. Competitive Landscape

### 8.1 Platforms Doing Similar or Better

| Platform | What They Do Well | What WonLink Can Learn |
|---|---|---|
| **Latenode** | Compute pricing, AI copilot, marketplace | Pricing model, template marketplace strategy |
| **n8n** | Open source, huge template library, self-hostable | Use as backend workflow engine |
| **Activepieces** | Clean UX, embeddable, Y Combinator backed | UI simplicity for non-technical users |
| **Windmill** | Developer-focused, multi-language, fastest engine | Internal tool automation patterns |
| **Bolt.new / Bolt.diy** | AI site generation from prompts | Self-host as site builder component |
| **v0.dev** (Vercel) | AI component generation | Use for generating React components |
| **10Web** | AI WordPress site builder (white-label API) | WordPress automation workflow |
| **Durable.co** | AI business website generator | UX patterns for client site creation |

### 8.2 WonLink's Unique Position

None of these platforms combine:
- Korean business domain expertise (10 specialized agents)
- Multi-agent orchestration (LangGraph)
- Site building automation (WordPress + Next.js)
- Automation templates (n8n compatible)
- All in one dashboard

**This vertical + horizontal combination is the competitive moat.**

---

## 9. Implementation Roadmap

### Phase 1: Template Library (Weeks 1-2)

| Task | Effort | Dependencies |
|---|---|---|
| Create 8 WonLink core workflow templates (see 3.2 Tier 1) | 3 days | Existing agents |
| Build `/dashboard/templates` browse/deploy UI | 2 days | None |
| Import 20 curated n8n templates from `ritik-prog` repo | 1 day | Template format adapter |
| Build AI-BOM security scanner as import gate | 1 day | None |
| Add template one-click deploy to agent workflows | 2 days | Template library |

**Deliverable:** `/dashboard/templates` page with 28+ curated templates, one-click deploy.

### Phase 2: WordPress Site Builder Pipeline (Weeks 3-4)

| Task | Effort | Dependencies |
|---|---|---|
| Create 6 Divi JSON master templates (see 5.2 table) | 3 days | Divi license |
| Build WP-CLI automation scripts (install + configure) | 2 days | Server access |
| Integrate Respira MCP into `src/lib/mcp/config.ts` | 1 day | Respira plugin |
| Build `/dashboard/site-builder` UI (client brief form) | 2 days | None |
| Build AI pipeline: brief → content → Divi JSON edit → deploy | 3 days | All above |
| Add Playwright visual testing for generated sites | 1 day | Existing Playwright |

**Deliverable:** Client fills form → AI generates WordPress/Divi site → human reviews → deploy.

### Phase 3: n8n Workflow Engine (Weeks 5-6)

| Task | Effort | Dependencies |
|---|---|---|
| Deploy self-hosted n8n via Docker | 1 day | Docker |
| Create n8n API wrapper (`src/lib/n8n/client.ts`) | 1 day | n8n running |
| Build `/dashboard/workflows` management UI | 3 days | n8n API |
| Connect n8n webhooks to Supabase | 1 day | Both running |
| Pre-load curated templates via n8n API | 1 day | Templates ready |
| Create workflow execution history view | 2 days | n8n API |

**Deliverable:** Users can browse, deploy, and manage automation workflows through WonLink dashboard.

### Phase 4: Next.js Site Builder (Weeks 7-8)

| Task | Effort | Dependencies |
|---|---|---|
| Self-host Bolt.diy via Docker | 1 day | Docker |
| Create `/dashboard/nextjs-builder` embed page | 2 days | Bolt.diy running |
| Create 4 Next.js starter templates (Korean market) | 3 days | None |
| Integrate GrapesJS for landing page builder | 2 days | npm install |
| Add Vercel MCP for one-click deployment | 1 day | Vercel account |
| Add GitHub MCP for auto-repo creation | 1 day | GitHub token |

**Deliverable:** AI-powered Next.js site generation + visual landing page builder.

### Phase 5: Co-Editor & Marketplace (Weeks 9-10)

| Task | Effort | Dependencies |
|---|---|---|
| Integrate Yjs + Hocuspocus for real-time sync | 3 days | None |
| Add cursor presence to workflow editor | 1 day | Yjs running |
| Build template submission flow for marketplace | 2 days | Template library |
| Add template rating and review system | 2 days | Supabase |
| Create template pricing and purchase flow | 2 days | Stripe |

**Deliverable:** Multiplayer workflow editing + community template marketplace.

---

## 10. Architecture Decision Records

### ADR-001: n8n vs Activepieces vs Custom

**Decision:** Use self-hosted n8n as workflow backend engine.

**Rationale:**
- 7,888+ existing templates vs 628 for Activepieces
- Stronger AI/LangChain integration
- Product directives already reference n8n
- Larger community and ecosystem
- Can migrate to custom React Flow editor later

**Trade-off:** n8n has a steeper learning curve than Activepieces, but WonLink's dashboard abstracts this from end users.

### ADR-002: Bolt.diy vs GrapesJS vs Build Custom

**Decision:** Use both — Bolt.diy for full app generation, GrapesJS for visual page editing.

**Rationale:**
- Bolt.diy excels at generating complete Next.js apps from prompts (your "vibe coding" use case)
- GrapesJS excels at visual drag-and-drop editing (non-developer use case)
- Neither alone covers both use cases
- Both are open source and self-hostable

### ADR-003: Template Format

**Decision:** Store templates as n8n-compatible JSON internally.

**Rationale:**
- De facto industry standard
- 12,000+ templates available in this format
- Programmatic generation via `n8n-template-builder`
- If workflow backend changes, format remains portable

### ADR-004: Multiplayer Technology

**Decision:** Yjs + Hocuspocus (not Liveblocks).

**Rationale:**
- Fully open source (no vendor lock-in)
- CRDT-based (conflict-free by design)
- Proven at scale (used by Notion, Tiptap)
- Hocuspocus provides auth, persistence, awareness out of the box
- Liveblocks would be faster to implement but creates dependency

### ADR-005: WordPress Automation

**Decision:** WP-CLI + Divi JSON + Respira MCP.

**Rationale:**
- Leverages existing Divi lifetime license
- Respira MCP is real and actively maintained (v1.9.1)
- WP-CLI is the industry standard for WordPress automation
- This combination automates ~80% of manual WordPress setup
- No additional licensing costs

---

## Appendix A: Corrections to Original Research

The original research documents were thorough. A few items needed verification:

| Claim | Verification | Status |
|---|---|---|
| Respira MCP exists and works with Divi | Confirmed — v1.9.1, supports 10 page builders | Verified |
| Next-Forge and ChadNext are good boilerplates | Confirmed — production-grade, actively maintained | Verified |
| Bolt.diy is self-hostable | Confirmed — Docker support, MIT license, 19k stars | Verified |
| GrapesJS works with Next.js 15+ / React 19 | Confirmed — @grapesjs/react v2 supports React 19 | Verified |
| AI-BOM scanner in Zie619 repo | Confirmed — useful tool, extract independently | Verified |
| n8n-template-builder (Python) exists | Could not independently verify as a standalone package | Unverified |
| Zie619 templates are mostly unvetted/outdated | Confirmed by community feedback — use `ritik-prog` repo instead | Verified |

## Appendix B: Key Resource Links

**Template Collections:**
- n8n official: https://n8n.io/workflows/ (7,888 templates)
- ritik-prog: https://github.com/ritik-prog/n8n-automation-templates-5000 (MIT, 5,000+)
- wassupjay: https://github.com/wassupjay/n8n-free-templates (200+ curated)
- n8ntemplates.me: https://n8ntemplates.me/ (9,370+, AI-generated)

**Site Builder Tools:**
- Bolt.diy: https://github.com/stackblitz-labs/bolt.diy
- GrapesJS: https://grapesjs.com/ (core) / https://grapesjs.com/sdk (Studio SDK)
- Respira MCP: https://www.respira.press/

**Workflow Engines:**
- n8n: https://n8n.io/ (self-hosted: https://docs.n8n.io/hosting/)
- Activepieces: https://activepieces.com/open-source
- Windmill: https://windmill.dev/

**Collaboration:**
- Yjs: https://yjs.dev/
- Hocuspocus: https://hocuspocus.dev/
- React Flow: https://reactflow.dev/

**Next.js Starters:**
- Next-Forge: https://next-forge.com/
- ChadNext: https://github.com/moinulmoin/chadnext

**MCP Servers:**
- Directory: https://mcpserver.space/
- Official list: https://github.com/modelcontextprotocol/servers
