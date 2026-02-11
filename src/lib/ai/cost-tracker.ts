import { createClient } from '@/lib/supabase/server';
import { createLogger } from '@/lib/logger';

/**
 * AI Cost Tracking
 * Logs every AI API call for billing, monitoring, and analytics
 */

export interface AIUsageParams {
  organizationId: string;
  userId?: string;
  agent: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  correlationId?: string;
  metadata?: Record<string, any>;
}

/**
 * Model pricing (USD per million tokens)
 * Updated: January 2026
 */
const MODEL_PRICING: Record<
  string,
  { input: number; output: number }
> = {
  // Google Gemini
  'gemini-1.5-flash': {
    input: 0.075, // $0.075 per 1M input tokens
    output: 0.3, // $0.30 per 1M output tokens
  },
  'gemini-1.5-flash-8b': {
    input: 0.0375, // $0.0375 per 1M (cheaper variant)
    output: 0.15,
  },
  'gemini-1.5-pro': {
    input: 1.25, // $1.25 per 1M input tokens
    output: 5.0, // $5.00 per 1M output tokens
  },
  'gemini-2.0-flash-exp': {
    input: 0.0, // Free during preview
    output: 0.0,
  },

  // OpenAI
  'gpt-4o': {
    input: 5.0, // $5 per 1M input tokens
    output: 15.0, // $15 per 1M output tokens
  },
  'gpt-4o-mini': {
    input: 0.15, // $0.15 per 1M
    output: 0.6, // $0.60 per 1M
  },
  'gpt-4-turbo': {
    input: 10.0,
    output: 30.0,
  },
  'gpt-3.5-turbo': {
    input: 0.5,
    output: 1.5,
  },

  // Anthropic Claude
  'claude-3-5-sonnet': {
    input: 3.0,
    output: 15.0,
  },
  'claude-3-haiku': {
    input: 0.25,
    output: 1.25,
  },
};

/**
 * Calculate cost in USD for a given AI call
 */
export function calculateCost(
  model: string,
  inputTokens: number,
  outputTokens: number
): number {
  // Normalize model name (handle versions, aliases)
  const normalizedModel = normalizeModelName(model);

  const pricing = MODEL_PRICING[normalizedModel];

  if (!pricing) {
    // Unknown model - use conservative estimate (highest pricing)
    console.warn(
      `[CostTracker] Unknown model: ${model}, using gpt-4o pricing as fallback`
    );
    const fallback = MODEL_PRICING['gpt-4o'];
    return (
      (inputTokens * fallback.input) / 1_000_000 +
      (outputTokens * fallback.output) / 1_000_000
    );
  }

  const inputCost = (inputTokens * pricing.input) / 1_000_000;
  const outputCost = (outputTokens * pricing.output) / 1_000_000;

  return inputCost + outputCost;
}

/**
 * Normalize model names to match pricing table
 */
function normalizeModelName(model: string): string {
  // Remove version suffixes
  const normalized = model
    .toLowerCase()
    .replace(/:\d+/, '') // Remove ":20240101" style versions
    .replace(/-\d{8}$/, ''); // Remove "-20240101" style dates

  // Map aliases
  const aliases: Record<string, string> = {
    'gemini-flash': 'gemini-1.5-flash',
    'gemini-pro': 'gemini-1.5-pro',
    'gpt4o': 'gpt-4o',
    'gpt4-turbo': 'gpt-4-turbo',
    'claude-sonnet': 'claude-3-5-sonnet',
  };

  return aliases[normalized] || normalized;
}

/**
 * Track an AI API call in the database
 * Call this AFTER every generateObject() or generateText() call
 */
export async function trackAICost(
  params: AIUsageParams
): Promise<void> {
  const logger = createLogger({
    agent: 'cost-tracker',
    correlationId: params.correlationId,
  });

  try {
    const cost = calculateCost(
      params.model,
      params.inputTokens,
      params.outputTokens
    );

    const supabase = await createClient();

    const { error } = await supabase.from('ai_usage_logs').insert({
      organization_id: params.organizationId,
      user_id: params.userId || null,
      agent_name: params.agent,
      model: params.model,
      input_tokens: params.inputTokens,
      output_tokens: params.outputTokens,
      cost_usd: cost,
      correlation_id: params.correlationId || null,
      metadata: params.metadata || {},
    });

    if (error) {
      logger.error('Failed to track AI cost (non-fatal)', {
        error: error.message,
        ...params,
      });
      // Non-fatal: don't throw - cost tracking shouldn't block user requests
      return;
    }

    logger.info('AI cost tracked', {
      agent: params.agent,
      model: params.model,
      tokens: params.inputTokens + params.outputTokens,
      cost: `$${cost.toFixed(6)}`,
    });
  } catch (err: any) {
    logger.error('Cost tracking exception (non-fatal)', err);
    // Swallow error - cost tracking is best-effort
  }
}

