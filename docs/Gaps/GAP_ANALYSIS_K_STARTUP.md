# Gap Analysis: K-Startup "Deep Tech" Readiness

## 1. Executive Summary
**Current Status**: 85% Ready.
The backend logic is robust, but the **Patient Experience (User Journey)** is missing the "Connective Tissue".
We have powerful specialized agents (`Grant Scout`, `Business Plan Master`), but no "Receptionist" to greet the user and route them.

**Verdict**: Technically strong, Operationally incomplete.

## 2. The "3 Pillars" of Gaps

### A. The "Voice" Gap (New Finding)
**Issue**: We have 11+ agents, but the Homepage is silent. The "Deep Tech" vibe requires an intelligent entry point.
-   **Missing**: A **"Welcome Agent"** (Chief of Staff) on the dashboard/home that acts as a natural language router.
-   **Solution**: Use existing `src/actions/orchestrator.ts` to build a Chat Interface that routes:
    -   "I need money" -> **Grant Scout**
    -   "Write a proposal" -> **Business Plan Master**
    -   "Sell to China" -> **Merchant Agent**

### B. The "Hands" Gap (Operational)
**Issue**: The `Business Plan Master` creates jobs, but nothing processes them.
-   **Code**: `src/actions/hwp-converter.ts` (Queues Job) -> `scripts/wonlink-hwp-worker-runner.js` (Does Work).
-   **Reality**: The Worker script is **OFFLINE**.
-   **Fix**: Deploy `node scripts/wonlink-hwp-worker-runner.js` as a always-on background service in Coolify.

### C. The "Brain" Gap (Data)
**Issue**: The `K-Startup Navigator` works, but thinks it's 2024 (or empty).
-   **Reality**: `startup_programs` table relies on mock data.
-   **Fix**: Manually inject 10 "Gold Standard" 2026 notices (TIPS, Global Expansion) so the demo always succeeds.

## 3. Implementation Roadmap

| Priority | Task | Technical Path | Status |
| :--- | :--- | :--- | :--- |
| **P0 (Critical)** | **Deploy HWP Worker** | Run `script/wonlink-hwp-worker-runner.js` on VPS. | 🔴 Offline |
| **P0 (Critical)** | **Inject Live Data** | SQL Insert for `startup_programs` (2026 data). | 🔴 Empty |
| **P1 (High)** | **Welcome Agent UI** | Add `ChatInterface` to Dashboard home -> `orchestrator.ts`. | 🔴 Missing |
| **P2 (Medium)** | **KOSIS Mapping** | Add `BioHealth`, `Robot` codes to `kosis.ts`. | ⚠️ Partial |

## 4. Why "Agno" was rejected
We evaluated shifting to Agno (Python). It was rejected because:
-   Your **LangGraph Orchestrator** (`src/actions/orchestrator.ts`) is already built and far superior.
-   It supports state persistence, auditing, and "Time Travel" debugging out of the box.
-   Agno would require a separate Flask backend, adding latency and complexity.

**Strategy**: "Double Down" on your current stack.
