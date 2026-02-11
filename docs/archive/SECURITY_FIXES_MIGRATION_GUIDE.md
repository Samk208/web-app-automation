# Security Fixes Migration Guide
**Date:** January 7, 2026
**Priority:** CRITICAL - Apply Immediately

---

## 🚨 Critical Security Fixes Implemented

This guide documents all security improvements made to the WonLink AI Automation Agency platform. These changes address **5 critical** and **6 high-priority** security vulnerabilities identified in the security audit.

---

## ✅ What's Been Fixed

### 1. **API Key Exposure** ✅ FIXED
- **Created:** [.env.example](.env.example) with all required environment variables
- **Action Required:** Rotate all exposed API keys immediately

### 2. **Authorization System** ✅ IMPLEMENTED
- **Created:** [src/lib/auth/authorization.ts](src/lib/auth/authorization.ts)
- **Features:**
  - User authentication verification
  - Organization membership checks
  - Role-based access control (RBAC)
  - Resource ownership validation

### 3. **Distributed Rate Limiting** ✅ IMPLEMENTED
- **Created:** [src/lib/rate-limit-redis.ts](src/lib/rate-limit-redis.ts)
- **Migration:** From in-memory to Redis-based (works across multiple servers)
- **Algorithm:** Sliding window counter for accurate limits

### 4. **Webhook Security** ✅ FIXED
- **Updated:** [src/app/api/kakao/webhook/route.ts](src/app/api/kakao/webhook/route.ts)
- **Fixes:**
  - Proper HMAC-SHA256 signature verification on request body
  - Constant-time comparison to prevent timing attacks
  - Clear error handling for missing secrets

### 5. **CSRF Protection** ✅ IMPLEMENTED
- **Created:** [src/lib/csrf.ts](src/lib/csrf.ts)
- **Features:**
  - Token generation and validation
  - Secure cookie storage
  - Helper functions for client-side

### 6. **Error Sanitization** ✅ IMPLEMENTED
- **Created:** [src/lib/error-handler.ts](src/lib/error-handler.ts)
- **Features:**
  - Production-safe error messages
  - Detailed server-side logging
  - Error code standardization

### 7. **Stripe Integration** ✅ FIXED
- **Updated:** [src/app/api/proposals/[id]/accept/route.ts](src/app/api/proposals/[id]/accept/route.ts)
- **Fixes:**
  - Remove hardcoded price ID
  - Add authorization checks
  - Validate price exists in Stripe
  - Proper error handling

### 8. **Input Validation** ✅ IMPLEMENTED
- **Created:** [src/lib/validation/schemas.ts](src/lib/validation/schemas.ts)
- **Includes:**
  - Email, password, URL validation
  - XSS protection with HTML sanitization
  - Korean-specific validators (phone, business number)
  - Business domain schemas (business plans, proposals, etc.)

---

## 📋 Migration Checklist

### Step 1: Environment Variables (URGENT)

**1.1 Rotate All Exposed API Keys**

❌ **EXPOSED KEYS - ROTATE IMMEDIATELY:**
```bash
# These keys were exposed in .env.local and must be rotated:
- GEMINI_API_KEY
- OPENAI_API_KEY
- ANTHROPIC_API_KEY
- SUPABASE_SERVICE_ROLE_KEY
- UPSTASH_REDIS_REST_TOKEN
- CLOUD_CONVERT_API_KEY
- NAVER_CLIENT_SECRET
- SCRAPEOWL_API_KEY
- WEBSHARE_API_KEY
```

**How to rotate:**
1. **Google Gemini:** https://aistudio.google.com/app/apikey
2. **OpenAI:** https://platform.openai.com/api-keys
3. **Anthropic:** https://console.anthropic.com/settings/keys
4. **Supabase:** https://app.supabase.com/project/_/settings/api
5. **Upstash Redis:** https://console.upstash.com/
6. **CloudConvert:** https://cloudconvert.com/dashboard/api/v2/keys
7. **Naver:** https://developers.naver.com/apps/
8. **ScrapeOwl:** https://scrapeowl.com/
9. **Webshare:** https://www.webshare.io/

**1.2 Set Up .env.local Correctly**

```bash
# Copy the example file
cp .env.example .env.local

# Edit .env.local and add your NEW rotated keys
# NEVER commit .env.local to git!
```

