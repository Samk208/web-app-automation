# Automation Workflows + Site Builder — Safe Implementation Plan

> **Date:** February 11, 2026
> **Goal:** Add workflow automation engine and site builder to WonLink as global (not Korea-only) capabilities
> **Constraint:** Production-safe, license-clean, builds on existing Next.js 16 + Supabase stack

---

## Architecture Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                    WonLink Dashboard (Next.js 16)                │
│                                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────────┐  │
│  │ AI Agents │  │ Workflow  │  │ Page     │  │ Site Generator │  │
│  │ (existing)│  │ Builder  │  │ Builder  │  │ Pipeline       │  │
│  │ 10 agents │  │ (new)    │  │ (new)    │  │ (new)          │  │
│  └─────┬─────┘  └────┬─────┘  └────┬─────┘  └───────┬────────┘  │
│        │              │             │                │           │
└────────┼──────────────┼─────────────┼────────────────┼───────────┘
         │              │             │                │
   ┌─────▼──────┐ ┌────▼──────┐ ┌───▼────────┐ ┌─────▼─────────┐
   │ LangGraph  │ │Activepieces│ │ GrapesJS   │ │ WP-CLI +      │
   │ Orchestrator│ │(self-hosted│ │ Studio SDK │ │ Respira MCP + │
   │            │ │ MIT license│ │ (free SDK) │ │ Divi/WP       │
   └─────┬──────┘ └────┬──────┘ └───┬────────┘ └─────┬─────────┘
         │              │            │                │
   ┌─────▼──────────────▼────────────▼────────────────▼──────────┐
   │                    Supabase (shared)                         │
   │          Auth │ Database │ Storage │ Real-time               │
   └─────────────────────────────────────────────────────────────┘
```

---

## Part 1: Workflow Automation Engine

### Why Activepieces (not n8n)

| Factor | n8n | Activepieces | Winner |
|---|---|---|---|
| **License** | Fair-code (commercial embed = $25K/yr) | MIT (fully permissive) | Activepieces |
| **Embed SDK** | Requires enterprise agreement | Built-in, JWT-based | Activepieces |
| **Self-host** | Docker Compose | Docker Compose | Tie |
| **Integrations** | 400+ | 280+ (growing fast) | n8n |
| **Custom code** | JavaScript nodes | TypeScript/npm packages | Tie |
| **AI integrations** | OpenAI, Anthropic, LangChain | OpenAI, Anthropic, Replicate | Tie |
| **Learning curve** | Steep | Beginner-friendly | Activepieces |
| **Commercial SaaS use** | Blocked without $25K license | Fully permitted (MIT) | Activepieces |

**Verdict:** Activepieces is the safe choice. MIT license means you can embed it, white-label it, and sell it commercially with zero licensing risk.

### Implementation Steps

#### Step 1: Deploy Activepieces (Day 1)

Create `docker-compose.activepieces.yml` at project root:

```yaml
version: '3.8'
services:
  activepieces:
    image: activepieces/activepieces:latest
    container_name: wonlink-workflows
    restart: unless-stopped
    ports:
      - "8080:80"
    environment:
      - AP_ENGINE_EXECUTABLE_PATH=dist/packages/engine/main.js
      - AP_ENCRYPTION_KEY=${AP_ENCRYPTION_KEY}
      - AP_JWT_SECRET=${AP_JWT_SECRET}
      - AP_FRONTEND_URL=http://localhost:8080
      - AP_POSTGRES_DATABASE=${POSTGRES_DB:-activepieces}
      - AP_POSTGRES_HOST=${POSTGRES_HOST:-postgres}
      - AP_POSTGRES_PORT=${POSTGRES_PORT:-5432}
      - AP_POSTGRES_USERNAME=${POSTGRES_USER:-activepieces}
      - AP_POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
      - AP_REDIS_HOST=redis
      - AP_REDIS_PORT=6379
      - AP_SANDBOX_RUN_TIME_SECONDS=600
      - AP_TELEMETRY_ENABLED=false
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:17
    container_name: wonlink-workflows-db
    restart: unless-stopped
    environment:
      - POSTGRES_DB=${POSTGRES_DB:-activepieces}
      - POSTGRES_USER=${POSTGRES_USER:-activepieces}
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
    volumes:
      - ap_postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7
    container_name: wonlink-workflows-redis
    restart: unless-stopped
    volumes:
      - ap_redis_data:/data

volumes:
  ap_postgres_data:
  ap_redis_data:
```

#### Step 2: Create API Wrapper (Day 2)

Create `src/lib/activepieces/client.ts`:

```typescript
// Activepieces API client for WonLink integration
import { createClient } from '@/utils/supabase/server';

const AP_BASE_URL = process.env.ACTIVEPIECES_URL || 'http://localhost:8080';
const AP_API_KEY = process.env.ACTIVEPIECES_API_KEY!;

export interface APFlow {
  id: string;
  projectId: string;
  folderId: string | null;
  status: 'ENABLED' | 'DISABLED';
  schedule: unknown;
  created: string;
  updated: string;
  version: { displayName: string; description: string; };
}

export async function listFlows(projectId: string): Promise<APFlow[]> {
  const res = await fetch(`${AP_BASE_URL}/v1/flows?projectId=${projectId}`, {
    headers: { 'Authorization': `Bearer ${AP_API_KEY}` },
  });
  const data = await res.json();
  return data.data;
}

export async function triggerFlow(flowId: string, payload: Record<string, unknown>) {
  const res = await fetch(`${AP_BASE_URL}/v1/webhooks/${flowId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function generateEmbedToken(userId: string, orgId: string): Promise<string> {
  // Generate JWT for Activepieces embed SDK
  // Maps WonLink user to Activepieces project
  const res = await fetch(`${AP_BASE_URL}/v1/managed-authn/external-token`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${AP_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      externalUserId: userId,
      externalProjectId: orgId,
      // pieces: { filterType: 'ALLOWED', pieces: [...] } // optional: restrict available pieces
    }),
  });
  const data = await res.json();
  return data.token;
}
```

#### Step 3: Build Dashboard Page (Days 3-4)

Create `/dashboard/workflows/page.tsx` with two views:

**View A: Workflow Library** — Browse pre-built templates, one-click deploy
**View B: Workflow Builder** — Embedded Activepieces editor via iframe + SDK

```typescript
// src/app/(dashboard)/dashboard/workflows/page.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function WorkflowsPage() {
  const [embedToken, setEmbedToken] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fetch embed token from server action
    fetch('/api/workflows/embed-token', { method: 'POST' })
      .then(r => r.json())
      .then(d => setEmbedToken(d.token));
  }, []);

  useEffect(() => {
    if (!embedToken || !containerRef.current) return;

    // Load Activepieces embed SDK
    const script = document.createElement('script');
    script.src = 'https://cdn.activepieces.com/sdk/embed/0.8.1.js';
    script.onload = () => {
      (window as any).activepieces.configure({
        instanceUrl: process.env.NEXT_PUBLIC_ACTIVEPIECES_URL,
        jwtToken: embedToken,
        containerId: 'ap-builder',
        embedding: {
          containerId: 'ap-builder',
          builder: { disableNavigation: false },
          dashboard: { hideSidebar: false },
          hideFolders: false,
        },
      });
    };
    document.head.appendChild(script);

    return () => { document.head.removeChild(script); };
  }, [embedToken]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Automation Workflows</h1>
        <p className="text-muted-foreground mt-1">Build, deploy, and manage automation workflows</p>
      </div>

      <Tabs defaultValue="builder">
        <TabsList>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="builder">Builder</TabsTrigger>
          <TabsTrigger value="runs">Run History</TabsTrigger>
        </TabsList>

        <TabsContent value="templates">
          {/* Template library grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Pre-built workflow templates */}
          </div>
        </TabsContent>

        <TabsContent value="builder" className="min-h-[700px]">
          <div
            id="ap-builder"
            ref={containerRef}
            className="w-full min-h-[700px] rounded-lg border bg-background"
          />
        </TabsContent>

        <TabsContent value="runs">
          {/* Execution history */}
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

#### Step 4: Connect Workflows to WonLink Agents (Day 5)

Create webhook bridge — Activepieces workflows can call your agents:

```typescript
// src/app/api/workflows/agent-bridge/route.ts
// Allows Activepieces workflows to invoke WonLink AI agents
import { processBusinessPlan } from '@/actions/business-plan';
import { processSEOAudit } from '@/actions/naver-seo';
import { processWithOrchestrator } from '@/actions/orchestrator';
// ... other agent imports

const AGENT_MAP: Record<string, Function> = {
  'business-plan': processBusinessPlan,
  'seo-audit': processSEOAudit,
  'orchestrator': processWithOrchestrator,
  // ... all agents
};

export async function POST(req: Request) {
  const { agent, payload, apiKey } = await req.json();

  // Validate API key (org-scoped)
  if (!apiKey || apiKey !== process.env.WORKFLOW_BRIDGE_KEY) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const agentFn = AGENT_MAP[agent];
  if (!agentFn) {
    return Response.json({ error: `Unknown agent: ${agent}` }, { status: 400 });
  }

  const result = await agentFn(payload);
  return Response.json({ success: true, result });
}
```

This means users can build workflows like:
```
Trigger (new email) → Extract data → Call WonLink SEO Agent → Send Slack notification
```

#### Step 5: Pre-built Templates (Days 6-7)

Create curated templates that showcase WonLink agents inside Activepieces:

| Template | Trigger | WonLink Agent | Output |
|---|---|---|---|
| Auto SEO Audit | Schedule (weekly) | Naver SEO Pro | Email report |
| Grant Alert Pipeline | Schedule (daily) | K-Startup Navigator | Slack/Kakao alert |
| Lead → Business Plan | Webhook (new client) | Business Plan Master | Supabase + email |
| Product Price Monitor | Schedule (hourly) | China Source Pro | Sheets + alert |
| Client Onboarding | Form submission | Orchestrator | Multi-step setup |
| Safety Daily Digest | Schedule (daily) | Safety Guardian | Email summary |
| Invoice Reconciliation | File upload trigger | Ledger Logic | PDF report |
| Competitor Watch | Schedule (daily) | Playwright scraper | Dashboard update |

---

## Part 2: Site Builder

### Two Capabilities, Two Tools

| Capability | Tool | License | Use Case |
|---|---|---|---|
| **Visual page builder** (drag-and-drop) | GrapesJS Studio SDK | Free (commercial OK) | Landing pages, email templates, simple sites |
| **WordPress site automation** | WP-CLI + Respira MCP + Divi JSON | Open source + your Divi license | Full WordPress client sites |

### Capability A: GrapesJS Visual Page Builder

#### Why GrapesJS Studio SDK

- **Free for commercial use** — no license cost
- **Works with React 19 + Next.js 16** — via `@grapesjs/studio-sdk`
- **Self-hosted data** — pages stored in your Supabase, not third-party cloud
- **White-label** — remove all GrapesJS branding
- **Multi-format** — websites, landing pages, email templates
- **Export** — HTML/CSS/JSON output you own

#### Implementation Steps

**Step 1: Install dependencies (30 minutes)**

```bash
npm install @grapesjs/studio-sdk grapesjs
```

**Step 2: Create the page builder page (Day 1)**

```typescript
// src/app/(dashboard)/dashboard/page-builder/page.tsx
'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

// GrapesJS must be loaded client-side only
const StudioEditor = dynamic(() => import('@/components/studio-editor'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[700px] flex items-center justify-center bg-muted rounded-lg">
      <p className="text-muted-foreground">Loading editor...</p>
    </div>
  ),
});

export default function PageBuilderPage() {
  const [projectId, setProjectId] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Page Builder</h1>
          <p className="text-muted-foreground mt-1">
            Design landing pages, websites, and email templates visually
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">My Pages</Button>
          <Button>New Page</Button>
        </div>
      </div>

      <StudioEditor projectId={projectId} />
    </div>
  );
}
```

**Step 3: Create the editor component (Day 1)**

```typescript
// src/components/studio-editor.tsx
'use client';

import StudioSDK from '@grapesjs/studio-sdk';
import { useEffect, useRef } from 'react';

interface Props {
  projectId: string | null;
}

export default function StudioEditor({ projectId }: Props) {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!editorRef.current) return;

    const editor = new StudioSDK({
      root: editorRef.current,
      licenseKey: process.env.NEXT_PUBLIC_GRAPESJS_LICENSE_KEY || '',
      project: {
        type: projectId ? 'web' : 'web',
        // Load from Supabase or start fresh
      },
      assets: {
        // Configure Supabase Storage for image uploads
        storageType: 'self',
        onUpload: async (files: File[]) => {
          // Upload to Supabase Storage, return URLs
          const urls: string[] = [];
          for (const file of files) {
            const formData = new FormData();
            formData.append('file', file);
            const res = await fetch('/api/site-builder/upload', {
              method: 'POST',
              body: formData,
            });
            const data = await res.json();
            urls.push(data.url);
          }
          return urls;
        },
      },
      onSave: async (projectData) => {
        // Save to Supabase
        await fetch('/api/site-builder/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            projectId,
            data: projectData,
          }),
        });
      },
    });

    return () => editor.destroy();
  }, [projectId]);

  return (
    <div
      ref={editorRef}
      className="w-full min-h-[700px] rounded-lg border overflow-hidden"
    />
  );
}
```

**Step 4: Supabase storage backend (Day 2)**

```sql
-- Migration: create site_builder tables
CREATE TABLE site_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  name TEXT NOT NULL,
  slug TEXT,
  page_type TEXT NOT NULL DEFAULT 'landing', -- landing, website, email
  grapes_data JSONB NOT NULL DEFAULT '{}',  -- GrapesJS project JSON
  html_output TEXT,                          -- Compiled HTML
  css_output TEXT,                           -- Compiled CSS
  status TEXT NOT NULL DEFAULT 'draft',      -- draft, published, archived
  published_url TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE site_pages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org_access" ON site_pages
  USING (organization_id IN (
    SELECT organization_id FROM memberships WHERE user_id = auth.uid()
  ));
