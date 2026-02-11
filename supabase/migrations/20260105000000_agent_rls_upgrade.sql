-- Strengthen RLS for agent tables by scoping to organizations (while allowing null org for legacy/demo rows).
-- Note: Update application writes to populate organization_id; policies here permit NULL for compatibility.

-- Helper functions (idempotent)
do $$
begin
  if not exists (select 1 from pg_type where typname = 'org_role') then
    create type public.org_role as enum ('owner', 'admin', 'member', 'viewer');
  end if;
end $$;

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

-- Add organization_id columns (nullable for backward compatibility)
alter table business_plans add column if not exists organization_id uuid references public.organizations(id);
alter table program_matches add column if not exists organization_id uuid references public.organizations(id);
alter table grant_applications add column if not exists organization_id uuid references public.organizations(id);
alter table safety_logs add column if not exists organization_id uuid references public.organizations(id);
alter table sourcing_tasks add column if not exists organization_id uuid references public.organizations(id);
alter table seo_audits add column if not exists organization_id uuid references public.organizations(id);

-- Indexes
create index if not exists idx_business_plans_org on business_plans(organization_id);
create index if not exists idx_program_matches_org on program_matches(organization_id);
create index if not exists idx_grant_applications_org on grant_applications(organization_id);
create index if not exists idx_safety_logs_org on safety_logs(organization_id);
create index if not exists idx_sourcing_tasks_org on sourcing_tasks(organization_id);
create index if not exists idx_seo_audits_org on seo_audits(organization_id);

-- Policies: drop permissive demo policies and replace with org-scoped + null fallback for legacy rows.

-- business_plans
drop policy if exists "Enable all access for all users" on business_plans;
create policy "Business plans visible to members or null-org demo" on business_plans
  for select using (organization_id is null or public.is_org_member(organization_id));
create policy "Business plans insert by members or demo" on business_plans
  for insert with check (organization_id is null or public.is_org_member(organization_id));
create policy "Business plans update by members" on business_plans
  for update using (organization_id is null or public.is_org_member(organization_id));

-- program_matches
drop policy if exists "Enable all access for all users" on program_matches;
create policy "Program matches visible to members or null-org demo" on program_matches
  for select using (organization_id is null or public.is_org_member(organization_id));
create policy "Program matches insert by members or demo" on program_matches
  for insert with check (organization_id is null or public.is_org_member(organization_id));
create policy "Program matches update by members" on program_matches
  for update using (organization_id is null or public.is_org_member(organization_id));

-- grant_applications
drop policy if exists "Enable all access for all users" on grant_applications;
create policy "Grant applications visible to members or null-org demo" on grant_applications
  for select using (organization_id is null or public.is_org_member(organization_id));
create policy "Grant applications insert by members or demo" on grant_applications
  for insert with check (organization_id is null or public.is_org_member(organization_id));
create policy "Grant applications update by members" on grant_applications
  for update using (organization_id is null or public.is_org_member(organization_id));

-- safety_logs
drop policy if exists "Enable all access for all users" on safety_logs;
create policy "Safety logs visible to members or null-org demo" on safety_logs
  for select using (organization_id is null or public.is_org_member(organization_id));
create policy "Safety logs insert by members or demo" on safety_logs
  for insert with check (organization_id is null or public.is_org_member(organization_id));

-- sourcing_tasks
drop policy if exists "Enable all access for all users" on sourcing_tasks;
create policy "Sourcing tasks visible to members or null-org demo" on sourcing_tasks
  for select using (organization_id is null or public.is_org_member(organization_id));
create policy "Sourcing tasks insert by members or demo" on sourcing_tasks
  for insert with check (organization_id is null or public.is_org_member(organization_id));
create policy "Sourcing tasks update by members" on sourcing_tasks
  for update using (organization_id is null or public.is_org_member(organization_id));

-- seo_audits
drop policy if exists "Enable all access for all users" on seo_audits;
create policy "SEO audits visible to members or null-org demo" on seo_audits
  for select using (organization_id is null or public.is_org_member(organization_id));
create policy "SEO audits insert by members or demo" on seo_audits
  for insert with check (organization_id is null or public.is_org_member(organization_id));
create policy "SEO audits update by members" on seo_audits
  for update using (organization_id is null or public.is_org_member(organization_id));

-- Realtime additions (idempotent)
do $$ begin
  begin alter publication supabase_realtime add table business_plans; exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table program_matches; exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table grant_applications; exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table safety_logs; exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table sourcing_tasks; exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table seo_audits; exception when duplicate_object then null; end;
end $$;

