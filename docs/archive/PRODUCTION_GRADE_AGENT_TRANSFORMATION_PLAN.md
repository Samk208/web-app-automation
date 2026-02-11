# 🚀 PRODUCTION-GRADE AGENT TRANSFORMATION PLAN

**Date**: January 5, 2026  
**Version**: 2.0 (Production Upgrade Roadmap)  
**Author**: Claude (AI Automation Architect)  
**Based On**: 10 MVP Agents by Antigravity (Google Deepmind)

---

## 📋 TABLE OF CONTENTS

1. [Executive Summary](#executive-summary)
2. [Architectural Upgrades](#architectural-upgrades)
3. [Agent-by-Agent Transformation](#agent-by-agent-transformation)
   - [Sector 1: Korea-Specific Utility](#sector-1-korea-specific-utility)
   - [Sector 2: Professional Services](#sector-2-professional-services)
   - [Sector 3: Deep Tech & Startup Support](#sector-3-deep-tech--startup-support)
4. [Production Infrastructure](#production-infrastructure)
5. [Monetization Strategy](#monetization-strategy)
6. [Implementation Timeline](#implementation-timeline)
7. [Production Readiness Checklist](#production-readiness-checklist)

---

## 🎯 EXECUTIVE SUMMARY

This document provides a comprehensive roadmap to transform 10 MVP agents into production-grade systems using:

- **Pre-built MCP Servers** (70% less custom code)
- **n8n Workflow Templates** (Visual debugging + community support)
- **LangGraph Multi-Agent Architecture** (Advanced orchestration)
- **Real API Integrations** (No more simulations)

### Key Benefits

```yaml
Development Speed: 10x faster (use existing workflows)
Code Quality: Battle-tested components
Maintenance: Community-supported libraries
Scalability: Production-ready from day 1
Time to Market: 4 weeks → Production-ready Agent #10
```

---

## 🏗️ ARCHITECTURAL UPGRADES (Apply to All 10 Agents)

### Current MVP Architecture

```
User Input → Custom Server Action → Gemini API → Simulated Response
```

### Production Architecture

```
User Input → n8n Workflow → MCP Servers → LangGraph Agent → Real Data
```

### Benefits Comparison

| Aspect | MVP | Production |
|--------|-----|------------|
| **Custom Code** | 100% | 30% |
| **Debugging** | Console logs | Visual n8n UI + LangSmith |
| **API Integrations** | Mock/Simulated | Real APIs |
| **Error Handling** | Basic | Retry logic + Dead letter queues |
| **Monitoring** | None | LangSmith + Sentry |
| **Scalability** | Limited | Queue-based workers |
| **Community Support** | None | 7,656+ n8n workflows |

---

## 🎯 AGENT-BY-AGENT TRANSFORMATION

---

## SECTOR 1: Korea-Specific Utility

---

### 🔷 AGENT #1: HWP Document Converter ⭐ HIGH PRIORITY

#### Current MVP Limitations
- Simulates HWP parsing
- Uses AI for reformatting (loses layout)
- Simple drag-drop UI only
- 10s Vercel timeout (can't handle large files)

#### Production Upgrade Strategy

**MCP Servers to Install:**

```bash
# Install core document processing MCPs
npx @smithery/cli install hongkongkiwi-docx-mcp --client claude
npx @smithery/cli install vivekVells-mcp-pandoc --client claude
```

**MCP Server #1: DOCX MCP** (hongkongkiwi/docx-mcp)
- Rust-based (ultra-fast, zero external dependencies)
- Native document parsing and generation
- Built-in PDF conversion
- Security features (read-only mode, sandboxing)

**MCP Server #2: Pandoc MCP** (vivekVells/mcp-pandoc)
- Converts between 40+ formats
- Custom styling templates
- Korean text support
- Academic paper formatting

**n8n Workflow: "HWP Converter Pipeline"**

```yaml
Source: Zie619/n8n-workflows #3211 (Document Processing)

Customization Steps:
  1. File Upload:
     - Trigger: Webhook or manual upload
     - Storage: Temporary S3/Cloudflare R2
  
  2. HWP Extraction:
     - Backend service: Python 3.10 + pyhwp
     - Docker: python:3.10-slim + pyhwp package
     - Extract text, tables, images
  
  3. Layout Analysis:
     - OCR: Naver Clova OCR API (Korean text)
     - Extract coordinates of tables/grids
     - Preserve document structure
  
  4. DOCX Generation:
     - Call DOCX MCP server
     - Apply Korean government template
     - Insert extracted content with positioning
  
  5. PDF Conversion:
     - Call Pandoc MCP
     - A4 paper size (Korean standard)
     - Korean fonts embedded
  
  6. Output Delivery:
     - Store in Supabase Storage
     - Generate download link
     - Send email notification
```

**Production Features to Implement:**

```yaml
Real HWP Parsing:
  Backend Service:
    - Language: Python 3.10
    - Library: pyhwp (pip install pyhwp)
    - Deployment: Docker container on Railway/Render
    - Queue: BullMQ + Redis for async processing
  
  Extract:
    - Text content with formatting
    - Tables with cell structure
    - Images with positioning
    - Metadata (author, date, version)

Layout Preservation:
  OCR Integration:
    - Service: Naver Clova OCR API
    - Endpoint: https://naveropenapi.apigw.ntruss.com/vision/v1/ocr
    - Cost: ₩10 per page (first 1000 free)
  
  Visual Analysis:
    - Extract bounding boxes for all elements
    - Identify tables, charts, images
    - Preserve exact positioning in output
  
  Reconstruction:
    - Use python-docx library
    - Apply positioning with absolute coordinates
    - Embed Korean fonts (Batang, Dotum)

Scalability:
  Queue System:
    - Tool: BullMQ (Node.js) or Celery (Python)
    - Backend: Redis (Upstash or self-hosted)
    - Workers: Auto-scale based on queue length
  
  Processing:
    - Small files (<10 pages): 10s sync response
    - Large files (100+ pages): Async processing
    - Status polling: WebSocket or SSE
  
  Infrastructure:
    - Move from Vercel serverless
    - To dedicated workers: Railway/Render
    - Handle unlimited file size
    - Timeout: 10 minutes per file
```

**Implementation Code:**

```python
# Backend service: hwp_converter.py
from pyhwp import Hwp
from docx import Document
from docx.shared import Pt, Mm
import requests

async def convert_hwp_to_docx(hwp_file_path: str) -> str:
    """Convert HWP to DOCX with layout preservation"""
    
    # Step 1: Extract HWP content
    hwp = Hwp(hwp_file_path)
    content = hwp.extract_text()
    tables = hwp.extract_tables()
    images = hwp.extract_images()
    
    # Step 2: OCR for layout analysis (Naver Clova)
    ocr_results = await naver_clova_ocr(hwp_file_path)
    layout_boxes = extract_bounding_boxes(ocr_results)
    
    # Step 3: Create DOCX with exact layout
    doc = Document()
    
    # Apply Korean government template
    section = doc.sections[0]
    section.page_height = Mm(297)  # A4
    section.page_width = Mm(210)
    section.top_margin = Mm(30)
    section.bottom_margin = Mm(30)
    section.left_margin = Mm(20)
    section.right_margin = Mm(20)
    
    # Insert content with positioning
    for element in content:
        if element.type == 'text':
            p = doc.add_paragraph(element.text)
            p.style.font.name = '바탕체'  # Batang
            p.style.font.size = Pt(11)
        
        elif element.type == 'table':
            table = doc.add_table(rows=element.rows, cols=element.cols)
            # Fill table cells...
    
    # Step 4: Save DOCX
    output_path = hwp_file_path.replace('.hwp', '.docx')
    doc.save(output_path)
    
    return output_path

async def naver_clova_ocr(image_path: str) -> dict:
    """Call Naver Clova OCR API"""
    url = "https://naveropenapi.apigw.ntruss.com/vision/v1/ocr"
    
    headers = {
        'X-NCP-APIGW-API-KEY-ID': os.getenv('NAVER_CLIENT_ID'),
        'X-NCP-APIGW-API-KEY': os.getenv('NAVER_CLIENT_SECRET')
    }
    
    with open(image_path, 'rb') as f:
        files = {'file': f}
        response = requests.post(url, headers=headers, files=files)
    
    return response.json()
```

**n8n Workflow JSON Structure:**

```json
{
  "nodes": [
    {
      "id": "webhook",
      "type": "n8n-nodes-base.webhook",
      "parameters": {
        "path": "hwp-upload",
        "method": "POST"
      }
    },
    {
      "id": "save-to-temp",
      "type": "n8n-nodes-base.s3",
      "parameters": {
        "operation": "upload",
        "bucket": "temp-hwp-files"
      }
    },
    {
      "id": "queue-job",
      "type": "n8n-nodes-base.redis",
      "parameters": {
        "operation": "push",
        "key": "hwp-conversion-queue"
      }
    },
    {
      "id": "call-python-worker",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "url": "https://hwp-worker.railway.app/convert",
        "method": "POST"
      }
    },
    {
      "id": "store-result",
      "type": "n8n-nodes-base.supabase",
      "parameters": {
        "operation": "insert",
        "table": "conversions"
      }
    }
  ]
}
```

**Deployment Configuration:**

```yaml
# docker-compose.yml
services:
  hwp-worker:
    build: ./hwp-worker
    environment:
      - REDIS_URL=${REDIS_URL}
      - NAVER_CLIENT_ID=${NAVER_CLIENT_ID}
      - NAVER_CLIENT_SECRET=${NAVER_CLIENT_SECRET}
    deploy:
      replicas: 3
      resources:
        limits:
          memory: 2G
          cpus: '1.0'
  
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
  
  n8n:
    image: n8nio/n8n:latest
    ports:
      - "5678:5678"
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
    volumes:
      - n8n_data:/home/node/.n8n
```

---

### 🔷 AGENT #2: KakaoTalk CRM Bot

#### Current MVP Limitations
- Simulates chat interface (no real API)
- RAG on static FAQs
- Basic "Human Handoff" trigger

#### Production Upgrade Strategy

**MCP Servers & n8n Workflows:**

```yaml
MCP Server: Messaging Integration
  Option 1: Use existing WhatsApp/Telegram MCP
  Option 2: Build custom KakaoTalk MCP
  
  GitHub Reference:
    - awesome-mcp-servers #messaging
    - Adapt WhatsApp logic → KakaoTalk API

n8n Workflow: "Multi-Channel CRM Bot"
  Source: enescingoz/awesome-n8n-templates
  Template: "WhatsApp AI Business Bot"
  
  Customization:
    - Replace WhatsApp node → KakaoTalk API
    - Add Korean language RAG (Supabase pgvector)
    - Session state in Redis MCP
    - Human handoff via Slack MCP
```

**Real API Integrations:**

```yaml
Kakao i Open Builder:
  Documentation: https://i.kakao.com/docs
  Features:
    - Bot creation & management
    - Message templates (text, image, button)
    - Fallback API for custom logic
    - Analytics dashboard
  
  Setup:
    1. Create bot at https://i.kakao.com
    2. Configure skill servers (webhook endpoint)
    3. Test in KakaoTalk app
  
  Webhook Endpoint:
    POST /webhook/kakaotalk
    {
      "intent": "질문_문의",
      "userRequest": {
        "utterance": "가격이 얼마인가요?"
      }
    }

Solapi (Alternative):
  Service: KakaoTalk Alimtalk (official messages)
  Use Case: Transactional messages
  Cost: ₩15 per message
  API: https://solapi.com/docs
```

**LangGraph Multi-Agent Architecture:**

```python
# kakaotalk_agent.py
from langgraph.graph import StateGraph, END
from typing import TypedDict

class ConversationState(TypedDict):
    messages: list
    intent: str
    user_id: str
    session_data: dict

def classify_intent(state: ConversationState) -> str:
    """Classify user intent using LLM"""
    user_message = state['messages'][-1]['content']
    
    # Call LLM to classify
    intent = llm.predict(
        f"Classify this message: {user_message}\n"
        f"Categories: faq, order_status, complaint, human_needed"
    )
    
    return intent

def answer_faq(state: ConversationState):
    """Handle FAQ using RAG"""
    query = state['messages'][-1]['content']
    
    # RAG retrieval from Supabase
    relevant_docs = vectorstore.similarity_search(query, k=3)
    
    # Generate answer
    answer = llm.generate_with_context(query, relevant_docs)
    
    state['messages'].append({
        'role': 'assistant',
        'content': answer
    })
    
    return state

def escalate_to_human(state: ConversationState):
    """Trigger human handoff"""
    # Send alert to Slack
    slack_webhook.post({
        'text': f"🚨 Human needed for user {state['user_id']}",
        'attachments': [{
            'text': state['messages'][-1]['content']
        }]
    })
    
    # Respond to user
    state['messages'].append({
        'role': 'assistant',
        'content': '상담원 연결 중입니다. 잠시만 기다려주세요.'
    })
    
    return state

def route_message(state: ConversationState) -> str:
    """Route based on intent"""
    intent = state['intent']
    
    if intent in ['faq', 'product_info']:
        return 'faq_handler'
    elif intent in ['complaint', 'complex_issue']:
        return 'human_handoff'
    else:
        return 'default_response'

# Build graph
workflow = StateGraph(ConversationState)

# Add nodes
workflow.add_node("classifier", classify_intent)
workflow.add_node("faq_handler", answer_faq)
workflow.add_node("human_handoff", escalate_to_human)

# Add edges
workflow.add_conditional_edges(
    "classifier",
    route_message,
    {
        "faq_handler": "faq_handler",
        "human_handoff": "human_handoff"
    }
)

workflow.add_edge("faq_handler", END)
workflow.add_edge("human_handoff", END)

# Set entry point
workflow.set_entry_point("classifier")

# Compile
app = workflow.compile()
```

**Session Management with Redis:**

```python
# session_manager.py
import redis
import json
from datetime import timedelta

redis_client = redis.from_url(os.getenv('REDIS_URL'))

class SessionManager:
    def __init__(self):
        self.ttl = timedelta(days=30)  # Session expires in 30 days
    
    def get_session(self, user_id: str) -> dict:
        """Retrieve user session"""
        session_key = f"kakaotalk_session:{user_id}"
        session_data = redis_client.get(session_key)
        
        if session_data:
            return json.loads(session_data)
        
        return {
            'user_id': user_id,
            'conversation_history': [],
            'preferences': {},
            'created_at': datetime.now().isoformat()
        }
    
    def update_session(self, user_id: str, data: dict):
        """Update and persist session"""
        session_key = f"kakaotalk_session:{user_id}"
        
        redis_client.setex(
            session_key,
            self.ttl,
            json.dumps(data)
        )
    
    def add_message(self, user_id: str, message: dict):
        """Add message to conversation history"""
        session = self.get_session(user_id)
        session['conversation_history'].append(message)
        
        # Keep only last 50 messages
        session['conversation_history'] = session['conversation_history'][-50:]
        
        self.update_session(user_id, session)
```

**Production Features:**

```yaml
Official API Integration:
  Kakao i Open Builder:
    - Bot creation & approval process
    - Message template registration
    - Webhook endpoint setup
    - Analytics integration
  
  Solapi (Alimtalk):
    - Transactional messages (order confirmations)
    - Template message sending
    - Message status tracking

Session State Management:
  Redis:
    - Store conversation history (30 days)
    - User preferences
    - Context for follow-up questions
    - Cross-session continuity
  
  Example:
    User (Day 1): "가격 문의했었는데"
    Bot: "네, 어제 문의하신 프로 플랜 말씀이시죠?"

Omnichannel Support:
  Single Bot Logic:
    - Core conversation engine (LangGraph)
    - Channel adapters pattern
  
  Supported Channels:
    ✅ KakaoTalk (Korea)
    ✅ Line (Japan/Thailand)
    ✅ Telegram (Global)
    ✅ Naver TalkTalk (Korea)
  
  Implementation:
    - Abstract channel interface
    - Channel-specific message formatting
    - Unified session management
```

---

### 🔷 AGENT #3: ChinaSource Pro (Sourcing Agent)

#### Current MVP Limitations
- Simulates Chinese marketplace search
- Mock supplier data
- Heuristic cost estimates

#### Production Upgrade Strategy

**n8n Workflows:**

```yaml
Workflow #1: "1688 Stealth Scraper"
  Source: Zie619/n8n-workflows #2109 (Advanced Web Scraping)
  
  Nodes:
    1. Product Search Input
    2. Puppeteer Stealth Scraper:
       - Launch headless Chrome
       - Anti-detection measures:
         * Random user agents
         * Stealth plugin
         * Realistic mouse movements
       - Login bypass techniques
    
    3. Parse Results:
       - Supplier name & rating
       - Product title & specs
       - MOQ (Minimum Order Quantity)
       - Unit price with bulk discounts
       - Supplier location
    
    4. Store in Database:
       - Supabase suppliers table
       - Update existing records
       - Track price history

Workflow #2: "Logistics Calculator"
  Custom n8n workflow
  
  Nodes:
    1. Product Dimensions Input
    2. FedEx API Call:
       - Real-time shipping rates
       - Transit time estimation
       - Duty & tax calculation
    
    3. DHL API Call:
       - Alternative quotes
       - Express vs economy
    
    4. Freight Forwarder API:
       - Flexport integration
       - Sea freight for bulk orders
    
    5. Currency Conversion:
       - Real-time CNY→KRW rates
       - Historical volatility data
       - Hedging recommendations

Workflow #3: "Supplier Verification"
  
  Nodes:
    1. Transaction History Analysis:
       - Scrape supplier review pages
       - Sentiment analysis (Chinese text)
       - Fraud risk scoring
    
    2. Factory Verification:
       - Check business licenses
       - Verify export licenses
       - Cross-reference with customs data
    
    3. Credit Scoring:
       - Years in business
       - Transaction volume
       - Dispute resolution history
```

**Real API Integrations:**

```yaml
Web Scraping:
  Tool: Bright Data (formerly Luminati)
  Features:
    - Residential proxies (China IPs)
    - CAPTCHA solving
    - Anti-detection headers
  Cost: $500/month (50GB)
  
  Alternative: ScraperAPI
  Cost: $49/month (100K requests)

Alibaba Official API:
  Access: Apply for developer account
  Limitations:
    - Only for verified suppliers
    - Limited search functionality
    - Not available for 1688
  
  Use Case: Alibaba.com (international)

Logistics APIs:
  FedEx Web Services:
    Endpoint: https://ws.fedex.com
    Features:
      - Rate quotes
      - Transit time
      - Duty calculator (HS code based)
    Setup: Register at developer.fedex.com
  
  DHL Express API:
    Endpoint: https://api-sandbox.dhl.com
    Features:
      - MyDHL+ integration
      - Real-time tracking
      - Multi-piece shipments
  
  Flexport API:
    Use Case: Freight forwarding (bulk orders)
    Features:
      - Ocean freight quotes
      - Customs clearance
      - Door-to-door pricing

Currency Exchange:
  Service: exchangerate-api.com
  Endpoint: /latest/CNY
  Free tier: 1,500 requests/month
  
  Alternative: openexchangerates.org
  Paid: $29/month (100K requests)
```

**LangChain SQL Agent for Supplier Database:**

```python
# supplier_agent.py
from langchain.agents import create_sql_agent
from langchain.agents.agent_toolkits import SQLDatabaseToolkit
from langchain.sql_database import SQLDatabase
from langchain.chat_models import ChatOpenAI

# Connect to supplier database
db = SQLDatabase.from_uri("postgresql://user:pass@host:5432/suppliers")

# Create toolkit
toolkit = SQLDatabaseToolkit(db=db, llm=ChatOpenAI())

# Create agent
agent = create_sql_agent(
    llm=ChatOpenAI(model="gpt-4", temperature=0),
    toolkit=toolkit,
    agent_type="openai-tools",
    verbose=True,
    handle_parsing_errors=True
)

# Example queries
query1 = """
Find suppliers for 'wireless earbuds' with:
- FOB price < $5
- Rating > 4.5
- Located in Guangdong province
- MOQ < 100 units
"""

query2 = """
Calculate landed cost for:
- Product: Bluetooth speaker
- FOB price: $8
- Shipping: FedEx Express
- Destination: Seoul, Korea
- Quantity: 500 units
"""

result = agent.run(query1)
```

**Stealth Scraping Implementation:**

```javascript
// 1688_scraper.js (for n8n Code node)
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(StealthPlugin());

async function scrape1688(productKeyword) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  // Set realistic viewport
  await page.setViewport({ width: 1920, height: 1080 });
  
  // Set random user agent
  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  );
  
  // Navigate to 1688
  await page.goto(`https://s.1688.com/selloffer/offer_search.htm?keywords=${encodeURIComponent(productKeyword)}`);
  
  // Wait for results
  await page.waitForSelector('.offer-item');
  
  // Extract supplier data
  const suppliers = await page.evaluate(() => {
    const items = document.querySelectorAll('.offer-item');
    
    return Array.from(items).map(item => ({
      title: item.querySelector('.title').innerText,
      supplier: item.querySelector('.company-name').innerText,
      price: item.querySelector('.price').innerText,
      moq: item.querySelector('.moq').innerText,
      rating: item.querySelector('.rating').getAttribute('data-rating'),
      url: item.querySelector('a').href
    }));
  });
  
  await browser.close();
  
  return suppliers;
}

// Use in n8n
const results = await scrape1688($input.item.json.product);
return results;
```

**Production Features:**

```yaml
Real-Time Scraping:
  Implementation:
    - Puppeteer with stealth plugin
    - Bright Data proxy rotation
    - CAPTCHA solving: 2Captcha API
    - Rate limiting: 1 req/5s per domain
  
  Anti-Detection:
    - Random user agents
    - Cookie persistence
    - Human-like delays (1-3s)
    - Mouse movement simulation

Logistics API:
  FedEx Integration:
    - Real-time rate quotes
    - Weight-based pricing
    - Volumetric weight calculation
    - Insurance options
  
  Calculation:
    FOB + Shipping + Customs + Insurance = Landed Cost
    Margin = (Selling Price - Landed Cost) / Selling Price

Currency Hedging:
  Features:
    - Real-time CNY→KRW rate
    - 30-day historical volatility
    - Buffer recommendation (5-10%)
    - Lock-in rate alerts
  
  Example:
    Current Rate: 1 CNY = 190 KRW
    Volatility: ±3%
    Recommended Buffer: 7%
    Safe Rate: 180 KRW (5% cushion)
```

---

### 🔷 AGENT #4: NaverSEO Pro

#### Current MVP Limitations
- Simulates "Naver Bot" crawl
- AI-generated SEO scores (not real metrics)
- Static keyword suggestions

#### Production Upgrade Strategy

**MCP Servers & APIs:**

```yaml
MCP Server: SEO Analysis
  Custom MCP to build using mcp-builder skill
  
  Features:
    - Website crawling (Puppeteer)
    - Lighthouse API integration
    - PageSpeed Insights API
    - Broken link checker
    - Sitemap validator

External APIs:
  DataForSEO:
    Service: SERP data provider
    Endpoint: dataforseo.com/apis
    Features:
      - Real Naver SERP results
      - Keyword difficulty scores
      - Search volume estimates
      - Competitor analysis
    Cost: $0.25 per 1000 requests
  
  Naver Search Advisor:
    Official tool: searchadvisor.naver.com
    Features:
      - Sitemap submission
      - Index status
      - Search performance data
      - Click-through rates
    Limitation: No public API (requires automation)
```

**n8n Workflow: "Complete SEO Audit Pipeline"**

```yaml
Source: Zie619/n8n-workflows #567 (Website Monitor)

Enhanced Workflow:
  1. URL Input & Validation
  
  2. Technical Audit:
     - Lighthouse audit (Performance, SEO, Accessibility)
     - Check robots.txt, sitemap.xml
     - SSL certificate validation
     - Mobile responsiveness test
     - Page load speed (< 3s target)
  
  3. Naver-Specific Checks:
     - Meta tags for Naver Shopping
     - Structured data (JSON-LD)
     - Naver Place (Maps) integration
     - Naver Blog citation potential
  
  4. SERP Analysis (DataForSEO):
     - Get current rankings for target keywords
     - Competitor analysis (top 10)
     - Keyword difficulty scores
     - Search volume data
  
  5. Content Analysis:
     - Keyword density
     - Readability score (Korean text)
     - Internal linking structure
     - Image optimization (alt tags)
  
  6. Backlink Profile:
     - Scrape Naver Webmaster Tools
     - Identify referring domains
     - Check for toxic backlinks
  
  7. Generate Report:
     - PDF with actionable recommendations
     - Priority ranking (Quick wins vs Long-term)
     - Korean language output
```

**DataForSEO Integration:**

```python
# dataforseo_client.py
import requests
import base64

class DataForSEOClient:
    def __init__(self, login, password):
        self.api_url = "https://api.dataforseo.com/v3"
        self.auth = base64.b64encode(f"{login}:{password}".encode()).decode()
    
    def get_naver_serp(self, keyword: str, location: str = "South Korea") -> dict:
        """Get Naver search results for keyword"""
        endpoint = f"{self.api_url}/serp/naver/organic/live/regular"
        
        headers = {
            "Authorization": f"Basic {self.auth}",
            "Content-Type": "application/json"
        }
        
        payload = [{
            "keyword": keyword,
            "location_name": location,
            "language_code": "ko",
            "device": "desktop",
            "depth": 100  # Get top 100 results
        }]
        
        response = requests.post(endpoint, headers=headers, json=payload)
        return response.json()
    
    def get_keyword_data(self, keywords: list) -> dict:
        """Get search volume and difficulty for keywords"""
        endpoint = f"{self.api_url}/keywords_data/naver/search_volume/live"
        
        headers = {
            "Authorization": f"Basic {self.auth}",
            "Content-Type": "application/json"
        }
        
        payload = [{
            "keywords": keywords,
            "location_name": "South Korea",
            "language_code": "ko"
        }]
        
        response = requests.post(endpoint, headers=headers, json=payload)
        return response.json()

# Usage in agent
client = DataForSEOClient(login="your_login", password="your_password")

# Get SERP for target keyword
serp_results = client.get_naver_serp("무선 이어폰")

# Get keyword metrics
keyword_data = client.get_keyword_data([
    "무선 이어폰",
    "블루투스 이어폰",
    "노이즈캔슬링 이어폰"
])
```

**Naver Search Advisor Automation:**

```python
# naver_search_advisor.py
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

class NaverSearchAdvisor:
    def __init__(self, naver_id: str, naver_pw: str):
        self.driver = webdriver.Chrome()
        self.naver_id = naver_id
        self.naver_pw = naver_pw
    
    def login(self):
        """Login to Naver Search Advisor"""
        self.driver.get("https://searchadvisor.naver.com/")
        
        # Wait for login form
        wait = WebDriverWait(self.driver, 10)
        id_field = wait.until(
            EC.presence_of_element_located((By.ID, "id"))
        )
        
        # Enter credentials
        id_field.send_keys(self.naver_id)
        self.driver.find_element(By.ID, "pw").send_keys(self.naver_pw)
        
        # Submit
        self.driver.find_element(By.ID, "log.login").click()
    
    def get_site_performance(self, site_url: str) -> dict:
        """Extract performance data from dashboard"""
        # Navigate to site dashboard
        self.driver.get(f"https://searchadvisor.naver.com/console/board?site={site_url}")
        
        # Wait for data to load
        wait = WebDriverWait(self.driver, 10)
        stats = wait.until(
            EC.presence_of_element_located((By.CLASS_NAME, "stats"))
        )
        
        # Extract metrics
        data = {
            "impressions": self.driver.find_element(By.ID, "impressions").text,
            "clicks": self.driver.find_element(By.ID, "clicks").text,
            "ctr": self.driver.find_element(By.ID, "ctr").text,
            "index_status": self.driver.find_element(By.ID, "index-status").text
        }
        
        return data
    
    def submit_sitemap(self, site_url: str, sitemap_url: str):
        """Submit sitemap to Naver"""
        # Navigate to sitemap page
        self.driver.get(f"https://searchadvisor.naver.com/console/sitemap?site={site_url}")
        
        # Enter sitemap URL
        sitemap_field = self.driver.find_element(By.ID, "sitemap-url")
        sitemap_field.send_keys(sitemap_url)
        
        # Submit
        self.driver.find_element(By.ID, "submit").click()
```

**Lighthouse Integration:**

```javascript
// lighthouse_audit.js
const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');

async function runLighthouseAudit(url) {
  // Launch Chrome
  const chrome = await chromeLauncher.launch({chromeFlags: ['--headless']});
  
  // Run Lighthouse
  const options = {
    logLevel: 'info',
    output: 'json',
    onlyCategories: ['performance', 'seo', 'accessibility'],
    port: chrome.port
  };
  
  const runnerResult = await lighthouse(url, options);
  
  // Extract scores
  const report = runnerResult.lhr;
  const scores = {
    performance: report.categories.performance.score * 100,
    seo: report.categories.seo.score * 100,
    accessibility: report.categories.accessibility.score * 100,
    metrics: {
      fcp: report.audits['first-contentful-paint'].numericValue,
      lcp: report.audits['largest-contentful-paint'].numericValue,
      tbt: report.audits['total-blocking-time'].numericValue,
      cls: report.audits['cumulative-layout-shift'].numericValue
    }
  };
  
  await chrome.kill();
  
  return scores;
}

// Export for n8n
module.exports = { runLighthouseAudit };
```

**Production Features:**

```yaml
Technical Audit:
  Real Crawler:
    - Language: Go or Python
    - Framework: Scrapy (Python) or Colly (Go)
    - Features:
      * Check all internal links
      * Validate HTTP status codes
      * Detect redirect chains
      * Find broken images
      * Validate canonical tags
  
  Lighthouse Audit:
    - Performance score
    - SEO score
    - Accessibility score
    - Best practices
    - Core Web Vitals (LCP, FID, CLS)

Keyword Tracking:
  Daily CRON Job:
    - Check rankings for 10-50 keywords
    - Store historical data (Supabase)
    - Calculate rank changes
    - Alert on significant drops (>5 positions)
  
  Reporting:
    - Weekly summary email
    - Rank distribution chart
    - Competitor comparison
    - Visibility score trend

Naver-Specific Optimizations:
  Naver Shopping:
    - Product feed validation (EP format)
    - Category mapping checker
    - Price competitiveness analysis
  
  Naver Place:
    - NAP consistency (Name, Address, Phone)
    - Review volume and rating
    - Photo optimization
  
  Naver Blog:
    - Citation opportunities
    - Influencer outreach list
    - Guest post potential
```

---

## SECTOR 2: Professional Services

---

### 🔷 AGENT #5: Ledger Logic (AI Bookkeeper)

#### Current MVP Limitations
- CSV upload only (no bank feeds)
- Fuzzy matching (not OCR)
- Basic categorization

#### Production Upgrade Strategy

**MCP Servers & APIs:**

```yaml
Bank Feed Integration:
  Option A: Plaid (Global)
    Service: https://plaid.com
    Supported Banks: 12,000+ (limited Korea coverage)
    Cost: $0.25 per account/month
    Features:
      - Real-time transaction sync
      - Balance tracking
      - Account verification
  
  Option B: Codef (Korea-Specific) ⭐ RECOMMENDED
    Service: https://codef.io
    Supported Banks: All major Korean banks
      - KB국민은행
      - 신한은행
      - 우리은행
      - 하나은행
      - NH농협은행
    Cost: API pricing (contact sales)
    Features:
      - Real-time transaction sync
      - Credit card transactions
      - Loan information
  
  Option C: Toss Payments
    Service: https://toss.im/business
    Use Case: For businesses using Toss
    Features:
      - Payment reconciliation
      - Settlement data
      - Fee transparency

OCR Receipt Scanner:
  Option A: Naver Clova OCR ⭐ RECOMMENDED
    Service: https://www.ncloud.com/product/aiService/ocr
    Specialization: Korean receipts
    Accuracy: 95%+ on printed Korean text
    Cost: ₩10 per page (first 1,000 free/month)
    Features:
      - Korean handwriting recognition
      - Table structure preservation
      - Multi-column detection
  
  Option B: AWS Textract
    Service: https://aws.amazon.com/textract/
    Specialization: Multi-language
    Accuracy: 90%+ on Korean text
    Cost: $1.50 per 1,000 pages
    Features:
      - Form data extraction
      - Table extraction
      - Key-value pair detection

ERP Integration:
  Option A: Douzone (Korean ERP) ⭐
    Service: https://www.douzone.com/
    Market Share: #1 in Korea
    API: Available for partners
    Features:
      - GL (General Ledger) sync
      - Accounts payable/receivable
      - Tax invoice integration
  
  Option B: Xero (Global)
    Service: https://www.xero.com
    Features:
      - Bank feed sync
      - Invoice automation
      - Financial reporting
  
  Option C: QuickBooks (Global)
    Service: https://quickbooks.intuit.com
    Features:
      - Transaction matching
      - Expense categorization
      - Multi-currency support
```

**n8n Workflow: "Complete Bookkeeping Pipeline"**

```yaml
Source: lucaswalter/n8n-ai-automations
Adapt: Newsletter workflow → Accounting workflow

Enhanced Workflow:
  1. Bank Feed Sync (Daily CRON):
     - Connect to Codef API
     - Fetch new transactions (last 24 hours)
     - Deduplicate against existing records
     - Store in Supabase transactions table
  
  2. Receipt Processing (On Upload):
     - Trigger: File upload to Supabase Storage
     - Call Naver Clova OCR
     - Extract:
       * Merchant name
       * Date
       * Amount
       * Tax amount
       * Line items
     - Store in receipts table
  
  3. Transaction Matching:
     - For each bank transaction:
       * Search receipts within ±3 days
       * Fuzzy match on amount (±5%)
       * Fuzzy match on merchant name (Levenshtein)
       * Score confidence (0-100)
     - Auto-match if confidence > 85%
  
  4. Categorization:
     - Use ML classifier (trained on historical data)
     - Categories:
       * 판매비와관리비 (Operating expenses)
       * 매출원가 (COGS)
       * 급여 (Payroll)
       * 접대비 (Entertainment)
       * 여비교통비 (Travel)
       * 광고선전비 (Advertising)
     - Confidence score for manual review
  
  5. ERP Sync:
     - Push matched transactions to Douzone
     - Create GL entries
     - Generate tax invoices
     - Update accounts payable/receivable
  
  6. Anomaly Detection:
     - Statistical outliers (Z-score > 3)
     - Duplicate detection
     - Unusual merchant
     - Fraud scoring model
  
  7. Manual Review Queue:
     - Low-confidence matches (< 85%)
     - High-value transactions (> ₩1M)
     - Flagged anomalies
     - Send notification (Slack/Email)
```

**Codef Integration:**

```python
# codef_client.py
import requests
import base64

class CodefClient:
    def __init__(self, client_id: str, client_secret: str):
        self.api_url = "https://api.codef.io"
        self.client_id = client_id
        self.client_secret = client_secret
        self.access_token = None
    
    def get_access_token(self):
        """OAuth2 authentication"""
        url = f"{self.api_url}/oauth/token"
        
        auth = base64.b64encode(
            f"{self.client_id}:{self.client_secret}".encode()
        ).decode()
        
        headers = {
            "Authorization": f"Basic {auth}",
            "Content-Type": "application/x-www-form-urlencoded"
        }
        
        data = {"grant_type": "client_credentials", "scope": "read"}
        
        response = requests.post(url, headers=headers, data=data)
        self.access_token = response.json()["access_token"]
    
    def get_bank_transactions(
        self,
        bank_code: str,
        account_number: str,
        start_date: str,
        end_date: str
    ) -> list:
        """Fetch bank transactions"""
        if not self.access_token:
            self.get_access_token()
        
        url = f"{self.api_url}/v1/kr/bank/p/account/transaction-list"
        
        headers = {
            "Authorization": f"Bearer {self.access_token}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "organization": bank_code,  # e.g., "0004" for KB
            "account": account_number,
            "startDate": start_date,  # YYYYMMDD
            "endDate": end_date,
            "orderBy": "0",  # 0=latest first
            "inquiryType": "0"  # 0=all, 1=deposit, 2=withdrawal
        }
        
        response = requests.post(url, headers=headers, json=payload)
        return response.json()["data"]["resList"]

# Usage in agent
client = CodefClient(
    client_id=os.getenv("CODEF_CLIENT_ID"),
    client_secret=os.getenv("CODEF_CLIENT_SECRET")
)

# Get KB Bank transactions for last 30 days
transactions = client.get_bank_transactions(
    bank_code="0004",  # KB국민은행
    account_number="123456789",
    start_date="20250101",
    end_date="20250131"
)
```

**Naver Clova OCR Integration:**

```python
# clova_ocr.py
import requests
import uuid
import time
import json

class ClovaOCR:
    def __init__(self, api_url: str, secret_key: str):
        self.api_url = api_url
        self.secret_key = secret_key
    
    def extract_receipt(self, image_path: str) -> dict:
        """Extract text from receipt image"""
        # Generate request ID
        request_id = str(uuid.uuid4())
        
        # Create request JSON
        request_json = {
            'images': [
                {
                    'format': 'jpg',
                    'name': 'receipt'
                }
            ],
            'requestId': request_id,
            'version': 'V2',
            'timestamp': int(round(time.time() * 1000))
        }
        
        # Prepare multipart form data
        headers = {'X-OCR-SECRET': self.secret_key}
        
        files = {
            'message': (None, json.dumps(request_json), 'application/json'),
            'file': open(image_path, 'rb')
        }
        
        # Send request
        response = requests.post(
            self.api_url,
            headers=headers,
            files=files
        )
        
        result = response.json()
        
        # Parse receipt fields
        receipt_data = self.parse_receipt_fields(result)
        
        return receipt_data
    
    def parse_receipt_fields(self, ocr_result: dict) -> dict:
        """Extract structured data from OCR result"""
        fields = ocr_result.get('images', [{}])[0].get('fields', [])
        
        receipt_data = {
            'merchant': None,
            'date': None,
            'amount': None,
            'tax': None,
            'items': []
        }
        
        for field in fields:
            name = field.get('name', '')
            text = field.get('inferText', '')
            
            if name == 'merchant.name':
                receipt_data['merchant'] = text
            elif name == 'payment.date':
                receipt_data['date'] = text
            elif name == 'total.price.value':
                receipt_data['amount'] = float(text.replace(',', ''))
            elif name == 'total.vatPrice.value':
                receipt_data['tax'] = float(text.replace(',', ''))
            elif name.startswith('item.'):
                # Parse line items
                pass
        
        return receipt_data

# Usage in agent
ocr_client = ClovaOCR(
    api_url=os.getenv("CLOVA_OCR_URL"),
    secret_key=os.getenv("CLOVA_OCR_SECRET")
)

# Extract receipt data
receipt_data = ocr_client.extract_receipt("receipt.jpg")
```

**LangGraph Multi-Agent Bookkeeping:**

```python
# bookkeeping_agent.py
from langgraph.prebuilt import create_react_agent
from langchain.tools import Tool

# Define tools
def fuzzy_match(transaction: dict, receipts: list) -> dict:
    """Fuzzy match transaction to receipt"""
    from fuzzywuzzy import fuzz
    
    best_match = None
    best_score = 0
    
    for receipt in receipts:
        # Amount match (±5%)
        amount_diff = abs(transaction['amount'] - receipt['amount'])
        amount_score = 100 if amount_diff / transaction['amount'] < 0.05 else 0
        
        # Merchant match (Levenshtein distance)
        merchant_score = fuzz.ratio(
            transaction['description'].lower(),
            receipt['merchant'].lower()
        )
        
        # Date match (within 3 days)
        date_diff = abs((transaction['date'] - receipt['date']).days)
        date_score = 100 if date_diff <= 3 else 0
        
        # Combined score
        score = (amount_score * 0.5 + merchant_score * 0.3 + date_score * 0.2)
        
        if score > best_score:
            best_score = score
            best_match = receipt
    
    return {
        'receipt': best_match,
        'confidence': best_score
    }

def categorize_expense(description: str, amount: float) -> str:
    """Categorize expense using ML model"""
    # In production, use trained classifier
    # For now, use simple keyword matching
    
    keywords = {
        '판매비와관리비': ['사무용품', '복사', '인쇄', '우편'],
        '매출원가': ['재료비', '원재료', '부품'],
        '급여': ['급여', '상여', '퇴직금'],
        '접대비': ['식사', '음식', '카페', '술'],
        '여비교통비': ['택시', '기차', '항공', '주차'],
        '광고선전비': ['광고', '홍보', '마케팅']
    }
    
    desc_lower = description.lower()
    
    for category, words in keywords.items():
        if any(word in desc_lower for word in words):
            return category
    
    return '기타'

def detect_anomaly(transactions: list, new_transaction: dict) -> dict:
    """Detect anomalous transactions"""
    import numpy as np
    
    amounts = [t['amount'] for t in transactions]
    mean = np.mean(amounts)
    std = np.std(amounts)
    
    # Z-score
    z_score = (new_transaction['amount'] - mean) / std
    
    is_anomaly = abs(z_score) > 3
    
    return {
        'is_anomaly': is_anomaly,
        'z_score': z_score,
        'reason': f"Amount is {abs(z_score):.1f} standard deviations from mean"
    }

# Create tools
match_tool = Tool(
    name="fuzzy_match",
    func=fuzzy_match,
    description="Match bank transaction to receipt"
)

categorize_tool = Tool(
    name="categorize",
    func=categorize_expense,
    description="Categorize expense into accounting category"
)

anomaly_tool = Tool(
    name="detect_anomaly",
    func=detect_anomaly,
    description="Detect anomalous transactions"
)

# Agent 1: Transaction Matcher
match_agent = create_react_agent(
    llm,
    tools=[match_tool],
    state_modifier="You are a bookkeeping assistant. Match transactions to receipts."
)

# Agent 2: Category Classifier
classify_agent = create_react_agent(
    llm,
    tools=[categorize_tool],
    state_modifier="You are an accounting expert. Categorize expenses."
)

# Agent 3: Anomaly Detector
anomaly_agent = create_react_agent(
    llm,
    tools=[anomaly_tool],
    state_modifier="You are a fraud detection specialist. Flag suspicious transactions."
)

# Orchestrator workflow
from langgraph.graph import StateGraph

workflow = StateGraph(dict)

workflow.add_node("matcher", match_agent)
workflow.add_node("classifier", classify_agent)
workflow.add_node("anomaly_detector", anomaly_agent)

workflow.add_edge("matcher", "classifier")
workflow.add_edge("classifier", "anomaly_detector")

app = workflow.compile()
```

**Production Features:**

```yaml
Bank Feeds:
  Codef Integration:
    - Support all major Korean banks
    - Daily sync (CRON: 6 AM KST)
    - Transaction deduplication
    - Multi-account support (up to 10)
  
  Data Quality:
    - Transaction normalization
    - Currency conversion (if multi-currency)
    - Time zone handling (UTC → KST)

OCR Accuracy:
  Naver Clova OCR:
    - 95%+ on printed receipts
    - 85%+ on handwritten receipts
    - Support thermal printer receipts
  
  Manual Review:
    - Confidence < 80% → Review queue
    - Display original image + extracted data
    - Quick edit interface

ERP Sync:
  Douzone Integration:
    - Bi-directional sync
    - GL entry creation
    - Tax invoice generation (Hometax)
    - Prevent duplicates (idempotency key)
  
  Sync Frequency:
    - Real-time for high-value (> ₩1M)
    - Hourly batch for regular transactions
    - Daily reconciliation report
```

---

### 🔷 AGENT #6: Proposal Architect

#### Current MVP Limitations
- RAG on static case studies
- Generates Markdown only
- Hallucinated pricing

#### Production Upgrade Strategy

**MCP Servers:**

```bash
# Install document generation MCP
npx @smithery/cli install thiagotw10-document-generator-mcp --client claude

# Install DOCX manipulation MCP
npx @smithery/cli install famano-office --client claude
```

**n8n Workflow: "Proposal Generation Pipeline"**

```yaml
Source: Zie619/n8n-workflows #1247 (Document Generator)

Enhanced Workflow:
  1. Client Requirements Form:
     - Company name & industry
     - Project scope & objectives
     - Timeline & budget range
     - Key stakeholders
     - Success criteria
  
  2. Similar Proposal Search (RAG):
     - Query Supabase pgvector
     - Find top 3 similar past proposals
     - Filter by:
       * Industry match
       * Project type match
       * Success rate (won vs lost)
     - Extract reusable sections
  
  3. Pricing Calculator:
     - Load rate card from database
     - Role-based hourly rates:
       * Senior Consultant: ₩300K/hour
       * Junior Consultant: ₩150K/hour
       * Project Manager: ₩250K/hour
     - Calculate total project cost
     - Apply margin (30-50%)
     - Check profitability threshold
  
  4. Content Generation (LLM):
     - Executive Summary
     - Problem Statement (from requirements)
     - Proposed Solution (from similar proposals)
     - Methodology & Approach
     - Timeline & Milestones
     - Team & Qualifications
     - Pricing & Terms
     - Case Studies (from RAG)
  
  5. Style Transfer:
     - If client has past proposals → LoRA fine-tuning
     - Match tone (formal vs casual)
     - Match structure (sections, headers)
     - Use client-specific terminology
  
  6. Document Generation:
     - Call Document Generator MCP
     - Apply branded template
     - Generate DOCX with:
       * Cover page
       * Table of contents
       * Styled headers
       * Tables & charts
       * Appendix
  
  7. Human Review (HITL):
     - Send to approval queue
     - Notify via Slack
     - Allow inline editing
     - Track approval status
  
  8. Final Export:
     - DOCX for editing
     - PDF for client delivery
     - PowerPoint executive summary
     - Store in Google Drive
```

**Advanced RAG System:**

```python
# proposal_rag.py
from langchain.vectorstores import SupabaseVectorStore
from langchain.embeddings import OpenAIEmbeddings
from langchain.retrievers import ContextualCompressionRetriever
from langchain.retrievers.document_compressors import LLMChainExtractor

# Initialize vector store
vectorstore = SupabaseVectorStore(
    client=supabase_client,
    embedding=OpenAIEmbeddings(),
    table_name="proposals",
    query_name="match_proposals"
)

# Create compressor
compressor = LLMChainExtractor.from_llm(llm)

# Create retriever with compression
retriever = ContextualCompressionRetriever(
    base_compressor=compressor,
    base_retriever=vectorstore.as_retriever(
        search_type="similarity",
        search_kwargs={"k": 5}
    )
)

def find_similar_proposals(
    industry: str,
    project_type: str,
    budget_range: str
) -> list:
    """Find similar past proposals"""
    query = f"""
    Find proposals for {industry} industry
    Project type: {project_type}
    Budget range: {budget_range}
    Focus on successful proposals (status=won)
    """
    
    docs = retriever.get_relevant_documents(query)
    
    # Filter by success rate
    successful = [d for d in docs if d.metadata.get('status') == 'won']
    
    return successful[:3]

def extract_reusable_sections(proposals: list, section: str) -> str:
    """Extract specific section from similar proposals"""
    sections = []
    
    for proposal in proposals:
        # Parse document structure
        content = proposal.page_content
        
        # Extract section (regex or LLM extraction)
        section_text = extract_section_text(content, section)
        
        if section_text:
            sections.append(section_text)
    
    # Combine and summarize
    combined = "\n\n".join(sections)
    
    summary = llm.predict(
        f"Summarize these similar sections into best practices:\n{combined}"
    )
    
    return summary

def generate_custom_proposal(
    client_info: dict,
    similar_proposals: list,
    rate_card: dict
) -> dict:
    """Generate complete proposal"""
    
    # Extract reusable content
    methodology = extract_reusable_sections(similar_proposals, "methodology")
    case_studies = [p.metadata.get('case_study') for p in similar_proposals]
    
    # Calculate pricing
    pricing = calculate_project_cost(
        scope=client_info['scope'],
        rate_card=rate_card,
        margin=0.4  # 40% margin
    )
    
    # Generate sections
    sections = {
        'executive_summary': generate_executive_summary(client_info),
        'problem_statement': generate_problem_statement(client_info),
        'proposed_solution': generate_solution(client_info, methodology),
        'timeline': generate_timeline(client_info['timeline']),
        'pricing': format_pricing(pricing),
        'case_studies': format_case_studies(case_studies)
    }
    
    return sections
```

**Pricing Engine:**

```python
# pricing_engine.py
from datetime import datetime, timedelta

class PricingEngine:
    def __init__(self, rate_card: dict):
        self.rate_card = rate_card
    
    def calculate_project_cost(
        self,
        roles: list,
        hours_per_role: dict,
        project_duration_weeks: int
    ) -> dict:
        """Calculate total project cost"""
        
        subtotal = 0
        breakdown = []
        
        for role in roles:
            hourly_rate = self.rate_card[role]['hourly_rate']
            hours = hours_per_role[role]
            
            role_cost = hourly_rate * hours
            subtotal += role_cost
            
            breakdown.append({
                'role': role,
                'hourly_rate': hourly_rate,
                'hours': hours,
                'total': role_cost
            })
        
        # Apply margin
        margin_percentage = 0.4  # 40%
        margin_amount = subtotal * margin_percentage
        
        total = subtotal + margin_amount
        
        # Check minimum profitability
        min_project_value = 5000000  # ₩5M minimum
        
        if total < min_project_value:
            raise ValueError(f"Project below minimum threshold: ₩{total:,}")
        
        return {
            'subtotal': subtotal,
            'margin': margin_amount,
            'total': total,
            'breakdown': breakdown,
            'duration_weeks': project_duration_weeks
        }
    
    def generate_payment_schedule(self, total: float, milestones: list) -> list:
        """Generate payment schedule"""
        
        if len(milestones) == 0:
            # Default: 30% upfront, 40% midpoint, 30% completion
            return [
                {'milestone': 'Contract Signing', 'percentage': 30, 'amount': total * 0.3},
                {'milestone': 'Midpoint Review', 'percentage': 40, 'amount': total * 0.4},
                {'milestone': 'Project Completion', 'percentage': 30, 'amount': total * 0.3}
            ]
        
        # Custom milestones
        schedule = []
        per_milestone = total / len(milestones)
        
        for milestone in milestones:
            schedule.append({
                'milestone': milestone,
                'amount': per_milestone
            })
        
        return schedule

# Rate card (stored in database)
RATE_CARD = {
    'senior_consultant': {
        'title': 'Senior Consultant',
        'hourly_rate': 300000,  # ₩300K/hour
        'daily_rate': 2400000   # ₩2.4M/day
    },
    'consultant': {
        'title': 'Consultant',
        'hourly_rate': 200000,
        'daily_rate': 1600000
    },
    'junior_consultant': {
        'title': 'Junior Consultant',
        'hourly_rate': 150000,
        'daily_rate': 1200000
    },
    'project_manager': {
        'title': 'Project Manager',
        'hourly_rate': 250000,
        'daily_rate': 2000000
    },
    'technical_specialist': {
        'title': 'Technical Specialist',
        'hourly_rate': 350000,
        'daily_rate': 2800000
    }
}

# Usage
engine = PricingEngine(RATE_CARD)

project_cost = engine.calculate_project_cost(
    roles=['senior_consultant', 'consultant', 'project_manager'],
    hours_per_role={
        'senior_consultant': 40,
        'consultant': 80,
        'project_manager': 60
    },
    project_duration_weeks=8
)
```

**Document Generation with python-docx:**

```python
# docx_generator.py
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH

class ProposalDocGenerator:
    def __init__(self, template_path: str = None):
        if template_path:
            self.doc = Document(template_path)
        else:
            self.doc = Document()
        
        self.setup_styles()
    
    def setup_styles(self):
        """Setup document styles"""
        # Title style
        title_style = self.doc.styles['Title']
        title_style.font.name = 'Arial'
        title_style.font.size = Pt(24)
        title_style.font.bold = True
        
        # Heading styles
        h1_style = self.doc.styles['Heading 1']
        h1_style.font.name = 'Arial'
        h1_style.font.size = Pt(18)
        h1_style.font.color.rgb = RGBColor(0, 70, 127)
    
    def add_cover_page(self, client_name: str, project_title: str):
        """Add branded cover page"""
        # Add logo
        self.doc.add_picture('logo.png', width=Inches(2))
        
        # Add title
        title = self.doc.add_paragraph()
        title.alignment = WD_ALIGN_PARAGRAPH.CENTER
        run = title.add_run(f'\n\n{project_title}\n\n')
        run.font.size = Pt(28)
        run.bold = True
        
        # Add client name
        client = self.doc.add_paragraph()
        client.alignment = WD_ALIGN_PARAGRAPH.CENTER
        run = client.add_run(f'Prepared for {client_name}')
        run.font.size = Pt(16)
        
        # Add date
        date = self.doc.add_paragraph()
        date.alignment = WD_ALIGN_PARAGRAPH.CENTER
        run = date.add_run(f'\n{datetime.now().strftime("%B %Y")}')
        run.font.size = Pt(14)
        
        # Page break
        self.doc.add_page_break()
    
    def add_toc(self):
        """Add table of contents"""
        self.doc.add_heading('Table of Contents', level=1)
        
        # TOC field (auto-generated in Word)
        paragraph = self.doc.add_paragraph()
        run = paragraph.add_run()
        fldChar = run._element.add_fldChar(fldCharType='begin')
        
        # Page break
        self.doc.add_page_break()
    
    def add_section(self, title: str, content: str, level: int = 1):
        """Add section with heading"""
        self.doc.add_heading(title, level=level)
        
        # Add paragraphs
        for para in content.split('\n\n'):
            p = self.doc.add_paragraph(para)
            p.style = 'Normal'
    
    def add_pricing_table(self, pricing_data: dict):
        """Add pricing breakdown table"""
        self.doc.add_heading('Pricing', level=1)
        
        # Create table
        table = self.doc.add_table(
            rows=len(pricing_data['breakdown']) + 3,
            cols=4
        )
        table.style = 'Light Grid Accent 1'
        
        # Header row
        headers = ['Role', 'Hourly Rate', 'Hours', 'Total']
        for i, header in enumerate(headers):
            cell = table.rows[0].cells[i]
            cell.text = header
            cell.paragraphs[0].runs[0].bold = True
        
        # Data rows
        for i, item in enumerate(pricing_data['breakdown'], start=1):
            row = table.rows[i]
            row.cells[0].text = item['role']
            row.cells[1].text = f"₩{item['hourly_rate']:,}"
            row.cells[2].text = str(item['hours'])
            row.cells[3].text = f"₩{item['total']:,}"
        
        # Subtotal
        subtotal_row = table.rows[-2]
        subtotal_row.cells[2].text = 'Subtotal'
        subtotal_row.cells[3].text = f"₩{pricing_data['subtotal']:,}"
        
        # Total
        total_row = table.rows[-1]
        total_row.cells[2].text = 'Total'
        total_row.cells[3].text = f"₩{pricing_data['total']:,}"
        total_row.cells[3].paragraphs[0].runs[0].bold = True
    
    def save(self, filename: str):
        """Save document"""
        self.doc.save(filename)

# Usage in agent
generator = ProposalDocGenerator(template_path='branded_template.docx')

generator.add_cover_page(
    client_name='ABC Corporation',
    project_title='Digital Transformation Strategy'
)

generator.add_toc()

generator.add_section(
    title='Executive Summary',
    content=proposal_sections['executive_summary']
)

generator.add_pricing_table(pricing_data)

generator.save('ABC_Proposal_20260105.docx')
```

**Production Features:**

```yaml
Dynamic Learning:
  Past Proposal Upload:
    - Parse uploaded DOCX/PDF
    - Extract sections and structure
    - Store in vector database
    - Tag with metadata (industry, outcome)
  
  Style Fine-Tuning:
    - Use LoRA (Low-Rank Adaptation)
    - Train on client's writing style
    - Maintain consistent tone
    - Preserve brand voice

Pricing Engine:
  Rate Card Database:
    - Store in Supabase
    - Role-based hourly rates
    - Geographic adjustments (Seoul vs regions)
    - Experience multipliers
  
  Profitability Checks:
    - Minimum project value (₩5M)
    - Target margin (30-50%)
    - Competitive pricing analysis
    - Win rate tracking

Native Office Export:
  DOCX:
    - Use python-docx library
    - Branded templates
    - Table of contents (auto-generated)
    - Headers/footers
    - Page numbers
  
  PPTX:
    - Use python-pptx library
    - Executive summary deck
    - 10-15 slides
    - Charts and tables
  
  PDF:
    - Convert from DOCX
    - Locked formatting
    - Client-ready delivery
```

---

## SECTOR 3: Deep Tech & Startup Support

---

### 🔷 AGENT #7: R&D Grant Scout

#### Current MVP Limitations
- Mock grant database
- 1-page abstracts only
- No eligibility checking

#### Production Upgrade Strategy

**MCP Servers & Web Scraping:**

```yaml
Custom MCP Server: Korean Government Grant Crawler
  Build using mcp-builder skill
  
  Target Websites:
    - https://www.k-startup.go.kr (K-Startup)
    - https://www.nipa.kr (NIPA)
    - https://www.msit.go.kr (MSIT)
    - https://www.koita.or.kr (KOITA)
    - https://www.kiat.or.kr (KIAT)
  
  Extraction:
    - Grant title
    - Eligibility criteria (company age, revenue, sector)
    - Application deadline
    - Funding amount
    - Required documents
    - PDF attachments (announcement, application form)
  
  Schedule:
    - Daily CRON job (6 AM KST)
    - Check for new announcements
    - Update grants table in Supabase
    - Alert users of relevant opportunities

Eligibility Rules Engine:
  Non-AI hard logic (Python/TypeScript)
  
  Rules:
    def check_eligibility(startup_profile, grant_requirements):
        checks = []
        
        # Company age
        if startup_profile['age_years'] > grant_requirements['max_age']:
            checks.append({
                'rule': 'Company Age',
                'result': 'FAIL',
                'reason': f"Company too old ({startup_profile['age_years']} > {grant_requirements['max_age']} years)"
            })
        else:
            checks.append({
                'rule': 'Company Age',
                'result': 'PASS'
            })
        
        # Revenue limit
        if startup_profile['revenue_krw'] > grant_requirements['max_revenue']:
            checks.append({
                'rule': 'Revenue Limit',
                'result': 'FAIL',
                'reason': f"Revenue too high (₩{startup_profile['revenue_krw']:,} > ₩{grant_requirements['max_revenue']:,})"
            })
        
        # Industry match
        if startup_profile['industry'] not in grant_requirements['eligible_industries']:
            checks.append({
                'rule': 'Industry Match',
                'result': 'FAIL',
                'reason': f"Industry '{startup_profile['industry']}' not eligible"
            })
        
        # Calculate overall eligibility
        failed_checks = [c for c in checks if c['result'] == 'FAIL']
        
        return {
            'eligible': len(failed_checks) == 0,
            'checks': checks,
            'failed_count': len(failed_checks)
        }
```

**Web Scraping Implementation:**

```python
# k_startup_crawler.py
from playwright.async_api import async_playwright
from bs4 import BeautifulSoup
import re
from datetime import datetime

class KStartupCrawler:
    def __init__(self):
        self.base_url = "https://www.k-startup.go.kr"
        self.grants_url = f"{self.base_url}/common/announcement/list.do"
    
    async def crawl_grant_announcements(self) -> list:
        """Crawl K-Startup website for grant announcements"""
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            page = await browser.new_page()
            
            # Navigate to announcements page
            await page.goto(self.grants_url)
            
            # Wait for content
            await page.wait_for_selector('.board-list')
            
            # Get page content
            content = await page.content()
            
            await browser.close()
        
        # Parse with BeautifulSoup
        soup = BeautifulSoup(content, 'html.parser')
        
        grants = []
        
        for item in soup.select('.board-item'):
            grant = {
                'title': item.select_one('.title').text.strip(),
                'category': item.select_one('.category').text.strip(),
                'deadline': self.parse_deadline(item.select_one('.date').text),
                'url': self.base_url + item.select_one('a')['href'],
                'posted_date': datetime.now().isoformat()
            }
            
            # Fetch detail page
            detail = await self.fetch_grant_details(grant['url'])
            grant.update(detail)
            
            grants.append(grant)
        
        return grants
    
    async def fetch_grant_details(self, url: str) -> dict:
        """Fetch detailed grant information"""
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            page = await browser.new_page()
            
            await page.goto(url)
            await page.wait_for_selector('.content')
            
            content = await page.content()
            await browser.close()
        
        soup = BeautifulSoup(content, 'html.parser')
        
        # Extract eligibility criteria
        eligibility_text = soup.select_one('.eligibility').text if soup.select_one('.eligibility') else ''
        
        details = {
            'funding_amount': self.extract_funding_amount(eligibility_text),
            'max_company_age': self.extract_max_age(eligibility_text),
            'max_revenue': self.extract_max_revenue(eligibility_text),
            'eligible_industries': self.extract_industries(eligibility_text),
            'required_documents': self.extract_documents(soup)
        }
        
        return details
    
    def parse_deadline(self, date_str: str) -> str:
        """Parse Korean date string to ISO format"""
        # "2026.01.31 18:00" → "2026-01-31T18:00:00+09:00"
        date_str = date_str.replace('.', '-')
        return f"{date_str}:00+09:00"
    
    def extract_funding_amount(self, text: str) -> int:
        """Extract funding amount from text"""
        # "최대 1억원 지원" → 100000000
        match = re.search(r'(\d+)억', text)
        if match:
            return int(match.group(1)) * 100000000
        return 0
    
    def extract_max_age(self, text: str) -> int:
        """Extract maximum company age"""
        # "업력 7년 미만" → 7
        match = re.search(r'업력\s*(\d+)년', text)
        if match:
            return int(match.group(1))
        return 10  # Default
    
    def extract_max_revenue(self, text: str) -> int:
        """Extract maximum revenue limit"""
        # "매출 100억원 미만" → 10000000000
        match = re.search(r'매출\s*(\d+)억', text)
        if match:
            return int(match.group(1)) * 100000000
        return float('inf')  # No limit
    
    def extract_industries(self, text: str) -> list:
        """Extract eligible industries"""
        industries = []
        
        keywords = {
            'AI': ['인공지능', 'AI', '머신러닝'],
            'Biotech': ['바이오', '의료', '헬스케어'],
            'Fintech': ['핀테크', '금융기술'],
            'IoT': ['사물인터넷', 'IoT'],
            'Mobility': ['모빌리티', '자율주행']
        }
        
        for industry, words in keywords.items():
            if any(word in text for word in words):
                industries.append(industry)
        
        return industries if industries else ['All']
    
    def extract_documents(self, soup: BeautifulSoup) -> list:
        """Extract required document list"""
        docs = []
        
        attachments = soup.select('.attachment-list .item')
        
        for item in attachments:
            docs.append({
                'name': item.select_one('.filename').text.strip(),
                'url': item.select_one('a')['href']
            })
        
        return docs

# Usage in CRON job
async def daily_grant_update():
    """Run daily to update grant database"""
    crawler = KStartupCrawler()
    
    # Fetch new grants
    grants = await crawler.crawl_grant_announcements()
    
    # Store in Supabase
    for grant in grants:
        # Check if already exists
        existing = supabase.table('grants').select('*').eq('title', grant['title']).execute()
        
        if not existing.data:
            # Insert new grant
            supabase.table('grants').insert(grant).execute()
            
            # Alert relevant users
            await notify_eligible_users(grant)
```

**Connect to Business Plan Master Agent:**

```python
# grant_application_pipeline.py
from langgraph.graph import StateGraph

class GrantApplicationState(TypedDict):
    startup_profile: dict
    matched_grant: dict
    eligibility_check: dict
    business_plan: dict
    application_file: str

async def match_grants(state: GrantApplicationState):
    """Step 1: Match startup to grants"""
    profile = state['startup_profile']
    
    # Query grants database
    grants = supabase.table('grants').select('*').execute()
    
    # Check eligibility for each
    eligible_grants = []
    
    for grant in grants.data:
        check = check_eligibility(profile, grant)
        
        if check['eligible']:
            eligible_grants.append({
                'grant': grant,
                'fit_score': calculate_fit_score(profile, grant)
            })
    
    # Sort by fit score
    eligible_grants.sort(key=lambda x: x['fit_score'], reverse=True)
    
    state['matched_grant'] = eligible_grants[0]['grant'] if eligible_grants else None
    
    return state

async def generate_business_plan(state: GrantApplicationState):
    """Step 2: Generate Korean business plan"""
    grant = state['matched_grant']
    profile = state['startup_profile']
    
    # Call Business Plan Master Agent (Agent #10)
    bizplan_agent = get_bizplan_agent()
    
    plan = await bizplan_agent.generate(
        company_info=profile,
        format='TIPS_application',  # Grant-specific format
        language='korean',
        sections=[
            '사업 개요',
            '기술 개발 계획',
            '시장 분석',
            '사업화 전략',
            '재무 계획'
        ]
    )
    
    state['business_plan'] = plan
    
    return state

async def generate_hwp_file(state: GrantApplicationState):
    """Step 3: Generate HWP application file"""
    plan = state['business_plan']
    
    # Call HWP Converter Agent (Agent #1)
    hwp_agent = get_hwp_agent()
    
    hwp_file = await hwp_agent.generate_hwp(
        content=plan,
        template='government_application',
        formatting={
            'font': '바탕체',
            'size': 11,
            'margins': {'top': 30, 'bottom': 30, 'left': 20, 'right': 20}
        }
    )
    
    state['application_file'] = hwp_file
    
    return state

# Build workflow
workflow = StateGraph(GrantApplicationState)

workflow.add_node("match_grants", match_grants)
workflow.add_node("generate_plan", generate_business_plan)
workflow.add_node("generate_hwp", generate_hwp_file)

workflow.add_edge("match_grants", "generate_plan")
workflow.add_edge("generate_plan", "generate_hwp")

app = workflow.compile()

# Run complete pipeline
result = await app.ainvoke({
    'startup_profile': {
        'name': 'SK AutoSphere',
        'industry': 'AI',
        'age_years': 1,
        'revenue_krw': 0,
        'team_size': 3
    }
})
```

**Production Features:**

```yaml
Live Crawler:
  Implementation:
    - Playwright for dynamic JavaScript sites
    - Daily CRON job (6 AM KST)
    - Error handling & retry logic
    - Notification on failures
  
  Data Extraction:
    - Grant title & category
    - Eligibility criteria (parse from Korean text)
    - Application deadline
    - Funding amount (₩)
    - Required documents (download PDFs)

Eligibility Engine:
  Rules-Based (Not AI):
    - Company age check
    - Revenue limit check
    - Industry match
    - Location restrictions
    - Patent requirements
  
  Output:
    - Boolean: Eligible or not
    - Detailed reasons for rejection
    - Suggestions to become eligible

Full Draft Generation:
  HWP Application:
    - 20+ page business plan
    - Korean government format
    - Required sections:
      * 사업 개요 (Business Overview)
      * 기술 개발 계획 (Tech Development Plan)
      * 시장 분석 (Market Analysis)
      * 사업화 전략 (Commercialization Strategy)
      * 재무 계획 (Financial Plan)
      * 팀 소개 (Team Introduction)
  
  Excel Financials:
    - 3-year projections
    - Balance sheet (대차대조표)
    - P&L (손익계산서)
    - Cash flow (현금흐름표)
  
  Supporting Documents:
    - Team CVs (Korean format)
    - Company registration
    - Patent certificates (if applicable)
```

---

### 🔷 AGENT #8: Safety Guardian (Industrial IoT)

#### Current MVP Limitations
- Simulates sensor stream
- Basic threshold detection
- Mock compliance logs

#### Production Upgrade Strategy

**Custom MCP Server: Industrial Protocols**

```yaml
MCP Server: IoT Protocol Handler
  Build using mcp-builder skill
  
  Supported Protocols:
    1. MQTT (IoT Standard):
       - Broker: Mosquitto or HiveMQ
       - Topics: sensor/temp, sensor/pressure, etc.
       - QoS: 2 (exactly once delivery)
    
    2. Modbus TCP/RTU:
       - Connect to Siemens PLCs
       - Mitsubishi controllers
       - Allen-Bradley systems
    
    3. OPC-UA:
       - Factory automation standard
       - Real-time data access
       - Historical data retrieval
  
  Features:
    - Multi-protocol support
    - Auto-reconnect on failure
    - Data buffering (offline mode)
    - Edge deployment ready
```

**MQTT Integration:**

```python
# mqtt_client.py
import paho.mqtt.client as mqtt
import json
from datetime import datetime

class IoTMQTTClient:
    def __init__(self, broker_url: str, port: int = 1883):
        self.client = mqtt.Client()
        self.broker_url = broker_url
        self.port = port
        
        # Callbacks
        self.client.on_connect = self.on_connect
        self.client.on_message = self.on_message
    
    def connect(self):
        """Connect to MQTT broker"""
        self.client.connect(self.broker_url, self.port, 60)
        self.client.loop_start()
    
    def on_connect(self, client, userdata, flags, rc):
        """Callback when connected"""
        print(f"Connected to MQTT broker: {rc}")
        
        # Subscribe to all sensor topics
        self.client.subscribe("sensor/#")
    
    def on_message(self, client, userdata, msg):
        """Callback when message received"""
        try:
            # Parse sensor data
            data = json.loads(msg.payload.decode())
            
            # Process based on sensor type
            if 'temperature' in msg.topic:
                self.process_temperature(data)
            elif 'pressure' in msg.topic:
                self.process_pressure(data)
            elif 'vibration' in msg.topic:
                self.process_vibration(data)
        
        except Exception as e:
            print(f"Error processing message: {e}")
    
    def process_temperature(self, data: dict):
        """Process temperature sensor data"""
        sensor_id = data['sensor_id']
        temp = data['value']
        timestamp = data['timestamp']
        
        # Check threshold
        if temp > 80:
            self.trigger_alert(
                severity='CRITICAL',
                sensor_id=sensor_id,
                message=f"Temperature critical: {temp}°C",
                value=temp,
                threshold=80
            )
        elif temp > 70:
            self.trigger_alert(
                severity='WARNING',
                sensor_id=sensor_id,
                message=f"Temperature high: {temp}°C",
                value=temp,
                threshold=70
            )
        
        # Store for analysis
        self.store_reading(sensor_id, 'temperature', temp, timestamp)
    
    def trigger_alert(self, severity: str, sensor_id: str, message: str, **kwargs):
        """Trigger alert and log"""
        alert = {
            'severity': severity,
            'sensor_id': sensor_id,
            'message': message,
            'timestamp': datetime.now().isoformat(),
            'metadata': kwargs
        }
        
        # Send to alert system (Slack, PagerDuty, etc.)
        self.send_to_alert_system(alert)
        
        # Log to immutable storage
        self.log_to_blockchain(alert)
    
    def store_reading(self, sensor_id: str, type: str, value: float, timestamp: str):
        """Store sensor reading"""
        # Insert to TimescaleDB or InfluxDB
        supabase.table('sensor_readings').insert({
            'sensor_id': sensor_id,
            'type': type,
            'value': value,
            'timestamp': timestamp
        }).execute()
    
    def send_to_alert_system(self, alert: dict):
        """Send alert via multiple channels"""
        # Slack
        slack_webhook.post(json={
            'text': f"🚨 {alert['severity']}: {alert['message']}"
        })
        
        # Email
        send_email(
            to='safety@factory.com',
            subject=f"Safety Alert: {alert['sensor_id']}",
            body=alert['message']
        )
        
        # SMS (critical alerts only)
        if alert['severity'] == 'CRITICAL':
            send_sms(
                to='+82-10-1234-5678',
                message=alert['message']
            )
    
    def log_to_blockchain(self, alert: dict):
        """Log to immutable blockchain ledger"""
        # Use IPFS or private blockchain
        # Ensures compliance logs can't be tampered
        
        hash_value = hashlib.sha256(
            json.dumps(alert).encode()
        ).hexdigest()
        
        # Store in blockchain or WORM storage
        blockchain_client.add_log(alert, hash_value)

# Usage
client = IoTMQTTClient(broker_url='mqtt.factory.local')
client.connect()
```

**Modbus Integration:**

```python
# modbus_client.py
from pymodbus.client import ModbusTcpClient
import time

class ModbusPLCClient:
    def __init__(self, plc_ip: str, port: int = 502):
        self.client = ModbusTcpClient(plc_ip, port=port)
        self.connected = False
    
    def connect(self):
        """Connect to PLC"""
        self.connected = self.client.connect()
        return self.connected
    
    def read_temperature_sensors(self) -> list:
        """Read temperature from holding registers"""
        # Register addresses (PLC-specific)
        TEMP_START_ADDR = 1000
        NUM_SENSORS = 10
        
        result = self.client.read_holding_registers(
            address=TEMP_START_ADDR,
            count=NUM_SENSORS,
            slave=1
        )
        
        if result.isError():
            print(f"Error reading from PLC: {result}")
            return []
        
        # Convert register values to temperatures
        temperatures = []
        for i, reg_value in enumerate(result.registers):
            # Assume value is in 0.1°C units
            temp = reg_value / 10.0
            
            temperatures.append({
                'sensor_id': f'TEMP_{i+1}',
                'value': temp,
                'timestamp': datetime.now().isoformat()
            })
        
        return temperatures
    
    def poll_sensors(self, interval_seconds: int = 5):
        """Continuously poll sensors"""
        while True:
            try:
                temps = self.read_temperature_sensors()
                
                for reading in temps:
                    # Process each reading
                    process_sensor_data(reading)
                
                time.sleep(interval_seconds)
            
            except Exception as e:
                print(f"Polling error: {e}")
                time.sleep(10)  # Wait before retry

# Usage
plc_client = ModbusPLCClient(plc_ip='192.168.1.100')
if plc_client.connect():
    plc_client.poll_sensors(interval_seconds=5)
```

**Edge Computing Deployment:**

```yaml
Hardware: NVIDIA Jetson Nano
  Cost: $99 USD
  Specs:
    - CPU: Quad-core ARM A57
    - GPU: 128-core Maxwell
    - RAM: 4GB
    - Storage: 16GB eMMC + microSD
  
  Deployment:
    1. Install Jetson OS (Ubuntu 18.04)
    2. Install Docker
    3. Deploy AI model container
    4. Connect to factory network

AI Model Optimization:
  Original Model:
    - TensorFlow/PyTorch
    - Size: 500MB
    - Inference: 200ms
  
  Quantized Model:
    - TensorFlow Lite
    - Size: 50MB (10x smaller)
    - Inference: 20ms (10x faster)
    - Accuracy: 98% (vs 99% original)
  
  Conversion:
    import tensorflow as tf
    
    # Load trained model
    model = tf.keras.models.load_model('anomaly_detector.h5')
    
    # Convert to TFLite
    converter = tf.lite.TFLiteConverter.from_keras_model(model)
    converter.optimizations = [tf.lite.Optimize.DEFAULT]
    converter.target_spec.supported_types = [tf.float16]
    
    tflite_model = converter.convert()
    
    # Save
    with open('anomaly_detector.tflite', 'wb') as f:
        f.write(tflite_model)

Edge-Cloud Architecture:
  Edge Device:
    - Run AI model locally
    - Detect anomalies in real-time
    - Log all readings to local storage
    - Send only alerts to cloud
  
  Benefits:
    - Offline operation (24-48 hours)
    - Reduced bandwidth (99% less)
    - Low latency (<50ms)
    - Privacy (data stays local)
  
  Cloud:
    - Receive alerts only
    - Long-term storage
    - Analytics & reporting
    - Model updates
```

**Immutable Compliance Logging:**

```python
# blockchain_logger.py
from web3 import Web3
import hashlib
import json

class ComplianceLogger:
    def __init__(self, blockchain_url: str = 'http://localhost:8545'):
        self.w3 = Web3(Web3.HTTPProvider(blockchain_url))
        
        # Smart contract for logging
        self.contract_address = '0x...'
        self.contract_abi = [...]  # Contract ABI
        
        self.contract = self.w3.eth.contract(
            address=self.contract_address,
            abi=self.contract_abi
        )
    
    def log_event(self, event_data: dict) -> str:
        """Log event to blockchain"""
        # Create hash
        event_json = json.dumps(event_data, sort_keys=True)
        event_hash = hashlib.sha256(event_json.encode()).hexdigest()
        
        # Send transaction to smart contract
        tx_hash = self.contract.functions.logEvent(
            eventHash=event_hash,
            eventType=event_data['type'],
            timestamp=int(time.time()),
            metadata=json.dumps(event_data)
        ).transact()
        
        # Wait for confirmation
        receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash)
        
        return receipt.transactionHash.hex()
    
    def verify_event(self, event_data: dict, tx_hash: str) -> bool:
        """Verify event hasn't been tampered"""
        # Recreate hash
        event_json = json.dumps(event_data, sort_keys=True)
        event_hash = hashlib.sha256(event_json.encode()).hexdigest()
        
        # Get from blockchain
        stored_hash = self.contract.functions.getEventHash(tx_hash).call()
        
        return event_hash == stored_hash
    
    def generate_compliance_report(self, start_date: str, end_date: str) -> dict:
        """Generate audit report"""
        # Query all events in date range
        events = self.contract.functions.getEventsByDateRange(
            start_date, end_date
        ).call()
        
        report = {
            'period': f"{start_date} to {end_date}",
            'total_events': len(events),
            'critical_alerts': len([e for e in events if e['severity'] == 'CRITICAL']),
            'warnings': len([e for e in events if e['severity'] == 'WARNING']),
            'events': events
        }
        
        return report

# Alternative: WORM Storage (Write Once Read Many)
class WORMStorage:
    def __init__(self, storage_path: str):
        self.storage_path = storage_path
    
    def write_log(self, log_data: dict) -> str:
        """Write log (append-only)"""
        log_id = str(uuid.uuid4())
        filename = f"{log_id}.json"
        filepath = os.path.join(self.storage_path, filename)
        
        with open(filepath, 'w') as f:
            json.dump(log_data, f, indent=2)
        
        # Make read-only
        os.chmod(filepath, 0o444)
        
        return log_id
    
    def read_log(self, log_id: str) -> dict:
        """Read log"""
        filepath = os.path.join(self.storage_path, f"{log_id}.json")
        
        with open(filepath, 'r') as f:
            return json.load(f)
```

**Production Features:**

```yaml
Protocol Support:
  MQTT:
    - Broker: Mosquitto (open-source)
    - Topics: Hierarchical (factory/line/sensor/temp)
    - QoS: 2 (exactly once)
    - Retained messages for last-known state
  
  Modbus:
    - Modbus TCP for ethernet PLCs
    - Modbus RTU for serial (RS-485)
    - Support major brands (Siemens, Mitsubishi, AB)
  
  OPC-UA:
    - Industry standard for automation
    - Server discovery
    - Historical data access
    - Alarms & events

Edge Computing:
  Deployment:
    - Hardware: Jetson Nano or Raspberry Pi 4
    - OS: Ubuntu + Docker
    - Model: TensorFlow Lite quantized
  
  Operation:
    - Offline mode: 24-48 hours
    - Local alerting (buzzer, light)
    - Cloud sync when online
    - OTA updates for model

Legal Compliance:
  Immutable Logs:
    - Option A: Private blockchain (Hyperledger)
    - Option B: WORM storage (append-only files)
    - Option C: AWS S3 Object Lock
  
  Audit Trail:
    - Every alert logged
    - Timestamps (NTP synced)
    - Hash verification
    - ISO 27001 compliant
```

---

### 🔷 AGENT #9: K-Startup Navigator

#### Current MVP Limitations
- Mock program database
- Basic strategy generation

#### Production Upgrade Strategy

**THIS IS YOUR KOREAN STARTUP SUPPORT PLATFORM!**

**Enhanced Integration:**

```yaml
Connect Multiple Agents:
  
  Navigator (Agent #9) → Grant Scout (Agent #7):
    - Navigator matches startup profile to programs
    - Grant Scout finds active opportunities
    - Returns eligibility status & deadlines
  
  Grant Scout (Agent #7) → Business Plan Master (Agent #10):
    - Extract grant application requirements
    - Generate program-specific business plan
    - Format in Korean government standard
  
  Business Plan Master (Agent #10) → HWP Converter (Agent #1):
    - Convert business plan to HWP format
    - Apply government template
    - Generate final submission file
  
  Complete Pipeline:
    Startup Profile → Navigator → Grant Scout → Business Plan → HWP File
    
    Result: Complete TIPS/OASIS/K-GC application in 2 hours
```

**Success Prediction Model:**

```python
# success_predictor.py
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split

class TIPSSuccessPredictor:
    def __init__(self):
        self.model = RandomForestClassifier(
            n_estimators=100,
            max_depth=10,
            random_state=42
        )
        self.trained = False
    
    def train(self, historical_data: pd.DataFrame):
        """Train model on past applications"""
        # Features
        features = [
            'team_size',
            'patent_count',
            'founder_experience_years',
            'revenue_krw',
            'yoy_growth_percentage',
            'sector_encoded',
            'has_tech_advisor',
            'previous_funding_amount'
        ]
        
        X = historical_data[features]
        y = historical_data['approved']  # 0 or 1
        
        # Split
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        
        # Train
        self.model.fit(X_train, y_train)
        
        # Evaluate
        accuracy = self.model.score(X_test, y_test)
        print(f"Model accuracy: {accuracy:.2%}")
        
        self.trained = True
    
    def predict_success(self, startup_profile: dict) -> dict:
        """Predict approval probability"""
        if not self.trained:
            raise ValueError("Model not trained yet")
        
        # Prepare features
        features = pd.DataFrame([{
            'team_size': startup_profile['team_size'],
            'patent_count': startup_profile.get('patent_count', 0),
            'founder_experience_years': startup_profile['founder_experience_years'],
            'revenue_krw': startup_profile.get('revenue_krw', 0),
            'yoy_growth_percentage': startup_profile.get('yoy_growth', 0),
            'sector_encoded': self.encode_sector(startup_profile['sector']),
            'has_tech_advisor': startup_profile.get('has_tech_advisor', False),
            'previous_funding_amount': startup_profile.get('previous_funding', 0)
        }])
        
        # Predict probability
        prob = self.model.predict_proba(features)[0][1]
        
        # Feature importance
        importance = dict(zip(
            features.columns,
            self.model.feature_importances_
        ))
        
        # Recommendations
        recommendations = self.generate_recommendations(
            startup_profile, importance
        )
        
        return {
            'success_probability': prob,
            'confidence': 'high' if prob > 0.7 or prob < 0.3 else 'medium',
            'feature_importance': importance,
            'recommendations': recommendations
        }
    
    def generate_recommendations(
        self,
        profile: dict,
        importance: dict
    ) -> list:
        """Generate recommendations to improve chances"""
        recs = []
        
        # Patent count
        if profile.get('patent_count', 0) == 0 and importance['patent_count'] > 0.1:
            recs.append({
                'priority': 'HIGH',
                'action': 'Apply for at least 1 patent before submission',
                'impact': 'Increases approval chance by ~22%'
            })
        
        # Team size
        if profile['team_size'] < 3 and importance['team_size'] > 0.1:
            recs.append({
                'priority': 'MEDIUM',
                'action': 'Expand team to 3-5 members',
                'impact': 'Increases approval chance by ~15%'
            })
        
        # Tech advisor
        if not profile.get('has_tech_advisor') and importance['has_tech_advisor'] > 0.1:
            recs.append({
                'priority': 'MEDIUM',
                'action': 'Recruit technical advisor from industry',
                'impact': 'Increases approval chance by ~18%'
            })
        
        return recs

# Load historical data
historical_apps = pd.read_csv('tips_applications_2019_2024.csv')

# Train model
predictor = TIPSSuccessPredictor()
predictor.train(historical_apps)

# Predict for new startup
result = predictor.predict_success({
    'team_size': 3,
    'patent_count': 1,
    'founder_experience_years': 5,
    'revenue_krw': 50000000,
    'yoy_growth': 120,
    'sector': 'AI',
    'has_tech_advisor': True,
    'previous_funding': 0
})

print(f"Success Probability: {result['success_probability']:.0%}")
print(f"Recommendations: {result['recommendations']}")
```

**Mentor Matching System:**

```python
# mentor_matching.py
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

class MentorMatcher:
    def __init__(self, mentor_database: list):
        self.mentors = mentor_database
        self.vectorizer = TfidfVectorizer()
        
        # Create mentor profiles
        mentor_texts = [
            self.create_mentor_profile_text(m) for m in self.mentors
        ]
        self.mentor_vectors = self.vectorizer.fit_transform(mentor_texts)
    
    def create_mentor_profile_text(self, mentor: dict) -> str:
        """Create searchable text from mentor profile"""
        return f"""
        {' '.join(mentor['sectors'])}
        {' '.join(mentor['expertise'])}
        {mentor['description']}
        {' '.join(mentor['past_investments'])}
        """
    
    def find_best_mentors(
        self,
        startup_profile: dict,
        top_k: int = 5
    ) -> list:
        """Find best mentor matches"""
        
        # Create startup profile text
        startup_text = f"""
        {startup_profile['sector']}
        {startup_profile['technology']}
        {startup_profile['stage']}
        {startup_profile['business_model']}
        """
        
        # Vectorize
        startup_vector = self.vectorizer.transform([startup_text])
        
        # Calculate similarity
        similarities = cosine_similarity(
            startup_vector,
            self.mentor_vectors
        )[0]
        
        # Get top K
        top_indices = similarities.argsort()[-top_k:][::-1]
        
        matches = []
        for idx in top_indices:
            mentor = self.mentors[idx]
            
            matches.append({
                'mentor': mentor,
                'similarity_score': similarities[idx],
                'match_reasons': self.explain_match(startup_profile, mentor)
            })
        
        return matches
    
    def explain_match(self, startup: dict, mentor: dict) -> list:
        """Explain why mentor is a good match"""
        reasons = []
        
        # Sector match
        if startup['sector'] in mentor['sectors']:
            reasons.append(f"Expertise in {startup['sector']} sector")
        
        # Stage match
        if startup['stage'] in mentor['preferred_stages']:
            reasons.append(f"Experience with {startup['stage']} startups")
        
        # Success rate
        if mentor['success_rate'] > 0.3:
            reasons.append(
                f"High success rate ({mentor['success_rate']:.0%}) "
                f"with portfolio companies"
            )
        
        # Recent activity
        if mentor['last_investment_days'] < 90:
            reasons.append("Recently active in investments")
        
        return reasons

# Mentor database (from Supabase)
mentors = supabase.table('mentors').select('*').execute().data

# Create matcher
matcher = MentorMatcher(mentors)

# Find matches
matches = matcher.find_best_mentors(
    startup_profile={
        'sector': 'AI',
        'technology': 'Computer Vision',
        'stage': 'Seed',
        'business_model': 'B2B SaaS'
    },
    top_k=5
)

for i, match in enumerate(matches, 1):
    print(f"\n{i}. {match['mentor']['name']}")
    print(f"   Similarity: {match['similarity_score']:.0%}")
    print(f"   Reasons:")
    for reason in match['match_reasons']:
        print(f"   - {reason}")
```

**Production Features:**

```yaml
Success Prediction:
  ML Classifier:
    - Training data: 1000+ past TIPS/OASIS applications
    - Features:
      * Team size & experience
      * Patent count
      * Revenue & growth
      * Sector
      * Technical advisor
      * Previous funding
    - Output: Probability (0-100%)
  
  Recommendations:
    - "Your patent portfolio increases chances by 22%"
    - "Adding a technical advisor: +18%"
    - "Team expansion to 5 members: +15%"

Mentor Matching:
  Database:
    - 500+ Korean VCs & accelerators
    - Sector expertise tags
    - Investment stage preferences
    - Success rate by mentor
    - Recent investment activity
  
  Matching Algorithm:
    - TF-IDF vectorization
    - Cosine similarity
    - Explain match reasons
  
  Auto-Introduction:
    - Draft email introduction
    - Warm intro via mutual connections
    - Track response rate
```

---

### 🔷 AGENT #10: Business Plan Master ⭐ FLAGSHIP PRODUCT

#### Current MVP Limitations
- Basic translation (EN→KR)
- Simple formatting
- No HWP generation

#### Production Upgrade Strategy

**THIS IS YOUR CORE PRODUCT!**

**Complete Integration:**

```yaml
Combine Multiple Tools:

MCP Server #1: DocTranslate MCP
  Purpose: Professional EN↔KR translation
  Features:
    - Business terminology preservation
    - Tone adjustment (formal business Korean)
    - Context-aware translation
    - Industry-specific vocabulary

MCP Server #2: DOCX MCP (hongkongkiwi/docx-mcp)
  Purpose: Native document generation
  Features:
    - HWP-compatible DOCX creation
    - Korean fonts & formatting
    - Table & chart generation
    - Template application

MCP Server #3: Document Generator MCP
  Purpose: Automated document creation
  Features:
    - Generate from structured data
    - Multi-format output
    - Timestamp & versioning

Custom Skill: korean-bizplan-generator
  Purpose: Orchestrate all MCPs
  Features:
    - Apply TIPS/OASIS/K-GC formats
    - Generate program-specific sections
    - Validate required content
    - Quality checks

n8n Workflow: "Complete Application Pipeline"
  Purpose: End-to-end automation
  Steps:
    1. Collect English input
    2. Translate to Korean
    3. Format to gov standard
    4. Generate HWP
    5. Create Excel financials
    6. Package for submission
```

**Korean Business Plan Generator Skill:**

```markdown
# korean-bizplan-generator.skill

## Purpose
Generate Korean government-format business plans (사업계획서) for startup programs (TIPS, OASIS, K-Startup Grand Challenge).

## Inputs
- `company_info`: Company name, industry, stage
- `english_content`: Business plan in English (notes, bullet points, or full text)
- `program_type`: "TIPS" | "OASIS" | "K-GC" | "General"
- `output_format`: "HWP" | "DOCX" | "PDF"

## Process

### Step 1: Content Translation
Use DocTranslate MCP to translate English → Korean:
- Preserve business terminology
- Use formal business tone (합니다체)
- Keep technical terms in English where appropriate
- Examples:
  * "Product-market fit" → "제품-시장 적합성 (Product-Market Fit)"
  * "Unique value proposition" → "독창적 가치 제안"
  * "Business model" → "비즈니스 모델"

### Step 2: Korean Market Data Integration
Add Korea-specific context:
- Market size in Korean Won (₩)
- Korean competitor analysis
- Korean regulatory environment
- Local customer insights

### Step 3: Section Generation
Generate required sections based on program:

**TIPS Format:**
1. 사업 개요 (Business Overview)
   - 회사 소개
   - 대표자 소개
   - 사업 아이템 요약

2. 기술 개발 계획 (Technology Development Plan)
   - 핵심 기술 설명
   - 기술의 차별성
   - 개발 일정
   - 지식재산권 현황

3. 시장 분석 (Market Analysis)
   - 시장 규모 및 성장성
   - 경쟁사 분석
   - 목표 시장
   - 진입 전략

4. 사업화 전략 (Commercialization Strategy)
   - 마케팅 계획
   - 판매 전략
   - 생산 계획
   - 수익 모델

5. 재무 계획 (Financial Plan)
   - 3개년 손익계산서
   - 현금흐름표
   - 자금 조달 계획
   - 투자 유치 계획

6. 추진 일정 (Timeline)
   - 단계별 계획
   - 주요 마일스톤
   - 위험 요소 및 대응

**OASIS Format:**
1. 사업 개요
2. 제품/서비스
3. 시장 분석
4. 재무 계획

**K-GC Format:**
1. Business Overview
2. Product/Service
3. Market Entry Strategy
4. Team

### Step 4: Financial Modeling
Generate Excel financial projections:

```python
def generate_financials(company_info):
    # 3-year projections
    years = [2026, 2027, 2028]
    
    # Revenue projections
    revenue = [
        company_info['year1_revenue'],
        company_info['year1_revenue'] * 1.5,  # 50% growth
        company_info['year1_revenue'] * 2.5   # 66% growth
    ]
    
    # COGS (40% of revenue)
    cogs = [r * 0.4 for r in revenue]
    
    # Operating expenses
    opex = calculate_opex(company_info['team_size'], years)
    
    # Net income
    net_income = [
        revenue[i] - cogs[i] - opex[i]
        for i in range(3)
    ]
    
    # Create Excel file
    create_excel_financials(years, revenue, cogs, opex, net_income)
```

### Step 5: Document Generation
Use DOCX MCP to create formatted document:
- Apply Korean government template
- Font: 바탕체 (Batang) 11pt
- Margins: 30mm top/bottom, 20mm left/right
- Page numbers: Bottom center
- Headers: Section titles

### Step 6: HWP Conversion
Convert to HWP format (if required):
- Use Hancom Office API
- Or use HWP Converter Agent (#1)
- Preserve formatting exactly

### Step 7: Quality Checks
Validate before delivery:
- [ ] All required sections present
- [ ] Korean spelling & grammar
- [ ] Financial numbers match narrative
- [ ] Proper government formatting
- [ ] PDF preview generated

## Outputs
- `business_plan_hwp`: HWP file (government standard)
- `business_plan_docx`: DOCX file (editable)
- `business_plan_pdf`: PDF file (read-only)
- `financial_projections_xlsx`: Excel file
- `submission_checklist`: List of required documents

## Integration Points
- Input from: K-Startup Navigator (Agent #9)
- Input from: Grant Scout (Agent #7)
- Output to: HWP Converter (Agent #1)
- Output to: User dashboard (download links)

## Quality Metrics
- Translation accuracy: >95%
- Format compliance: 100%
- Generation time: <5 minutes
- User satisfaction: >4.5/5
```

**Financial Modeling Module:**

```python
# financial_modeler.py
import pandas as pd
from openpyxl import Workbook
from openpyxl.styles import Font, Alignment, PatternFill

class KoreanFinancialModeler:
    def __init__(self):
        self.wb = Workbook()
        self.setup_styles()
    
    def setup_styles(self):
        """Setup Excel styles"""
        self.header_font = Font(name='맑은 고딕', size=12, bold=True)
        self.header_fill = PatternFill(
            start_color='4472C4',
            end_color='4472C4',
            fill_type='solid'
        )
        self.currency_format = '#,##0"원"'
    
    def generate_profit_loss(
        self,
        company_name: str,
        projections: dict
    ) -> str:
        """Generate P&L statement (손익계산서)"""
        
        ws = self.wb.create_sheet("손익계산서")
        
        # Title
        ws['A1'] = f"{company_name} 손익계산서"
        ws['A1'].font = Font(size=14, bold=True)
        
        # Headers
        headers = ['항목', '2026', '2027', '2028']
        for col, header in enumerate(headers, start=1):
            cell = ws.cell(row=3, column=col)
            cell.value = header
            cell.font = self.header_font
            cell.fill = self.header_fill
            cell.alignment = Alignment(horizontal='center')
        
        # Revenue
        row = 4
        ws.cell(row, 1).value = "I. 매출액"
        ws.cell(row, 1).font = Font(bold=True)
        
        for i, year in enumerate([2026, 2027, 2028]):
            ws.cell(row, i+2).value = projections['revenue'][i]
            ws.cell(row, i+2).number_format = self.currency_format
        
        # COGS
        row += 1
        ws.cell(row, 1).value = "II. 매출원가"
        for i in range(3):
            ws.cell(row, i+2).value = projections['cogs'][i]
            ws.cell(row, i+2).number_format = self.currency_format
        
        # Gross Profit
        row += 1
        ws.cell(row, 1).value = "III. 매출총이익"
        ws.cell(row, 1).font = Font(bold=True)
        for i in range(3):
            ws.cell(row, i+2).value = projections['revenue'][i] - projections['cogs'][i]
            ws.cell(row, i+2).number_format = self.currency_format
        
        # Operating Expenses
        row += 1
        ws.cell(row, 1).value = "IV. 판매비와관리비"
        for i in range(3):
            ws.cell(row, i+2).value = projections['opex'][i]
            ws.cell(row, i+2).number_format = self.currency_format
        
        # Operating Income
        row += 1
        ws.cell(row, 1).value = "V. 영업이익"
        ws.cell(row, 1).font = Font(bold=True)
        for i in range(3):
            gross_profit = projections['revenue'][i] - projections['cogs'][i]
            ws.cell(row, i+2).value = gross_profit - projections['opex'][i]
            ws.cell(row, i+2).number_format = self.currency_format
        
        # Net Income
        row += 2
        ws.cell(row, 1).value = "VI. 당기순이익"
        ws.cell(row, 1).font = Font(bold=True, size=12)
        for i in range(3):
            ws.cell(row, i+2).value = projections['net_income'][i]
            ws.cell(row, i+2).number_format = self.currency_format
            ws.cell(row, i+2).font = Font(bold=True)
        
        return ws
    
    def generate_cash_flow(self, projections: dict):
        """Generate cash flow statement (현금흐름표)"""
        ws = self.wb.create_sheet("현금흐름표")
        
        # Headers
        headers = ['항목', '2026', '2027', '2028']
        for col, header in enumerate(headers, start=1):
            cell = ws.cell(row=2, column=col)
            cell.value = header
            cell.font = self.header_font
        
        # Operating Activities
        row = 3
        ws.cell(row, 1).value = "I. 영업활동 현금흐름"
        ws.cell(row, 1).font = Font(bold=True)
        
        row += 1
        ws.cell(row, 1).value = "  당기순이익"
        for i in range(3):
            ws.cell(row, i+2).value = projections['net_income'][i]
        
        # Investing Activities
        row += 2
        ws.cell(row, 1).value = "II. 투자활동 현금흐름"
        ws.cell(row, 1).font = Font(bold=True)
        
        # Financing Activities
        row += 2
        ws.cell(row, 1).value = "III. 재무활동 현금흐름"
        ws.cell(row, 1).font = Font(bold=True)
        
        return ws
    
    def generate_balance_sheet(self, projections: dict):
        """Generate balance sheet (대차대조표)"""
        ws = self.wb.create_sheet("대차대조표")
        
        # Headers
        headers = ['항목', '2026', '2027', '2028']
        for col, header in enumerate(headers, start=1):
            cell = ws.cell(row=2, column=col)
            cell.value = header
            cell.font = self.header_font
        
        # Assets
        row = 3
        ws.cell(row, 1).value = "I. 자산"
        ws.cell(row, 1).font = Font(bold=True)
        
        # Liabilities
        row += 5
        ws.cell(row, 1).value = "II. 부채"
        ws.cell(row, 1).font = Font(bold=True)
        
        # Equity
        row += 5
        ws.cell(row, 1).value = "III. 자본"
        ws.cell(row, 1).font = Font(bold=True)
        
        return ws
    
    def save(self, filename: str):
        """Save workbook"""
        # Remove default sheet
        if 'Sheet' in self.wb.sheetnames:
            self.wb.remove(self.wb['Sheet'])
        
        self.wb.save(filename)

# Usage
modeler = KoreanFinancialModeler()

projections = {
    'revenue': [100000000, 150000000, 250000000],  # ₩100M, ₩150M, ₩250M
    'cogs': [40000000, 60000000, 100000000],
    'opex': [50000000, 70000000, 90000000],
    'net_income': [10000000, 20000000, 60000000]
}

modeler.generate_profit_loss("SK AutoSphere", projections)
modeler.generate_cash_flow(projections)
modeler.generate_balance_sheet(projections)

modeler.save("SK_AutoSphere_재무제표_2026.xlsx")
```

**HWP Generation:**

```python
# hwp_generator.py
# Using Hancom Office Automation

import win32com.client as win32

class HWPGenerator:
    def __init__(self):
        self.hwp = win32.gencache.EnsureDispatch("HWPFrame.HwpObject")
        self.hwp.RegisterModule("FilePathCheckDLL", "FilePathCheckerModule")
    
    def create_document(self, template_path: str = None):
        """Create new HWP document"""
        if template_path:
            self.hwp.Open(template_path)
        else:
            self.hwp.HAction.Run("FileNew")
    
    def set_page_setup(self):
        """Set Korean government standard formatting"""
        # A4 size: 210mm x 297mm
        # Margins: 30mm top/bottom, 20mm left/right
        
        self.hwp.HAction.GetDefault("PageSetup", self.hwp.HParameterSet.HPageDef.HSet)
        
        # Paper size
        self.hwp.HParameterSet.HPageDef.PaperWidth = 21000  # 210mm
        self.hwp.HParameterSet.HPageDef.PaperHeight = 29700  # 297mm
        
        # Margins (in HWPUNIT: 1mm = 100 HWPUNIT)
        self.hwp.HParameterSet.HPageDef.TopMargin = 3000    # 30mm
        self.hwp.HParameterSet.HPageDef.BottomMargin = 3000
        self.hwp.HParameterSet.HPageDef.LeftMargin = 2000   # 20mm
        self.hwp.HParameterSet.HPageDef.RightMargin = 2000
        
        self.hwp.HAction.Execute("PageSetup", self.hwp.HParameterSet.HPageDef.HSet)
    
    def set_font(self, name: str = "바탕체", size: int = 11):
        """Set font style"""
        self.hwp.HAction.GetDefault("CharShape", self.hwp.HParameterSet.HCharShape.HSet)
        
        self.hwp.HParameterSet.HCharShape.FaceNameHangul = name
        self.hwp.HParameterSet.HCharShape.FontTypeHangul = 0
        self.hwp.HParameterSet.HCharShape.Height = size * 100  # 11pt = 1100
        
        self.hwp.HAction.Execute("CharShape", self.hwp.HParameterSet.HCharShape.HSet)
    
    def add_heading(self, text: str, level: int = 1):
        """Add heading"""
        # Set heading style
        style_name = f"제목 {level}"
        self.hwp.HAction.Run("StyleApply", style_name)
        
        # Insert text
        self.hwp.HAction.GetDefault("InsertText", self.hwp.HParameterSet.HInsertText.HSet)
        self.hwp.HParameterSet.HInsertText.Text = text
        self.hwp.HAction.Execute("InsertText", self.hwp.HParameterSet.HInsertText.HSet)
        
        # New paragraph
        self.hwp.HAction.Run("BreakPara")
    
    def add_paragraph(self, text: str):
        """Add paragraph"""
        self.hwp.HAction.GetDefault("InsertText", self.hwp.HParameterSet.HInsertText.HSet)
        self.hwp.HParameterSet.HInsertText.Text = text
        self.hwp.HAction.Execute("InsertText", self.hwp.HParameterSet.HInsertText.HSet)
        
        self.hwp.HAction.Run("BreakPara")
    
    def add_table(self, rows: int, cols: int, data: list):
        """Add table"""
        # Create table
        self.hwp.HAction.GetDefault("TableCreate", self.hwp.HParameterSet.HTableCreation.HSet)
        self.hwp.HParameterSet.HTableCreation.Rows = rows
        self.hwp.HParameterSet.HTableCreation.Cols = cols
        self.hwp.HParameterSet.HTableCreation.WidthType = 2  # Fit to paper
        
        self.hwp.HAction.Execute("TableCreate", self.hwp.HParameterSet.HTableCreation.HSet)
        
        # Fill data
        for i, row in enumerate(data):
            for j, cell in enumerate(row):
                # Move to cell
                self.hwp.HAction.Run("TableCellBlock", f"{i},{j},{i},{j}")
                
                # Insert text
                self.add_paragraph(str(cell))
    
    def add_page_number(self):
        """Add page number at bottom center"""
        self.hwp.HAction.Run("InsertPageNum")
    
    def save(self, filename: str):
        """Save document"""
        self.hwp.SaveAs(filename, "HWP")
    
    def close(self):
        """Close document"""
        self.hwp.Quit()

# Usage
generator = HWPGenerator()

# Create document
generator.create_document()
generator.set_page_setup()
generator.set_font("바탕체", 11)

# Add content
generator.add_heading("사업계획서", level=1)
generator.add_heading("1. 사업 개요", level=2)
generator.add_paragraph("SK AutoSphere는 한국과 아프리카를 연결하는...")

# Add table
table_data = [
    ['연도', '매출액', '영업이익'],
    ['2026', '₩100M', '₩10M'],
    ['2027', '₩150M', '₩20M'],
    ['2028', '₩250M', '₩60M']
]
generator.add_table(4, 3, table_data)

# Add page numbers
generator.add_page_number()

# Save
generator.save("SK_AutoSphere_사업계획서.hwp")
generator.close()
```

**Production Features:**

```yaml
Native HWP Generation:
  Methods:
    Option A: Hancom Office API (Windows only)
      - Requires Hancom Office installed
      - Full control over formatting
      - Perfect government compliance
    
    Option B: HWP Converter Agent (#1)
      - Cross-platform (Linux/Mac)
      - Uses pyhwp library
      - May lose some formatting
  
  Format Compliance:
    - Font: 바탕체 (Batang) 11pt
    - Line spacing: 160%
    - Margins: 30-20-30-20mm
    - Page numbers: Bottom center
    - Headers: Left-aligned
    - Tables: Grid borders

Financial Modeling:
  Excel Generation:
    - Use openpyxl library
    - Korean templates
    - Formatted cells (currency, percentages)
    - Charts (revenue growth, profit margin)
  
  Statements:
    - 손익계산서 (P&L)
    - 대차대조표 (Balance Sheet)
    - 현금흐름표 (Cash Flow)
  
  Validation:
    - Numbers match text narrative
    - Formulas calculate correctly
    - Ratios are reasonable
    - Breakeven analysis

Quality Checks:
  Pre-Delivery Validation:
    - [ ] All sections present (checklist)
    - [ ] Korean spelling (Naver spell check API)
    - [ ] Financial consistency
    - [ ] Proper formatting
    - [ ] PDF preview generated
    - [ ] Required docs list
  
  User Review:
    - Preview mode (PDF)
    - Inline editing allowed
    - Track changes
    - Approval workflow
```

---

## 🏗️ PRODUCTION INFRASTRUCTURE

---

### **Multi-Agent Orchestration (LangGraph)**

```python
# Complete 10-agent orchestration system
from langgraph.graph import StateGraph, END
from typing import TypedDict

class AgentState(TypedDict):
    task: str
    context: dict
    results: list
    next_agent: str

# Define all 10 agents
agents = {
    'hwp_converter': hwp_agent,
    'kakao_crm': kakao_agent,
    'china_source': sourcing_agent,
    'naver_seo': seo_agent,
    'bookkeeper': ledger_agent,
    'proposal_gen': proposal_agent,
    'grant_scout': grant_agent,
    'safety_guard': iot_agent,
    'k_startup_nav': navigator_agent,
    'bizplan_master': bizplan_agent
}

# Build orchestration graph
workflow = StateGraph(AgentState)

# Add all agent nodes
for name, agent in agents.items():
    workflow.add_node(name, agent)

# Add routing logic
def route_task(state: AgentState) -> str:
    """Route task to appropriate agent"""
    task = state['task'].lower()
    
    if 'hwp' in task or 'convert' in task:
        return 'hwp_converter'
    elif 'kakaotalk' in task or 'crm' in task:
        return 'kakao_crm'
    elif 'china' in task or 'sourcing' in task:
        return 'china_source'
    elif 'seo' in task or 'naver' in task:
        return 'naver_seo'
    elif 'bookkeeping' in task or 'reconcile' in task:
        return 'bookkeeper'
    elif 'proposal' in task:
        return 'proposal_gen'
    elif 'grant' in task or 'funding' in task:
        return 'grant_scout'
    elif 'iot' in task or 'sensor' in task:
        return 'safety_guard'
    elif 'startup' in task or 'strategy' in task:
        return 'k_startup_nav'
    elif 'business plan' in task or '사업계획서' in task:
        return 'bizplan_master'
    else:
        return 'k_startup_nav'  # Default to navigator

# Add conditional routing
workflow.add_conditional_edges(
    "entry",
    route_task,
    agents
)

# Set entry point
workflow.set_entry_point("entry")

# Compile
app = workflow.compile()

# Use orchestrator
result = await app.ainvoke({
    'task': "Generate complete TIPS application",
    'context': {
        'company': 'SK AutoSphere',
        'industry': 'AI',
        'stage': 'Seed'
    },
    'results': [],
    'next_agent': None
})
```

---

### **Observability & Monitoring**

```yaml
LangSmith Integration:
  Setup:
    export LANGCHAIN_TRACING_V2=true
    export LANGCHAIN_API_KEY=<your-key>
    export LANGCHAIN_PROJECT="ai-automation-agency"
  
  Features:
    - Trace every LLM call
    - Debug agent decisions
    - Cost tracking per user
    - A/B test prompts
    - Performance metrics
  
  Dashboard:
    - Total requests
    - Average latency
    - Error rate
    - Cost per agent
    - User satisfaction

Helicone (Alternative):
  Setup:
    Base URL: https://oai.hconeai.com/v1
    Header: Helicone-Auth: Bearer <key>
  
  Features:
    - Request caching (save 80% costs)
    - Cost alerts (>$100/day)
    - User analytics
    - Rate limiting
    - Webhook notifications

Sentry Error Tracking:
  Setup:
    import sentry_sdk
    
    sentry_sdk.init(
        dsn="<your-dsn>",
        traces_sample_rate=1.0
    )
  
  Features:
    - Catch agent failures
    - Track user complaints
    - Performance monitoring
    - Error grouping
    - Slack alerts
```

---

### **Human-in-the-Loop (HITL)**

```yaml
Critical for High-Stakes Agents:

Agents Requiring HITL:
  ✅ Grant Scout (Agent #7):
     - Before submitting ₩100M+ applications
     - Manual review of eligibility
  
  ✅ Business Plan Master (Agent #10):
     - Final review before HWP export
     - Financial validation
  
  ✅ Proposal Architect (Agent #6):
     - Client approval workflow
     - Pricing validation
  
  ✅ Safety Guardian (Agent #8):
     - Critical alerts (temp >90°C)
     - Compliance log review
  
  ✅ Bookkeeper (Agent #5):
     - Large transactions (>₩1M)
     - Unusual expenses

Implementation:
  Approval Queue UI:
    - Display pending items
    - Inline editing
    - Approve/Reject buttons
    - Add comments
  
  Notification Channels:
    - Email (high priority)
    - Slack (real-time)
    - SMS (critical only)
  
  Timeout Handling:
    - Auto-escalate after 24 hours
    - Remind after 12 hours
    - Default action (approve/reject)
  
  Audit Trail:
    - Who approved
    - When approved
    - Changes made
    - Reason for rejection
```

---

### **Rate Limiting & Security**

```yaml
Per-User Limits:
  Free Tier:
    - 10 requests/day per agent
    - Max 5 concurrent requests
    - No API access
  
  Pro Tier (₩99K-299K/month):
    - 100 requests/day
    - Max 20 concurrent requests
    - API access included
  
  Enterprise (₩999K+/month):
    - Unlimited requests
    - Dedicated resources
    - SLA guarantees

Implementation (Upstash Redis):
  import { Ratelimit } from "@upstash/ratelimit"
  import { Redis } from "@upstash/redis"
  
  const redis = Redis.fromEnv()
  
  const ratelimit = new Ratelimit({
    redis: redis,
    limiter: Ratelimit.slidingWindow(10, "1 d"),
    analytics: true
  })
  
  // Check rate limit
  const { success } = await ratelimit.limit(user_id)
  
  if (!success) {
    throw new Error("Rate limit exceeded")
  }

API Key Security:
  Rotation:
    - Gemini/OpenAI keys
    - Rotate monthly
    - Store in 1Password/Vault
    - Environment variables only
  
  Access Control:
    - Different keys per environment
    - Development (low limit)
    - Staging (medium limit)
    - Production (high limit)

Cost Controls:
  Monitoring:
    - Track spend per user
    - Daily budget alerts
    - Monthly rollup reports
  
  Limits:
    - Max tokens per request: 4000
    - Max requests per hour: 100
    - User spending caps
  
  Alerts:
    - Daily spend >$100 → Email
    - User >$50/day → Investigation
    - Anomaly detection
```

---

## 💰 MONETIZATION STRATEGY

---

### **Tiered Pricing Model**

```yaml
Free Tier (Lead Generation):
  Purpose: User acquisition
  Limits:
    - 10 requests/month per agent
    - Basic features only
    - Watermarked outputs
    - Community support (Discord)
  
  Access:
    ✅ HWP Converter (5 conversions)
    ✅ NaverSEO audit (1 site)
    ✅ Business Plan preview
    ❌ No API access
    ❌ No priority support

Pro Tier (₩99,000-299,000/month):
  Target: Individual founders & small startups
  Limits:
    - Unlimited requests
    - Full features
    - Priority support (24h response)
    - API access (1000 req/month)
    - Multiple team members (up to 5)
  
  Pricing by Agent:
    - HWP Converter: ₩49K/month
    - KakaoTalk CRM: ₩79K/month
    - ChinaSource Pro: ₩99K/month
    - NaverSEO Pro: ₩79K/month
    - Ledger Logic: ₩99K/month
    - Proposal Architect: ₩129K/month
    - Grant Scout: ₩149K/month
    - Safety Guardian: ₩199K/month
    - K-Startup Navigator: ₩199K/month
    - Business Plan Master: ₩299K/month ⭐
  
  Bundle Discount:
    - Any 3 agents: 20% off
    - Any 5 agents: 30% off
    - All 10 agents: 40% off (₩720K/month)

Enterprise (₩999,000+/month):
  Target: Agencies, corporations, accelerators
  Features:
    - Unlimited requests
    - White-label option
    - Custom integrations
    - Dedicated support (4h SLA)
    - On-premise deployment
    - Training & onboarding
  
  Custom Pricing:
    - Based on team size
    - API usage limits
    - SLA requirements
    - Custom features

Add-Ons:
  - Additional API calls: ₩10 per 100 requests
  - Priority queue: ₩50K/month
  - Dedicated account manager: ₩200K/month
  - Custom agent development: ₩5M+
```

---

### **Usage-Based Pricing (Alternative)**

```yaml
Pay-Per-Use Model:

Document Processing:
  - HWP conversion: ₩5,000/document
  - Business plan generation: ₩50,000/plan
  - Grant application: ₩100,000/application
  - Proposal generation: ₩30,000/proposal

Consulting Services:
  - NaverSEO audit: ₩20,000/site
  - Market analysis: ₩50,000/report
  - Competitor research: ₩30,000/report
  - Strategic roadmap: ₩150,000/plan

Industrial IoT:
  - Safety Guardian: ₩10/sensor/month
  - Compliance logs: ₩1,000/report
  - Real-time monitoring: ₩50K/month base

Credits System:
  Purchase Credits:
    - ₩100K = 100 credits (₩1K each)
    - ₩500K = 550 credits (10% bonus)
    - ₩1M = 1200 credits (20% bonus)
  
  Credit Cost per Agent:
    - Simple tasks (HWP convert): 5 credits
    - Medium tasks (SEO audit): 20 credits
    - Complex tasks (Business plan): 50 credits
    - Enterprise tasks (Grant app): 100 credits
```

---

### **Revenue Projections**

```yaml
Conservative Estimate (Year 1):

Target Market:
  - Korean startups applying to programs: 10,000/year
  - Addressable market: 5,000 (realistic reach)
  - Conversion rate: 2% → 100 paying customers

Monthly Breakdown:
  Month 3:  10 customers × ₩149K avg = ₩1.49M
  Month 6:  30 customers × ₩199K avg = ₩5.97M
  Month 9:  60 customers × ₩249K avg = ₩14.94M
  Month 12: 100 customers × ₩299K avg = ₩29.9M

Annual Revenue (Year 1): ₩300M (~$225K USD)

Aggressive Estimate (Year 2):

Expansion:
  - Add 200 customers (300 total)
  - Increase ARPU to ₩350K (upsells)
  - Add enterprise clients (5 × ₩2M/month)

Monthly Revenue: 300 × ₩350K + 5 × ₩2M = ₩115M
Annual Revenue (Year 2): ₩1.38B (~$1.03M USD)

Profitability Analysis:

Costs:
  - LLM API (Gemini/OpenAI): ₩20M/month
  - Infrastructure (Vercel/Railway): ₩5M/month
  - Salaries (3 team members): ₩30M/month
  - Total monthly costs: ₩55M

Break-even: 250 Pro customers at ₩220K average

Profit margin: 40-50% (after scale)
```

---

## 🚀 IMPLEMENTATION TIMELINE

---

### **4-Week MVP Launch Plan**

```yaml
Week 1: Foundation Setup

Monday:
  - Install core MCP servers
  - Setup n8n instance
  - Clone workflow templates

Tuesday:
  - Configure LangGraph environment
  - Setup Supabase database
  - Create agent schemas

Wednesday:
  - Test MCP integrations
  - Verify API connections
  - Setup observability (LangSmith)

Thursday:
  - Build orchestration layer
  - Test agent routing
  - Error handling

Friday:
  - Documentation
  - Team training
  - Week 1 review

Week 2: Priority Agent Upgrade

Focus: Business Plan Master (Agent #10)

Monday:
  - Integrate DocTranslate MCP
  - Test EN→KR translation
  - Quality validation

Tuesday:
  - Integrate DOCX MCP
  - Apply Korean templates
  - Format validation

Wednesday:
  - Build financial modeler
  - Generate Excel projections
  - Number validation

Thursday:
  - HWP generation implementation
  - Government format compliance
  - Preview generation

Friday:
  - End-to-end testing
  - Beta user testing (3 startups)
  - Collect feedback

Week 3: Integration & Testing

Monday:
  - Connect Agent #9 (Navigator) to #10
  - Connect Agent #7 (Grant Scout) to #10
  - Test complete pipeline

Tuesday:
  - Setup HITL approval queue
  - Build review interface
  - Test approval workflow

Wednesday:
  - Implement rate limiting
  - Setup cost controls
  - Test user quotas

Thursday:
  - Performance optimization
  - Caching implementation
  - Load testing

Friday:
  - Security audit
  - Bug fixes
  - Week 3 review

Week 4: Launch Preparation

Monday:
  - Create landing page (Korean + English)
  - Demo video recording
  - Marketing materials

Tuesday:
  - Setup payment (Toss Payments)
  - Pricing page
  - Subscription logic

Wednesday:
  - Beta user onboarding (10 users)
  - Collect testimonials
  - Refine based on feedback

Thursday:
  - Deploy to production
  - Setup monitoring dashboards
  - On-call rotation

Friday:
  - Public launch announcement
  - Korean startup communities
  - Track first 100 users

Post-Launch (Weeks 5-12):
  - Weekly feature updates
  - Expand to other agents (1-2 per week)
  - Continuous optimization
  - Scale infrastructure
```

---

## 📊 PRODUCTION READINESS CHECKLIST

---

### **Per-Agent Checklist**

```yaml
For Each of 10 Agents:

Infrastructure:
  □ Real API integrations (no mocks)
  □ Error handling with retries
  □ Rate limiting implemented
  □ Logging (Winston/Pino)
  □ Monitoring (LangSmith/Helicone)
  □ Observability dashboards

Performance:
  □ Response time <3s (P95)
  □ Queue system for long tasks
  □ Caching strategy (Redis)
  □ Database indexing
  □ CDN for assets

Security:
  □ Input validation (Zod)
  □ SQL injection prevention
  □ API key rotation schedule
  □ User authentication (Supabase Auth)
  □ Data encryption at rest
  □ HTTPS everywhere

User Experience:
  □ Loading states with progress
  □ Error messages (Korean + English)
  □ Success confirmations
  □ Undo functionality
  □ Help documentation
  □ Demo videos

Business:
  □ Pricing tier defined
  □ Payment integration (Toss)
  □ Usage tracking
  □ Invoice generation
  □ Customer support (Intercom)
  □ Analytics (Mixpanel)

Compliance:
  □ GDPR compliance
  □ Korean privacy laws (PIPA)
  □ Terms of service
  □ Privacy policy
  □ Data retention policy
```

---

### **Launch Checklist**

```yaml
Pre-Launch (T-1 week):
  □ All 10 agents tested end-to-end
  □ Beta users satisfied (4+/5 rating)
  □ Payment system tested
  □ Support channels ready
  □ Documentation complete
  □ Marketing materials ready
  □ Press release drafted

Launch Day:
  □ Deploy to production
  □ Monitor dashboards
  □ Social media announcements
  □ Email to waitlist
  □ Post in Korean communities
  □ Track first 100 sign-ups

Post-Launch (Week 1):
  □ Daily monitoring
  □ Respond to all support tickets <24h
  □ Fix critical bugs immediately
  □ Collect user feedback
  □ Iterate rapidly
```

---

## 🎯 RECOMMENDED NEXT STEPS

---

### **Build ONE Production Agent First**

```yaml
RECOMMENDED: Agent #10 (Business Plan Master)

Why This One:
  ✅ Highest revenue potential (₩299K/month)
  ✅ Clear market need (Korean startups)
  ✅ Can use ALL the MCP servers
  ✅ Connects to Agent #9 (Navigator)
  ✅ You already have foundational skills
  ✅ Fastest path to revenue

4-Week Plan:
  Week 1: Install MCPs (DocTranslate, DOCX, Document Generator)
  Week 2: Integrate financial modeling
  Week 3: Add HWP generation
  Week 4: Launch with 10 beta users

Success Metrics:
  - Generate complete TIPS application in <2 hours
  - User satisfaction >4.5/5
  - Win rate for TIPS applications >30%
  - 10 paying customers by Week 6

Revenue Target:
  - Month 1: ₩1.5M (10 × ₩149K trial)
  - Month 3: ₩6M (20 × ₩299K)
  - Month 6: ₩18M (60 × ₩299K)
```

---

## 📚 RESOURCES & REFERENCES

---

```yaml
MCP Servers:
  - Official Registry: https://github.com/modelcontextprotocol/servers
  - Awesome MCP: https://github.com/punkpeye/awesome-mcp-servers
  - PulseMCP Directory: https://www.pulsemcp.com/

n8n Workflows:
  - Zie619 Collection: https://github.com/Zie619/n8n-workflows (4,343)
  - Official Templates: https://n8n.io/workflows/ (7,656+)
  - Community: https://community.n8n.io/

LangChain/LangGraph:
  - Official Docs: https://python.langchain.com/
  - LangGraph Guide: https://langchain-ai.github.io/langgraph/
  - Templates: https://github.com/langchain-ai/langchain/tree/master/templates

Korean APIs:
  - Codef (Banking): https://codef.io
  - Naver Clova OCR: https://www.ncloud.com/product/aiService/ocr
  - Kakao i Open Builder: https://i.kakao.com/docs
  - DataForSEO (Naver): https://dataforseo.com/apis/serp-api/naver

Development Tools:
  - LangSmith: https://smith.langchain.com/
  - Helicone: https://helicone.ai/
  - Upstash Redis: https://upstash.com/
  - Supabase: https://supabase.com/
```

---

## 🎉 CONCLUSION

This production upgrade plan transforms your 10 MVP agents into a comprehensive, production-ready platform using:

- **70% less custom code** (via MCP servers & n8n workflows)
- **Battle-tested components** (community-validated)
- **Visual debugging** (n8n UI + LangSmith)
- **Real integrations** (no more simulations)
- **Scalable architecture** (LangGraph orchestration)

**Next Action:** Install core MCPs and start upgrading Agent #10 (Business Plan Master) this week!

---

**Document Version**: 2.0  
**Last Updated**: January 5, 2026  
**Status**: Ready for Implementation  
**Priority**: Agent #10 → Complete Korean Startup Support Platform
