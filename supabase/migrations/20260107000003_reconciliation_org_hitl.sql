alter table public.reconciliation_jobs
add column if not exists organization_id uuid references public.organizations (id);

create index if not exists idx_reconciliation_jobs_org on public.reconciliation_jobs (organization_id);

alter table public.reconciliation_jobs
drop constraint if exists reconciliation_jobs_status_check;

alter table public.reconciliation_jobs
add constraint reconciliation_jobs_status_check check (
    status in (
        'UPLOADED',
        'PROCESSING',
        'AWAITING_APPROVAL',
        'COMPLETED',
        'FAILED'
    )
);

alter table public.reconciliation_jobs enable row level security;

drop policy if exists "Enable all access for all users" on public.reconciliation_jobs;

create policy "Reconciliation jobs visible to members or null-org demo" on public.reconciliation_jobs for
select using (
        organization_id is null
        or public.is_org_member (organization_id)
    );

create policy "Reconciliation jobs insert by members or demo" on public.reconciliation_jobs for insert
with
    check (
        organization_id is null
        or public.is_org_member (organization_id)
    );

create policy "Reconciliation jobs update by members" on public.reconciliation_jobs
for update
    using (
        organization_id is null
        or public.is_org_member (organization_id)
    );

do $$ begin
  begin alter publication supabase_realtime add table public.reconciliation_jobs;

exception when duplicate_object then null;

end;

end $$;