# Wireframe: System Detail

**Purpose:** The cockpit for a single Agent System. Control center.
**Route:** `/app/:org_slug/systems/:id`

## Layout

```text
[Header: < Back to Systems | "Inbound Lead Bot" [Status: Active]] 
[Sidebar...]

[ SUB-NAV TABS ]
[ *Overview* | Workflow | Agents | Runs | Settings ]

-------------------------------------------------------------------------------
Tab: Overview
-------------------------------------------------------------------------------

[ CONTROL BAR ]
[Trigger Run Btn]   [Pause System Btn]   [Edit Logic Btn]

[ METRICS CARDS ]
[ Total Runs: 1,204 ]  [ Avg Cost: $0.12 ]  [ Avg Duration: 4s ]

[ CHART AREA ]
[ Bar Chart: Daily Run Volume (Last 30 days) ]

[ RECENT RUNS (Mini Table) ]
--------------------------------------------------------
| ID      | Status     | Time        | Output Preview  |
--------------------------------------------------------
| #1024   | [Success]  | Just now    | { "c": B+ }     |
| #1023   | [Failed]   | 10m ago     | TimeOutError    |
--------------------------------------------------------
```

## Special States
- **Tab: Workflow:** Shows read-only React Flow graph visualization of the steps.
- **Tab: Agents:** List of specialist agents assigned (e.g., "Research Agent (GPT-4)").
- **Tab: Runs:** Full history with search.
