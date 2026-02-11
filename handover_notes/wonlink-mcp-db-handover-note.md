# WonLink MCP & DB Handover (Jan 7, 2026)

## Scope
- Supabase migrations and seed reset
- Smoke + guard tests
- MCP document generation status

## Actions completed
- Applied all Supabase migrations via `supabase db reset --yes` (local stack running).
- Fixed seed path and content (`supabase/seed.sql`), ensuring reset succeeds.
- Ran smoke check `npm run smoke` → all target tables reachable; `hwp_jobs` insert OK.
- Ran mock-data protection test `npx tsx scripts/test-production-blocking.js` → expected behavior (dev allows, prod blocks unless `ALLOW_MOCK_DATA=true`).
- Sanity queries via service key:
  - `ai_usage_logs` count: 0 (empty until real AI calls).
  - `sourcing_tasks` statuses: [] (empty until tasks created).
  - `organizations.subscription_tier`: seed org set to `free`.
  - `workflow_states`: empty (no runs yet).

## Open items / blockers
- MCP document generation test fails (`spawn EINVAL`); MCP servers not available:
  - `thiagotw10-document-generator-mcp` and `doctranslate-io-mcp` not found on npm.
  - Need correct MCP binaries/paths per `MCP_INTEGRATION_SUMMARY.md`, then rerun `node scripts/test-mcp-document-generation.js`.
- Optional: add `"type": "module"` or run test scripts with `npx tsx` under Node 22 to avoid TypeScript strip warnings.

## Environment notes
- Local Supabase URLs/keys from `supabase start` were used for checks.
- `.env.local` assumed populated; not read directly.

## Recommended next steps
1) Install/point to the correct MCP servers; rerun `node scripts/test-mcp-document-generation.js`.
2) Trigger a real AI call to populate `ai_usage_logs` and confirm cost tracking.
3) Create a sample `sourcing_task` via UI/API to exercise the sourcing flow and the `FAILED` status constraint.