/**
 * Get monthly AI usage for an organization
 * Used for budget enforcement
 */
export async function getMonthlyUsage(
  organizationId: string
): Promise<{
  totalCostUsd: number;
  callCount: number;
  totalTokens: number;
}> {
  const supabase = await createClient();

  // Calculate start of current month
  const now = new Date();
  const monthStart = new Date(
    now.getFullYear(),
    now.getMonth(),
    1
  ).toISOString();

  const { data, error } = await supabase
    .from('ai_usage_logs')
    .select('cost_usd, input_tokens, output_tokens')
    .eq('organization_id', organizationId)
    .gte('created_at', monthStart);

  if (error) {
    console.error('Failed to get monthly usage:', error);
    // Fail open - allow request but log warning
    return { totalCostUsd: 0, callCount: 0, totalTokens: 0 };
  }

  const totalCostUsd = data.reduce(
    (sum, row) => sum + Number(row.cost_usd),
    0
  );
  const totalTokens = data.reduce(
    (sum, row) => sum + row.input_tokens + row.output_tokens,
    0
  );

  return {
    totalCostUsd,
    callCount: data.length,
    totalTokens,
  };
}

/**
 * Estimate cost for a prompt before making the call
 * Useful for showing cost estimates to users
 */
export function estimateCost(
  model: string,
  estimatedInputTokens: number,
  estimatedOutputTokens: number
): { costUsd: number; costDisplay: string } {
  const costUsd = calculateCost(
    model,
    estimatedInputTokens,
    estimatedOutputTokens
  );

  let costDisplay: string;
  if (costUsd < 0.001) {
    costDisplay = '< $0.001';
  } else if (costUsd < 0.01) {
    costDisplay = `~$${costUsd.toFixed(4)}`;
  } else {
    costDisplay = `~$${costUsd.toFixed(2)}`;
  }

  return { costUsd, costDisplay };
}

/**
 * Get cost analytics for an organization
 * Returns breakdown by agent, model, and time period
 */
export async function getCostAnalytics(
  organizationId: string,
  days: number = 30
): Promise<{
  totalCost: number;
  byAgent: Record<string, number>;
  byModel: Record<string, number>;
  dailyCosts: Array<{ date: string; cost: number }>;
}> {
  const supabase = await createClient();

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data, error } = await supabase
    .from('ai_usage_logs')
    .select('agent_name, model, cost_usd, created_at')
    .eq('organization_id', organizationId)
    .gte('created_at', startDate.toISOString())
    .order('created_at', { ascending: false });

  if (error || !data) {
    return {
      totalCost: 0,
      byAgent: {},
      byModel: {},
      dailyCosts: [],
    };
  }

  // Aggregate by agent
  const byAgent: Record<string, number> = {};
  data.forEach((row) => {
    byAgent[row.agent_name] =
      (byAgent[row.agent_name] || 0) + Number(row.cost_usd);
  });

  // Aggregate by model
  const byModel: Record<string, number> = {};
  data.forEach((row) => {
    byModel[row.model] =
      (byModel[row.model] || 0) + Number(row.cost_usd);
  });

  // Aggregate by day
  const dailyMap = new Map<string, number>();
  data.forEach((row) => {
    const date = row.created_at.split('T')[0]; // YYYY-MM-DD
    dailyMap.set(date, (dailyMap.get(date) || 0) + Number(row.cost_usd));
  });

  const dailyCosts = Array.from(dailyMap.entries())
    .map(([date, cost]) => ({ date, cost }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const totalCost = data.reduce(
    (sum, row) => sum + Number(row.cost_usd),
    0
  );

  return {
    totalCost,
    byAgent,
    byModel,
    dailyCosts,
  };
}
