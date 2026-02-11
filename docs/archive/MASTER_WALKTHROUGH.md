# AI Automation Agency - Master Verification Guide

**Project Status**: 100% Complete (10/10 Blueprints Implemented)
**Tech Stack**: Next.js 14, Supabase (PgVector + Realtime), Vercel AI SDK (Google Gemini)

---

## 🏗️ 1. Korea-Specific Agents

### Blueprint #1: HWP Document Converter
- **URL**: `/dashboard/hwp-converter`
- **Function**: Converts legacy `.hwp` files (Korean Govt standard) to Web-ready PDF/HTML.
- **Verification**: Upload a dummy file -> Monitor console -> View "Converted" badge.

### Blueprint #2: KakaoTalk CRM Bot
- **URL**: `/dashboard/kakao-crm`
- **Function**: Managing customer service via KakaoTalk channel simulation.
- **Verification**: Type a query -> See AI Auto-reply -> Check "Human Handoff" trigger.

### Blueprint #3: ChinaSource Pro (Sourcing Agent)
- **URL**: `/dashboard/china-source`
- **Function**: Finds suppliers on 1688/Alibaba, calculates Landed Cost (Shipping + Tariffs).
- **Verification**: Enter Product ("Wireless Earbuds") -> View Supplier Table with calculated margins.

### Blueprint #4: NaverSEO Pro
- **URL**: `/dashboard/naver-seo`
- **Function**: Audits websites for Naver Search Engine Optimization compliance.
- **Verification**: Enter URL (`example.com`) -> View Audit Score & Keyword opportunities.

---

## 💼 2. Professional Services

### Blueprint #5: Ledger Logic (AI Bookkeeper)
- **URL**: `/dashboard/reconciliation`
- **Function**: Reconciles bank feed transactions with receipt images using fuzzy matching.
- **Verification**: Click "Start Reconciliation" -> Observe "Matched" vs "Unreconciled" buckets.

### Blueprint #6: Proposal Architect (RAG Agent)
- **URL**: `/dashboard/proposal-gen`
- **Function**: Generates consulting proposals using Case Study RAG (Retrieval Augmented Generation).
- **Verification**: Enter Client Requirements -> Download generated Markdown proposal.

---

## 🔬 3. Deep Tech R&D

### Blueprint #7: R&D Grant Scout
- **URL**: `/dashboard/grant-scout`
- **Function**: Matches startups to Deep Tech grants (TIPS) & drafts abstracts.
- **Verification**: Upload Deck -> View Matched Programs & Auto-generated Abstract.

### Blueprint #8: Safety Guardian (IoT Agent)
- **URL**: `/dashboard/smart-factory`
- **Function**: Monitors sensor streams for anomalies (Temp > 80C) & logs compliance audits.
- **Verification**: Start Stream -> Wait for Critical Alert -> Check Compliance Log.

---

## 🚀 4. Startup Support

### Blueprint #9: K-Startup Navigator
- **URL**: `/dashboard/k-startup-navigator`
- **Function**: Strategic funding roadmap based on industry & stage.
- **Verification**: Select Industry/Stage -> View Fit Scores for TIPS/OASIS.

### Blueprint #10: Business Plan Master
- **URL**: `/dashboard/business-plan-master`
- **Function**: Transforms English notes into Korean Government Standard (HWP style) business plans.
- **Verification**: Paste English text -> View Translated & Formatted Sections (Motivation, Market, Execution).

---

## 🛠️ Technical Implementation Summary

All agents follow the **"Server Action + AI"** pattern:
1.  **Frontend**: Triggers Server Action (loading state).
2.  **Server Action**:
    *   Authenticates via Supabase.
    *   Constructs specific Prompts for Google Gemini.
    *   Calls `generateObject` for structured JSON output.
    *   Updates Supabase Database.
3.  **Frontend**: Subscribes to Supabase Realtime for instant UI updates.

**Repository**: `c:/Users/Lenovo/Desktop/AI Automation Agency/PRD`
