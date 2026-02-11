-- db/seed.sql
-- Minimal seed data for local development

-- Static IDs (avoid psql meta-commands for Supabase seeding)
-- Demo org/user IDs are fixed for local dev only.

-- Organization
insert into
    public.organizations (id, name, slug)
values (
        '00000000-0000-0000-0000-000000000002',
        'Acme Corp',
        'acme-corp'
    ) on conflict (id) do nothing;

-- Agent System: "Inbound Lead Qualifier"
insert into
    public.agent_systems (
        organization_id,
        name,
        description,
        status,
        config
    )
values (
        '00000000-0000-0000-0000-000000000002',
        'Inbound Lead Qualifier',
        'Qualifies leads from email and updates CRM',
        'active',
        '{"notifications_channel": "slack-leads"}'
    ) on conflict do nothing;

-- Workflow Definition: "Qualify Email"
insert into
    public.workflow_definitions (
        organization_id,
        name,
        description,
        version,
        is_template,
        spec
    )
values (
        '00000000-0000-0000-0000-000000000002',
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
    ) on conflict do nothing;

-- K-Startup 2026 Demo Programs (for Navigator & Grant Scout)
insert into
    public.startup_programs (
        name,
        category,
        funding_amount,
        deadline
    )
values (
        'TIPS (Tech Incubator Program for Startup) – Deep Tech 2026',
        'R&D',
        'Up to 700M KRW (Matching + Follow-on)',
        '2026-12-31'
    ),
    (
        'K-Startup Grand Challenge 2026',
        'Global',
        'Equity-free support + settlement grants',
        '2026-08-31'
    ),
    (
        'OASIS Visa & Incubation 2026',
        'Visa',
        'OASIS points + office incubation',
        '2026-12-31'
    ),
    (
        'Pre-Startup Package 2026 – Foreign Founders',
        'Commercialization',
        'Approx. 50M KRW',
        '2026-04-30'
    ),
    (
        'Korea AI Voucher Program 2026',
        'AI',
        'Up to 160M KRW in vouchers',
        '2026-05-31'
    ),
    (
        'Smart Factory PoC 2026',
        'Manufacturing',
        'PoC funding up to 300M KRW',
        '2026-06-30'
    ),
    (
        'Global Market Expansion Package 2026',
        'Global',
        'Export marketing support up to 200M KRW',
        '2026-09-30'
    ),
    (
        'Bio/Healthcare TIPS Track 2026',
        'BioHealth',
        'R&D support up to 1B KRW',
        '2026-11-30'
    ),
    (
        'Green Energy Startup Fund 2026',
        'Green',
        'Seed funding + pilot projects',
        '2026-07-31'
    ),
    (
        'Regional Deep Tech Incubator 2026',
        'Regional',
        'Office, mentorship, and grants up to 100M KRW',
        '2026-10-31'
    ) on conflict do nothing;