**1.3 Add Missing Environment Variables**

```bash
# Add to .env.local
KAKAO_WEBHOOK_SECRET=your_kakao_webhook_secret_from_console
SESSION_SECRET=$(openssl rand -hex 32)  # Generate random secret
STRIPE_SECRET_KEY=sk_test_your_stripe_key  # If using Stripe
```

**1.4 Clean Git History**

```bash
# Remove .env.local from git history (WARNING: Rewrites history)
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env.local" \
  --prune-empty --tag-name-filter cat -- --all

# Force push to remote (if applicable)
# git push origin --force --all
```

---

### Step 2: Database Migrations

**2.1 Add Authorization Tables**

You need an `organization_members` table for the authorization system:

```sql
-- supabase/migrations/20260107000000_add_organization_members.sql

CREATE TABLE IF NOT EXISTS organization_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(organization_id, user_id)
);

CREATE INDEX idx_org_members_org ON organization_members(organization_id);
CREATE INDEX idx_org_members_user ON organization_members(user_id);

-- Enable RLS
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;

-- Policy: Users can see their own memberships
CREATE POLICY "Users can view own memberships"
ON organization_members
FOR SELECT
USING (user_id = auth.uid());

-- Policy: Admins can manage members
CREATE POLICY "Admins can manage members"
ON organization_members
FOR ALL
USING (
    organization_id IN (
        SELECT organization_id
        FROM organization_members
        WHERE user_id = auth.uid()
        AND role IN ('owner', 'admin')
    )
);
```

**2.2 Add Stripe Price ID to Proposals**

```sql
-- supabase/migrations/20260107000001_add_stripe_price_id.sql

ALTER TABLE proposals
ADD COLUMN IF NOT EXISTS stripe_price_id TEXT;

-- Add index for lookups
CREATE INDEX IF NOT EXISTS idx_proposals_stripe_price
ON proposals(stripe_price_id);
```

**2.3 Apply Migrations**

```bash
# Local development
supabase db reset --yes

# Production
supabase db push
```

---

### Step 3: Update Existing Code

**3.1 Update Action Files to Use New Authorization**

For each server action that accesses resources, add authorization:

```typescript
// Example: src/actions/business-plan.ts
import { requireResourceAccess } from '@/lib/auth/authorization';
import { enforceRateLimit } from '@/lib/rate-limit-redis'; // Updated import
import { handleAPIError } from '@/lib/error-handler';
import { BusinessPlanInputSchema } from '@/lib/validation/schemas';

export async function processBusinessPlan(planId: string) {
    try {
        // 1. Verify authorization
        const auth = await requireResourceAccess('business_plans', planId);

        // 2. Rate limiting with Redis
        await enforceRateLimit(`bp:${auth.organizationId}`, 10); // 10/min

        // 3. Your existing logic...
        // ...

    } catch (error) {
        const { error: sanitized, statusCode } = handleAPIError(error);
        throw sanitized;
    }
}
```

**3.2 Update API Routes**

All API routes should follow this pattern:

```typescript
// Example: src/app/api/resource/[id]/route.ts
import { requireResourceAccess } from '@/lib/auth/authorization';
import { handleAPIError } from '@/lib/error-handler';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const ParamsSchema = z.object({
    id: z.string().uuid()
});

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        // Validate params
        const { id } = ParamsSchema.parse(params);

        // Check authorization
        const auth = await requireResourceAccess('table_name', id);

        // Your logic here...

        return NextResponse.json({ success: true, data: /* ... */ });

    } catch (error) {
        const { error: sanitized, statusCode } = handleAPIError(error);
        return NextResponse.json(
            { error: sanitized.message },
            { status: statusCode }
        );
    }
}
```

**3.3 Remove console.log and console.error**

Replace all `console.log` / `console.error` with proper logging:

```typescript
import { createLogger } from '@/lib/logger';

const logger = createLogger({ service: 'my-service' });

// Instead of:
console.log('Something happened', data);
console.error('Error occurred', error);

// Use:
logger.info('Something happened', { data });
logger.error('Error occurred', error);
```

---

### Step 4: Client-Side Updates

**4.1 Add CSRF Token to Forms**

