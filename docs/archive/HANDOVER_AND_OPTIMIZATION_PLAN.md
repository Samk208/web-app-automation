# AI Automation Agency: Handover & Optimization Report

**Date**: January 5, 2026
**Version**: 1.0 (MVP Handover)
**Author**: Antigravity (Google Deepmind)

---

## 📢 Executive Summary

This document serves as the official handover for the **AI Automation Agency** platform. We have successfully deployed **10 MVP Agents** across 4 key sectors (Korea-Specific, Trade, Professional Services, Deep Tech/Startup).

While currently functional as high-fidelity MVPs (Minimum Viable Products) demonstrating core logic and AI integration, transforming these into **"Production First-Class Grade"** SaaS products requires specific architectural upgrades, data integrations, and robustness improvements.

---

## 🏛️ Sector 1: Korea-Specific Utility

### 1. HWP Document Converter
**Current Capability**:
*   Accepts `.hwp` files.
*   Simulates extraction and uses AI to reformat content into HTML/PDF.
*   Provides a simple drag-and-drop web UI.

**Path to Production Grade**:
*   **True HWP Parsing**: Replace simulated parsing with a dedicated backend service using `libhwp` (C++) or `pyhwp` (Python) to extract actual binary data structure, not just text.
*   **Layout Fidelity**: The current AI reformatting loses complex grid/table layouts common in government docs. Implement **Visual Layout Analysis** (OCR) to preserve exact coordinates.
*   **Scale**: Move from serverless functions (Next.js) to a queue-based worker architecture (BullMQ + Redis) to handle 100+ page documents without timeout.

### 2. KakaoTalk CRM Bot
**Current Capability**:
*   Simulates chat interface.
*   Uses RAG (Retrieval Augmented Generation) to answer FAQs.
*   Triggers "Human Handoff" logic.

**Path to Production Grade**:
*   **Official API Integration**: Connect to **Kakao i Open Builder** or **Solapi** for real message transmission.
*   **Session State Management**: Use Redis to maintain conversation context across days/weeks, remembering user preferences (e.g., "User asked about pricing yesterday").
*   **Omnichannel**: Decouple the bot logic to support Line, Telegram, and Naver TalkTalk simultaneously.

---

## 🌏 Sector 2: Cross-Border Trade (China-Korea)

### 3. ChinaSource Pro (Sourcing Agent)
**Current Capability**:
*   Takes user product queries.
*   Simulates searching Chinese marketplaces.
*   AI estimates Landed Cost (Shipping/Tariffs).

**Path to Production Grade**:
*   **Real-Time Scraping**: Implement **Puppeteer/Playwright** stealth scrapers or use **Bright Data** proxies to fetch live real-time pricing from 1688.com and Alibaba (bypassing login walls).
*   **Logistic API**: Integrate with **FedEx/DHL** or freight forwarder APIs (e.g., Flexport) for accurate, weight-based shipping quotes instead of heuristic estimates.
*   **Currency Hedging**: Add real-time FX rate buffers (CNY -> KRW) to protect against volatility during the sourcing process.

### 4. NaverSEO Pro
**Current Capability**:
*   Analyzes URLs.
*   AI simulates a "Naver Bot" crawl to score content.
*   Suggests keywords.

**Path to Production Grade**:
*   **SERP Data**: Integrate with **DataForSEO** or **SerpApi** to get *actual* Naver search volume and competition metrics.
*   **Technical Audit**: Implement a real crawler (Golang/Python) to check Lighthouse scores, broken links, and Canonical tags, rather than relying on LLM inference.
*   **Keyword Tracking**: Add a persistent "Rank Tracker" job that checks keyword positions daily.

---

## 💼 Sector 3: Professional Services

### 5. Ledger Logic (AI Bookkeeper)
**Current Capability**:
*   Fuzzy matches transactions to receipts.
*   Categorizes expenses.

