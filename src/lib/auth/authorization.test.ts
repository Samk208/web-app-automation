import { describe, it, expect } from 'vitest'
import { getRateLimitKey, getOrgRateLimitKey } from './authorization'

// ============================================================================
// Rate Limit Key Generators (pure functions, no Supabase needed)
// ============================================================================

describe('getRateLimitKey', () => {
  it('generates key with default scope', () => {
    const key = getRateLimitKey('user-123')
    expect(key).toBe('ratelimit:user:user-123:global')
  })

  it('generates key with custom scope', () => {
    const key = getRateLimitKey('user-123', 'business-plan')
    expect(key).toBe('ratelimit:user:user-123:business-plan')
  })
})

describe('getOrgRateLimitKey', () => {
  it('generates org key with default scope', () => {
    const key = getOrgRateLimitKey('org-456')
    expect(key).toBe('ratelimit:org:org-456:global')
  })

  it('generates org key with custom scope', () => {
    const key = getOrgRateLimitKey('org-456', 'sourcing')
    expect(key).toBe('ratelimit:org:org-456:sourcing')
  })
})
