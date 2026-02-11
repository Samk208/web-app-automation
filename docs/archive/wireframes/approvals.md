# Wireframe: Approvals Queue

**Purpose:** The inbox for human decisions. Where the "Human-in-the-Loop" actually happens.
**Route:** `/app/:org_slug/approvals`

## Layout

```text
[Header...]
[Sidebar...]

-------------------------------------------------------------------------------
[H1: Approvals]                             [Filter: Pending (5) | History]

[ MAIN LIST AREA ]

[ EXPANDED PANEL (Active Item) ]
+-------------------------------------------------------------------------+
| REQUEST #772 - Refund > $500                                            |
| System: Customer Support Bot                                            |
| Waiting since: 10:42 AM (2 hours ago)                                   |
|                                                                         |
| [ CONTEXT DATA ]                                                        |
| Customer: john.doe@example.com                                          |
| Refund Amount: $520.00                                                  |
| Reason: Product Defect (Photo attached)                                 |
|                                                                         |
| [ PROPOSED ACTION ]                                                     |
| Stripe.refund(charge_id="ch_123", amount=52000)                         |
|                                                                         |
| [ ACTIONS ]                                                             |
| [ Reject ]          [ Edit Action ]           [ Approve & Exec ]        |
+-------------------------------------------------------------------------+

[ LIST ITEMS (Collapsed) ]
+-------------------------------------------------------------------------+
| Req #771 - Publish Tweet (Brand Risk High) - waiting 5m                 |
+-------------------------------------------------------------------------+
| Req #770 - Delete Database Row (Sensitive) - waiting 12m                 |
+-------------------------------------------------------------------------+

```

## Interaction
- Clicking "Edit Action" opens a JSON editor or Form to modify the payload before sending.
- "Approve" triggers the API endpoint to resume the workflow run.
