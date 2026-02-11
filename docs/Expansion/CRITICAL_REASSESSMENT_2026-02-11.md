# Critical Reassessment: Building a Production AI Automation Agency

> **Date:** February 11, 2026
> **Purpose:** Unbiased, research-backed critique of previous expansion plans with a corrected strategy
> **Methodology:** Independent web research, production case studies, market data, and architecture best practices — deliberately avoiding Latenode-centric framing

---

## The Uncomfortable Truths First

Before proposing a better path, here's what the data actually says:

### Truth 1: 40% of Agentic AI Projects Will Be Canceled

Gartner predicts over 40% of agentic AI projects will be canceled by 2027 due to cost overruns and inadequate risk controls. 95% of AI pilots fail to scale beyond proof-of-concept. The culprit isn't technology — it's trying to build too much too fast.

**Implication for WonLink:** The previous expansion plan (workflow builder + site builder + co-editor + marketplace in 10 weeks) is a recipe for joining the 40%.

### Truth 2: Simple Automations Make the Real Money

The case studies that actually show revenue:
- **Contractor Appointments:** $134M client revenue using Zapier + OpenAI. Just lead scheduling and SMS parsing.
- **Zenyt AI for Caudalie:** €700k recovered revenue with 4 focused agents checking product pages.
- **J.v.G. Technology:** €1M → €8M with a 2-person team automating video funnels and email sequences.

None of these required a custom workflow builder, a site builder, a co-editor, or a template marketplace. They required **focused agents solving specific expensive problems.**

### Truth 3: The Previous Research Was Latenode Marketing

The "AI Automation Platform Analysis" document cites 46 sources — 80%+ are from Latenode's own blog, community forum, or comparison pages. The "89x cheaper" claims, the "400+ LLM" bundling, and the "7.6x cost reduction" figures are marketing, not independent analysis. Latenode is a legitimate platform, but framing your entire strategy around their talking points is a trap.

### Truth 4: n8n Embed Is NOT Free for Commercial Use

n8n Embed requires a **paid commercial license** for embedding in SaaS products. The previous plan assumed you could just self-host n8n and expose it through your dashboard. You can self-host for internal use (fair-code license), but embedding it as a customer-facing feature in WonLink requires licensing negotiation.

### Truth 5: Your Actual Moat Is Domain Expertise, Not Platform Features

WonLink has 10 agents specialized for Korean business (K-Startup grants, 1688 sourcing, Naver SEO, PSST business plans, Korean compliance). No other platform has this. Building a generic workflow builder throws away this advantage to compete with n8n, Make, and Zapier — companies with $100M+ in funding.

---

## The Corrected Strategy: Three Horizons

Instead of "build everything at once," adopt a **Three Horizons** model where each phase generates revenue before the next begins.

---

## Horizon 1: Monetize What Exists (Weeks 1-4)

**Goal:** Start generating revenue from the 10 agents you already built.

### What Actually Sells in 2026

| Service Model | Price Range | Margin | Time to Revenue |
|---|---|---|---|
| AI Agent Licensing (setup + monthly) | $20K setup + $2K/month | 70-80% | Immediate |
| Discovery/Audit Package | $5K-$15K flat fee | 80-90% | 1-2 weeks |
| Custom Agent Implementation | $10K-$50K per project | 70-80% | 4-8 weeks |
| Monthly Retainer (operations + optimization) | $2K-$25K/month | 60-70% | After first delivery |

### Concrete Revenue Plan

**Product 1: Korean Business AI Audit ($5K-$10K)**
- Client fills intake form
- You run 3-4 agents against their data (SEO audit, grant matching, sourcing analysis)
- Deliver a strategic report with ROI calculations
- Upsell to monthly agent licensing

**Product 2: Agent-as-a-Service ($2K-$5K/month per agent)**
- Client gets a dedicated agent (e.g., Naver SEO monitoring, grant opportunity alerts)
- Runs on your infrastructure, billed monthly
- Your existing Supabase multi-tenancy already supports this