```

**Step 5: Pre-built page templates (Day 3)**

Create starter templates users can pick from:

| Template | Type | Sections |
|---|---|---|
| SaaS Landing | Landing page | Hero, Features, Pricing, Testimonials, CTA, Footer |
| Agency Portfolio | Website | Hero, Services, Case Studies, Team, Contact |
| Product Launch | Landing page | Hero, Demo Video, Features, Social Proof, Pricing |
| Newsletter | Email template | Header, Content, CTA, Footer |
| Restaurant | Website | Hero, Menu, About, Gallery, Reservations, Contact |
| E-commerce Store | Website | Hero, Products Grid, Categories, About, Contact |
| Startup Pitch | Landing page | Problem, Solution, Traction, Team, CTA |

Store as JSON in `src/lib/site-builder/templates/` — loaded into GrapesJS on demand.

### Capability B: WordPress Site Automation Pipeline

#### Architecture

```
Client brief form (/dashboard/site-generator)
        │
        ▼
┌───────────────────────────┐
│ Step 1: AI Content Gen    │
│ (Vercel AI SDK)           │
│ Input: industry, brand,   │
│   services, tone          │
│ Output: JSON content      │
│   structure with all copy │
└──────────┬────────────────┘
           │
     ┌─────┴──────┐
     │             │
