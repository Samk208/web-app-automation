-- Create Sourcing Tasks Table (ChinaSource Pro)
create table sourcing_tasks (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  source_url text not null,
  platform text default '1688',
  status text check (status in ('PENDING', 'SEARCHING', 'CALCULATING', 'COMPLETED')) default 'PENDING',
  product_data jsonb, -- Stores raw title, image_url, etc.
  landed_cost_analysis jsonb, -- Stores cny_price, exchange_rate, shipping_est, margin
  translated_content jsonb -- Stores title_kr, description_kr
);

-- Create SEO Audits Table (NaverSEO Pro)
create table seo_audits (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  target_url text not null,
  platform text default 'NAVER',
  status text check (status in ('ANALYZING', 'COMPLETED')) default 'ANALYZING',
  current_metrics jsonb, -- keyword_density, image_count, etc.
  optimization_report jsonb -- score, suggestions_list, optimized_title_candidate
);

-- Enable RLS
alter table sourcing_tasks enable row level security;
alter table seo_audits enable row level security;

-- Policies (Allow all for demo)
create policy "Enable all access for all users" on sourcing_tasks for all using (true);
create policy "Enable all access for all users" on seo_audits for all using (true);

-- Realtime
alter publication supabase_realtime add table sourcing_tasks;
alter publication supabase_realtime add table seo_audits;
