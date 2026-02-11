# Agent Hardening Handover - Production Readiness
**Date:** January 7, 2026
**Status:** 2/10 Agents Complete (20%)
**Next Session:** Continue with remaining 8 agents

---

## 🎯 Mission

Transform all 10 WonLink AI agents from MVP to production-grade by applying comprehensive security fixes, authorization, rate limiting, input validation, and error handling.

---

## ✅ What's Been Completed

### Phase 1: Security Infrastructure (100% Complete)

**New Security Libraries Created:**

1. **[src/lib/auth/authorization.ts](../src/lib/auth/authorization.ts)** - Full RBAC system
   - `requireAuth()` - Verify user logged in
   - `requireResourceAccess()` - Check resource ownership
   - `requireOrganizationAccess()` - Verify org membership
   - `requireAdminRole()` - Admin-only access

2. **[src/lib/rate-limit-redis.ts](../src/lib/rate-limit-redis.ts)** - Distributed rate limiting
   - `enforceRateLimit()` - Throw if exceeded
   - `checkRateLimit()` - Get status without incrementing
   - `getRateLimitHeaders()` - HTTP headers for responses

3. **[src/lib/error-handler.ts](../src/lib/error-handler.ts)** - Error sanitization
   - `sanitizeError()` - Production-safe messages
   - `handleAPIError()` - Complete error handling
   - `Errors.*` - Error factories

4. **[src/lib/validation/schemas.ts](../src/lib/validation/schemas.ts)** - Input validation
   - Email, Password, UUID, URL schemas
   - XSS protection with `SafeStringSchema`
   - Business domain schemas (BusinessPlan, Proposal, etc.)

5. **[src/lib/csrf.ts](../src/lib/csrf.ts)** - CSRF protection
   - Token generation and validation
   - Secure cookie management

6. **[.env.example](../.env.example)** - Environment template
   - All 50+ required variables documented
   - Security checklist included

**Critical Fixes Applied:**

7. ✅ Fixed **Kakao Webhook** - Proper HMAC signature verification
8. ✅ Fixed **Stripe Integration** - Authorization + price validation

**Documentation Created:**

9. **[PRODUCTION_READINESS_SECURITY_AUDIT.md](../PRODUCTION_READINESS_SECURITY_AUDIT.md)** - Full security audit
10. **[SECURITY_FIXES_MIGRATION_GUIDE.md](../SECURITY_FIXES_MIGRATION_GUIDE.md)** - Implementation guide
11. **[SECURITY_FIXES_SUMMARY.md](../SECURITY_FIXES_SUMMARY.md)** - Executive summary
12. **[AGENT_HARDENING_PROGRESS.md](../AGENT_HARDENING_PROGRESS.md)** - Progress tracker

---

### Phase 2: Agent Hardening (20% Complete)

**✅ Agent 1: Business Plan Master** - PRODUCTION READY
- File: [src/actions/business-plan.ts](../src/actions/business-plan.ts)
- Authorization: ✅ Full RBAC with org scoping
- Rate Limiting: ✅ Redis-based (10 req/min)
- Input Validation: ✅ 50-50,000 chars
- Error Handling: ✅ Sanitized + structured logging
- Budget Enforcement: ✅ Enhanced
- Cost Tracking: ✅ Enhanced
- Organization Scoping: ✅ All queries filtered

**✅ Agent 2: Proposal Architect** - PRODUCTION READY
- File: [src/actions/proposal.ts](../src/actions/proposal.ts)
- Authorization: ✅ Full RBAC
- Rate Limiting: ✅ Redis-based (10 req/min)
- Input Validation: ✅ 20-10,000 chars + URL validation
- Knowledge Base: ✅ Organization-scoped
- XSS Protection: ✅ SafeStringSchema
- Error Handling: ✅ Complete
- Organization Scoping: ✅ All queries filtered

---

## 📋 TODO: Remaining 8 Agents

