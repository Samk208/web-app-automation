# App Map & Navigation

## 1. Route Structure

### Public (Marketing)
- `/` (Home)
- `/pricing`
- `/login` (Auth)

### Application (Protected, Layout: Sidebar + Header)
- `/app` (Redirects to dashboard)
- `/app/:org_slug/dashboard` (Overview)
- `/app/:org_slug/systems` (List Agent Systems)
    - `/app/:org_slug/systems/new` (Create System)
    - `/app/:org_slug/systems/:system_id` (System Detail - Monitor)
        - `?tab=workflow`
        - `?tab=agents`
        - `?tab=history`
        - `?tab=settings`
- `/app/:org_slug/approvals` (HITL Queue)
- `/app/:org_slug/templates` (Library)
- `/app/:org_slug/activity` (Global Logs)
- `/app/:org_slug/settings` (Org Settings)
    - `?tab=team`
    - `?tab=integrations`
    - `?tab=billing`

## 2. Permission Matrix

| Route | Viewer | Member | Admin | Owner |
| :--- | :---: | :---: | :---: | :---: |
| `/dashboard` | ✅ | ✅ | ✅ | ✅ |
| `/systems` (View) | ✅ | ✅ | ✅ | ✅ |
| `/systems` (Edit/Create) | ❌ | ❌ | ✅ | ✅ |
| `/approvals` (View) | ✅ | ✅ | ✅ | ✅ |
| `/approvals` (Act) | ❌ | ✅ | ✅ | ✅ |
| `/settings` | ❌ | ❌ | ✅ | ✅ |

Incompatible permissions redirect to 403 Forbidden.