┌────▼─────┐  ┌───▼──────────┐
│ WordPress │  │ Next.js      │
│ Track     │  │ Track        │
│           │  │              │
│ 1. WP-CLI │  │ 1. Next-Forge│
│    Docker  │  │    scaffold  │
│    provisn │  │              │
│ 2. Divi   │  │ 2. AI fills  │
│    JSON    │  │    components│
│    template│  │              │
│ 3. Respira │  │ 3. Deploy to │
│    MCP     │  │    Vercel    │
│    styling │  │              │
└────┬──────┘  └───┬──────────┘
     │             │
     └──────┬──────┘
            │
   ┌────────▼────────┐
   │ Step 3: QA      │
   │ Playwright tests │
   │ • Responsive     │
   │ • Links work     │
   │ • Images load    │
   │ • Performance    │
   └────────┬────────┘
            │
   ┌────────▼────────┐
   │ Step 4: Review   │
   │ Human preview +  │
   │ approve          │
   └────────┬────────┘
            │
   ┌────────▼────────┐
   │ Step 5: Deploy   │
   │ Publish live     │
   └─────────────────┘
```

#### Implementation Steps

**Step 1: Site Generator Page (Days 1-2)**

```typescript
// src/app/(dashboard)/dashboard/site-generator/page.tsx
// Client intake form → AI generates site
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

