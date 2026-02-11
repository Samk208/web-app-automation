# Wireframe: Activity Log

**Purpose:** Global audit trail. "Show me everything that happened yesterday."
**Route:** `/app/:org_slug/activity`

## Layout

```text
[Header...]
[Sidebar...]

-------------------------------------------------------------------------------
[H1: Global Activity]

[ FILTER BAR ]
[Date Range]  [System: All]  [Event Type: All]  [User: All]

[ LOG TABLE ]
---------------------------------------------------------------------------------------
| Timestamp   | Level   | System         | Event                   | Actor            |
---------------------------------------------------------------------------------------
| 10:45:01 AM | INFO    | Inbound Bot    | Workflow Started        | Trigger:Webhook  |
| 10:45:05 AM | INFO    | Inbound Bot    | step.completed (Agent)  | System           |
| 10:45:12 AM | WARN    | Inbound Bot    | Low Confidence (0.6)    | System           |
| 10:46:00 AM | ACTION  | Inbound Bot    | Approval Requested      | System           |
| 10:52:00 AM | ACTION  | Inbound Bot    | Approved "Exec"         | sarah@acme.com   |
---------------------------------------------------------------------------------------

[ SIDE PANEL (On Row Click) ]
Displays full JSON payload of the event.
```

## Data
- Source: `events_audit` table.
- Read-only.
