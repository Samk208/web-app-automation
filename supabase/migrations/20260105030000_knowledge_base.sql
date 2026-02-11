
create table if not exists knowledge_base (
  id text primary key,
  title text not null,
  tags text[] not null default '{}',
  content text not null,
  created_at timestamptz default now()
);

alter table knowledge_base enable row level security;

create policy "Knowledge base readable by all" on knowledge_base
  for select using (true);

-- Seed Data (from proposal.ts)
insert into knowledge_base (id, title, tags, content) values
(
  'case_study_fintech_01',
  'Cloud Migration for Shinhan Bank',
  '{cloud, security, finance}',
  'Successfully migrated 50TB of legacy data to Hybrid Cloud, reducing latency by 40% and cutting OpEx by 25%.'
),
(
  'whitepaper_retail_ai',
  'AI Personalization for Coupang Sellers',
  '{ai, ecommerce, retail}',
  'Implemented recommendation engine increasing bucket size by 15%.'
),
(
  'project_healthcare_security',
  'HIPAA Compliant Infrastructure for Severance Hospital',
  '{security, healthcare, compliance}',
  'Zero-trust architecture implementation with 99.99% uptime SLA.'
)
on conflict (id) do nothing;
