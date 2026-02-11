create table if not exists hwp_jobs (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  organization_id uuid references public.organizations(id),
  file_url text not null,
  status text check (status in ('QUEUED','PROCESSING','COMPLETED','FAILED')) default 'QUEUED',
  output_url text,
  error_message text
);

alter table hwp_jobs enable row level security;

drop policy if exists "Enable all access for all users" on hwp_jobs;

create policy "HWP jobs visible to members or null-org demo" on hwp_jobs
  for select using (organization_id is null or public.is_org_member(organization_id));
create policy "HWP jobs insert by members or demo" on hwp_jobs
  for insert with check (organization_id is null or public.is_org_member(organization_id));
create policy "HWP jobs update by members" on hwp_jobs
  for update using (organization_id is null or public.is_org_member(organization_id));

do $$ begin
  begin alter publication supabase_realtime add table hwp_jobs; exception when duplicate_object then null; end;
end $$;

create index if not exists idx_hwp_jobs_org on hwp_jobs(organization_id);

