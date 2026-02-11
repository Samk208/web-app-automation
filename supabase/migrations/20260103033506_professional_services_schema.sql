-- Create Reconciliation Jobs Table (Ledger Logic)
create table reconciliation_jobs (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  status text check (status in ('UPLOADED', 'PROCESSING', 'COMPLETED')) default 'UPLOADED',
  company_name text not null,
  bank_statement_data jsonb, -- Array of transaction objects
  receipt_data jsonb, -- Array of extracted receipt info
  match_results jsonb -- Array of matches and discrepancies
);

-- Create Proposals Table (Proposal Architect)
create table proposals (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  client_url text,
  project_scope text,
  status text check (status in ('RESEARCHING', 'DRAFTING', 'COMPLETED')) default 'RESEARCHING',
  scraped_brand_voice jsonb, -- e.g. {"tone": "Formal", "keywords": ["Innovation", "Trust"]}
  retrieved_knowledge jsonb, -- IDs of relevant case studies found in RAG
  generated_content text -- Markown content of the proposal
);

-- Enable RLS
alter table reconciliation_jobs enable row level security;
alter table proposals enable row level security;

-- Policies (Allow all for demo)
create policy "Enable all access for all users" on reconciliation_jobs for all using (true);
create policy "Enable all access for all users" on proposals for all using (true);

-- Realtime
alter publication supabase_realtime add table reconciliation_jobs;
alter publication supabase_realtime add table proposals;
