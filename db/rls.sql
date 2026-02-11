-- db/rls.sql
-- Row Level Security Policies
-- PREREQUISITE: Run schema.sql first

-- Helper Function to check Org Membership
create or replace function public.is_org_member(_org_id uuid)
returns boolean as $$
begin
  return exists (
    select 1 from public.memberships
    where organization_id = _org_id
    and user_id = auth.uid()
  );
end;
$$ language plpgsql security definer;

-- Helper Function to check Org Role (e.g. admin/owner)
create or replace function public.has_org_role(_org_id uuid, _role public.org_role)
returns boolean as $$
begin
  return exists (
    select 1 from public.memberships
    where organization_id = _org_id
    and user_id = auth.uid()
    and role = _role
  );
end;
$$ language plpgsql security definer;

--------------------------------------------------------------------------------
-- ENABLE RLS ON ALL TABLES
--------------------------------------------------------------------------------
alter table public.organizations enable row level security;
alter table public.profiles enable row level security;
alter table public.memberships enable row level security;
alter table public.agent_systems enable row level security;
alter table public.agent_definitions enable row level security;
alter table public.workflow_definitions enable row level security;
alter table public.workflow_runs enable row level security;
alter table public.workflow_steps enable row level security;
alter table public.approval_requests enable row level security;
alter table public.integration_connections enable row level security;
alter table public.events_audit enable row level security;

--------------------------------------------------------------------------------
-- POLICIES
--------------------------------------------------------------------------------

-- 1. Organizations
-- Users can read orgs they belong to
create policy "Members can view their organizations"
  on public.organizations for select
  using (
    id in (select organization_id from public.memberships where user_id = auth.uid())
  );

-- 2. Profiles
-- Users can read all profiles (basic info)
create policy "Users can view all profiles"
  on public.profiles for select
  using (auth.uid() is not null);
  
-- Users can update their own profile
create policy "Users can update own profile"
  on public.profiles for update
  using (user_id = auth.uid());

-- 3. Memberships
-- Members can view memberships of their orgs
create policy "Members can view team"
  on public.memberships for select
  using ( public.is_org_member(organization_id) );

-- Only Admins/Owners can manage memberships (Simplified: just owner/admin check)
-- (Real implementation would be more complex to prevent self-lockout)
create policy "Admins can manage memberships"
  on public.memberships for all
  using (
    public.has_org_role(organization_id, 'owner') or 
    public.has_org_role(organization_id, 'admin')
  );

-- 4. Agent Systems
create policy "Members can view agent systems"
  on public.agent_systems for select
  using ( public.is_org_member(organization_id) );

create policy "Admins/Owners can manage agent systems"
  on public.agent_systems for all
  using (
     public.has_org_role(organization_id, 'owner') or 
     public.has_org_role(organization_id, 'admin')
  );

-- 5. Workflow runs
-- All members can view runs
create policy "Members can view runs"
  on public.workflow_runs for select
  using ( public.is_org_member(organization_id) );

-- Members can create runs
create policy "Members can create runs"
  on public.workflow_runs for insert
  with check ( public.is_org_member(organization_id) );

-- 6. Workflow Steps
create policy "Members can view steps"
  on public.workflow_steps for select
  using ( public.is_org_member(organization_id) );

-- 7. Audit Log
-- Read-only for members
create policy "Members can view audit logs"
  on public.events_audit for select
  using ( public.is_org_member(organization_id) );

-- Insert-only (System/Backend usage mostly, but defined for completeness)
-- In practice, audit logs are often written by a service_role key, bypassing RLS.

-- 8. Approvals
create policy "Members can view approvals"
  on public.approval_requests for select
  using ( public.is_org_member(organization_id) );

create policy "Admins can update approvals"
  on public.approval_requests for update
  using (
    public.has_org_role(organization_id, 'owner') or 
    public.has_org_role(organization_id, 'admin')
  );
