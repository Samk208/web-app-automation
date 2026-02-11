# Wireframe: Templates

**Purpose:** Library of pre-built automation recipes to get users started quickly.
**Route:** `/app/:org_slug/templates`

## Layout

```text
[Header...]
[Sidebar...]

-------------------------------------------------------------------------------
[H1: Workflow Templates]

[ TABS: Featured | Sales | Support | Operations ]

[ GRID ]
+---------------------+  +---------------------+  +---------------------+
| Inbound Email Qual  |  | Slack Summarizer    |  | Invoice Extractor   |
| [Icon: Email]       |  | [Icon: Slack]       |  | [Icon: File]        |
|                     |  |                     |  |                     |
| Qualify leads &     |  | Daily channel       |  | PDF to JSON data    |
| sync to HubSpot.    |  | digest to email.    |  | entry.              |
|                     |  |                     |  |                     |
| [Use Template ->]   |  | [Use Template ->]   |  | [Use Template ->]   |
+---------------------+  +---------------------+  +---------------------+
| Competitor Intel    |  | ...                 |  | ...                 |
| [Icon: Globe]       |  |                     |  |                     |
+---------------------+  +---------------------+  +---------------------+

```

## Flow
- Click "Use Template" -> Opens "Clone System" modal.
- Modal asks for "New System Name" and "Config Setup" (e.g., enter API keys).
