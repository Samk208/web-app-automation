# Implementation Plan: K-Startup Readiness & Welcome Agent

# Goal Description
Finalize the "Deep Tech" MVP for K-Startup application. This involves activating the dormant HWP worker, injecting demo-ready data, and building the "Welcome Agent" UI to give users a high-end entry point.

## Proposed Changes

### 1. Operations & Data (The "Hidden" Fixes)
#### [Deploy] HWP Worker
-   **Action**: Create a `systemd` service or Docker container instruction for `scripts/wonlink-hwp-worker-runner.js`.
-   **Why**: To make HWP generation actually work.

#### [Data] K-Startup Seed Data
-   **Action**: Create `supabase/seed_kstartup_2026.sql` with 5 high-value 2026 programs.
-   **Why**: To ensure the "Navigator" agent produces impressive results during demos.

### 2. Frontend: The "Welcome Agent"
#### [NEW] `src/components/agents/WelcomeChat.tsx`
-   **Type**: Client Component.
-   **Features**:
    -   Floating "Chief of Staff" avatar.
    -   Streaming chat interface using `useChat` (Vercel AI SDK) or direct Server Action calls.
    -   Connects to `processWithOrchestrator` in `src/actions/orchestrator.ts`.
    -   **Deep Tech Style**: Glassmorphism, "matrix code" rain effect (optional), smooth animations.

#### [MODIFY] `src/app/(dashboard)/dashboard/page.tsx`
-   **Action**: Embed `WelcomeChat` as the hero element.
-   **Change**: detailed visual overhaul to match the "Command Center" aesthetic.

## Verification Plan

### Automated Tests
-   **HWP Worker**: Enqueue a job via `Business Plan Master`, verify `output_url` appears in Supabase within 30 seconds.
-   **Welcome Agent**: Send "Find me grants" message, verify Orchestrator routes to `grant-scout` and returns a response.

### Manual Verification
-   **Data Check**: Go to K-Startup Navigator, see 2026 TIPS program listed.
-   **UX Check**: Complete a full flow: Chat -> Router -> Specific Agent -> HWP Generation.
