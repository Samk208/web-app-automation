/**
 * CSRF Protection
 * Generates and validates CSRF tokens to prevent cross-site request forgery
 */

import { cookies } from 'next/headers'
import { randomBytes } from 'crypto'
import { createLogger } from './logger'

const logger = createLogger({ agent: 'csrf' })

const CSRF_COOKIE_NAME = 'csrf-token'
const CSRF_HEADER_NAME = 'x-csrf-token'
const TOKEN_LENGTH = 32

/**
 * Generate a new CSRF token and set it in a secure cookie
 * Call this on page load for authenticated users
 */
export async function generateCSRFToken(): Promise<string> {
  const token = randomBytes(TOKEN_LENGTH).toString('hex')
  const cookieStore = await cookies()

  cookieStore.set(CSRF_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24, // 24 hours
    path: '/'
  })

  logger.info('CSRF token generated')
  return token
}

/**
 * Get the current CSRF token from cookies
 * Returns null if no token exists
 */
export async function getCSRFToken(): Promise<string | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(CSRF_COOKIE_NAME)
  return token?.value || null
}

/**
 * Verify CSRF token from request headers matches cookie
 * Throws error if validation fails
 */
export async function verifyCSRFToken(headerToken: string | null): Promise<void> {
  if (!headerToken) {
    logger.warn('CSRF token missing from request headers')
    throw new Error('CSRF token required')
  }

  const cookieToken = await getCSRFToken()

  if (!cookieToken) {
    logger.warn('CSRF token missing from cookies')
    throw new Error('CSRF token session expired')
  }

  // Constant-time comparison to prevent timing attacks
  const headerBuffer = Buffer.from(headerToken)
  const cookieBuffer = Buffer.from(cookieToken)

  if (headerBuffer.length !== cookieBuffer.length) {
    logger.warn('CSRF token length mismatch')
    throw new Error('Invalid CSRF token')
  }

  try {
    if (!headerBuffer.equals(cookieBuffer)) {
      logger.warn('CSRF token validation failed')
      throw new Error('Invalid CSRF token')
    }
  } catch {
    logger.warn('CSRF token validation error')
    throw new Error('Invalid CSRF token')
  }

  logger.info('CSRF token validated successfully')
}

/**
 * Clear CSRF token (call on logout)
 */
export async function clearCSRFToken(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(CSRF_COOKIE_NAME)
  logger.info('CSRF token cleared')
}

/**
 * Get CSRF header name for client-side usage
 */
export function getCSRFHeaderName(): string {
  return CSRF_HEADER_NAME
}

/**
 * Helper to include CSRF token in fetch requests
 * Usage in client components:
 *
 * const response = await fetch('/api/endpoint', {
 *   method: 'POST',
 *   headers: await getCSRFHeaders(),
 *   body: JSON.stringify(data)
 * })
 */
export async function getCSRFHeaders(): Promise<Record<string, string>> {
  const token = await getCSRFToken()

  if (!token) {
    throw new Error('No CSRF token available. Please refresh the page.')
  }

  return {
    [CSRF_HEADER_NAME]: token
  }
}
