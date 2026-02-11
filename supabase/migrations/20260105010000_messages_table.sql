-- Messages table for omni-channel bots (Kakao, etc.)
create table if not exists messages (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  channel text not null,
  user_external_id text not null,
  role text default 'user',
  content text,
  organization_id uuid references public.organizations(id)
);

alter table messages enable row level security;

drop policy if exists "Enable all access for all users" on messages;

create policy "Messages visible to members or null-org demo" on messages
  for select using (organization_id is null or public.is_org_member(organization_id));
create policy "Messages insert by members or demo" on messages
  for insert with check (organization_id is null or public.is_org_member(organization_id));
create policy "Messages update by members" on messages
  for update using (organization_id is null or public.is_org_member(organization_id));

do $$ begin
  begin alter publication supabase_realtime add table messages; exception when duplicate_object then null; end;
end $$;

create index if not exists idx_messages_org on messages(organization_id);

