Awesome — here are **two copy-paste prompts** for Antigravity to generate:



---

## ✅ PROMPT #1 — Generate Supabase Schema + RLS (Multi-tenant SaaS, Agentic Control Plane)

> Paste this into Antigravity

```text
Generate Supabase database schema + Row Level Security policies for a multi-tenant “Agentic Systems Integrator for SMEs” web app.

TECH STACK (mandatory):
- Next.js App Router + Tailwind
- Supabase Postgres + Auth + RLS
- API-first, auditable workflows and human approvals

OUTPUTS REQUIRED:
1) /db/schema.sql (Postgres SQL, Supabase compatible)
2) /db/rls.sql (RLS enablement + policies)
3) /db/seed.sql (minimal dev seed)
4) /docs/data-model.md (tables explained + relationships)

CORE REQUIREMENTS:
- Multi-tenant: every record must be scoped by tenant (organization_id)
- Tenant isolation enforced by RLS (no cross-tenant reads/writes)
- Users come from auth.users; create profiles table linked by user_id
- Role-based access control per org (owner/admin/member/viewer)
- Everything must be auditable: logs for agent runs, workflow steps, approvals, tool calls

ENTITIES (must include):
- organizations
- profiles (user_id)
- memberships (org roles)
- agent_systems (a deployed “system” per client)
- agent_definitions (roles like manager/specialist/validator)
- workflow_definitions (template + versioning)
- workflow_runs (instances)
- workflow_steps (per step execution logs)
- approval_requests (HITL queue)
- integrations (connected tools metadata)
- integration_connections (per org connector config metadata only; no secrets)
- events_audit (append-only audit log)

IMPORTANT CONSTRAINTS:
- Never store raw secrets in DB; store references only (e.g., encrypted secrets via Supabase Vault or external secret manager; document this)
- Approval requests must support: pending/approved/rejected/edited + approver user_id + timestamps + reason/comments
- Each workflow_run and step must have: status, timestamps, error fields, model/provider metadata, cost/token estimates if available
- Implement “soft delete” pattern where useful (deleted_at)
- Use UUID PKs
- Add indexes for: org scoping, status filters, created_at sorting
- Add RLS policies for SELECT/INSERT/UPDATE/DELETE per table based on membership role
- Include helper SQL functions for auth.uid() org membership checks

RLS RULES (minimum):
- org members can read org data
- only admin/owner can modify configurations (integrations, templates, agent_system definitions)
- member can create runs and submit approvals; viewer read-only
- approvals: only assigned approvers (or admin/owner) can approve/reject
- audit logs: insert-only; no update/delete

Return full files with clear headings and comments.
```

---

### (Optional) Starter reference SQL (for you to compare)

If you want a baseline now, here’s a compact, solid starting point you can keep (Antigravity should produce something similar, but more complete):

```sql
-- db/schema.sql (starter reference)

create extension if not exists "pgcrypto";

-- 1) Tenancy
create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique,
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);

-- 2) Users
create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  created_at timestamptz not null default now()
);

-- 3) Membership / RBAC
create type public.org_role as enum ('owner','admin','member','viewer');

create table public.memberships (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.org_role not null default 'member',
  created_at timestamptz not null default now(),
  unique (organization_id, user_id)
);

-- 4) Agentic Systems (deployed per org)
create table public.agent_systems (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  description text,
  status text not null default 'active', -- active|paused|archived
  config jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

-- 5) Workflow Definitions (templates + versioning)
create table public.workflow_definitions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  version int not null default 1,
  is_template boolean not null default false,
  spec jsonb not null, -- nodes/edges/steps config
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  unique (organization_id, name, version)
);

-- 6) Runs + Steps (observability)
create table public.workflow_runs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  agent_system_id uuid references public.agent_systems(id) on delete set null,
  workflow_definition_id uuid references public.workflow_definitions(id) on delete set null,
  status text not null default 'queued', -- queued|running|waiting_approval|succeeded|failed|cancelled
  input jsonb not null default '{}'::jsonb,
  output jsonb,
  error jsonb,
  model_meta jsonb not null default '{}'::jsonb, -- provider/model/tokens/cost
  started_at timestamptz,
  finished_at timestamptz,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table public.workflow_steps (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  run_id uuid not null references public.workflow_runs(id) on delete cascade,
  step_index int not null,
  agent_role text,
  status text not null default 'queued',
  input jsonb not null default '{}'::jsonb,
  output jsonb,
  error jsonb,
  started_at timestamptz,
  finished_at timestamptz,
  created_at timestamptz not null default now(),
  unique (run_id, step_index)
);

-- 7) Human-in-the-loop approvals
create type public.approval_status as enum ('pending','approved','rejected','edited');

create table public.approval_requests (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  run_id uuid references public.workflow_runs(id) on delete cascade,
  step_id uuid references public.workflow_steps(id) on delete set null,
  status public.approval_status not null default 'pending',
  requested_action text not null,
  request_payload jsonb not null,
  requested_by uuid references auth.users(id),
  assigned_to uuid references auth.users(id), -- nullable if “any admin”
  decision_payload jsonb,
  decided_by uuid references auth.users(id),
  decided_at timestamptz,
  created_at timestamptz not null default now()
);

create index on public.memberships (organization_id, user_id);
create index on public.agent_systems (organization_id, status, created_at desc);
create index on public.workflow_runs (organization_id, status, created_at desc);
create index on public.approval_requests (organization_id, status, created_at desc);
```

---

## ✅ PROMPT #4 — Low-Fidelity Wireframes (Dashboard Pages + Components + States)

> Paste this into Antigravity

```text
Create low-fidelity wireframes (text + layout) for the authenticated web app of “Agentic Systems Integrator for SMEs”.

OUTPUTS REQUIRED:
1) /wireframes/app-map.md (navigation + routes)
2) /wireframes/overview.md
3) /wireframes/agent-systems.md
4) /wireframes/system-detail.md
5) /wireframes/approvals.md
6) /wireframes/templates.md
7) /wireframes/activity-log.md
8) /wireframes/settings.md

UI CONSTRAINTS:
- Next.js + Tailwind
- Calm, trustworthy, enterprise-grade
- Prioritize state visibility, control, and auditability
- Avoid “prompt playground” UI patterns

WIREFRAME FORMAT:
For each page include:
- Purpose
- Primary user actions
- Data displayed (and source tables)
- Layout sketch in ASCII (header/sidebar/main/panels)
- Key components (cards, tables, badges, timeline, filters)
- States: empty / loading / error / success
- Permission notes (viewer/member/admin)

NAVIGATION (required):
Sidebar: Overview, Agent Systems, Approvals, Templates, Activity Log, Settings

PAGES MUST SUPPORT:
- Agent System list (status, last run, health)
- System detail with tabs: Workflow, Agents, Approvals, Logs, Metrics
- Approvals queue with approve/reject/edit + audit trail
- Activity log with filters (by system/run/status/user)
- Templates library (view + clone + deploy)
```

---

### Starter wireframe skeleton (what “good” looks like)

You can compare Antigravity output to this structure:

```text
[Sidebar]
- Overview
- Agent Systems
- Approvals (badge count)
- Templates
- Activity Log
- Settings

[Top Bar]
Org switcher | Search | User menu

OVERVIEW (Main)
---------------------------------------------------------
[Health Summary]   [Approvals Pending]   [Runs Today]
[Success Rate]     [Override Rate]       [Estimated Hours Saved]

[Recent Runs Table] (filter: status, system)
[Recent Approvals Timeline]
[Alerts Panel] (errors, integration disconnects)
---------------------------------------------------------
```

---