### Priority 1: Quick Wins (Est. 3-4 hours)

These agents need basic security only (no complex integrations):

#### **Agent 5: Global Merchant** ⏳
**File:** `src/actions/merchant.ts`
**Time Estimate:** 1 hour
**Current Status:** Basic functionality, no security

**Tasks:**
- [ ] Add authorization with `requireResourceAccess`
- [ ] Add Redis rate limiting (10 req/min)
- [ ] Add input validation for text fields
- [ ] Scope queries to organization_id
- [ ] Add error sanitization
- [ ] Enhanced logging (remove console.*)
- [ ] Validate source/target languages

**Security Pattern:**
```typescript
// 1. Auth
const auth = await requireResourceAccess('translations', translationId)

// 2. Rate limit
await enforceRateLimit(`merchant:${auth.organizationId}`, 10)

// 3. Input validation
if (!data.source_text || data.source_text.length > 10000) {
    throw Errors.validation("Invalid source text")
}

// 4. Scope to org
.eq('organization_id', auth.organizationId)
```

---

#### **Agent 6: Ledger Logic** ⏳
**File:** `src/actions/reconciliation.ts`
**Time Estimate:** 1.5 hours
**Current Status:** Basic reconciliation, no HITL

**Tasks:**
- [ ] Add authorization
- [ ] Add Redis rate limiting
- [ ] Add input validation for financial data
- [ ] Implement HITL for financial decisions (critical!)
- [ ] Add audit logging for all transactions
- [ ] Scope to organization_id
- [ ] Error sanitization
- [ ] Validate amounts are positive numbers

**HITL Implementation:**
```typescript
// After reconciliation
const { data: review } = await supabase
    .from('approval_requests')
    .insert({
        agent: 'ledger-logic',
        resource_id: reconciliationId,
        organization_id: auth.organizationId,
        summary: `${matchedCount} transactions matched`,
        data: { matches, unreconciled },
        status: 'pending'
    })

// Don't auto-apply - wait for approval
```

---

### Priority 2: Mock Data Removal (Est. 4-5 hours)

These agents currently use mock data and need guards removed:

#### **Agent 7: Grant Scout** ⏳
**File:** `src/actions/grant-scout.ts`
**Time Estimate:** 1.5 hours
**Current Status:** Uses mock startup_programs data

**Tasks:**
- [ ] Add basic security (auth + rate limit + validation)
- [ ] Add note about mock data in logs
- [ ] Scope to organization_id
- [ ] Add error handling
- [ ] **Future:** Implement K-Startup scraper (separate task)

**Note in Code:**
```typescript
// TODO: Replace with real K-Startup scraper
// Currently using seeded data from database
logger.warn("Using seeded program data - scraper not yet implemented")
```

---

#### **Agent 8: K-Startup Navigator** ⏳
**File:** `src/actions/k-startup.ts`
**Time Estimate:** 1.5 hours
**Current Status:** Reads startup_programs (seeded data)

**Tasks:**
- [ ] Same as Grant Scout
- [ ] Add basic security
- [ ] Organization scoping
- [ ] Error handling
- [ ] Note about future scraper

---

#### **Agent 9: NaverSEO Pro** ⏳
**File:** `src/actions/naver-seo.ts`
**Time Estimate:** 1.5 hours
**Current Status:** Simulated audit with `ensureMockDataAllowed`

**Tasks:**
- [ ] Add basic security
- [ ] Remove `ensureMockDataAllowed` guard
- [ ] Add clear logging that audit is simulated
- [ ] Organization scoping
- [ ] Error handling
- [ ] **Future:** Real crawler + SERP API

**Code Pattern:**
```typescript
logger.warn("SEO audit is simulated - real crawler not yet implemented", {
    url: proposal.url,
    organizationId: auth.organizationId
})

// Generate simulated audit data
const audit = {
    performanceScore: 75,
    // ... simulated data
}
```

---

### Priority 3: Complex Agents (Est. 5-6 hours)

