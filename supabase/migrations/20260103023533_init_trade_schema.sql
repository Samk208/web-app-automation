-- Create Orders Table
create table orders (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  customer_name text not null,
  item_description text not null,
  destination_country text not null,
  status text check (status in ('PENDING', 'ANALYZING', 'BLOCKED', 'APPROVED', 'REJECTED')) default 'PENDING',
  classification_result jsonb,
  risk_score float,
  updated_at timestamptz default now()
);

-- Create Trade Audits Table (for LiveLogViewer)
create table trade_audits (
  id uuid default gen_random_uuid() primary key,
  order_id uuid references orders(id) on delete cascade,
  timestamp timestamptz default now(),
  action text not null,
  details jsonb,
  agent_id text -- Identifier for which agent performed the action
);

-- Enable Row Level Security (RLS)
alter table orders enable row level security;
alter table trade_audits enable row level security;

-- Create Policies (allow all for now, this is a demo app)
-- In production, restrict to authenticated users
create policy "Enable all access for all users" on orders for all using (true);
create policy "Enable all access for all users" on trade_audits for all using (true);

-- Enable Realtime for these tables
alter publication supabase_realtime add table orders;
alter publication supabase_realtime add table trade_audits;
