# TODO: Production Readiness Checklist
**Date:** January 7, 2026
**Priority:** Complete before production deployment

---

## 🔥 CRITICAL - Before Going Live

### 1. API Key Rotation (URGENT)
**Time:** 1-2 hours
**Priority:** 🔴 CRITICAL

The following API keys were exposed in `.env.local` and MUST be rotated:

- [ ] **Google Gemini** - Rotate at https://aistudio.google.com/app/apikey
- [ ] **OpenAI** - Rotate at https://platform.openai.com/api-keys
- [ ] **Anthropic** - Rotate at https://console.anthropic.com/settings/keys
- [ ] **Supabase Service Role** - Rotate at https://app.supabase.com/project/_/settings/api
- [ ] **Upstash Redis** - Rotate at https://console.upstash.com/
- [ ] **CloudConvert** - Rotate at https://cloudconvert.com/dashboard/api/v2/keys
- [ ] **Naver Client Secret** - Rotate at https://developers.naver.com/apps/
- [ ] **ScrapeOwl** - Rotate at https://scrapeowl.com/
- [ ] **Webshare** - Rotate at https://www.webshare.io/

**After rotation:**
- [ ] Update keys in production secrets manager (not .env.local)
- [ ] Test all integrations with new keys
- [ ] Delete old `.env.local` from git history

---

### 2. Database Migrations
**Time:** 30 minutes
**Priority:** 🔴 CRITICAL