**Path to Production Grade**:
*   **Bank Feeds**: Integrate **Plaid** (Global) or **Codef** (Korea) to fetch real-time bank transactions instead of CSV uploads.
*   **OCR Accuracy**: Integrate **AWS Textract** or **Naver Clova OCR** for receipt scanning, as they handle Korean receipts/handwriting significantly better than generic LLM vision.
*   **ERP Sync**: Bi-directional sync with **Xero**, **QuickBooks**, or **Douzone** (Korean ERP) to push reconciled entries automatically.

### 6. Proposal Architect
**Current Capability**:
*   RAG based on static case studies.
*   Generates consulting proposals in Markdown.

**Path to Production Grade**:
*   **Dynamic Learning**: Allow users to "Upload Past Winning Proposals". The agent should fine-tune (LoRA) or strictly RAG on *that specific client's* style and tone.
*   **Pricing Engine**: connect to a "Rate Card" database. The AI currently hallucinates prices; it should strict-check a CPQ (Configure, Price, Quote) logic to ensure profitability.
*   **Docx/PPTX Export**: Generate native Office files using `python-docx` or `pptx` libraries, as consultants rarely send Markdown to clients.

---

## 🔬 Sector 4: Deep Tech & Startup Support

### 7. R&D Grant Scout
**Current Capability**:
*   Matches startup profile to mock Govt Programs.
*   Generates 1-page abstracts.

**Path to Production Grade**:
*   **Live Crawler**: A daily scraper for **K-Startup.go.kr** and **NIPA** websites to populate the database with real, active grant opportunities.
*   **Eligibility Engine**: A non-AI rules engine (Hard Logic) to strictly filter by "Age < 7 years", "Revenue < 10B KRW", etc., to prevent AI from suggesting ineligible grants.
*   **Full Draft Generation**: Expand from "Abstract" to generating the full 20-page PSST (Problem, Solution, Scale-up, Team) standard HWP application file.

### 8. Safety Guardian (Industrial IoT)
**Current Capability**:
*   Simulates sensor stream.
*   Detects >80C threshold.
*   Logs compliance notes.

**Path to Production Grade**:
*   **Protocol Support**: Support **MQTT**, **Modbus**, and **OPC-UA** to ingest data from real PLC controllers (Siemens, Mitsubishi) in factories.
*   **Edge Computing**: Deploy the AI model (quantized) to a local Edge Gateway (e.g., Raspberry Pi or NVIDIA Jetson) to run *offline* in the factory, sending only alerts to the cloud.
*   **Legal Liability**: Immutable logs. Use a **Blockchain** ledger or **WORM** (Write Once Read Many) storage for compliance logs so they can stand up in court.

### 9. K-Startup Navigator
**Current Capability**:
*   Strategic roadmap generation.
*   Mock database of programs (TIPS, OASIS).

**Path to Production Grade**:
*   **Success Prediction**: Train a classifier model on thousands of past successful vs. failed applications to give a "Probability of Success" score (e.g., "Your patent portfolio increases TIPS chances by 22%").
*   **Mentor Matching**: Auto-match startups with registered Accelerators/VCs in the database who specialize in their sector.

### 10. Business Plan Master
**Current Capability**:
*   Translates/Formats English notes to Korean Gov-Standard HWP sections.
*   Renders output in UI.

**Path to Production Grade**:
*   **Native HWP Generation**: Use **Hancom Office Automation scripts** or **Hwp.Net** to generate the actual `.hwp` binary file with perfect government formatting (fonts, margins, tables) which is mandatory for submission.
*   **Financial modeling**: Integrate a "Spreadsheet Agent" that can generate the Excel financial projection (Balance Sheet, P&L) ensuring the numbers matched the text narrative.

---

## 🚀 General Platform Recommendations

1.  **Observability**: Implement traces (LangSmith or Helicone) to debug *why* an agent gave a specific answer.
2.  **Rate Limiting**: Protect your Gemini/OpenAI keys. End-users will abuse unlimited generations.
3.  **Human-in-the-Loop (HITL)**: For "High Stakes" agents (Legal, Safety, Grants), always force a "Review Step" where a human admin must approve the AI output before it is finalized or sent.
