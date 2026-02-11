# Wireframe: Dashboard Overview

**Purpose:** High-level health check. "Is the shop running effectively?"
**Route:** `/app/:org_slug/dashboard`

## Layout

```text
[Header: Org Switcher | Search | User Profile]
[Sidebar: OVERVIEW | Systems | Approvals | Templates | Activity | Settings ]

-------------------------------------------------------------------------------
Main Content Area:
-------------------------------------------------------------------------------

[H1: Dashboard]                             [Date Range Picker: Last 7 Days v]

[ METRICS ROW ]
+---------------------+  +---------------------+  +---------------------+
| Active Systems      |  | Pending Approvals   |  | Success Rate (7d)   |
| 3                   |  | 5                   |  | 98.2%               |
| [Status Badge: OK]  |  | [Link: Review ->]   |  | ^ 2% vs prev        |
+---------------------+  +---------------------+  +---------------------+

[ TWO COLUMN LAYOUT ]

[ COL 1: Live Activity Feed ] (60% width)
+-------------------------------------------------------------------------+
| [H2: Recent Activity]                                                   |
|                                                                         |
| (•) Just Now - System A running "Lead Qualify" (Step 2/5)               |
| (x) 5m ago - System B failed "Invoice Recon" (Error: API Timeout)       |
| (✓) 10m ago - System A completed "Lead Qualify"                         |
|                                                                         |
| [View All Activity ->]                                                  |
+-------------------------------------------------------------------------+

[ COL 2: Action Required ] (40% width)
+-------------------------------------------------------------------------+
| [H2: Needs Attention]                                                   |
|                                                                         |
| [Card: Critical]                                                        |
| Approval: Bulk Refund > $500                                            |
| waiting since 2h ago                                                    |
| [Review button]                                                         |
|                                                                         |
| [Card: Warning]                                                         |
| HubSpot Integration Disconnected                                        |
| [Reconnect button]                                                      |
+-------------------------------------------------------------------------+

```

## States
- **Loading:** Skeleton loaders on cards.
- **Empty (New Org):** "Welcome! Deploy your first Agent System [Create System Btn]" center hero.
- **Error:** "Failed to load metrics" retry button.
