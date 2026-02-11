/**
 * Distributed Rate Limiting with Redis
 * Uses sliding window counter algorithm for accurate rate limiting
 * Works across multiple server instances
 */

import { Redis } from '@upstash/redis'
import { createLogger } from './logger'

const logger = createLogger({ agent: 'rate-limit' })

// Initialize Redis client
let redis: Redis | null = null

function getRedisClient(): Redis {
  if (!redis) {
    const url = process.env.UPSTASH_REDIS_REST_URL
    const token = process.env.UPSTASH_REDIS_REST_TOKEN

    if (!url || !token) {
      throw new Error(
        'Redis credentials not configured. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN'
      )
    }

    redis = new Redis({ url, token })
  }

  return redis
}

export interface RateLimitConfig {
  /** Maximum requests allowed in the window */
  limit: number
  /** Window duration in seconds */
  windowSeconds: number
  /** Whether to throw error or return false */
  throwOnLimit?: boolean
}

export interface RateLimitResult {
  allowed: boolean
  limit: number
  remaining: number
  reset: number // Unix timestamp when the window resets
}

/**
 * Check rate limit using sliding window counter algorithm
 *
 * @param key - Unique identifier for the rate limit bucket (e.g., "user:123", "org:456")
 * @param config - Rate limit configuration
 * @returns Rate limit result with allowed status and metadata
 */
export async function checkRateLimit(
  key: string,
  config: RateLimitConfig = { limit: 60, windowSeconds: 60 }
): Promise<RateLimitResult> {
  const redis = getRedisClient()
  const rateLimitKey = `ratelimit:${key}`
  const now = Date.now()
  const windowStart = now - (config.windowSeconds * 1000)

  try {
    // Remove old entries outside the window
    await redis.zremrangebyscore(rateLimitKey, 0, windowStart)

    // Count requests in current window
    const requestCount = await redis.zcard(rateLimitKey)

    const remaining = Math.max(0, config.limit - requestCount)
    const reset = now + (config.windowSeconds * 1000)

    if (requestCount >= config.limit) {
      logger.warn('Rate limit exceeded', {
        key,
        limit: config.limit,
        count: requestCount,
        window: config.windowSeconds
      })

      return {
        allowed: false,
        limit: config.limit,
        remaining: 0,
        reset: Math.floor(reset / 1000)
      }
    }

    // Add current request to the window
    const requestId = `${now}-${Math.random().toString(36).substring(7)}`
    await redis.zadd(rateLimitKey, { score: now, member: requestId })

    // Set expiration to clean up old keys
    await redis.expire(rateLimitKey, config.windowSeconds + 10)

    logger.info('Rate limit check passed', {
      key,
      count: requestCount + 1,
      limit: config.limit,
      remaining: remaining - 1
    })

    return {
      allowed: true,
      limit: config.limit,
      remaining: remaining - 1,
      reset: Math.floor(reset / 1000)
    }
  } catch (error) {
    logger.error('Rate limit check failed', error)

    // Fail open - allow request if Redis is down
    // This prevents Redis outages from blocking all traffic
    logger.warn('Rate limit check failed, allowing request', { key })

    return {
      allowed: true,
      limit: config.limit,
      remaining: config.limit,
      reset: Math.floor((now + config.windowSeconds * 1000) / 1000)
    }
  }
}

/**
 * Enforce rate limit - throws error if limit exceeded
 *
 * @param key - Unique identifier for the rate limit bucket
 * @param limitPerMinute - Maximum requests per minute (default: 60)
 */
export async function enforceRateLimit(
  key: string,
  limitPerMinute: number = 60
): Promise<void> {
  const result = await checkRateLimit(key, {
    limit: limitPerMinute,
    windowSeconds: 60
  })

  if (!result.allowed) {
    const resetDate = new Date(result.reset * 1000).toISOString()
    throw new Error(
      `Rate limit exceeded. Max ${result.limit} requests per minute. ` +
      `Try again after ${resetDate}`
    )
  }
}

/**
 * Get rate limit headers for HTTP responses
 */
export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    'RateLimit-Limit': result.limit.toString(),
    'RateLimit-Remaining': result.remaining.toString(),
    'RateLimit-Reset': result.reset.toString(),
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': result.reset.toString()
  }
}

/**
 * Reset rate limit for a specific key (admin function)
 */
export async function resetRateLimit(key: string): Promise<void> {
  const redis = getRedisClient()
  const rateLimitKey = `ratelimit:${key}`

  try {
    await redis.del(rateLimitKey)
    logger.info('Rate limit reset', { key })
  } catch (error) {
    logger.error('Failed to reset rate limit', error)
    throw new Error('Failed to reset rate limit')
  }
}

/**
 * Get current rate limit status without incrementing
 */
export async function getRateLimitStatus(
  key: string,
  config: RateLimitConfig = { limit: 60, windowSeconds: 60 }
): Promise<RateLimitResult> {
  const redis = getRedisClient()
  const rateLimitKey = `ratelimit:${key}`
  const now = Date.now()
  const windowStart = now - (config.windowSeconds * 1000)

  try {
    // Clean up old entries
    await redis.zremrangebyscore(rateLimitKey, 0, windowStart)

    // Count requests in window
    const requestCount = await redis.zcard(rateLimitKey)
    const remaining = Math.max(0, config.limit - requestCount)
    const reset = now + (config.windowSeconds * 1000)

    return {
      allowed: requestCount < config.limit,
      limit: config.limit,
      remaining,
      reset: Math.floor(reset / 1000)
    }
  } catch (error) {
    logger.error('Failed to get rate limit status', error)

    return {
      allowed: true,
      limit: config.limit,
      remaining: config.limit,
      reset: Math.floor((now + config.windowSeconds * 1000) / 1000)
    }
  }
}
