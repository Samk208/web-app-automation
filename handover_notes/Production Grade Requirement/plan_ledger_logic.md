# Production Upgrade Plan: Ledger Logic (Financial Reconciliation)

## 1. Goal
Upgrade **Ledger Logic** to a bank-grade reconciliation agent capable of handling complex "fuzzy matches," detecting fraud patterns, and facilitating audit-ready financial closes.

## 2. Production Grade Requirements

### A. Core Features
1.  **AI-Powered Fuzzy Matching (99% Accuracy)**:
    *   Match transactions across Bank Statements, Receipts, and ERP logic.
    *   Handle discrepancies in dates (within window), descriptions (OCR errors), and amounts (currency conversion small variances).
2.  **Anomaly & Fraud Detection**:
    *   Flag "Benford's Law" violations or duplicate invoices.
    *   Identify unusual vendor patterns (e.g., sudden price hikes).
3.  **Automated Categorization**:
    *   Auto-tag expenses to General Ledger (GL) codes based on description and amount.
4.  **Audit Trail**:
    *   Every decision (Match/Flag) must have an "AI Reasoning" log explained in plain English for auditors.

### B. Advanced Capabilities
*   **Multi-Currency Handling**: Real-time FX conversion for matching USD invoices paid in KRW.
*   **Confidence Scoring**: Assign high/medium/low confidence to matches; Auto-approve high, queue low for HITL.

## 3. Tech Stack & APIs
*   **Database**: Supabase `transactions`, `reconciliations` tables. `pgvector` for description embedding matching.
*   **AI Model**: Gemini 1.5 Pro (for complex reasoning on discrepancies).
*   **Services**:
    *   **OCR**: Google Cloud Vision or Supabase Edge Function with Tesseract (simulated upload).
    *   **Currency**: ExchangeRate-API for normalization.

## 4. Implementation Strategy

### Phase 1: Enhanced Data Ingestion
1.  Support CSV/Excel bulk upload for Bank Statements and Receipts.
2.  Implement "Pre-processing" pipeline to normalize dates and cleanse vendor names.

### Phase 2: The Matching Engine
1.  Implement tiered matching logic:
    *   Tier 1: Exact Match (ID, Amount, Date).
    *   Tier 2: Fuzzy Match (Amount, Date ±3 days, Vendor Similarity).
    *   Tier 3: Vector Semantic Match (for ambiguous descriptions).
2.  **Critic Loop**: A secondary AI "Auditor" reviews Tier 2/3 matches to confirm validity.

### Phase 3: Fraud/Anomaly Detection
1.  Implement specialized checks (Duplicates, Round Number bias, Weekend posting bias).
2.  Create "Discrepancy Resolution" UI where users can accept AI suggestion or manually fix.

## 5. Verification Plan
*   **Accuracy Test**: Run a "Golden Dataset" of 100 known transactions with 10 tricky cases (OCR typos, FX diffs). Target >95% auto-reconciliation.
*   **Red Team**: Deliberately inject a "fraudulent" duplicate invoice and ensure it is Flagged (not Matched).
