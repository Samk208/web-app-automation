-- Create Startup Programs Database (ReadOnly for Users)
create table startup_programs (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  name text not null, -- e.g. "TIPS", "Pre-Startup Package"
  category text, -- "R&D", "Commercialization", "Global"
  eligibility_criteria jsonb, -- { "age_max": 7, "tech_required": true }
  funding_amount text, -- "Up to 500M KRW"
  deadline timestamptz
);

-- Seed some initial data
insert into startup_programs (name, category, funding_amount, deadline) values
('TIPS (Tech Incubator Program for Startup)', 'R&D', 'Up to 500M KRW (Matched)', '2026-12-31'),
('Pre-Startup Package (Available for Foreigners)', 'Commercialization', 'Avg 50M KRW', '2026-03-15'),
('OASIS (Visa Points)', 'Visa', 'Visa Points + Incubation', '2026-12-31'),
('Global Challenge 2026', 'Global', 'Prize Money + PoC', '2026-06-30');

-- Create Program Matches Table (Navigator Agent)
create table program_matches (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  startup_profile jsonb, -- { "stage": "Series A", "industry": "AI" }
  matched_results jsonb, -- Array of programs with Fit Score
  status text check (status in ('ANALYZING', 'COMPLETED')) default 'ANALYZING'
);

-- Create Business Plans Table (Writer Agent)
create table business_plans (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  input_materials text, -- Raw text or file link
  target_program text, -- e.g. "TIPS" (determines format)
  status text check (status in ('PROCESSING', 'GENERATING', 'COMPLETED')) default 'PROCESSING',
  sections_generated jsonb -- { "market_analysis": "...", "strategy": "..." }
);

-- Enable RLS
alter table startup_programs enable row level security;
alter table program_matches enable row level security;
alter table business_plans enable row level security;

-- Policies (Allow all for demo)
create policy "Enable read access for all users" on startup_programs for all using (true);
create policy "Enable all access for all users" on program_matches for all using (true);
create policy "Enable all access for all users" on business_plans for all using (true);

-- Realtime
alter publication supabase_realtime add table program_matches;
alter publication supabase_realtime add table business_plans;
