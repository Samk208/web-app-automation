# MVP Documentation

## 1. Getting Started
### Prerequisites
- Node.js v20+
- Supabase Project (created)
- OpenAI / Anthropic API Keys

### Installation
1.  Clone repo.
2.  `npm install`
3.  `cp .env.example .env.local` (Populate Supabase & AI Keys)
4.  `npm run dev`

## 2. MVP Scope (Phase 1)
- **Authentication:** Sign up/Login via Supabase Auth (Email/Pass).
- **Dashboard:** View list of active/past workflows.
- **Workflow Builder (Basic):** Select from pre-defined "Recipes" (no dragging nodes yet).
    - Recipe A: "Inbound Lead Qualifier"
    - Recipe B: "Weekly Market Report"
- **Execution:** Trigger run manually. View logs streaming in real-time.
- **Approvals:** Simple "Approve/Reject" modal for paused workflows.

## 3. Deployment Guide
- **Frontend:** Vercel (recommended) or any Next.js generic host.
- **Backend:** Supabase (managed).
- **Edge Functions:** Deploy via Supabase CLI (`supabase functions deploy`).

## 4. Observability Strategy
- **Logs:** All `workflow_logs` are inspectable in the UI.
- **Tracing:** (Future) OpenTelemetry integration.
- **Alerts:** Email triggers on `failed` workflow status.

## 5. Security Checklist
- [ ] RLS Policies enabled on all tables.
- [ ] API routes protected by Middleware (Auth Check).
- [ ] Secrets (API Keys) not committed to Git.
- [ ] Public website separated from App logic (different routes/layouts).
