-- Create Grant Applications Table (R&D Grant Scout)
create table grant_applications (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  startup_name text not null,
  status text check (status in ('ANALYZING', 'DRAFTING', 'COMPLETED')) default 'ANALYZING',
  tech_sector text, -- e.g. "AI", "Bio", "Chip"
  matched_programs jsonb, -- Array of relevant TIPS/Gov programs
  generated_draft text -- Content of the gov proposal
);

-- Create Safety Logs Table (Safety Guardian)
create table safety_logs (
  id uuid default gen_random_uuid() primary key,
  timestamp timestamptz default now(),
  factory_zone text not null,
  sensor_type text not null, -- 'TEMP', 'PRESSURE', 'VIBRATION'
  reading_value float not null,
  status text check (status in ('NORMAL', 'WARNING', 'CRITICAL')) default 'NORMAL',
  compliance_note text -- Auto-generated legal log regarding action taken
);

-- Enable RLS
alter table grant_applications enable row level security;
alter table safety_logs enable row level security;

-- Policies (Allow all for demo)
create policy "Enable all access for all users" on grant_applications for all using (true);
create policy "Enable all access for all users" on safety_logs for all using (true);

-- Realtime
alter publication supabase_realtime add table grant_applications;
alter publication supabase_realtime add table safety_logs;