```tsx
// src/components/forms/ProtectedForm.tsx
'use client';

import { getCSRFToken, getCSRFHeaderName } from '@/lib/csrf';
import { useEffect, useState } from 'react';

export function ProtectedForm() {
    const [csrfToken, setCsrfToken] = useState<string | null>(null);

    useEffect(() => {
        // Get CSRF token on mount
        getCSRFToken().then(setCsrfToken);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!csrfToken) {
            alert('Security token missing. Please refresh the page.');
            return;
        }

        const response = await fetch('/api/endpoint', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                [getCSRFHeaderName()]: csrfToken
            },
            body: JSON.stringify(formData)
        });

        // Handle response...
    };

    return <form onSubmit={handleSubmit}>{/* ... */}</form>;
}
```

**4.2 Add Error Handling UI**

```tsx
// src/components/ErrorBoundary.tsx
'use client';

import { useEffect } from 'react';

export function ErrorBoundary({ error }: { error: Error }) {
    useEffect(() => {
        // Log to error tracking service (Sentry, etc.)
        console.error('Client error:', error);
    }, [error]);

    return (
        <div className="error-container">
            <h2>Something went wrong</h2>
            <p>We're working on fixing the issue. Please try again later.</p>
            {process.env.NODE_ENV === 'development' && (
                <details>
                    <summary>Error Details</summary>
                    <pre>{error.message}</pre>
                </details>
            )}
        </div>
    );
}
```

---

### Step 5: Add Security Middleware

**5.1 Create Middleware for CSRF and Headers**

```typescript
// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyCSRFToken } from '@/lib/csrf';

const SAFE_METHODS = ['GET', 'HEAD', 'OPTIONS'];
const WEBHOOK_PATHS = ['/api/kakao/webhook', '/api/stripe/webhook'];

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Skip CSRF for safe methods
    if (SAFE_METHODS.includes(request.method)) {
        return addSecurityHeaders(NextResponse.next());
    }

    // Skip CSRF for webhooks (they use signature verification)
    if (WEBHOOK_PATHS.some(path => pathname.startsWith(path))) {
        return addSecurityHeaders(NextResponse.next());
    }

    // Verify CSRF token for state-changing requests
    try {
        const csrfToken = request.headers.get('x-csrf-token');
        await verifyCSRFToken(csrfToken);
    } catch (error) {
        return NextResponse.json(
            { error: 'CSRF validation failed' },
            { status: 403 }
        );
    }

    return addSecurityHeaders(NextResponse.next());
}

function addSecurityHeaders(response: NextResponse): NextResponse {
    // Content Security Policy
    response.headers.set('Content-Security-Policy',
        "default-src 'self'; " +
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
        "style-src 'self' 'unsafe-inline'; " +
        "img-src 'self' data: https:; " +
        "connect-src 'self' https://api.openai.com https://generativelanguage.googleapis.com; " +
        "frame-ancestors 'none';"
    );

    // Other security headers
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

    if (process.env.NODE_ENV === 'production') {
        response.headers.set(
            'Strict-Transport-Security',
            'max-age=31536000; includeSubDomains'
        );
    }

    return response;
}

export const config = {
    matcher: ['/api/:path*', '/dashboard/:path*']
};
```

---

## 🧪 Testing Checklist

### Authorization Tests

- [ ] Unauthenticated users cannot access protected endpoints
- [ ] Users cannot access other organizations' resources
- [ ] Role-based access works (admin can approve, member cannot)
- [ ] Resource ownership checks prevent unauthorized access

### Rate Limiting Tests

```bash
# Test rate limiting
for i in {1..70}; do
    curl -X POST http://localhost:3000/api/endpoint \
        -H "Content-Type: application/json" \
        -d '{"test": "data"}'
    echo "Request $i"
done

# Should see 429 errors after 60 requests
```

### CSRF Tests

```bash
# Without CSRF token (should fail)
curl -X POST http://localhost:3000/api/endpoint \
    -H "Content-Type: application/json" \
    -d '{"test": "data"}'

# Should return: {"error": "CSRF validation failed"}
```

### Error Handling Tests

- [ ] Production errors don't leak stack traces
- [ ] Development errors show full details
- [ ] Errors are logged server-side with context
- [ ] Client receives user-friendly messages

---

## 📊 Monitoring & Alerts

