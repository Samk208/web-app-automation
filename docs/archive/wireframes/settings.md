# Wireframe: Settings

**Purpose:** Admin controls for the Organization.
**Route:** `/app/:org_slug/settings`

## Layout

```text
[Header...]
[Sidebar...]

-------------------------------------------------------------------------------
[H1: Organization Settings]

[ VERTICAL TABS (Left) ]
| General      |
| Team         |
| Integrations |
| API Keys     |
| Billing      |

[ CONTENT AREA (Right) ]

-- Tab: Team --
[H2: Team Members]        [Btn: Invite Member]
------------------------------------------------
User            Role      Joined
------------------------------------------------
Alice (You)     Owner     Dec 1, 2025
Bob             Admin     Dec 2, 2025
Charlie         Member    Jan 15, 2026
------------------------------------------------

-- Tab: Integrations --
[H2: Connected Tools]
[ HubSpot ]  [Connected as User X]  [Disconnect]
[ Slack   ]  [Status: Not Linked ]  [Connect]
[ Stripe  ]  [Status: Not Linked ]  [Connect]

-- Tab: API Keys --
[H2: Developer Access]
[Btn: Roll Keys]
Key: sk_live_... (Hidden)

```
