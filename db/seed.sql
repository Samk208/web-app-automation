-- db/seed.sql
-- Minimal seed data for local development

-- 1. Create a demo user (This usually happens via Auth, but simulating profile here)
-- Note: In real dev, you'd Create User in Supabase Auth, then run this linked to that UUID.
-- For pure SQL seed without Auth context, we might skip profiles/memberships or use placeholders.

-- Placeholder IDs
\set owner_id '00000000-0000-0000-0000-000000000001'
\set org_id '00000000-0000-0000-0000-000000000002'

-- Organization
insert into public.organizations (id, name, slug)
values (:'org_id', 'Acme Corp', 'acme-corp');

-- Agent System: "Inbound Lead Qualifier"
insert into public.agent_systems (organization_id, name, description, status, config)
values (
  :'org_id', 
  'Inbound Lead Qualifier', 
  'Qualifies leads from email and updates CRM', 
  'active', 
  '{"notifications_channel": "slack-leads"}'
);

-- Workflow Definition: "Qualify Email"
insert into public.workflow_definitions (organization_id, name, description, version, is_template, spec)
values (
  :'org_id',
  'Qualify Email V1',
  'Extracts budget and timeline from email.',
  1,
  true,
  '{
    "nodes": [
      {"id": "1", "type": "trigger", "label": "Email Received"},
      {"id": "2", "type": "agent", "role": "qualifier", "label": "Analyze Content"},
      {"id": "3", "type": "action", "tool": "hubspot_update", "label": "Update CRM"}
    ],
    "edges": [
      {"source": "1", "target": "2"},
      {"source": "2", "target": "3"}
    ]
  }'
);