- [ ] **Create `organization_members` table**
  - File: `supabase/migrations/20260107000000_add_organization_members.sql`
  - See: [SECURITY_FIXES_MIGRATION_GUIDE.md](../SECURITY_FIXES_MIGRATION_GUIDE.md#21-add-authorization-tables)

- [ ] **Add `stripe_price_id` to proposals**
  - File: `supabase/migrations/20260107000001_add_stripe_price_id.sql`

- [ ] **Apply RLS policies** to all agent tables
  - business_plans, proposals, grant_applications, safety_logs
  - hwp_jobs, messages, knowledge_base

- [ ] **Test migrations locally:**
  ```bash
  supabase db reset --yes
  ```

- [ ] **Apply to production:**
  ```bash
  supabase db push
  ```

---

### 3. Environment Configuration
**Time:** 30 minutes
**Priority:** 🔴 CRITICAL

- [ ] Copy `.env.example` to production environment
- [ ] Set `NODE_ENV=production`
- [ ] Set `ALLOW_MOCK_DATA=false`
- [ ] Add missing variables:
  - [ ] `KAKAO_WEBHOOK_SECRET`
  - [ ] `SESSION_SECRET` (generate: `openssl rand -hex 32`)
  - [ ] `STRIPE_SECRET_KEY`
  - [ ] `STRIPE_WEBHOOK_SECRET`

---

## 🟠 HIGH PRIORITY - Complete This Week

### 4. Complete Agent Hardening (8 remaining)
**Time:** ~13.5 hours
**Priority:** 🟠 HIGH

#### Quick Wins (3-4 hours)
- [ ] **Global Merchant** - Basic security (1h)
- [ ] **Ledger Logic** - Basic security + HITL (1.5h)
- [ ] **Grant Scout** - Security + mock data note (1.5h)

#### Mock Data Agents (3 hours)
- [ ] **K-Startup Navigator** - Security + mock note (1.5h)
- [ ] **NaverSEO Pro** - Security + simulation note (1.5h)

#### Complex Agents (7 hours)
- [ ] **ChinaSource Pro** - Security + proxy enforcement + retry (2h)
- [ ] **Safety Guardian** - Security + alert system (2.5h)
- [ ] **HWP Converter** - Security + file validation (1.5h)

**Reference:** [AGENT_HARDENING_HANDOVER.md](./AGENT_HARDENING_HANDOVER.md)

---

### 5. Security Middleware
**Time:** 2 hours
**Priority:** 🟠 HIGH

- [ ] **Implement CSRF middleware**
  - File: `src/middleware.ts`
  - See: [SECURITY_FIXES_MIGRATION_GUIDE.md](../SECURITY_FIXES_MIGRATION_GUIDE.md#51-create-middleware-for-csrf-and-headers)

- [ ] **Add security headers**
  - CSP, X-Frame-Options, X-Content-Type-Options
  - HSTS for production

- [ ] **Test CSRF protection**
  - Verify tokens required for state-changing requests
  - Verify webhooks excluded from CSRF

---

### 6. Testing
**Time:** 4 hours
**Priority:** 🟠 HIGH

#### Unit Tests
- [ ] Write tests for authorization helpers
- [ ] Write tests for rate limiting
- [ ] Write tests for error sanitization
- [ ] Write tests for input validation

#### Integration Tests
- [ ] Test Business Plan Master end-to-end
- [ ] Test Proposal Architect end-to-end
- [ ] Test authorization across all agents
- [ ] Test rate limiting works with Redis

#### Security Tests
- [ ] Test unauthorized access returns 401
- [ ] Test cross-org access returns 403
- [ ] Test rate limit returns 429
- [ ] Test CSRF protection works
- [ ] Test error messages don't leak info

---

## 🟡 MEDIUM PRIORITY - Next 2 Weeks

### 7. Monitoring & Alerts
**Time:** 3 hours
**Priority:** 🟡 MEDIUM

- [ ] **Set up logging aggregation**
  - Option: Datadog, Splunk, or CloudWatch

- [ ] **Configure alerts**
  - High error rate (>5%)
  - Rate limit hits (>100/hour)
  - Budget exceeded
  - Cost anomalies (3x average)
  - Authorization failures (potential attack)

- [ ] **Create dashboards**
  - Agent usage by organization
  - AI cost per agent
  - Error rates
  - Response times

---

### 8. Performance Optimization
**Time:** 4 hours
**Priority:** 🟡 MEDIUM

- [ ] **Database indexes**
  - `organization_members(organization_id)`
  - `organization_members(user_id)`
  - `business_plans(organization_id, status)`
  - `proposals(organization_id, status)`

- [ ] **Query optimization**
  - Use `select('id, name')` instead of `select('*')`
  - Add pagination to large queries

- [ ] **Caching strategy**
  - Cache organization memberships (Redis)
  - Cache knowledge base items (Redis)
  - CDN for static assets

---

### 9. Documentation
**Time:** 2 hours
**Priority:** 🟡 MEDIUM

- [ ] **Update README.md**
  - Add security section
  - Add deployment instructions
  - Add testing instructions

- [ ] **API Documentation**
  - Document all server actions
  - Document required permissions
  - Document rate limits

- [ ] **Runbook**
  - Common issues and solutions
  - Emergency procedures
  - Rollback procedures

---

## 🟢 LOW PRIORITY - Nice to Have

### 10. Advanced Features
**Time:** Variable
**Priority:** 🟢 LOW

- [ ] **Implement real data integrations**
  - K-Startup scraper (Playwright)
  - 1688.com scraper (with proxy)
  - Naver SEO crawler (Lighthouse + SERP API)

- [ ] **Vector search for RAG**
  - Upgrade Proposal Architect to use pgvector
  - Semantic search instead of keyword matching

- [ ] **HWP on-prem converter**
  - Alternative to CloudConvert
  - Python worker with pyhwp

- [ ] **Advanced HITL workflows**
  - Multi-stage approvals
  - Approval routing by role
  - Approval history

---

## 📋 Pre-Deployment Checklist

Run through this checklist before deploying to production:

### Security
- [ ] All API keys rotated
- [ ] No secrets in code or git history
- [ ] CSRF protection enabled
- [ ] Security headers configured
- [ ] RLS policies enabled
- [ ] Authorization on all endpoints
- [ ] Rate limiting working
- [ ] Input validation comprehensive
- [ ] Error messages sanitized

### Database
- [ ] All migrations applied
- [ ] Indexes created
- [ ] RLS policies tested
- [ ] Backups configured

### Application
- [ ] All agents hardened
- [ ] Tests passing
- [ ] No console.* statements
- [ ] Logging configured
- [ ] Error handling complete
- [ ] Environment variables set

### Infrastructure
- [ ] Redis configured and tested
- [ ] Supabase storage accessible
- [ ] MCP servers responding
- [ ] CDN configured (if needed)
- [ ] DNS configured
- [ ] SSL certificates valid

### Monitoring
- [ ] Logs aggregated
- [ ] Alerts configured
- [ ] Dashboards created
- [ ] Status page (optional)

---

## 🎯 Weekly Sprint Plan

### Week 1: Security Hardening
**Goal:** Complete all 8 remaining agents

**Mon-Tue:**
- [ ] Global Merchant
- [ ] Ledger Logic
- [ ] Grant Scout
- [ ] K-Startup Navigator

**Wed-Thu:**
- [ ] NaverSEO Pro
- [ ] ChinaSource Pro
- [ ] Safety Guardian

**Fri:**
- [ ] HWP Converter
- [ ] Testing & bug fixes

---

### Week 2: Testing & Deployment Prep
**Goal:** Production-ready deployment

**Mon:**
- [ ] CSRF middleware
- [ ] Security headers
- [ ] Unit tests

**Tue:**
- [ ] Integration tests
- [ ] Security tests
- [ ] Load tests

**Wed:**
- [ ] Database migrations (staging)
- [ ] API key rotation
- [ ] Environment setup

**Thu:**
- [ ] Deploy to staging
- [ ] Smoke tests
- [ ] Bug fixes

**Fri:**
- [ ] Deploy to production
- [ ] Monitoring setup
- [ ] Final verification

---

### Week 3: Polish & Monitor
**Goal:** Stability and optimization

**Mon-Tue:**
- [ ] Performance optimization
- [ ] Dashboard setup
- [ ] Alert tuning

**Wed-Thu:**
- [ ] Documentation
- [ ] Runbook creation
- [ ] Team training

**Fri:**
- [ ] Final review
- [ ] Retrospective
- [ ] Next sprint planning

---

## 📊 Success Metrics

**Security:**
- Zero exposed credentials
- 100% authorization coverage
- Rate limiting on all endpoints
- Input validation on all inputs

**Functionality:**
- All 10 agents production-ready
- P95 latency < 3 seconds
- Error rate < 1%
- Uptime > 99.5%

**Performance:**
- Response time < 2s for sync operations
- Budget enforcement working
- Cost tracking accurate
- Rate limiting effective

---

## 🆘 Getting Help

If you encounter issues:

1. **Check documentation:**
   - [PRODUCTION_READINESS_SECURITY_AUDIT.md](../PRODUCTION_READINESS_SECURITY_AUDIT.md)
   - [SECURITY_FIXES_MIGRATION_GUIDE.md](../SECURITY_FIXES_MIGRATION_GUIDE.md)
   - [AGENT_HARDENING_HANDOVER.md](./AGENT_HARDENING_HANDOVER.md)

2. **Reference implementations:**
   - [src/actions/business-plan.ts](../src/actions/business-plan.ts)
   - [src/actions/proposal.ts](../src/actions/proposal.ts)

3. **Common patterns:**
   - See "Standard Security Pattern" in handover doc

---

**Created:** January 7, 2026
**Status:** 2/10 agents complete
**Next:** Continue with remaining 8 agents