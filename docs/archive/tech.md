Great — this is the **right moment** to lock the **technical spine + design language** so Google Antigravity (Gemini) generates *correct, consistent, non-fluffy artifacts*.

Below is a **DROP-IN ADDENDUM PROMPT** you can append to what you already prepared.
This explicitly highlights:

* **Main tech stack (Supabase + Next.js)**
* **Web app + site + application scope**
* **Design system & UI principles**
* **How the AI should think when generating workflows & directives**

You can paste this **after** the master bootstrap prompt or as a **separate “constraints” prompt**.

---

# 🔒 TECH + DESIGN CONSTRAINTS PROMPT (ADD THIS)

> **Paste this into Antigravity immediately after the master prompt**

```
IMPORTANT: Apply the following TECHNOLOGY and DESIGN constraints to ALL generated files, workflows, directives, and documentation.

━━━━━━━━━━━━━━━━━━━━━━━━━━
TECHNOLOGY STACK (MANDATORY)
━━━━━━━━━━━━━━━━━━━━━━━━━━

This product is a WEB APPLICATION + SITE built with:

Frontend:
- Next.js (App Router)
- React
- Server Components where appropriate
- Tailwind CSS for styling

Backend:
- Supabase (Postgres, Auth, Storage, Row Level Security)
- API-first architecture
- Server Actions / Edge Functions where applicable

State & Data:
- Persistent workflow state stored in Supabase
- Agent execution state is serializable and auditable
- All workflows and agent decisions must be loggable

Authentication & Access:
- Supabase Auth
- Role-based access control
- Tenant isolation (each SME is isolated)

This is NOT:
- A static website
- A one-off script system
- A notebook-based AI tool
- A no-code-only product

Assume a production-grade SaaS architecture.

━━━━━━━━━━━━━━━━━━━━━━━━━━
APPLICATION SCOPE
━━━━━━━━━━━━━━━━━━━━━━━━━━

The product includes:

1. Public Website
   - Positioning
   - Solutions
   - Architecture
   - Trust & credibility

2. Authenticated Web App
   - Agent Systems Dashboard
   - Workflow Control
   - Human-in-the-Loop Approvals
   - Observability & Logs
   - Templates & Configurations

3. Future-ready Application Layer
   - APIs for agent execution
   - Reusable workflow definitions
   - Expandable into mobile or partner tools later

When generating documentation:
- Clearly distinguish between SITE vs APP vs SYSTEM
- Avoid blending marketing pages with control interfaces

━━━━━━━━━━━━━━━━━━━━━━━━━━
DESIGN SYSTEM & UI PRINCIPLES
━━━━━━━━━━━━━━━━━━━━━━━━━━

Design philosophy:
- Calm
- Trustworthy
- System-oriented
- Enterprise-grade
- Minimal, not flashy

Visual rules:
- Neutral color palette (slate, gray, muted blue)
- No hype gradients
- No “AI magic” visuals
- No gamification

UI priorities:
- Clarity of state
- Visibility of system behavior
- Explainability of decisions
- Clear separation between AI actions and human actions

Dashboards must emphasize:
- Status
- Flow
- Control
- Logs
- Metrics

Not:
- Creative inspiration
- Content writing tools
- Prompt playgrounds

━━━━━━━━━━━━━━━━━━━━━━━━━━
DOCUMENTATION RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━

When generating files (gemini.md, directives, workflows, schemas):

- Write as if engineers will implement them
- Use structured sections
- Use explicit constraints
- Prefer deterministic behavior over flexibility
- Always assume human oversight

Avoid:
- Marketing language
- Buzzwords
- Over-promising autonomy
- References to “intelligence” without controls

━━━━━━━━━━━━━━━━━━━━━━━━━━
AI BEHAVIORAL EXPECTATIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━

When designing workflows or agents:
- Default to safe execution
- Escalate uncertainty
- Log all decisions
- Require approval for irreversible actions

AI agents must behave like:
- Junior operators with supervision
NOT
- Autonomous decision-makers

━━━━━━━━━━━━━━━━━━━━━━━━━━
FINAL CHECK
━━━━━━━━━━━━━━━━━━━━━━━━━━

Before outputting any file:
- Confirm it aligns with Supabase + Next.js architecture
- Confirm it can be implemented in a real web app
- Confirm it reinforces deep-tech credibility
```

---

# 🧩 OPTIONAL: DESIGN TOKEN PROMPT (VERY USEFUL)

If Antigravity supports design tokens or UI generation, run this too:

```
Define a base design system for the web application:

- Typography: modern, neutral, readable
- Spacing: generous, grid-based
- Components: cards, tables, status badges, timelines
- Emphasis: state > decoration

Generate:
- Design principles
- Component categories
- Layout patterns for dashboards
```

---

# ✅ WHAT THIS UNLOCKS

With this added, Antigravity will now:

* Generate **Supabase-aware docs**
* Respect **Next.js app boundaries**
* Produce **implementable workflows**
* Design **serious dashboards**, not AI toys
* Maintain **deep-tech credibility**

This avoids the #1 failure mode:

> “Nice docs that can’t actually be built.”

---

