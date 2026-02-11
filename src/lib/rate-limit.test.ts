import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'

// We need to reset the module between tests to clear the in-memory buckets
let enforceRateLimit: typeof import('./rate-limit').enforceRateLimit

describe('enforceRateLimit', () => {
  beforeEach(async () => {
    // Re-import to get fresh module with empty buckets
    vi.resetModules()
    const mod = await import('./rate-limit')
    enforceRateLimit = mod.enforceRateLimit
  })

  it('allows requests within rate limit', async () => {
    // Default limit is 60/minute
    await expect(enforceRateLimit('test-key')).resolves.toBeUndefined()
  })

  it('allows multiple requests within limit', async () => {
    for (let i = 0; i < 10; i++) {
      await expect(enforceRateLimit('test-key')).resolves.toBeUndefined()
    }
  })

  it('throws when rate limit is exceeded', async () => {
    // Use a very low limit to test exhaustion
    for (let i = 0; i < 5; i++) {
      await enforceRateLimit('exhaust-key', 5)
    }
    await expect(enforceRateLimit('exhaust-key', 5)).rejects.toThrow('Rate limit exceeded')
  })

  it('uses separate buckets per key', async () => {
    // Exhaust one key
    for (let i = 0; i < 3; i++) {
      await enforceRateLimit('key-a', 3)
    }
    // Different key should still work
    await expect(enforceRateLimit('key-b', 3)).resolves.toBeUndefined()
  })

  it('refills tokens over time', async () => {
    // Use limit of 2
    await enforceRateLimit('refill-key', 2)
    await enforceRateLimit('refill-key', 2)

    // Should be exhausted
    await expect(enforceRateLimit('refill-key', 2)).rejects.toThrow('Rate limit exceeded')

    // Advance time by 60 seconds (full refill for 2/minute)
    vi.useFakeTimers()
    vi.advanceTimersByTime(60_000)

    // Should work again after refill
    await expect(enforceRateLimit('refill-key', 2)).resolves.toBeUndefined()

    vi.useRealTimers()
  })
})
