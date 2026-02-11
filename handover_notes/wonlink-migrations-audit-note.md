# WonLink DB Migration Audit (Jan 7, 2026)

## What I checked

- Reviewed root docs (`README.md`, `docs/README.md`, `PROJECT_OVERVIEW.md`) and Supabase config (`supabase/config.toml`).
- Enumerated all Supabase migrations under `supabase/migrations` (22 files, newest: `20260107000004_sourcing_failed_status.sql`).
- Cross-referenced the documented schema in `db/schema.sql` and seed expectations (`db/seed.sql`).
- Attempted to read `.env.local` but it is excluded by repository policy (cannot verify contents).

## Supabase config notes

- Local ports: API 54321, DB 54322, Studio 54323, shadow 54320; RLS/auth/storage enabled.
- Migrations enabled; seeds enabled with `sql_paths = ["./seed.sql"]` **but `supabase/seed.sql` is missing**. The only seed file is `db/seed.sql`, so `supabase db reset` will fail at seed step unless the path is fixed.

## Migration inventory (chronological)

- `20260101000000_base_schema.sql` — core multi-tenant + workflows/audit base (matches `db/schema.sql`).
- Trade/Ecom agents:
  - `20260103023533_init_trade_schema.sql` — `orders`, `trade_audits`.
  - `20260103025351_global_merchant_schema.sql` — `localizations` (initial, permissive RLS).
  - `20260103033025_korea_agents_schema.sql` — `sourcing_tasks`, `seo_audits`.
  - `20260107000004_sourcing_failed_status.sql` — adds `FAILED` status to `sourcing_tasks`.
- Professional services / finance:
  - `20260103033506_professional_services_schema.sql` — `reconciliation_jobs`, `proposals`.
  - `20260103034016_deep_tech_schema.sql` — `grant_applications`, `safety_logs`.
  - `20260103035130_startup_support_schema.sql` — `startup_programs` seed, `program_matches`, `business_plans`.
  - `20260107000003_reconciliation_org_hitl.sql` — adds `organization_id`, tightened status enum + RLS to `reconciliation_jobs`.
  - `20260107000002_localizations_org_rls.sql` — adds `organization_id`, tightened status enum + RLS to `localizations`.
- Deal closer placeholder:
  - `20260103040000_deal_closer_schema.sql` — fully commented out (no-op).
- Security/RLS hardening:
  - `20260105000000_agent_rls_upgrade.sql` — adds org_id columns to key tables, installs `is_org_member/has_org_role`, replaces “allow all” policies, adds realtime safely.
  - `20260105010000_messages_table.sql` — `messages` table with org-scoped RLS + realtime.
- HWP worker queue:
  - `20260105011000_hwp_jobs.sql` — `hwp_jobs` with RLS + realtime.
  - `20260105020000_wonlink-hwp-retry-metrics.sql` — adds retry metadata/index.
  - `20260105021000_hwp_job_dlq.sql` — DLQ table with RLS + index.
- Knowledge base / content:
  - `20260105030000_knowledge_base.sql` — `knowledge_base` + seed rows, RLS (read-only).
  - `20260106000000_add_document_urls.sql` — `document_url` on `business_plans`/`proposals` + partial indexes.
- Cost tracking & budgets:
  - `20260106010000_ai_cost_tracking.sql` — `ai_usage_logs`, `monthly_ai_costs` matview, RLS, helper function.
  - `20260106020000_add_subscription_tier.sql` — `subscription_tier` column + index + backfill.
- Orchestration & memory:
  - `20260106030000_workflow_orchestration.sql` — `workflow_states` table, policies, RPC, grants.
  - `20260106040000_memory_system.sql` — `user_history` table with RLS.

## Gaps / actions needed

- **Seed path mismatch**: Create `supabase/seed.sql` (copy from `db/seed.sql`) or update `supabase/config.toml` `db.seed.sql_paths` to point to `../db/seed.sql` before running `supabase db reset`.
- **Deal closer migration is a no-op**: safe but does nothing; leave as-is or remove if not intended.
- **Cannot validate env**: `.env.local` is unreadable due to repo filter. Need the Supabase keys (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL`) and model keys to run the app/tests.

## How to apply/verify

1. Fix seed path (choose one):
   - Copy `db/seed.sql` to `supabase/seed.sql`, or
   - Edit `supabase/config.toml` to `sql_paths = ["../db/seed.sql"]`.
2. Start local stack and reset:
   - `supabase start`
   - `supabase db reset --yes` (will run all migrations + seed).
3. Smoke-verify schema (examples):
   - `select count(*) from ai_usage_logs;`
   - `select distinct status from sourcing_tasks;` (should include `FAILED`)
   - `select subscription_tier from organizations limit 5;`
   - `select correlation_id from workflow_states limit 5;`
4. App-level checks (after `npm install` and `.env.local` populated):
   - `npm run dev` then hit `http://localhost:3000/dashboard/orchestrator`.
   - Run `node scripts/test-production-blocking.js` (RLS/flags sanity).
   - Run `node scripts/test-mcp-document-generation.js` (document URLs rely on `document_url` cols).

## Risks if skipped

- Seed mismatch will halt `supabase db reset` and leave DB partially applied.
- Missing env secrets blocks Supabase client and AI calls, so runtime features can’t be validated.
- Leaving old permissive policies would bypass org scoping; ensure migrations above are applied so org-based RLS is active.

## Requests / next info needed

- Share `.env.local` values or a redacted version so I can confirm Supabase connectivity and rerun verification end-to-end.
