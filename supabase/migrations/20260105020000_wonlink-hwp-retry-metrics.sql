-- Adds retry metadata and scheduling for HWP jobs to support a real queue/worker loop.
alter table hwp_jobs
  add column if not exists attempts integer not null default 0,
  add column if not exists retry_at timestamptz not null default now();

update hwp_jobs set retry_at = coalesce(retry_at, now()) where retry_at is null;

create index if not exists idx_hwp_jobs_status_retry on hwp_jobs(status, retry_at);

