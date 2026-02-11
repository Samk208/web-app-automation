# Data Model Documentation

## Core Entities

### 1. Tenancy (`organizations`, `memberships`)
- **Multi-tenancy:** Everything starts with an `organization_id`.
- **Isolation:** RLS policies ensure cross-tenant data access is impossible.
- **Roles:** `owner`, `admin`, `member`, `viewer` control permission granularity.

### 2. Agent Systems (`agent_systems`, `agent_definitions`)
- **System:** A logical container for a specific business automation (e.g., "Customer Support Bot").
- **Definitions:** The "staffing" of that system. Who works there? (e.g., "Triage Agent", "Refund Specialist").

### 3. Workflows (`workflow_definitions`, `workflow_runs`, `workflow_steps`)
- **Definition:** The blueprint (graph) of what happens. Versioned.
- **Run:** A specific instance of execution. Contains the global `context`.
- **Step:** An atomic log of a single node execution. Essential for debugging.

### 4. Human-in-the-Loop (`approval_requests`)
- **Checkpoint:** When a workflow pauses for human input.
- **State:** `pending` -> `approved` | `rejected` | `edited`.
- **Audit:** Who decided what, and when.

### 5. Audit (`events_audit`)
- **Immutable Log:** Append-only table for compliance.
- **Scope:** Logs significant lifecycle events (`workflow.failed`, `config.changed`).

## Key Relationships
- `workflow_runs` belong to `agent_systems`.
- `workflow_runs` follow a `workflow_definition`.
- `approval_requests` block a specific `workflow_run`.

## Security Model
- **Authentication:** Supabase Auth (`auth.users`).
- **Authorization:** RLS Policies on every table.
- **Secrets:** stored in Supabase Vault (not in `integration_connections`).