type SiteTrack = 'wordpress' | 'nextjs';

interface SiteBrief {
  businessName: string;
  industry: string;
  description: string;
  services: string;
  tone: string; // professional, casual, bold, minimal
  colorPreference: string;
  targetAudience: string;
  track: SiteTrack;
  pages: string[]; // which pages they want
}

export default function SiteGeneratorPage() {
  const [brief, setBrief] = useState<Partial<SiteBrief>>({
    track: 'wordpress',
    pages: ['home', 'about', 'services', 'contact'],
  });
  const [status, setStatus] = useState<'idle' | 'generating' | 'review' | 'complete'>('idle');

  async function handleGenerate() {
    setStatus('generating');
    const res = await fetch('/api/site-generator/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(brief),
    });
    const data = await res.json();
    if (data.success) setStatus('review');
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Site Generator</h1>
        <p className="text-muted-foreground mt-1">
          Describe the business — AI builds the site
        </p>
      </div>

      {/* Intake form with fields for all SiteBrief properties */}
      {/* Track selector: WordPress (Divi) or Next.js */}
      {/* Page selector: checkboxes for which pages to generate */}
      {/* Generate button → shows real-time status → preview → approve → deploy */}
    </div>
  );
}
```

**Step 2: AI Content Generation Server Action (Day 2)**

```typescript
// src/actions/site-generator.ts
'use server';

import { generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';

const SiteContentSchema = z.object({
  pages: z.array(z.object({
    slug: z.string(),
    title: z.string(),
    sections: z.array(z.object({
      type: z.enum(['hero', 'features', 'about', 'services', 'testimonials',
                     'pricing', 'contact', 'gallery', 'cta', 'faq', 'team']),
      heading: z.string(),
      subheading: z.string().optional(),
      body: z.string().optional(),
      items: z.array(z.object({
        title: z.string(),
        description: z.string(),
        icon: z.string().optional(),
      })).optional(),
      ctaText: z.string().optional(),
      ctaLink: z.string().optional(),
    })),
  })),
  globalStyles: z.object({
    primaryColor: z.string(),
    secondaryColor: z.string(),
    fontHeading: z.string(),
    fontBody: z.string(),
    tone: z.string(),
  }),
  seo: z.object({
    metaTitle: z.string(),
    metaDescription: z.string(),
    keywords: z.array(z.string()),
  }),
});

export async function generateSiteContent(brief: {
  businessName: string;
  industry: string;
  description: string;
  services: string;
  tone: string;
  targetAudience: string;
  pages: string[];
}) {
  const { object: siteContent } = await generateObject({
    model: google('gemini-2.0-flash'),
    schema: SiteContentSchema,
    prompt: `Generate complete website content for:
      Business: ${brief.businessName}
      Industry: ${brief.industry}
      Description: ${brief.description}
      Services: ${brief.services}
      Tone: ${brief.tone}
      Target audience: ${brief.targetAudience}
      Pages needed: ${brief.pages.join(', ')}

      Generate professional, conversion-optimized copy for each page.
      Include realistic section content, CTAs, and SEO metadata.
      Match the tone to the business type.`,
  });

  return siteContent;
}
```

**Step 3: Divi JSON Template Library (Days 3-4)**

Build a library of Divi-exportable JSON templates. Each template is a full Divi layout that you export from your Divi Builder and store as JSON:

```
src/lib/site-builder/divi-templates/
├── saas-landing.json
├── agency-portfolio.json
├── restaurant.json
├── ecommerce.json
├── professional-services.json
├── startup-landing.json
├── medical-clinic.json
└── real-estate.json
```

Create a template processor that replaces placeholder content with AI-generated content:

```typescript
// src/lib/site-builder/divi-processor.ts
export function populateDiviTemplate(
  templateJson: string,
  content: SiteContent
): string {
  let populated = templateJson;

  // Replace placeholders in Divi JSON
  // Divi stores content as encoded HTML in JSON fields
  for (const page of content.pages) {
    for (const section of page.sections) {
      // Map section type to Divi module placeholders
      populated = populated.replace(
        `{{${section.type}_heading}}`,
        section.heading
      );
      populated = populated.replace(
        `{{${section.type}_body}}`,
        section.body || ''
      );
      // ... etc for all fields
    }
  }

  // Replace global styles
  populated = populated.replace('{{primary_color}}', content.globalStyles.primaryColor);
  populated = populated.replace('{{secondary_color}}', content.globalStyles.secondaryColor);

  return populated;
}
```

**Step 4: WordPress Provisioning Script (Day 5)**

```typescript
// src/lib/site-builder/wp-provisioner.ts
// Uses WP-CLI to automate WordPress setup
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface WPProvisionConfig {
  siteName: string;
  siteUrl: string;
  adminEmail: string;
  diviTemplateJson: string; // Pre-populated Divi JSON
}

export async function provisionWordPressSite(config: WPProvisionConfig) {
  const steps = [
    // 1. Create WordPress via Docker
    `docker compose -f docker-compose.wp-client.yml up -d`,

    // 2. Install WordPress
    `docker exec wp-${config.siteName} wp core install \\
      --url="${config.siteUrl}" \\
      --title="${config.siteName}" \\
      --admin_user=admin \\
      --admin_email="${config.adminEmail}" \\
      --skip-email`,

    // 3. Install and activate Divi
    `docker exec wp-${config.siteName} wp theme install /themes/Divi.zip --activate`,

    // 4. Create standard pages
    `docker exec wp-${config.siteName} wp post create --post_type=page --post_title="Home" --post_status=publish`,
    `docker exec wp-${config.siteName} wp post create --post_type=page --post_title="About" --post_status=publish`,
    `docker exec wp-${config.siteName} wp post create --post_type=page --post_title="Services" --post_status=publish`,
    `docker exec wp-${config.siteName} wp post create --post_type=page --post_title="Contact" --post_status=publish`,

    // 5. Set homepage
    `docker exec wp-${config.siteName} wp option update show_on_front page`,
    `docker exec wp-${config.siteName} wp option update page_on_front $(docker exec wp-${config.siteName} wp post list --post_type=page --name=home --field=ID)`,

    // 6. Import Divi layout
    // Write populated JSON to temp file, import via WP-CLI
    `docker exec wp-${config.siteName} wp eval "et_import_portability('${config.diviTemplateJson}')"`,

    // 7. Install essential plugins
    `docker exec wp-${config.siteName} wp plugin install wordpress-seo contact-form-7 --activate`,
  ];

  const results = [];
  for (const step of steps) {
    try {
      const { stdout, stderr } = await execAsync(step);
      results.push({ step, success: true, output: stdout });
    } catch (error) {
      results.push({ step, success: false, error: String(error) });
    }
  }

  return results;
}
```

**Step 5: Respira MCP Integration (Day 6)**

Add Respira to your MCP config for AI-powered Divi styling:

```typescript
// Update src/lib/mcp/config.ts
export const MCP_SERVERS: Record<string, MCPServerConfig> = {
  'document-generator': {
    id: 'document-generator',
    command: npx,
    args: ['-y', 'thiagotw10-document-generator-mcp'],
  },
  'respira-wordpress': {
    id: 'respira-wordpress',
    command: npx,
    args: ['-y', 'respira-mcp'],
    env: {
      WORDPRESS_URL: process.env.WP_CLIENT_URL || '',
      WORDPRESS_API_KEY: process.env.WP_CLIENT_API_KEY || '',
    },
  },
  // ... existing servers
};
```

Then create a server action that uses Respira MCP to refine Divi styling:

```typescript
// src/actions/site-styling.ts
'use server';

import { createMCPClient } from '@/lib/mcp/client';

export async function refineSiteStyling(siteUrl: string, styleInstructions: string) {
  const client = await createMCPClient('respira-wordpress');

  // Respira MCP can edit Divi layouts via natural language
  const result = await client.callTool('edit_page', {
    url: siteUrl,
    instructions: styleInstructions,
    // e.g., "Make the hero section full-width with a gradient overlay.
    //        Change the primary font to Poppins. Add subtle animations
    //        to the service cards on scroll."
  });

  return result;
}
```

---

## Part 3: Dashboard Navigation Update

Update the sidebar to include the new sections:

```typescript
// Updated nav items for src/app/(dashboard)/layout.tsx

// After "Core Agents" section, add:

<div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-4 mb-2">
  Automation
</div>

<Link href="/dashboard/workflows"
  className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-muted hover:text-foreground">
  <Workflow className="h-4 w-4" />
  Workflows
</Link>

<div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-4 mb-2">
  Site Builder
</div>

<Link href="/dashboard/page-builder"
  className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-muted hover:text-foreground">
  <Layout className="h-4 w-4" />
  Page Builder
</Link>

<Link href="/dashboard/site-generator"
  className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-muted hover:text-foreground">
  <Globe className="h-4 w-4" />
  Site Generator
</Link>
```

---

## Part 4: Database Migrations

```sql
-- Migration: add workflow and site builder tables

-- Workflow tracking (Activepieces handles its own state,
-- but we track org-level metadata in Supabase)
CREATE TABLE workflow_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL, -- seo, leads, onboarding, monitoring, etc.
  ap_flow_id TEXT, -- Activepieces flow ID
  is_public BOOLEAN DEFAULT false, -- visible in template library
  config JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Site builder pages (GrapesJS)
CREATE TABLE site_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  name TEXT NOT NULL,
  slug TEXT,
  page_type TEXT NOT NULL DEFAULT 'landing',
  grapes_data JSONB NOT NULL DEFAULT '{}',
  html_output TEXT,
  css_output TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  published_url TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Site generation projects (WordPress + Next.js)
CREATE TABLE site_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  name TEXT NOT NULL,
  track TEXT NOT NULL, -- 'wordpress' or 'nextjs'
  brief JSONB NOT NULL, -- client intake form data
  ai_content JSONB, -- generated content structure
  status TEXT NOT NULL DEFAULT 'pending',
  -- pending → generating → review → approved → deploying → live
  preview_url TEXT,
  live_url TEXT,
  wp_admin_url TEXT, -- for WordPress sites
  repo_url TEXT, -- for Next.js sites
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for all tables
ALTER TABLE workflow_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_access" ON workflow_templates USING (
  organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid())
  OR is_public = true
);
CREATE POLICY "org_access" ON site_pages USING (
  organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid())
);
CREATE POLICY "org_access" ON site_projects USING (
  organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid())
);
```

---

## Part 5: Environment Variables to Add

```bash
# Activepieces (workflow engine)
ACTIVEPIECES_URL=http://localhost:8080
ACTIVEPIECES_API_KEY=your-ap-api-key
NEXT_PUBLIC_ACTIVEPIECES_URL=http://localhost:8080
AP_ENCRYPTION_KEY=generate-a-32-char-key
AP_JWT_SECRET=generate-a-secret
WORKFLOW_BRIDGE_KEY=generate-a-bridge-key

