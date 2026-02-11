# Production Upgrade Plan: Proposal Architect (Consulting)

## 1. Goal
Upgrade **Proposal Architect** into an enterprise-grade **RAG-powered B2B Sales Engineer**. It should generate high-value consulting proposals that strictly adhere to improved internal knowledge bases and pricing strategies.

## 2. Production Grade Requirements

### A. Core Features
1.  **Advanced RAG Implementation**:
    *   Ingest "Success Stories," "Case Studies," "Team Resumes," and "Pricing Tables" into a vector store.
    *   **Citation**: Every claim in the proposal must cite the source document (e.g., "[Source: Q3 2024 Samsung Case Study]").
2.  **Automated Costing**:
    *   Integrate a "Rate Card" logic. Automatically calculate project budgets based on estimated hours * rate cards.
    *   Enforce "Minimum Margin" rules.
3.  **Document Formatting (DOCX/PDF)**:
    *   Output professional, branded documents (not just markdown).
    *   Support Tables, Gantt Charts (text-based or rendered), and signature blocks.

### B. Advanced Capabilities
*   **Proposal Logic Check**:
    *   Critic Loop: Check for consistency (e.g., "Timeline says 3 months, but Budget only covers 1 month").
*   **Tone Adaptation**:
    *   "Aggressive/Growth" vs "Conservative/Risk-Averse" tone toggle.

## 3. Tech Stack & APIs
*   **Database**: Supabase `knowledge_base` with `pgvector`.
*   **AI**: Gemini 1.5 Pro (Long context window for reading large RFPs).
*   **Doc Gen**: `docx` library (Node.js) or `html-to-pdf` services.

## 4. Implementation Strategy

### Phase 1: Knowledge Base & RAG
1.  Build a "Knowledge Ingestion" UI (`/dashboard/proposal-architect/knowledge`).
2.  Chunking Strategy: Split documents by "Section" rather than arbitrary tokens to preserve context.
3.  Implement "Hybrid Search" (Keyword Match + Semantic Match) for finding relevant Case Studies.

### Phase 2: Generation Engine
1.  Input: Parse RFP (Request for Proposal) PDF/Text.
2.  Orchestrator: Deconstruct RFP into requirements.
3.  Generation: Parallelly generate "Approach," "Timeline," "Team," "Budget".
4.  Assembly: Combine into a coherent narrative.

### Phase 3: Validation & Output
1.  **Critic Agent**: Review Draft against RFP requirements matrix.
2.  Export: Render final `docx` file.

## 5. Verification Plan
*   **RAG Accuracy**: Ask for a specific case study detail. Ensure it is retrieved and cited.
*   **Math Check**: Input standard hours -> Check Total Budget matches Rate Card.
*   **Completeness**: Feed a 10-point RFP. Ensure the generated proposal addresses all 10 points.