**Product 3: Business Plan Generation ($3K-$8K per plan)**
- Your Business Plan Master already generates PSST-compliant plans
- Package as a premium service for startups applying to Korean government programs
- Include human review (HITL workflow already built)

### What to Actually Build in Horizon 1

| Task | Why | Effort |
|---|---|---|
| **Fix the 3 critical gaps** (tests, CI/CD, API rotation) | Can't sell a product that might break | 5 days |
| **Build client portal** (`/dashboard/client/[orgId]`) | Clients need their own view, not your admin dashboard | 3 days |
| **Add Stripe checkout to pricing page** | You can't charge people without payments | 2 days |
| **Create 3 landing pages** for the 3 products above | Sales needs a front door | 2 days |
| **Set up Braintrust or LangSmith evaluations** | You must prove agent accuracy to clients | 2 days |
| **Proxy configuration for 4 scrapers** | Agents using mock data can't be sold | 2 days |

**Total: ~16 days. Revenue starts flowing.**

---

## Horizon 2: Platform Hardening + Selective Expansion (Months 2-3)

**Goal:** Based on what clients actually buy in Horizon 1, invest in the highest-ROI platform capabilities.

### The Agent Framework Decision

Your project uses **LangGraph** — and the research confirms this is the right choice for production:

| Framework | Best For | WonLink Fit |
|---|---|---|
| **LangGraph** | Enterprise control, audit trails, complex state machines | **Current choice. Keep it.** |
| **CrewAI** | Rapid MVP, role-based teams | Good for new agents, not for replacing LangGraph |
| **Vercel AI SDK 6** (already installed) | Simple tool-calling agents, streaming | Already in your stack — use for simpler agents |
| **OpenAI Agents SDK** | OpenAI-specific features | Not needed — Vercel AI SDK is provider-agnostic |
| **Dify** (self-hosted) | Visual agent building for non-developers | **Consider for client-facing agent builder** |

**Key insight:** You don't need to choose one. Use **LangGraph for your core 10 agents** (complex, stateful, auditable) and **Vercel AI SDK for simple one-shot agents** (quick tools, chat interfaces). This is already your architecture — don't change it.

### The "Should I Build a Workflow Builder?" Decision

**Answer: Not yet. And maybe never.**

