alter table public.localizations
add column if not exists organization_id uuid references public.organizations (id);

create index if not exists idx_localizations_org on public.localizations (organization_id);

alter table public.localizations
drop constraint if exists localizations_status_check;

alter table public.localizations
add constraint localizations_status_check check (
    status in (
        'PENDING',
        'ANALYZING',
        'ADAPTING',
        'COMPLETED',
        'FAILED'
    )
);

alter table public.localizations enable row level security;

drop policy if exists "Enable all access for all users" on public.localizations;

create policy "Localizations visible to members or null-org demo" on public.localizations for
select using (
        organization_id is null
        or public.is_org_member (organization_id)
    );

create policy "Localizations insert by members or demo" on public.localizations for insert
with
    check (
        organization_id is null
        or public.is_org_member (organization_id)
    );

create policy "Localizations update by members" on public.localizations
for update
    using (
        organization_id is null
        or public.is_org_member (organization_id)
    );

do $$ begin
  begin alter publication supabase_realtime add table public.localizations;

exception when duplicate_object then null;

end;

end $$;