These need more work due to external integrations:

#### **Agent 3: ChinaSource Pro** ⏳
**File:** `src/actions/sourcing.ts`
**Time Estimate:** 2 hours
**Current Status:** Has optional scraper, needs hardening

**Tasks:**
- [ ] Add authorization + rate limiting + validation
- [ ] **CRITICAL:** Enforce proxy requirement in production
- [ ] Add retry logic with exponential backoff
- [ ] Add PII/secret scrubbing before logging URLs
- [ ] Validate product URLs (must be 1688.com/alibaba.com)
- [ ] Error handling for scraper failures
- [ ] Remove or clearly gate AI fallback

**Proxy Enforcement:**
```typescript
// In production, require proxy
if (process.env.NODE_ENV === 'production') {
    if (!process.env.PROXY_URL) {
        throw Errors.internal(
            "Proxy required for production scraping. Configure PROXY_URL."
        )
    }
}

// Retry logic
const maxAttempts = 3
for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
        const result = await scraper.scrapeProduct(url)
        break
    } catch (err) {
        if (attempt === maxAttempts) throw err
        await sleep(Math.pow(2, attempt) * 1000) // Exponential backoff
    }
}
```

**URL Scrubbing:**
```typescript
// Don't log sensitive URLs
logger.info("Scraping product", {
    domain: new URL(productUrl).hostname, // ✅ Safe
    organizationId: auth.organizationId
})
```

---

#### **Agent 4: Safety Guardian** ⏳
**File:** `src/actions/safety-guardian.ts`
**Time Estimate:** 2.5 hours
**Current Status:** Basic logging, needs alert system

**Tasks:**
- [ ] Add authorization + rate limiting + validation
- [ ] Implement alert dispatch system
- [ ] Add severity/runbook mapping
- [ ] MQTT sensor integration stub (for future)
- [ ] Immutable logging (WORM storage)
- [ ] Email/SMS/webhook alerts for critical events
- [ ] Organization scoping
- [ ] Input validation for sensor data

**Alert Dispatcher:**
```typescript
// src/lib/alerts/alert-dispatcher.ts
export async function dispatchAlert(
    severity: 'critical' | 'high' | 'medium' | 'low',
    message: string,
    organizationId: string
) {
    // Email for critical
    if (severity === 'critical') {
        await sendEmail({
            to: process.env.ALERT_EMAIL!,
            subject: `[CRITICAL] Safety Alert - ${organizationId}`,
            body: message
        })
    }

    // SMS for critical/high
    if (['critical', 'high'].includes(severity)) {
        await sendSMS({
            to: process.env.ALERT_PHONE!,
            message: `Safety Alert: ${message}`
        })
    }

    // Webhook always
    await fetch(process.env.ALERT_WEBHOOK_URL!, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            severity,
            message,
            organizationId,
            timestamp: new Date().toISOString()
        })
    })
}
```

**Severity Mapping:**
```typescript
const getSeverity = (value: number, threshold: number): string => {
    const ratio = value / threshold
    if (ratio >= 2.0) return 'critical'
    if (ratio >= 1.5) return 'high'
    if (ratio >= 1.2) return 'medium'
    return 'low'
}
```

---

#### **Agent 10: HWP Converter** ⏳
**File:** `src/actions/hwp-converter.ts`
**Time Estimate:** 1.5 hours
**Current Status:** Worker implemented, needs security

**Tasks:**
- [ ] Add authorization for job creation
- [ ] File validation (MIME type, magic numbers)
- [ ] File size limits (512MB max)
- [ ] Virus scanning (optional, requires external service)
- [ ] Organization scoping
- [ ] Rate limiting on job creation
- [ ] Input validation for file URLs

**File Validation:**
```typescript
// Validate file before processing
import { validateFile } from '@/lib/file-validation'

const fileBuffer = await fetchFile(fileUrl)

const { valid, error } = await validateFile(fileBuffer, 'application/vnd.ms-word')

if (!valid) {
    throw Errors.validation(error || 'Invalid file')
}

// Check file size
if (fileBuffer.length > 512 * 1024 * 1024) {
    throw Errors.validation('File too large (max 512MB)')
}
```

