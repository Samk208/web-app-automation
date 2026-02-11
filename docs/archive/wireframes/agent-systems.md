# Wireframe: Agent Systems List

**Purpose:** Directory of all deployed automation systems.
**Route:** `/app/:org_slug/systems`

## Layout

```text
[Header...]
[Sidebar...]

-------------------------------------------------------------------------------
[H1: Agent Systems]                         [Primary Btn: + New System]

[ FILTER BAR ]
[Search by name...]  [Status: All v]  [Sort: Last Run v]

[ DATA TABLE ]
-------------------------------------------------------------------------------
| Name                | Status    | Last Run      | 24h Success | Actions      |
-------------------------------------------------------------------------------
| Inbound Lead Bot    | [Active]  | 2 mins ago    | 100%        | [Manage]     |
| Invoice Processor   | [Paused]  | 1 day ago     | 95%         | [Manage]     |
| Weekly Reporting    | [Error]   | 5 mins ago    | 0%          | [Debug]      |
-------------------------------------------------------------------------------

[ PAGINATION ]
< Prev  1 of 1  Next >

```

## Components
- **Status Badges:**
  - Active (Green dot)
  - Paused (Yellow dot)
  - Error (Red dot)
  - Archived (Grey)

## User Actions
- Click row -> Go to `/systems/:id`
- Click `+ New System` -> Open Template/Blank modal.
