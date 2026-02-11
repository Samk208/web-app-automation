# Smart Solutions: Automation Agency Workflows
> **Context**: Customized "Master Pipelines" inspired by the elite "n8n | AI Agents" and "PlusFeeds" communities, adapted for your Next.js + Supabase "Agentic OS".

These solutions leverage the **tools and MCPs we have** (Stripe, Supabase, Browser) to implement the "robust automation" discussed in these groups without needing external low-code subscriptions.

## 1. The "Deal-Closer Autopilot" (Proposal Architect V2)
**Concept**: The "Holy Grail" of agency automation—seamlessly converting a signed proposal into active billing and project infrastructure.
**Inspiration**: Common n8n pattern "Typeform > Stripe > Slack > Notion".

### Workflow Logic
1.  **Trigger**: Client accepts proposal in `Proposal Architect` UI.
2.  **Action 1 (Stripe MCP)**:
    *   `stripe.create_customer({ email: client_email, name: client_name })`
    *   `stripe.create_subscription({ customer: id, price: retainer_price_id })`
    *   `stripe.create_invoice_item()` (for one-off setup fees)
    *   `stripe.finalize_invoice()`
3.  **Action 2 (Supabase MCP)**:
    *   `supabase.execute_sql("UPDATE projects SET status = 'active', stripe_customer_id = '...' WHERE id = '...'")`
4.  **Action 3 (Agent)**:
    *   Deploy "Onboarding Agent" to send welcome email with Stripe Portal link.

**Why it's smart**: Eliminates the "payment friction" gap. The moment they say "Yes", they are billed and boarded.

## 2. The "Global Trend Watchdog" (PlusFeeds Style)
**Concept**: A "Listening Engine" that feeds the "Global Merchant" agent. PlusFeeds is famous for turning chaos (social feeds) into signal (RSS).
**Inspiration**: "Social Listening > Sentiment Analysis > Alerting".

### Workflow Logic
1.  **Trigger**: Scheduled Job (Hourly).
2.  **Action 1 (Browser Tool)**:
    *   Agent visits key market aggregators (e.g., "Best Selling on Naver", "Trending on 1688").
    *   *Note: Since we have the `browser_subagent`, we can build a specialized "Harvester" that runs periodically.*
3.  **Action 2 (Supabase MCP)**:
    *   Store raw trends in `trend_signals` table.
4.  **Action 3 (Agent)**:
    *   "Global Merchant" compares new signals against user's Product Portfolio.
    *   If match > 80%: Alert User "Opportunity: This product is trending in Korea RIGHT NOW."

**Why it's smart**: Turns passive "Product Search" into proactive "Opportunity Notification".

## 3. The "Self-Auditing Ledger" (Ledger Logic V2)
**Concept**: Financial automation that doesn't just "log" but "proves".
**Inspiration**: "Bank Feed > Receipt Match > Reconciliation".

### Workflow Logic
1.  **Trigger**: `stripe.list_payment_intents()` (Daily Sync).
2.  **Action 1 (Supabase MCP)**:
    *   Fetch pending generic `reconciliation_jobs`.
3.  **Action 2 (Agent)**:
    *   Compare Stripe Payout Metadata vs. Bank Transaction Description.
    *   Use `sequential_thinking` to resolve messy descriptors (e.g., "STRIPE* J SUITH" vs "John Smith").
4.  **Action 3 (Stripe MCP)**:
    *   If dispute detected, auto-draft evidence using `stripe.update_dispute({ evidence: ... })`.

**Why it's smart**: It handles the "messy middle" of accounting (matching weird names) using Agentic reasoning, not just regex.

---

## Implementation Plan

### Phase 1: Stripe Integration (The "Railways")
- [ ] Create `lib/stripe/actions.ts` to wrap MCP calls for Customer/Subscription creation.
- [ ] Add `stripe_customer_id` and `subscription_status` to `organizations` table in Supabase.

### Phase 2: The "Watchdog" Scraper
- [ ] Create `src/agents/trend-watcher.ts`.
- [ ] Implement `browser_subagent` task definition for "Naver Datalab" scraping.

### Phase 3: Dispute Auto-Responder
- [ ] Create `src/agents/ledger-dispute.ts`.
- [ ] Connect `stripe.list_disputes` to the Agent's context.

**Recommended Next Step**: Shall we prototype the **"Deal-Closer Autopilot"** first? It has the highest immediate ROI for the Agency.

## 4. The "Growth Engine" (Smart Lead Gen)
**Concept**: A "Self-Filling Pipeline" that doesn't sleep. The n8n "Gold Standard" for agencies.
**Inspiration**: "Search > Enrich > Qualify > Reach Out".

### Workflow Logic
1.  **Trigger**: Weekly or On-Demand (e.g., "Find me 50 Gym Owners in Seoul").
2.  **Action 1 (Browser Subagent)**:
    *   Scrape *specific* niche directories (e.g., Naver Maps, LinkedIn) to get raw domains.
3.  **Action 2 (Browser Subagent / Agent)**:
    *   **"The Deep Dive"**: Agent visits each company website.
    *   Extracts: `Contact Email`, `Mission Statement`, `Recent News`, `Tech Stack`.
4.  **Action 3 (Agent - The Copywriter)**:
    *   Generates a *highly personalized* icebreaker based on their *actual* recent news/tech.
    *   *Not generic spam.* Example: "Saw you're using X tech, have you considered Y automation?"
5.  **Action 4 (Stripe/Supabase)**:
    *   Drafts email in Supabase `outreach_queue` (Human validation before sending).

**Why it's smart**: It prioritizes **Relevance** over Volume. The AI "reads" the prospect's site before writing.

## 5. The "24/7 Concierge" (Drift/Warmly Style)
**Concept**: A chatbot that doesn't just say "Hello", but *sells*.
**Inspiration**: "Signal-Based Marketing" (Warmly).

### Workflow Logic
1.  **Trigger**: Visitor lands on `pricing` page or stays > 30s.
2.  **Action 1 (Client Side)**:
    *   **"The Hook"**: Chatbot pops up with context-aware question. 
    *   If on `pricing`: "Need help calculating your ROI?"
    *   If on `case-studies`: "Want to see how [Similar Industry] scaled?"
3.  **Action 2 (Agent - RAG)**:
    *   User asks Q. Agent queries `proposal_gen` knowledge base (from Sol #1) to answer accurately.
4.  **Action 3 (Stripe)**:
    *   "Ready to start? I can create a custom invoice for you right now." -> *Triggers Deal-Closer Autopilot (Sol #1).*

**Why it's smart**: It connects the top of the funnel (Chat) directly to the bottom (Stripe Invoice).