### Set Up Logging

```typescript
// src/lib/monitoring/setup.ts
import { createLogger } from '@/lib/logger';

const securityLogger = createLogger({ service: 'security' });

// Log all authorization failures
export function logAuthFailure(userId: string, resource: string) {
    securityLogger.warn('Authorization failed', {
        userId,
        resource,
        timestamp: new Date().toISOString()
    });
}

// Log rate limit hits
export function logRateLimitHit(key: string, limit: number) {
    securityLogger.warn('Rate limit hit', {
        key,
        limit,
        timestamp: new Date().toISOString()
    });
}
```

### Alert on Security Events

Configure alerts for:
- Multiple authorization failures from same IP
- Rate limit exceeded repeatedly
- Invalid webhook signatures
- CSRF validation failures

---

## 🚀 Deployment Steps

### Development

```bash
# 1. Install dependencies
npm install

# 2. Set up environment
cp .env.example .env.local
# Edit .env.local with your keys

# 3. Apply migrations
supabase db reset --yes

# 4. Start dev server
npm run dev

# 5. Test endpoints
npm run test  # If you have tests
```

### Staging

```bash
# 1. Set environment variables in hosting platform
# (Vercel, AWS, etc.)

# 2. Apply migrations
supabase db push

# 3. Deploy
git push staging main

# 4. Smoke test critical endpoints
curl https://staging.yourapp.com/api/health
```

### Production

```bash
# 1. CRITICAL: Set NODE_ENV=production
# 2. CRITICAL: Set ALLOW_MOCK_DATA=false
# 3. Ensure all rotated keys are in secrets manager
# 4. Apply migrations with backup
supabase db push --dry-run  # Preview first
supabase db push

# 5. Deploy
git push production main

# 6. Monitor logs for errors
# 7. Test critical user flows
```

---

## 📚 Additional Resources

### Documentation Created

1. [.env.example](.env.example) - Environment variables template
2. [src/lib/auth/authorization.ts](src/lib/auth/authorization.ts) - Authorization system
3. [src/lib/rate-limit-redis.ts](src/lib/rate-limit-redis.ts) - Redis rate limiting
4. [src/lib/csrf.ts](src/lib/csrf.ts) - CSRF protection
5. [src/lib/error-handler.ts](src/lib/error-handler.ts) - Error sanitization
6. [src/lib/validation/schemas.ts](src/lib/validation/schemas.ts) - Input validation
7. [PRODUCTION_READINESS_SECURITY_AUDIT.md](PRODUCTION_READINESS_SECURITY_AUDIT.md) - Full security audit

### Next Steps

After applying these security fixes:

1. **Agent Hardening** - Apply authorization and validation to all 10 agents
2. **RLS Policies** - Complete database row-level security
3. **File Upload Security** - Add virus scanning and validation
4. **Monitoring** - Set up dashboards and alerts
5. **Penetration Testing** - Hire security firm for audit

---

## ❓ FAQ

**Q: Will these changes break existing functionality?**
A: The new authorization checks may initially break endpoints if users/orgs aren't properly set up. Test thoroughly in staging first.

**Q: Do I need to update the database schema?**
A: Yes, you need `organization_members` table and `stripe_price_id` column. See Step 2.

**Q: What if Redis is down?**
A: Rate limiting fails open (allows requests) to prevent outages from blocking all traffic.

**Q: How do I test locally?**
A: Use the Supabase CLI for local development. All features work with local Supabase.

**Q: When should I apply these fixes?**
A: **Immediately**. The exposed API keys alone are a critical security risk.

---

## ✅ Completion Checklist

- [ ] Rotate all exposed API keys
- [ ] Set up .env.local with new keys
- [ ] Apply database migrations
- [ ] Update server actions with authorization
- [ ] Update API routes with new patterns
- [ ] Add CSRF protection to forms
- [ ] Replace console.log with logger
- [ ] Add security middleware
- [ ] Test authorization flows
- [ ] Test rate limiting
- [ ] Test CSRF protection
- [ ] Deploy to staging
- [ ] Smoke test on staging
- [ ] Deploy to production
- [ ] Monitor logs for issues

---

**Last Updated:** January 7, 2026
**Status:** Ready for Implementation
**Priority:** 🔴 CRITICAL