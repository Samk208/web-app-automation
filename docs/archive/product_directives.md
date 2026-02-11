# Product Directives: Agentic Systems Integrator

## 1. Strategic Positioning
**"We build the factory, not just the machines."**
We provide the orchestration layer that makes multi-agent systems viable for SMEs. We compose resilient, stateful agent workforces using best-in-class components (MCPs, n8n) rather than brittle custom scripts.

## 2. Core Value Propositions
- **Reliability:** work gets done correctly, or error states are clearly communicated.
- **Transparency:** Owners see exactly *what* the agents did and *why*.
- **Control:** Granular permissions and approval gates for all meaningful actions.
- **Integration:** Deep connection into existing business tools (CRMs, ERPs, Email) via robust APIs.

## 3. Anti-Patterns (What We Are NOT)
- **Chat Interface:** We are not a chat window. We are a dashboard of active workflows.
- **"Do anything" Agents:** Our agents are specialized (e.g., "Invoice Reconciler", "Lead Qualifier"). They are not AGI.
- **Black Box:** We never hide the logic. "Magic" is a bug.
- **No-Code Only:** We provide a robust code-backed infrastructure, not just a drag-and-drop toy.

## 4. Target Architecture
### High-Level Flow
1.  **Trigger:** Webhook / Schedule / Manual Input.
2.  **Workflow Engine:** n8n (Visual Workflow) instantiates a new `WorkflowRun` in Supabase.
3.  **Orchestrator:** LangGraph logic assigns tasks to specific Agents.
4.  **Agent Execution:** Agent performs work using MCP tools, possibly asking for sub-tasks.
5.  **State Persistence:** Every step updates the DB row `workflow_logs`.
6.  **Checkpoint:** If confidence < threshold or action is sensitive -> Pause for HITL.
7.  **Completion:** Structured update to downstream systems (e.g., Update HubSpot).

## 5. Success Metrics
- **Throughput:** Number of successfully completed workflows per day.
- **Error Rate:** % of workflows requiring manual rescue (outside of planned HITL).
- **Latency:** Time from trigger to completion (less critical than accuracy).
- **Trust:** User usage of "Auto-Approve" features over time.
