import { BaseMessage } from "@langchain/core/messages";

export type IntentType =
  | "business_plan"
  | "grant_application"
  | "product_sourcing"
  | "seo_optimization"
  | "proposal_writing"
  | "document_conversion"
  | "bookkeeping"
  | "safety_compliance"
  | "crm_automation"
  | "startup_programs"
  | "unknown";

export type AgentType =
  | "navigator"
  | "bizplan_master"
  | "grant_scout"
  | "china_source"
  | "naver_seo"
  | "proposal_gen"
  | "hwp_converter"
  | "bookkeeping"
  | "safety_guardian"
  | "kakao_crm";

export interface AgentConfigItem {
  name: string;
  description: string;
  keywords: string[];
  estimatedCostPerTask: number;
}

export const AGENT_CONFIG: Record<AgentType, AgentConfigItem> = {
  navigator: {
    name: "K-Startup Navigator",
    description: "General assistant and routing agent",
    keywords: ["help", "guide", "navigator", "start"],
    estimatedCostPerTask: 0.005,
  },
  bizplan_master: {
    name: "Business Plan Master",
    description: "Generates government business plans (Hwp/Docx)",
    keywords: ["business plan", "tips", "government", "hwp"],
    estimatedCostPerTask: 0.15,
  },
  grant_scout: {
    name: "R&D Grant Scout",
    description: "Matches startups with government grants",
    keywords: ["grant", "funding", "support", "match"],
    estimatedCostPerTask: 0.05,
  },
  china_source: {
    name: "ChinaSource Pro",
    description: "Sourcing agent for 1688.com",
    keywords: ["1688", "alibaba", "sourcing", "product"],
    estimatedCostPerTask: 0.1,
  },
  naver_seo: {
    name: "NaverSEO Pro",
    description: "SEO optimization for Naver Smart Store",
    keywords: ["naver", "seo", "smart store", "ranking"],
    estimatedCostPerTask: 0.08,
  },
  proposal_gen: {
    name: "Proposal Architect",
    description: "Generates B2B consulting proposals",
    keywords: ["proposal", "b2b", "consulting", "offer"],
    estimatedCostPerTask: 0.12,
  },
  hwp_converter: {
    name: "HWP Converter",
    description: "Converts HWP files to other formats",
    keywords: ["hwp", "convert", "pdf", "docx"],
    estimatedCostPerTask: 0.01,
  },
  bookkeeping: {
    name: "Ledger Logic",
    description: "Automated bookkeeping and reconciliation",
    keywords: ["ledger", "transaction", "reconcile", "tax"],
    estimatedCostPerTask: 0.03,
  },
  safety_guardian: {
    name: "Safety Guardian",
    description: "IoT safety compliance monitoring",
    keywords: ["safety", "compliance", "iot", "check"],
    estimatedCostPerTask: 0.02,
  },
  kakao_crm: {
    name: "KakaoTalk CRM",
    description: "Automated customer service via KakaoTalk",
    keywords: ["kakao", "crm", "message", "chat"],
    estimatedCostPerTask: 0.02,
  },
};

export const HITL_AGENTS: AgentType[] = ["bizplan_master", "proposal_gen"];

export interface AgentState {
  // Core
  messages?: BaseMessage[]; // Optional to support older code or if not used in every node
  userId?: string;
  organizationId: string;
  correlationId: string;
  sessionId?: string;

  // Input
  userQuery: string;

  // Context
  intent: IntentType;
  confidence: number;

  // Navigation
  currentAgent: AgentType;
  agentHistory: AgentType[];
  routingReason?: string;

  // Output
  results: Record<string, any>;
  finalOutput?: string;

  // Cost Tracking
  estimatedCost: number;
  actualCost: number;
  budgetApproved: boolean;

  // Control flow
  requiresHITL: boolean;
  hitlApproved: boolean;
  hitlFeedback?: string;
  status: "pending" | "cost_check" | "awaiting_approval" | "executing" | "completed" | "failed";

  // Metadata
  error?: string;
  startedAt: Date;
  completedAt?: Date;
  metadata: Record<string, any>;
}
