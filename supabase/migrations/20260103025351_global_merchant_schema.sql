-- Create Localizations Table
create table localizations (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  source_text text not null,
  target_market text not null, -- e.g., 'Japan', 'Germany'
  status text check (status in ('PENDING', 'ANALYZING', 'ADAPTING', 'COMPLETED')) default 'PENDING',
  adapted_text text,
  cultural_reasoning jsonb, -- Stores the "Why" behind changes (e.g., {"avoided_term": "cheap", "reason": "Implies low quality in JP market"})
  confidence_score float
);

-- Enable RLS
alter table localizations enable row level security;

-- Policies
create policy "Enable all access for all users" on localizations for all using (true);

-- Realtime
alter publication supabase_realtime add table localizations;
