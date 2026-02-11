# Handover Note (2026-01-07)

## Objective
Harden the remaining complex agents to production level with a consistent security pattern:
- Auth
- Authorization (RBAC + org scoping)
- Redis rate limiting
- Zod input validation
- Structured logging
- Sanitized error handling

## Migrations to Run
These are the **hardening-related** migrations that must be applied (in addition to your baseline schema migrations):

### HWP Converter
- `supabase/migrations/20260105011000_hwp_jobs.sql`
  - Creates `hwp_jobs` with `organization_id` and RLS policies.
  - Run this if `hwp_jobs` does not exist yet.

- `supabase/migrations/20260105020000_wonlink-hwp-retry-metrics.sql`
  - Adds `attempts` + `retry_at` to `hwp_jobs` and an index.
  - **Required** because `processHwpJob` and `/api/hwp/jobs` now set `retry_at`.

- (Optional / worker-dependent) `supabase/migrations/20260105021000_hwp_job_dlq.sql`
  - Creates `hwp_job_dlq` with RLS.
  - Only required if the worker writes DLQ entries.

### Global Merchant / Localizations
- `supabase/migrations/20260107000002_localizations_org_rls.sql`
  - Adds `organization_id` to `localizations`, adds indexes, enables RLS policies, and allows `FAILED` status.

### Ledger Logic / Reconciliation (HITL)
- `supabase/migrations/20260107000003_reconciliation_org_hitl.sql`
  - Adds `organization_id` to `reconciliation_jobs`, indexes, enables RLS policies, and adds `AWAITING_APPROVAL` + `FAILED` statuses.

### ChinaSource Pro
- `supabase/migrations/20260107000004_sourcing_failed_status.sql`
  - Adds `FAILED` to `sourcing_tasks.status` constraint.

## Key Code Changes

### HWP Converter hardening
- `src/app/api/hwp/jobs/route.ts`
  - Requires authenticated user (`requireAuth()`).
  - Requires actual org membership by reading `memberships.organization_id` (no demo fallback).
  - Redis rate limiting: `hwp:create:<org>` (10/min).
  - Validates `fileUrl` with shared `URLSchema`.
  - Restricts `fileUrl` host to `NEXT_PUBLIC_SUPABASE_URL` host (prevents arbitrary URL injection).
  - Sanitized errors via `handleAPIError`.

- `src/actions/hwp-converter.ts`
  - `processHwpJob(jobId)`:
    - `UUIDSchema` validation.
    - RBAC + org scoping via `requireResourceAccess('hwp_jobs', jobId)`.
    - Redis rate limiting.
    - Org-scoped select/update.
    - Sanitized errors (`handleAPIError`).
  - `getHwpJobStatus(fileUrl)`:
    - Validates URL, requires auth+membership, org-scoped query.
    - Removes `console.error`.

## Verification Checklist
- **DB**
  - `hwp_jobs` has columns: `retry_at`, `attempts` (after `20260105020000_*`).
  - RLS policies behave correctly for org members.

- **API**
  - `POST /api/hwp/jobs` returns `403` for authenticated users without a `memberships` row.
  - Rejects `fileUrl` that is not on your Supabase host.
  - Rate limiting triggers after repeated calls.

- **UI/Flow**
  - Business Plan page polling via `getHwpJobStatus` works for authenticated org members.

## Follow-ups / Open Risks
- `src/app/(dashboard)/dashboard/business-plan-master/page.tsx` still inserts `business_plans` client-side. Not part of HWP scope, but a candidate for future hardening if you want consistent server-side creation + RBAC.

## Current TODO List
- Harden Agent 5 Global Merchant (auth, rate limit, validation, org scoping, errors) — **completed**
- Harden Agent 6 Ledger Logic (add HITL + security pattern) — **completed**
- Harden mock-data agents (Grant Scout, K-Startup, NaverSEO) per security pattern + correct logging/guards — **completed**
- Harden complex agents: ChinaSource Pro dashboard + finalize sourcing flow — **completed**
- Harden complex agent: Safety Guardian (alerts stub + security pattern) — **completed**
- Harden complex agent: HWP Converter (auth + file validation + rate limiting) — **completed**
