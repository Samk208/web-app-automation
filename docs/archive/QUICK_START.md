# 🚀 Quick Start: MCP + Cost Tracking

**5-Minute Setup Guide**

---

## Step 1: Apply Database Migrations (2 minutes)

```bash
cd web-app
supabase db reset --yes
```

**Expected output**:
```
Resetting database...
Applying migration 20260106000000_add_document_urls.sql...
Applying migration 20260106010000_ai_cost_tracking.sql...
Applying migration 20260106020000_add_subscription_tier.sql...
✅ Database ready
```

---

## Step 2: Start Development Server (30 seconds)

```bash
npm run dev
```

---

## Step 3: Test Business Plan Generation (2 minutes)

1. **Navigate to**: http://localhost:3000/dashboard/business-plan-master

2. **Enter test data**:
   - Input materials: "AI startup for healthcare diagnostics"
   - Target program: "TIPS 프로그램"

3. **Click "Generate Plan"**

4. **Watch the logs** (in terminal):
   ```
   ✅ Budget check passed: $0.000200
   ⏳ Status set to GENERATING
   💰 AI cost tracked: agent=business-plan, cost=$0.000165
   📄 Generating DOCX document via MCP...
   ✅ Document generated and uploaded
   ```

5. **Get download link** in response:
   ```json
   {
     "success": true,
     "downloadUrl": "https://...supabase.co/.../plan.docx?token=..."
   }
   ```

6. **Click download** → Opens Korean DOCX file with proper formatting

---

## Step 4: Verify Cost Tracking (1 minute)

**Check database**:
```sql
-- In Supabase Studio or psql:
SELECT
  agent_name,
  model,
  input_tokens,
  output_tokens,
  cost_usd,
  created_at
FROM ai_usage_logs
ORDER BY created_at DESC
LIMIT 5;
```

**Expected result**:
```
agent_name     | model              | input_tokens | output_tokens | cost_usd   | created_at
business-plan  | gemini-1.5-flash   | 200          | 500           | 0.000165   | 2026-01-06 ...
```

---

## Step 5: Test Budget Limit (1 minute)

**Simulate exceeded budget**:
```sql
-- Set your org to free tier ($10/month)
UPDATE organizations
SET subscription_tier = 'free'
WHERE id = (SELECT organization_id FROM business_plans LIMIT 1);

-- Add fake usage over $10
INSERT INTO ai_usage_logs (
  organization_id,
  agent_name,
  model,
  input_tokens,
  output_tokens,
  cost_usd
)
SELECT
  organization_id,
  'test',
  'gemini-1.5-flash',
  1000,
  1000,
  11.00
FROM business_plans LIMIT 1;
```

**Try to generate another plan**:
- Should **fail** with error: "Monthly AI budget exceeded. Used: $11.00, Budget: $10.00 (free tier)"

---

## ✅ You're Done!

If all 5 steps worked:
- ✅ MCP document generation is working
- ✅ Cost tracking is working
- ✅ Budget enforcement is working

---

## 🐛 Troubleshooting

### "MCP server not responding"
```bash
# Test MCP manually:
npx -y thiagotw10-document-generator-mcp
```

### "Column 'document_url' does not exist"
```bash
# Re-run migrations:
cd web-app
supabase db reset --yes
```

### "Budget check failed"
- Check `organizations` table has `subscription_tier` column
- Run migration 20260106020000 again

---

## 📚 Full Documentation

- **Complete Summary**: `INTEGRATION_COMPLETE_SUMMARY.md`
- **MCP Details**: `MCP_INTEGRATION_SUMMARY.md`
- **Cost Tracking**: `COST_TRACKING_COMPLETE.md`
- **MCP Library**: `src/lib/mcp/README.md`

---

**Total Time**: 5-7 minutes
**Status**: ✅ Production-ready
