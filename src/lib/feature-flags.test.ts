import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Reset modules before each test to re-evaluate FeatureFlags
let isDevelopment: typeof import('./feature-flags').isDevelopment
let isProduction: typeof import('./feature-flags').isProduction
let allowMockData: typeof import('./feature-flags').allowMockData
let requireRealIntegrations: typeof import('./feature-flags').requireRealIntegrations
let ensureMockDataAllowed: typeof import('./feature-flags').ensureMockDataAllowed
let MockDataNotAllowedError: typeof import('./feature-flags').MockDataNotAllowedError

beforeEach(async () => {
  vi.resetModules()
  const mod = await import('./feature-flags')
  isDevelopment = mod.isDevelopment
  isProduction = mod.isProduction
  allowMockData = mod.allowMockData
  requireRealIntegrations = mod.requireRealIntegrations
  ensureMockDataAllowed = mod.ensureMockDataAllowed
  MockDataNotAllowedError = mod.MockDataNotAllowedError
})

afterEach(() => {
  vi.unstubAllEnvs()
})

// ============================================================================
// isDevelopment / isProduction
// ============================================================================

describe('isDevelopment', () => {
  it('returns true in development', () => {
    vi.stubEnv('NODE_ENV', 'development')
    expect(isDevelopment()).toBe(true)
  })

  it('returns false in production', () => {
    vi.stubEnv('NODE_ENV', 'production')
    expect(isDevelopment()).toBe(false)
  })
})

describe('isProduction', () => {
  it('returns true in production', () => {
    vi.stubEnv('NODE_ENV', 'production')
    expect(isProduction()).toBe(true)
  })

  it('returns false in development', () => {
    vi.stubEnv('NODE_ENV', 'development')
    expect(isProduction()).toBe(false)
  })
})

// ============================================================================
// allowMockData
// ============================================================================

describe('allowMockData', () => {
  it('allows mock data in development', () => {
    vi.stubEnv('NODE_ENV', 'development')
    expect(allowMockData()).toBe(true)
  })

  it('blocks mock data in production by default', () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('ALLOW_MOCK_DATA', '')
    expect(allowMockData()).toBe(false)
  })

  it('allows mock data in production when ALLOW_MOCK_DATA=true', () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('ALLOW_MOCK_DATA', 'true')
    expect(allowMockData()).toBe(true)
  })

  it('blocks mock data when ALLOW_MOCK_DATA=false in production', () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('ALLOW_MOCK_DATA', 'false')
    expect(allowMockData()).toBe(false)
  })
})

// ============================================================================
// requireRealIntegrations
// ============================================================================

describe('requireRealIntegrations', () => {
  it('requires real integrations in production', () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('ALLOW_MOCK_DATA', '')
    expect(requireRealIntegrations()).toBe(true)
  })

  it('does not require real integrations in development', () => {
    vi.stubEnv('NODE_ENV', 'development')
    expect(requireRealIntegrations()).toBe(false)
  })

  it('does not require real integrations when ALLOW_MOCK_DATA=true', () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('ALLOW_MOCK_DATA', 'true')
    expect(requireRealIntegrations()).toBe(false)
  })
})

// ============================================================================
// ensureMockDataAllowed
// ============================================================================

describe('ensureMockDataAllowed', () => {
  it('does not throw in development', () => {
    vi.stubEnv('NODE_ENV', 'development')
    expect(() =>
      ensureMockDataAllowed('sourcing', '1688 scraping', 'Playwright')
    ).not.toThrow()
  })

  it('throws MockDataNotAllowedError in production', () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('ALLOW_MOCK_DATA', '')
    expect(() =>
      ensureMockDataAllowed('sourcing', '1688 scraping', 'Playwright')
    ).toThrow(MockDataNotAllowedError)
  })

  it('includes agent and feature info in error', () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('ALLOW_MOCK_DATA', '')
    try {
      ensureMockDataAllowed('naver-seo', 'SEO audit', 'Naver SERP API')
      expect.fail('Should have thrown')
    } catch (error) {
      expect(error).toBeInstanceOf(MockDataNotAllowedError)
      const mockError = error as InstanceType<typeof MockDataNotAllowedError>
      expect(mockError.agent).toBe('naver-seo')
      expect(mockError.feature).toBe('SEO audit')
      expect(mockError.requiredIntegration).toBe('Naver SERP API')
      expect(mockError.message).toContain('naver-seo')
      expect(mockError.message).toContain('SEO audit')
      expect(mockError.message).toContain('Naver SERP API')
    }
  })

  it('does not throw in production when ALLOW_MOCK_DATA=true', () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('ALLOW_MOCK_DATA', 'true')
    expect(() =>
      ensureMockDataAllowed('sourcing', '1688 scraping')
    ).not.toThrow()
  })
})

// ============================================================================
// MockDataNotAllowedError
// ============================================================================

describe('MockDataNotAllowedError', () => {
  it('is an instance of Error', () => {
    const error = new MockDataNotAllowedError('test', 'feature')
    expect(error).toBeInstanceOf(Error)
    expect(error.name).toBe('MockDataNotAllowedError')
  })

  it('includes required integration hint when provided', () => {
    const error = new MockDataNotAllowedError('agent', 'feature', 'Real API')
    expect(error.message).toContain('Required integration: Real API')
  })

  it('works without required integration', () => {
    const error = new MockDataNotAllowedError('agent', 'feature')
    expect(error.message).not.toContain('Required integration')
    expect(error.message).toContain('Mock data not allowed')
  })
})