---

## 🔧 Standard Security Pattern (Copy This)

Every agent should follow this pattern:

```typescript
"use server"

import { requireResourceAccess } from '@/lib/auth/authorization'
import { enforceRateLimit } from '@/lib/rate-limit-redis'
import { handleAPIError, Errors } from '@/lib/error-handler'
import { createLogger } from '@/lib/logger'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

export async function agentAction(
    resourceId: string,
    opts?: { correlationId?: string }
) {
    const logger = createLogger({
        agent: 'agent-name',
        correlationId: opts?.correlationId,
        context: { resourceId }
    })

    try {
        // 1. Validate input format
        const idSchema = z.string().uuid("Invalid ID format")
        idSchema.parse(resourceId)

        // 2. Authorization
        const auth = await requireResourceAccess('table_name', resourceId)

        logger.info("Authorization verified", {
            userId: auth.userId,
            organizationId: auth.organizationId,
            role: auth.role
        })

        const supabase = await createClient()

        // 3. Fetch resource with ownership check
        const { data, error } = await supabase
            .from('table_name')
            .select('*')
            .eq('id', resourceId)
            .eq('organization_id', auth.organizationId)
            .single()

        if (error || !data) {
            logger.error("Resource not found", { resourceId, error })
            throw Errors.notFound("Resource")
        }

        // 4. Rate limiting
        await enforceRateLimit(`agent:${auth.organizationId}`, 10)

        // 5. Input validation
        if (!data.required_field || data.required_field.length < 10) {
            throw Errors.validation("Field too short (min 10 chars)")
        }

        // 6. Update status
        await supabase
            .from('table_name')
            .update({ status: 'PROCESSING' })
            .eq('id', resourceId)
            .eq('organization_id', auth.organizationId)

        logger.info("Status updated to PROCESSING")

        // 7. Main agent logic
        // ... your agent work here ...

        // 8. Save results with ownership check
        await supabase
            .from('table_name')
            .update({
                status: 'COMPLETED',
                result: 'data'
            })
            .eq('id', resourceId)
            .eq('organization_id', auth.organizationId)

        logger.info("Agent completed successfully", {
            resourceId,
            organizationId: auth.organizationId
        })

        return { success: true, resourceId }

    } catch (err) {
        // Update status to FAILED
        try {
            const supabase = await createClient()
            await supabase
                .from('table_name')
                .update({ status: 'FAILED' })
                .eq('id', resourceId)
        } catch (updateError) {
            logger.error("Failed to update status to FAILED", updateError)
        }

        // Use error handler for proper logging and sanitization
        const sanitized = handleAPIError(err, {
            service: 'agent-name',
            resourceId,
            correlationId: opts?.correlationId
        })

        throw sanitized.error
    }
}
```

---

## 📝 Checklist Per Agent

Before marking an agent as "complete", verify:

- [ ] ✅ Authorization with `requireResourceAccess`
- [ ] ✅ Redis rate limiting (10 req/min recommended)
- [ ] ✅ Input validation with Zod schemas
- [ ] ✅ All database queries scoped to `organization_id`
- [ ] ✅ Error sanitization with `handleAPIError`
- [ ] ✅ Structured logging (no `console.*`)
- [ ] ✅ Budget enforcement (if uses AI)
- [ ] ✅ Cost tracking (if uses AI)
- [ ] ✅ Status updates with ownership checks
- [ ] ✅ Proper error recovery (update status to FAILED)
- [ ] ✅ Non-fatal operations wrapped in try-catch
- [ ] ✅ XSS protection on user inputs

---

## 🧪 Testing Requirements

After hardening each agent, test:

