# Workflow Specifications

## 1. Concept: The "Workflow Run"
A `WorkflowRun` is the atomic unit of work in our business logic, tracked as a stateful database record in Supabase. The *execution* of this run is orchestrated by n8n workflows and LangGraph agents.
**Table:** `workflow_runs`
- `id`: UUID
- `status`: `pending` | `running` | `paused` | `completed` | `failed`
- `current_step_index`: integer
- `context`: JSONB (accumulated state)
- `logs`: JSONB (array of events)
- `requires_action`: boolean (flag for HITL)

## 2. Lifecycle
1.  **Initialization:** Created via API/UI. Initial context populated. Status: `pending`.
2.  **Execution Loop:**
    - Worker picks up `running` workflow.
    - Executes current step logic (or delegates to Agent).
    - Updates `context` with result.
    - Increments `current_step_index`.
3.  **Pause State:**
    - Triggered by: Error, Low Confidence, or Explicit `ApprovalNode`.
    - Status: `paused`. `requires_action`: `true`.
    - System notifies User.
4.  **Resumption:**
    - User approves/edits via UI.
    - Status: `running`. `requires_action`: `false`.
5.  **Termination:**
    - Success: Status `completed`. Log final output.
    - Failure: Status `failed`. Log error trace.

## 3. Human-in-the-Loop (HITL) Checkpoints
Checkpoints are explicit nodes in the workflow graph.
- **Type:** `approval` | `edit` | `input`
- **Behavior:**
    - `approval`: Simple Yes/No to proceed.
    - `edit`: User modifies the `pending_payload` before it is sent.
    - `input`: Workflow asks User for missing information.

## 4. Error Handling
- **Retry Policy:** Exponential backoff for network/API errors (max 3 retries).
- **Dead Letter:** Logic errors or max retries set status to `failed` and alert owner.
- **Resiliency:** System must be able to restart from the *last successful step* (idempotency required for step execution).
