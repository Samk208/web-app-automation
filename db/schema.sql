-- db/schema.sql
-- Agentic Systems Integrator - MVP Database Schema
-- Tech: Supabase Postgres

-- Enable UUID extension
create extension if not exists "pgcrypto";

--------------------------------------------------------------------------------
-- 1. TENANCY & USERS
--------------------------------------------------------------------------------

-- Public Organizations (Tenants)
create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

-- User Profiles (linked to auth.users)
create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Organization Memberships (RBAC)
create type public.org_role as enum ('owner', 'admin', 'member', 'viewer');

create table public.memberships (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.org_role not null default 'member',
  created_at timestamptz not null default now(),
  unique (organization_id, user_id)
);

--------------------------------------------------------------------------------
-- 2. AGENT SYSTEMS & CONFIGURATION
--------------------------------------------------------------------------------

-- Agent Systems (The "Container" for agents per org)
create table public.agent_systems (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  description text,
  status text not null default 'active', -- active, paused, archived
  config jsonb not null default '{}'::jsonb, -- System-level config
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

-- Agent Definitions (Roles within a system)
create table public.agent_definitions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  system_id uuid references public.agent_systems(id) on delete cascade,
  name text not null, -- e.g. "Research Specialist"
  role text not null, -- e.g. "researcher", "manager"
  model_config jsonb not null default '{}'::jsonb, -- model, temp, provider
  tools_config jsonb not null default '[]'::jsonb, -- enabled tools
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Workflow Definitions (Templates)
create table public.workflow_definitions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  description text,
  version int not null default 1,
  is_template boolean not null default false,
  spec jsonb not null, -- The graph/steps definition
  input_schema jsonb default '{}'::jsonb, -- JSON Schema for validation
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, name, version)
);

--------------------------------------------------------------------------------
-- 3. EXECUTION & STATE
--------------------------------------------------------------------------------

-- Workflow Runs (Instances)
create table public.workflow_runs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  system_id uuid references public.agent_systems(id) on delete set null,
  definition_id uuid references public.workflow_definitions(id) on delete set null,
  status text not null default 'pending', -- pending, running, paused, completed, failed, cancelled
  input_payload jsonb not null default '{}'::jsonb,
  output_payload jsonb,
  error_details jsonb,
  metrics jsonb not null default '{}'::jsonb, -- cost, tokens, duration
  requires_action boolean default false, -- HITL flag
  started_at timestamptz,
  finished_at timestamptz,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Workflow Steps (Granular Logs)
create table public.workflow_steps (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  run_id uuid not null references public.workflow_runs(id) on delete cascade,
  step_index int not null,
  step_type text not null, -- 'agent', 'tool', 'system', 'approval'
  agent_id uuid references public.agent_definitions(id),
  status text not null default 'pending',
  input_data jsonb,
  output_data jsonb,
  error_data jsonb,
  started_at timestamptz,
  finished_at timestamptz,
  created_at timestamptz not null default now()
);

--------------------------------------------------------------------------------
-- 4. HUMAN-IN-THE-LOOP (HITL)
--------------------------------------------------------------------------------

create type public.approval_status as enum ('pending', 'approved', 'rejected', 'edited');

create table public.approval_requests (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  run_id uuid not null references public.workflow_runs(id) on delete cascade,
  step_id uuid references public.workflow_steps(id),
  status public.approval_status not null default 'pending',
  trigger_reason text not null,
  data_payload jsonb not null, -- What is being approved
  assigned_to_role public.org_role default 'admin', -- e.g. only admins can approve
  decision_payload jsonb, -- Edited data if applicable
  decided_by uuid references auth.users(id),
  decided_at timestamptz,
  created_at timestamptz not null default now()
);

--------------------------------------------------------------------------------
-- 5. INTEGRATIONS & AUDIT
--------------------------------------------------------------------------------

create table public.integrations (
  id uuid primary key default gen_random_uuid(),
  name text not null, -- 'hubspot', 'slack', etc.
  key text unique not null,
  logo_url text,
  doc_url text,
  created_at timestamptz not null default now()
);

create table public.integration_connections (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  integration_key text not null, -- e.g. 'hubspot'
  label text,
  config_meta jsonb default '{}'::jsonb, -- Non-secret config (e.g. account_id)
  -- Secrets should be stored in Supabase Vault, referenced here by ID if needed, or matched by composite key.
  -- user_id uuid references auth.users(id), -- If OAuth is per-user
  status text default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Immutable Audit Log
create table public.events_audit (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  event_type text not null, -- 'workflow.started', 'agent.action', 'approval.rejected'
  actor_id uuid references auth.users(id), -- Null if system
  resource_id uuid, -- Polymorphic ID (run_id, system_id, etc.)
  resource_table text,
  payload jsonb not null default '{}'::jsonb,
  ip_address text,
  created_at timestamptz not null default now()
);

-- Indexes
create index idx_memberships_org_user on public.memberships(organization_id, user_id);
create index idx_runs_org_status on public.workflow_runs(organization_id, status);
create index idx_steps_run_id on public.workflow_steps(run_id);
create index idx_audit_org_created on public.events_audit(organization_id, created_at desc);
create index idx_approvals_org_status on public.approval_requests(organization_id, status);