| Option | Cost | Revenue Risk | Verdict |
|---|---|---|---|
| Build custom React Flow editor | 4-8 weeks | High (who's asking for it?) | Skip |
| Embed n8n (licensed) | $$$$ + 2 weeks | Medium (competes with n8n directly) | Skip |
| Self-host Dify as agent builder | 1 week | Low (complements, not competes) | **Maybe — Phase 2** |
| Offer n8n consulting as a service | 0 build effort | Low (you're the expert, not the platform) | **Yes — now** |

**The smarter play:** Don't build a workflow builder. Instead, **offer n8n/Make implementation as a consulting service**, using your WonLink agents as the AI layer. You become the "AI brain" that connects to the client's existing automation tool — not a replacement for it.

### What to Actually Build in Horizon 2

**Only build what clients paid for in Horizon 1:**

| If clients want... | Build... | Technology |
|---|---|---|
| More agents for their specific use cases | **Agent Builder UI** (Dify self-hosted, white-labeled) | Dify + your MCP tools |
| Their own automation workflows | **n8n consulting package** (you build, they run) | n8n cloud + your agents via webhook |
| Website building as a service | **Site generation pipeline** (see below) | WP-CLI + Respira MCP + Divi JSON |
| API access to your agents | **Agent API layer** | Already exists via server actions → expose as REST |

### The Site Builder Decision: Productize, Don't Platformize

**Previous plan:** Embed Bolt.diy + GrapesJS + Respira MCP as a full site builder platform.

**Better plan:** Productize YOUR workflow. You vibe-code sites with Cursor/Claude. Automate the parts you repeat — don't build a site builder for others to use.

**The Agentic Site Factory (lean version):**

```
Client intake form (industry, brand, content)
        │
        ▼
┌─────────────────────────────────────┐
│  Step 1: AI Content Generation       │
│  (GPT-4/Claude generates all copy)   │
│  Output: JSON content structure       │
└─────────────┬───────────────────────┘
              │
        ┌─────┴──────┐
        │             │
  ┌─────▼────┐  ┌────▼──────┐
  │ WordPress │  │  Next.js   │
  │ Track     │  │  Track     │
  │           │  │            │
  │ WP-CLI    │  │ Next-Forge │
  │ + Divi    │  │ scaffold   │
  │ JSON      │  │ + shadcn   │
  │ + Respira │  │ + AI fill  │
  │ MCP       │  │            │
  └─────┬─────┘  └─────┬─────┘
        │              │
        └─────┬────────┘
              │
        ┌─────▼──────┐
        │ Playwright   │
        │ QA tests     │
        └─────┬──────┘
              │
        ┌─────▼──────┐
        │ Human review │
        │ + finishing  │
        │ touches      │
        └─────┬──────┘
              │
        ┌─────▼──────┐
        │ Deploy       │
        │ (Vercel/     │
        │  hosting)    │
        └──────────────┘
```

**Don't build Bolt.diy into your platform.** Use Bolt.diy (or Cursor) as YOUR tool behind the scenes. The client sees a polished intake form and a finished website. They don't need access to a site builder.

**Why this is better:**
- 2 days to build the intake form + pipeline vs 4-8 weeks for a platform
- You maintain quality control (clients don't break their own sites)
- You charge $3K-$10K per site instead of $49/month for a builder
- The AI does the boring parts, you do the creative parts

---

## Horizon 3: Platform Play (Months 4-6+)

**Only if Horizons 1 and 2 prove product-market fit.**

### The Template Marketplace (When You Have Users)

Templates are only valuable when you have users who need them. Build the marketplace AFTER you have 20+ paying clients, not before.

**When ready:**
- Curate 30-50 templates from your real client implementations
- Use the `ritik-prog/n8n-automation-templates-5000` (MIT) as a supplement
- Charge $15-$50 per template OR include in monthly subscription
- Let power users submit templates (revenue share)

### The Co-Editor (When You Have Teams)

Multiplayer editing is a feature for teams. Build it AFTER you have clients with 3+ users.

**When ready:**
- Yjs + Hocuspocus is the correct stack (confirmed by research)
- Apply to agent workflow editing first (most unique)
- Apply to site editing second (if demand exists)

### The Agent Marketplace (When You Have Demand)

Let third-party developers build and sell agents on your platform. This is the Latenode/Relevance AI model, but you need a critical mass of users first.

---

## The Technology Stack: What's Actually Best

### Agent Orchestration (Keep)

| Component | Current | Change? |
|---|---|---|
| LangGraph | v1.0.7 | **Keep.** Market leader for production agents. |
| Vercel AI SDK | v6.0.6 | **Keep.** Use for simple agents, streaming, tool calling. |
| Supabase | v2.89.0 | **Keep.** Great for multi-tenancy, auth, real-time. |

### Observability (Upgrade)

| Current | Recommended | Why |
|---|---|---|
| LangSmith (basic) | **Braintrust** or **LangSmith Pro** | Need proper evaluation, not just tracing. Braintrust connects eval → CI/CD → regression tests automatically. |
| Structured logging | **Keep + add Sentry** | Error tracking is different from logging. |

### Tool Integration (Upgrade)

| Current | Recommended | Why |
|---|---|---|
| Raw MCP client | **Composio** (for 300+ app integrations) + **Raw MCP** (for custom tools) | Composio handles OAuth, token refresh, and auth for 300+ apps automatically. Your raw MCP is still needed for custom tools (doc generation, Respira). |

### AI Evaluation (Add)

| Current | Recommended | Why |
|---|---|---|
| Nothing | **Braintrust** | You cannot sell agents without proving accuracy. Braintrust provides offline eval, online scoring, CI/CD integration, and automatic regression test creation from production failures. Free tier available. |

### Site Building (Add Selectively)

| Tool | Use For | Integration Effort |
|---|---|---|
| **Respira MCP** (v1.9.1) | WordPress/Divi automation | 1 day — npm install + MCP config |
| **WP-CLI** | WordPress provisioning | 1 day — shell scripts |
| **Next-Forge** | Next.js project scaffolding | 30 min — npx init + customize |
| **GitHub MCP** | Auto-deploy generated sites | 1 day — MCP config |
| **Vercel MCP** | Deploy Next.js sites | 1 day — MCP config |

**Skip for now:** Bolt.diy (complexity), GrapesJS (not needed if you're the builder), custom React Flow editor (months of work).

---

## Head-to-Head: Previous Plan vs. Corrected Plan

| Dimension | Previous Plan | Corrected Plan | Why |
|---|---|---|---|
| **Scope** | Build 5 new systems in 10 weeks | Monetize existing + fix critical gaps | Building 5 systems = building 0 to completion |
| **Revenue start** | After 10 weeks of building | Week 2 (audit packages, agent licensing) | Cash flow funds future development |
| **Workflow builder** | Self-host n8n + custom React Flow editor | Offer n8n consulting as a service | Don't compete with n8n, partner with it |
| **Site builder** | Embed Bolt.diy + GrapesJS | Productize YOUR build process (intake form → AI pipeline → deliver) | Clients want sites, not a builder |
| **Co-editor** | Yjs + Hocuspocus in weeks 9-10 | Build only when you have teams using the platform | No users = wasted multiplayer feature |
| **Template marketplace** | Build in weeks 1-2 | Build after 20+ paying clients | Templates without users is a ghost town |
| **Agent framework** | Keep LangGraph | Keep LangGraph + add Vercel AI SDK for simple agents + add Braintrust for evaluation | Right framework, add missing eval layer |
| **Tool integration** | Raw MCP only | Composio for standard apps + Raw MCP for custom tools | Composio handles OAuth/auth for 300+ apps |
| **Testing** | Vitest + Playwright (planned) | Vitest + Playwright + **Braintrust for AI evaluation** | Code tests ≠ agent evaluation |
| **Business model** | Platform subscription | **Service-first, platform-second** (audit → license → retainer → platform) | Services generate revenue immediately; platforms require scale |

---

## The Real Competitive Landscape

### Who You're Actually Competing With

| Competitor | Their Advantage | Your Advantage |
|---|---|---|
| **Korean IT consultancies** | Established relationships | AI-first, 10x faster delivery |
| **Freelance developers on Soomgo/Kmong** | Cheaper labor | Repeatable AI agents vs one-off work |
| **Relevance AI** | Beautiful platform, Canva/KPMG clients | Korean domain expertise they'll never have |
| **Zapier/Make agencies** | Proven automation playbook | AI agents > simple automations for complex tasks |
| **Dify self-hosted** | Free, powerful visual builder | Your 10 pre-built Korean business agents |

### Who You're NOT Competing With (Stop Trying)

- Latenode (different market: general iPaaS for developers)
- n8n (open-source automation engine — use it, don't compete with it)
- Bolt.new (AI code generation — use it, don't embed it)
- Zapier (6,000+ connectors with $100M+ funding — you can't match this)

---

## Revised Implementation Roadmap

### Phase 1: Ship & Sell (Weeks 1-4)

| Week | Focus | Deliverable |
|---|---|---|
| 1 | Fix critical gaps (tests, CI/CD, API keys) | Stable, deployable codebase |
| 2 | Stripe checkout + client portal + 3 product landing pages | Revenue infrastructure |
| 3 | Proxy setup for 4 scrapers + Braintrust eval baseline | Agents work with real data + accuracy metrics |
| 4 | Launch 3 products: AI Audit, Agent-as-a-Service, Business Plan Gen | First paying clients |

### Phase 2: Expand Based on Demand (Months 2-3)

| If demand shows... | Build... | Timeline |
|---|---|---|
| Clients want custom agents | Self-host Dify as white-labeled agent builder | 1 week |
| Clients want workflows | n8n consulting packages (you build on n8n, connect to your agents) | 0 build time |
| Clients want websites | Site generation pipeline (WP-CLI + Respira MCP + intake form) | 2 weeks |
| Clients want API access | REST API wrapper over server actions | 1 week |
| Clients want more apps connected | Integrate Composio for 300+ app connections | 1 week |

### Phase 3: Platform (Month 4+, only if PMF proven)

| Feature | Prerequisite | Build Time |
|---|---|---|
| Template library | 20+ client implementations to templatize | 2 weeks |
| Agent marketplace | 50+ active users | 3 weeks |
| Co-editor | Teams with 3+ collaborators | 2 weeks |
| Visual workflow builder | Clear demand signal from clients | 4-6 weeks |

---

## Key Architecture Decisions (Updated)

### ADR-001 (Revised): Don't Build a Workflow Builder

**Decision:** Offer workflow automation as a service using n8n, not as a platform feature.

**Rationale:**
- n8n Embed requires paid licensing for commercial SaaS use
- Building a custom React Flow editor is 4-8 weeks minimum
- 70% of teams that start with AI-centric tools switch to workflow tools within 3 months — meet them where they are (n8n/Make) instead of replacing their tools
- Your value is the AI brain, not the workflow canvas

### ADR-002 (Revised): Site Builder = Service, Not Platform

**Decision:** Productize your site-building workflow. Don't embed a site builder.

**Rationale:**
- Clients want a finished website, not a builder
- You charge $3K-$10K per site as a service vs $49/month as a platform
- The AI pipeline (content generation → template selection → WP-CLI/Next-Forge → Respira MCP → QA) is your IP
- Human finishing touches are what clients are actually paying for

### ADR-003 (New): Add Composio for Tool Integration

**Decision:** Use Composio alongside raw MCP.

**Rationale:**
- Composio handles OAuth, token refresh, and auth for 300+ apps automatically
- Your existing raw MCP handles custom tools (document generation, Korean-specific APIs)
- This gives you "connect to anything" capability without building 300 connectors

### ADR-004 (New): Add Braintrust for Agent Evaluation

**Decision:** Integrate Braintrust as the evaluation layer.

**Rationale:**
- You cannot sell AI agents without proving accuracy
- Braintrust provides: offline evaluation → CI/CD integration → production monitoring → automatic regression tests
- This is the missing piece between "demo" and "production-grade"
- Free tier available for getting started

### ADR-005 (New): Service-First, Platform-Second Business Model

**Decision:** Launch as a service company, evolve into a platform company.

**Rationale:**
- Services generate revenue in weeks; platforms require months of building + scale
- The $7.63B AI agency market grows 45.8% annually
- Top agencies achieve 70-90% gross margins
- Service delivery teaches you what clients actually need (vs. what you assume they need)
- Every service engagement creates a template for the future platform

---

## The Bottom Line

The previous expansion plan was ambitious but unfocused — it tried to build 5 new systems in 10 weeks while the core product has zero tests and no paying clients.

**The corrected priority:**

1. **Fix what's broken** (tests, CI/CD, real data) — 1 week
2. **Sell what exists** (3 products from your 10 agents) — 2 weeks
3. **Evaluate what works** (Braintrust, client feedback) — ongoing
4. **Build what clients pay for** (not what sounds cool) — month 2+
5. **Platformize when you have scale** (20+ clients) — month 4+

The organizations that choose correctly report **171% average ROI**. The ones that build everything at once join the **40% cancellation rate**.

Choose correctly.
