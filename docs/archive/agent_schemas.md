# Agent Schemas & Architecture

## 1. Agent Architecture
We use a **Hub-and-Spoke** model.
- **Manager Agent (Orchestrator):** Breaks down high-level goals, assigns sub-tasks to Specialists, synthesizes results.
- **Specialist Agents:** Single-purpose tools (e.g., "Research Specialist", "Code Specialist", "Email Specialist").

## 2. Communication Protocol (JSON)
Agents communicate exclusively via structured JSON.
**Request Format:**
```json
{
  "taskId": "uuid",
  "type": "delegation",
  "toAgent": "researcher_v1",
  "payload": {
    "query": "Competitor pricing for X",
    "depth": "detailed"
  },
  "constraints": {
    "timeLimit": 60,
    "maxCost": 0.50
  }
}
```

**Response Format:**
```json
{
  "taskId": "uuid",
  "status": "success",
  "data": {
    "summary": "Pricing is $10-50...",
    "sources": ["url1", "url2"]
  },
  "metadata": {
    "executionTime": 4.2
  }
}
```

## 3. Agent Definition Schema
Stored in `agents` table.
```json
{
  "id": "agent_email_processor",
  "name": "Email Processor",
  "role": "specialist",
  "description": "Extracts intent and entities from inbound customer emails.",
  "inputs": {
    "email_body": "string",
    "sender": "string"
  },
  "outputs": {
    "intent": "enum('support', 'sales', 'spam')",
    "entities": "array"
  },
  "tools": ["sentiment_analysis", "crm_lookup"]
}
```

## 4. Permissioning
- Agents operate with *Service Account* tokens, not User tokens.
- **Scope:** Restricted by RLS (Row Level Security) policies in Supabase.
- An agent can only access data belonging to the `workflow_run` it is assigned to.
- External API keys (e.g., OpenAI, Twilio) are stored in Vault/Encrypted columns, accessed only by the backend runner, never exposed to the frontend.
