import { getMonthlyUsage, calculateCost } from './cost-tracker';
import { createLogger } from '@/lib/logger';

/**
 * AI Cost Guardrails
 * Enforces monthly budget caps per organization tier
 */

/**
 * Organization subscription tiers and their monthly AI budgets (USD)
 */
export const TIER_BUDGETS: Record<string, number> = {
  free: 10.0, // $10/month
  starter: 50.0, // $50/month
  pro: 100.0, // $100/month
  business: 500.0, // $500/month
  enterprise: 1000.0, // $1000/month
  unlimited: Infinity, // No limit
};

/**
 * Default tier if organization doesn't have subscription_tier set
 */
const DEFAULT_TIER = 'free';

/**
 * Budget enforcement error
 * Thrown when monthly budget is exceeded
 */
export class BudgetExceededError extends Error {
  constructor(
    public currentUsage: number,
    public budget: number,
    public tier: string
  ) {
    super(
      `Monthly AI budget exceeded. Used: $${currentUsage.toFixed(2)}, Budget: $${budget.toFixed(2)} (${tier} tier)`
    );
    this.name = 'BudgetExceededError';
  }
}

/**
 * Get organization's subscription tier from database
 */
async function getOrganizationTier(
  organizationId: string
): Promise<string> {
  try {
    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('organizations')
      .select('subscription_tier')
      .eq('id', organizationId)
      .single();

    if (error || !data) {
      console.warn(
        `Could not fetch tier for org ${organizationId}, using default: ${DEFAULT_TIER}`
      );
      return DEFAULT_TIER;
    }

    return data.subscription_tier || DEFAULT_TIER;
  } catch (err) {
    console.error('Error fetching organization tier:', err);
    return DEFAULT_TIER;
  }
}

/**
 * Get monthly budget for an organization
 */
export async function getMonthlyBudget(
  organizationId: string
): Promise<{ budget: number; tier: string }> {
  const tier = await getOrganizationTier(organizationId);
  const budget = TIER_BUDGETS[tier] || TIER_BUDGETS[DEFAULT_TIER];

  return { budget, tier };
}

/**
 * Enforce budget cap before making an AI call
 * Throws BudgetExceededError if budget is exceeded
 *
 * @param organizationId - Organization making the AI call
 * @param estimatedCost - Estimated cost of the upcoming call (in USD)
 * @param correlationId - Optional correlation ID for logging
 *
 * @throws {BudgetExceededError} If monthly budget would be exceeded
 */
export async function enforceBudgetCap(
  organizationId: string,
  estimatedCost: number = 0,
  correlationId?: string
): Promise<void> {
  const logger = createLogger({
    agent: 'cost-guard',
    correlationId,
    context: { organizationId },
  });

  try {
    // Get current monthly usage
    const usage = await getMonthlyUsage(organizationId);

    // Get organization's budget
    const { budget, tier } = await getMonthlyBudget(organizationId);

    // Calculate projected usage
    const projectedUsage = usage.totalCostUsd + estimatedCost;

    logger.info('Budget check', {
      tier,
      budget,
      currentUsage: usage.totalCostUsd,
      estimatedCost,
      projectedUsage,
      wouldExceed: projectedUsage > budget,
    });

    // Check if budget would be exceeded
    if (projectedUsage > budget) {
      logger.error('Budget exceeded', {
        tier,
        budget,
        currentUsage: usage.totalCostUsd,
        projectedUsage,
      });

      throw new BudgetExceededError(
        usage.totalCostUsd,
        budget,
        tier
      );
    }

    // Warn if approaching budget (>80%)
    const usagePercent = (projectedUsage / budget) * 100;
    if (usagePercent > 80 && usagePercent <= 100) {
      logger.warn('Approaching budget limit', {
        tier,
        budget,
        currentUsage: usage.totalCostUsd,
        usagePercent: Math.round(usagePercent),
      });
    }
  } catch (err) {
    // Re-throw BudgetExceededError
    if (err instanceof BudgetExceededError) {
      throw err;
    }

    // For other errors (DB connection, etc.), log but allow request
    logger.error('Budget check failed (allowing request)', err);
    // Fail open - don't block user on infrastructure errors
  }
}

/**
 * Estimate cost for a prompt before calling AI
 * Use this to pass to enforceBudgetCap()
 */
export function estimatePromptCost(
  model: string,
  promptLength: number,
  expectedOutputLength: number = 500
): number {
  // Rough estimation: 1 token ≈ 4 characters
  const estimatedInputTokens = Math.ceil(promptLength / 4);
  const estimatedOutputTokens = Math.ceil(expectedOutputLength / 4);

  return calculateCost(model, estimatedInputTokens, estimatedOutputTokens);
}

/**
 * Check if organization is approaching budget
 * Returns percentage of budget used (0-100+)
 */
export async function getBudgetUsagePercent(
  organizationId: string
): Promise<number> {
  const usage = await getMonthlyUsage(organizationId);
  const { budget } = await getMonthlyBudget(organizationId);

  if (budget === Infinity) return 0; // Unlimited tier

  return (usage.totalCostUsd / budget) * 100;
}

/**
 * Get budget status for display to user
 */
export async function getBudgetStatus(organizationId: string): Promise<{
  tier: string;
  budget: number;
  used: number;
  remaining: number;
  percentUsed: number;
  isExceeded: boolean;
  isNearLimit: boolean; // >80%
}> {
  const usage = await getMonthlyUsage(organizationId);
  const { budget, tier } = await getMonthlyBudget(organizationId);

  const used = usage.totalCostUsd;
  const remaining = Math.max(0, budget - used);
  const percentUsed = budget === Infinity ? 0 : (used / budget) * 100;

  return {
    tier,
    budget,
    used,
    remaining,
    percentUsed,
    isExceeded: used > budget,
    isNearLimit: percentUsed > 80,
  };
}

/**
 * Wrapper for AI calls with automatic cost enforcement
 * Use this to wrap generateObject() or generateText()
 *
 * @example
 * const result = await withCostEnforcement(
 *   organizationId,
 *   async () => generateObject({ model, schema, prompt }),
 *   { model, promptLength: prompt.length }
 * );
 */
export async function withCostEnforcement<T>(
  organizationId: string,
  aiCall: () => Promise<T>,
  options: {
    model: string;
    promptLength: number;
    correlationId?: string;
  }
): Promise<T> {
  // Estimate cost before call
  const estimatedCost = estimatePromptCost(
    options.model,
    options.promptLength
  );

  // Enforce budget cap
  await enforceBudgetCap(
    organizationId,
    estimatedCost,
    options.correlationId
  );

  // Execute AI call
  return await aiCall();
}