### Authorization Tests
- [ ] Unauthenticated users get 401
- [ ] Users can't access other org's resources
- [ ] Role-based access works (if applicable)

### Rate Limiting Tests
```bash
# Test rate limiting (should get 429 after limit)
for i in {1..70}; do
    curl -X POST http://localhost:3000/api/agent \
        -H "Content-Type: application/json" \
        -d '{"id": "test"}'
done
```

### Input Validation Tests
- [ ] Too short input rejected
- [ ] Too long input rejected
- [ ] Invalid formats rejected
- [ ] XSS attempts sanitized

### Error Handling Tests
- [ ] Production errors don't leak stack traces
- [ ] Errors logged server-side with context
- [ ] Failed operations update status to FAILED

---

## 🚀 Deployment Checklist

Before deploying to production:

### Environment Variables
- [ ] All API keys rotated (from exposed .env.local)
- [ ] `NODE_ENV=production`
- [ ] `ALLOW_MOCK_DATA=false`
- [ ] All required variables set (see .env.example)

### Database
- [ ] Apply migration: `organization_members` table
- [ ] Apply migration: `stripe_price_id` column
- [ ] Enable RLS policies on all agent tables
- [ ] Test database connections

### Infrastructure
- [ ] Redis (Upstash) configured and tested
- [ ] Supabase storage buckets created
- [ ] MCP servers accessible
- [ ] Monitoring/alerts configured

### Security
- [ ] No secrets in code
- [ ] CSRF protection enabled
- [ ] Security headers configured
- [ ] Rate limiting working
- [ ] Authorization working

---

## 📊 Progress Tracking

Update [AGENT_HARDENING_PROGRESS.md](../AGENT_HARDENING_PROGRESS.md) after each agent:

```markdown
## ✅ Agent X: [Name] - COMPLETE

**Status:** ✅ Production-Ready
**Completion:** 100%

### Security Improvements
- [x] Authorization
- [x] Rate limiting
- [x] Input validation
- [x] Error handling
- [x] Organization scoping
```

---

## 📚 Reference Files

**Use these as references:**
- **Best Example:** [src/actions/business-plan.ts](../src/actions/business-plan.ts)
- **Second Example:** [src/actions/proposal.ts](../src/actions/proposal.ts)
- **Security Libraries:** [src/lib/auth/](../src/lib/auth/), [src/lib/error-handler.ts](../src/lib/error-handler.ts)
- **Validation Schemas:** [src/lib/validation/schemas.ts](../src/lib/validation/schemas.ts)

**Documentation:**
- **Security Audit:** [PRODUCTION_READINESS_SECURITY_AUDIT.md](../PRODUCTION_READINESS_SECURITY_AUDIT.md)
- **Migration Guide:** [SECURITY_FIXES_MIGRATION_GUIDE.md](../SECURITY_FIXES_MIGRATION_GUIDE.md)

---

## 🎯 Next Session Plan

1. **Start with quick wins:** Global Merchant + Ledger Logic (3 hours)
2. **Mock data agents:** Grant Scout + K-Startup + NaverSEO (4.5 hours)
3. **Complex agents:** ChinaSource Pro + Safety Guardian (4.5 hours)
4. **Finish with:** HWP Converter (1.5 hours)

**Total remaining:** ~13.5 hours (~2 days)

---

## ✅ Success Criteria

**Agent hardening is complete when:**
- All 10 agents follow the security pattern
- All agents have authorization checks
- All agents use Redis rate limiting
- All agents validate inputs
- All agents scope to organization
- All agents have proper error handling
- No mock data in production paths (or clearly marked)
- All critical issues from security audit resolved

**Project is production-ready when:**
- All agents hardened ✅
- Database migrations applied ✅
- API keys rotated ✅
- Tests passing ✅
- Monitoring configured ✅
- Documentation updated ✅

---

**Last Updated:** January 7, 2026
**Current Progress:** 2/10 agents (20%)
**Estimated Completion:** 2 more days of work
**Ready for:** Next development session