# GrapesJS Studio SDK
NEXT_PUBLIC_GRAPESJS_LICENSE_KEY=your-free-license-key

# WordPress automation
WP_CLIENT_URL=http://localhost:8888
WP_CLIENT_API_KEY=your-wp-api-key
RESPIRA_MCP_KEY=your-respira-key

# Deployment
VERCEL_TOKEN=your-vercel-token
GITHUB_TOKEN=your-github-token
```

---

## Implementation Timeline

| Day | Task | Deliverable |
|---|---|---|
| 1 | Deploy Activepieces via Docker Compose | Workflow engine running at localhost:8080 |
| 2 | Create AP API wrapper + embed token endpoint | `src/lib/activepieces/client.ts` |
| 3-4 | Build `/dashboard/workflows` page with embedded builder | Users can create and run workflows |
| 5 | Create agent-bridge API + connect workflows to WonLink agents | Workflows can invoke AI agents |
| 6-7 | Create 8 pre-built workflow templates | Template library populated |
| 8 | Install GrapesJS Studio SDK + create `/dashboard/page-builder` | Visual page builder working |
| 9 | Create GrapesJS Supabase storage backend + asset uploads | Pages save/load from database |
| 10 | Create 7 page templates (landing, portfolio, etc.) | Template library for pages |
| 11-12 | Build `/dashboard/site-generator` intake form + AI content gen | Client brief → AI content pipeline |
| 13 | Create Divi JSON template library (6 industry templates) | WordPress automation templates |
| 14 | Integrate WP-CLI provisioning + Respira MCP | Automated WordPress site creation |
| 15 | Integrate Playwright QA tests for generated sites | Automated quality checks |
| 16 | Build site preview/approval workflow + deploy pipeline | End-to-end site generation |
| 17 | Update dashboard navigation + polish all UIs | Cohesive experience |
| 18 | Documentation + smoke tests for all new features | Production-ready |

**Total: 18 working days (3.5 weeks)**

---

## Safety Guardrails

### License Safety

| Tool | License | Commercial Use | Embed in SaaS | Status |
|---|---|---|---|---|
| Activepieces | MIT | Unrestricted | Yes | Safe |
| GrapesJS Studio SDK | Free commercial | Yes (can't resell SDK itself) | Yes | Safe |
| Respira MCP | Commercial plugin | Yes (your own use) | N/A (server-side) | Safe |
| WP-CLI | MIT | Unrestricted | N/A (server-side) | Safe |
| Divi | Your lifetime license | For your client sites | N/A (server-side) | Safe |

### Security Guardrails

1. **Workflow sandboxing:** Activepieces runs workflows in sandboxed containers (600s timeout configured)
2. **Org isolation:** All data (workflows, pages, sites) is org-scoped via Supabase RLS
3. **API key validation:** Agent bridge endpoint requires org-scoped API key
4. **Rate limiting:** Apply existing rate limiting to new endpoints
5. **File upload validation:** GrapesJS asset uploads validated for type/size before Supabase Storage
6. **WordPress isolation:** Each client WordPress runs in its own Docker container
7. **Preview before publish:** All generated sites require human approval before going live

### What Could Go Wrong + Mitigations

| Risk | Likelihood | Mitigation |
|---|---|---|
| Activepieces Docker OOM | Medium | Set memory limits in Docker Compose (2GB cap) |
| GrapesJS breaking on large pages | Low | Implement auto-save + warn at 50+ sections |
| WordPress provisioning fails | Medium | Retry logic + manual fallback path |
| AI generates bad content | Medium | Human review step is mandatory, not optional |
| Divi JSON template breaks on update | Low | Pin Divi version, test templates on update |
| Respira MCP fails to connect | Medium | Fallback to manual Divi editing (template already imported) |
| Activepieces embed SDK version mismatch | Low | Pin SDK version, test on upgrade |
