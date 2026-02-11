/**
 * Feature Flags System
 * Controls which features are enabled in different environments
 *
 * CRITICAL: Prevents mock/simulated data from reaching production
 */

/**
 * Check if running in development mode
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development';
}

/**
 * Check if running in production mode
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

/**
 * Check if mock data is allowed
 *
 * Mock data is ONLY allowed when:
 * 1. In development environment, OR
 * 2. ALLOW_MOCK_DATA env var is explicitly set to 'true'
 *
 * @returns true if mock data is allowed, false otherwise
 */
export function allowMockData(): boolean {
  // Explicit opt-in via env var (for staging/testing)
  if (process.env.ALLOW_MOCK_DATA === 'true') {
    return true;
  }

  // Auto-allow in development
  if (isDevelopment()) {
    return true;
  }

  // NEVER allow in production without explicit opt-in
  return false;
}

/**
 * Check if real integrations are required
 *
 * Real integrations are required when:
 * 1. In production environment, AND
 * 2. Mock data is NOT explicitly allowed
 *
 * @returns true if real integrations must be used
 */
export function requireRealIntegrations(): boolean {
  return isProduction() && !allowMockData();
}

/**
 * Error class for production-blocked mock data
 */
export class MockDataNotAllowedError extends Error {
  constructor(
    public agent: string,
    public feature: string,
    public requiredIntegration?: string
  ) {
    const integrationHint = requiredIntegration
      ? `\n\nRequired integration: ${requiredIntegration}`
      : '';

    super(
      `Mock data not allowed in production.\n` +
        `Agent: ${agent}\n` +
        `Feature: ${feature}` +
        integrationHint +
        `\n\nTo enable mock data in non-production environments, set ALLOW_MOCK_DATA=true`
    );

    this.name = 'MockDataNotAllowedError';
  }
}

/**
 * Guard function to ensure mock data is not used in production
 *
 * @param agent - Name of the agent (e.g., "sourcing", "naver-seo")
 * @param feature - Description of the mocked feature
 * @param requiredIntegration - What real integration is needed
 * @throws {MockDataNotAllowedError} If in production and mock data not allowed
 *
 * @example
 * ensureMockDataAllowed("sourcing", "1688.com scraping", "Puppeteer/Bright Data");
 */
export function ensureMockDataAllowed(
  agent: string,
  feature: string,
  requiredIntegration?: string
): void {
  if (requireRealIntegrations()) {
    throw new MockDataNotAllowedError(agent, feature, requiredIntegration);
  }
}

/**
 * Feature flags for specific integrations
 * Can be overridden via environment variables
 */
export const FeatureFlags = {
  /** Allow simulated HWP parsing (dev only) */
  ALLOW_MOCK_HWP: allowMockData(),

  /** Allow simulated KakaoTalk messages (dev only) */
  ALLOW_MOCK_KAKAOTALK: allowMockData(),

  /** Allow simulated 1688.com scraping (dev only) */
  ALLOW_MOCK_1688_SCRAPING: allowMockData(),

  /** Allow simulated Naver SEO analysis (dev only) */
  ALLOW_MOCK_NAVER_SEO: allowMockData(),

  /** Allow simulated bank feeds (dev only) */
  ALLOW_MOCK_BANK_FEEDS: allowMockData(),

  /** Allow mock grant programs database (dev only) */
  ALLOW_MOCK_GRANT_PROGRAMS: allowMockData(),

  /** Allow simulated IoT sensor data (dev only) */
  ALLOW_MOCK_IOT_SENSORS: allowMockData(),

  /** Allow mock knowledge base (dev only) */
  ALLOW_MOCK_KNOWLEDGE_BASE: allowMockData(),
} as const;

/**
 * Log feature flag status on startup (useful for debugging)
 */
export function logFeatureFlagStatus(): void {
  console.log('[FeatureFlags] Environment:', process.env.NODE_ENV);
  console.log('[FeatureFlags] Mock Data Allowed:', allowMockData());
  console.log('[FeatureFlags] Real Integrations Required:', requireRealIntegrations());

  if (isProduction() && allowMockData()) {
    console.warn(
      '⚠️  WARNING: Mock data is ENABLED in production environment! ' +
        'This should only be used for testing. Set ALLOW_MOCK_DATA=false for real users.'
    );
  }
}
