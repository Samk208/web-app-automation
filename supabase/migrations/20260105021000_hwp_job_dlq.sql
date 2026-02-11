create table if not exists hwp_job_dlq (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  job_id uuid references public.hwp_jobs(id),
  organization_id uuid references public.organizations(id),
  attempts integer,
  error_message text,
  payload jsonb
);

alter table hwp_job_dlq enable row level security;

drop policy if exists "HWP DLQ visible to members or null-org demo" on hwp_job_dlq;
create policy "HWP DLQ visible to members or null-org demo" on hwp_job_dlq
  for select using (organization_id is null or public.is_org_member(organization_id));

drop policy if exists "HWP DLQ insert by members or demo" on hwp_job_dlq;
create policy "HWP DLQ insert by members or demo" on hwp_job_dlq
  for insert with check (organization_id is null or public.is_org_member(organization_id));

create index if not exists idx_hwp_job_dlq_org on hwp_job_dlq(organization_id);

