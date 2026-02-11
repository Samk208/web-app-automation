import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock the logger to avoid side effects
vi.mock('./logger', () => ({
  createLogger: () => ({
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn()
  })
}))

import {
  sanitizeError,
  ErrorCode,
  AppError,
  Errors,
  handleAPIError,
  logError
} from './error-handler'

// ============================================================================
// sanitizeError — Development Mode
// ============================================================================

describe('sanitizeError (development)', () => {
  beforeEach(() => {
    vi.stubEnv('NODE_ENV', 'development')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('returns full error message in development', () => {
    const error = new Error('Detailed internal error with sensitive info')
    const result = sanitizeError(error)
    expect(result.message).toBe('Detailed internal error with sensitive info')
  })

  it('handles non-Error objects in development', () => {
    const result = sanitizeError('string error')
    expect(result.message).toBe('string error')
    expect(result.code).toBe(ErrorCode.INTERNAL_ERROR)
  })

  it('preserves custom error codes in development', () => {
    const error = new Error('test') as any
    error.code = 'CUSTOM_CODE'
    error.statusCode = 418
    const result = sanitizeError(error)
    expect(result.code).toBe('CUSTOM_CODE')
    expect(result.statusCode).toBe(418)
  })
})

// ============================================================================
// sanitizeError — Production Mode
// ============================================================================

describe('sanitizeError (production)', () => {
  beforeEach(() => {
    vi.stubEnv('NODE_ENV', 'production')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('sanitizes unauthorized errors', () => {
    const error = new Error('Unauthorized: Invalid API key abc123')
    const result = sanitizeError(error)
    expect(result.message).toBe('Authentication required. Please log in.')
    expect(result.code).toBe(ErrorCode.UNAUTHORIZED)
    expect(result.statusCode).toBe(401)
  })

  it('sanitizes forbidden errors', () => {
    const error = new Error('Forbidden: User xyz has no permission to resource')
    const result = sanitizeError(error)
    expect(result.message).toBe('You do not have permission to access this resource.')
    expect(result.code).toBe(ErrorCode.FORBIDDEN)
    expect(result.statusCode).toBe(403)
  })

  it('sanitizes token expired errors', () => {
    const error = new Error('Token expired at 2026-01-01')
    const result = sanitizeError(error)
    expect(result.message).toBe('Your session has expired. Please log in again.')
    expect(result.code).toBe(ErrorCode.TOKEN_EXPIRED)
    expect(result.statusCode).toBe(401)
  })

  it('sanitizes not found errors', () => {
    const error = new Error('Resource not found: id=abc123 in table=business_plans')
    const result = sanitizeError(error)
    expect(result.message).toBe('The requested resource was not found.')
    expect(result.code).toBe(ErrorCode.NOT_FOUND)
    expect(result.statusCode).toBe(404)
  })

  it('sanitizes duplicate errors', () => {
    const error = new Error('Record already exists with same email')
    const result = sanitizeError(error)
    expect(result.message).toBe('This resource already exists.')
    expect(result.code).toBe(ErrorCode.ALREADY_EXISTS)
    expect(result.statusCode).toBe(409)
  })

  it('sanitizes validation errors', () => {
    const error = new Error('Validation failed: email is invalid, name too short')
    const result = sanitizeError(error)
    expect(result.message).toBe('The provided data is invalid. Please check your input.')
    expect(result.code).toBe(ErrorCode.VALIDATION_ERROR)
    expect(result.statusCode).toBe(400)
  })

  it('sanitizes rate limit errors', () => {
    const error = new Error('Rate limit exceeded for org abc123')
    const result = sanitizeError(error)
    expect(result.message).toBe('Too many requests. Please try again later.')
    expect(result.code).toBe(ErrorCode.RATE_LIMIT_EXCEEDED)
    expect(result.statusCode).toBe(429)
  })

  it('sanitizes budget exceeded errors', () => {
    const error = new Error('Budget exceeded: $105.23 > $100 limit')
    const result = sanitizeError(error)
    expect(result.message).toBe('Monthly AI budget exceeded. Please upgrade your subscription.')
    expect(result.code).toBe(ErrorCode.BUDGET_EXCEEDED)
    expect(result.statusCode).toBe(402)
  })

  it('sanitizes external service errors', () => {
    const error = new Error('API connection timeout to Gemini')
    const result = sanitizeError(error)
    expect(result.message).toBe('An external service is temporarily unavailable. Please try again.')
    expect(result.code).toBe(ErrorCode.EXTERNAL_SERVICE_ERROR)
    expect(result.statusCode).toBe(503)
  })

  it('returns generic error for unknown errors', () => {
    const error = new Error('Some completely unexpected internal crash')
    const result = sanitizeError(error)
    expect(result.message).toBe('An unexpected error occurred. Please try again or contact support.')
    expect(result.code).toBe(ErrorCode.INTERNAL_ERROR)
    expect(result.statusCode).toBe(500)
  })

  it('never leaks stack traces in production', () => {
    const error = new Error('Database connection failed at /home/user/.config/db')
    const result = sanitizeError(error)
    expect(result.message).not.toContain('/home/user')
    expect(result.message).not.toContain('Database connection')
  })

  it('returns generic error for non-Error objects', () => {
    const result = sanitizeError({ weird: 'object' })
    expect(result.message).toBe('An unexpected error occurred. Please try again or contact support.')
    expect(result.statusCode).toBe(500)
  })
})

// ============================================================================
// AppError
// ============================================================================

describe('AppError', () => {
  it('creates error with code and status', () => {
    const error = new AppError('Custom error', ErrorCode.FORBIDDEN, 403)
    expect(error.message).toBe('Custom error')
    expect(error.code).toBe(ErrorCode.FORBIDDEN)
    expect(error.statusCode).toBe(403)
    expect(error.name).toBe('AppError')
    expect(error instanceof Error).toBe(true)
  })

  it('defaults to INTERNAL_ERROR / 500', () => {
    const error = new AppError('Something broke')
    expect(error.code).toBe(ErrorCode.INTERNAL_ERROR)
    expect(error.statusCode).toBe(500)
  })
})

// ============================================================================
// Error Factories
// ============================================================================

describe('Errors factory', () => {
  it('creates unauthorized error', () => {
    const error = Errors.unauthorized()
    expect(error.statusCode).toBe(401)
    expect(error.code).toBe(ErrorCode.UNAUTHORIZED)
  })

  it('creates forbidden error', () => {
    const error = Errors.forbidden('Custom forbidden message')
    expect(error.message).toBe('Custom forbidden message')
    expect(error.statusCode).toBe(403)
  })

  it('creates not found error', () => {
    const error = Errors.notFound('Business Plan')
    expect(error.message).toBe('Business Plan not found')
    expect(error.statusCode).toBe(404)
  })

  it('creates validation error', () => {
    const error = Errors.validation('Email is required')
    expect(error.message).toBe('Email is required')
    expect(error.statusCode).toBe(400)
  })

  it('creates rate limit error', () => {
    const error = Errors.rateLimitExceeded()
    expect(error.statusCode).toBe(429)
  })

  it('creates budget exceeded error', () => {
    const error = Errors.budgetExceeded()
    expect(error.statusCode).toBe(402)
  })

  it('creates internal error', () => {
    const error = Errors.internal()
    expect(error.statusCode).toBe(500)
  })
})

// ============================================================================
// handleAPIError
// ============================================================================

describe('handleAPIError', () => {
  beforeEach(() => {
    vi.stubEnv('NODE_ENV', 'production')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('returns sanitized error and status code', () => {
    const result = handleAPIError(new Error('Unauthorized'))
    expect(result.statusCode).toBe(401)
    expect(result.error.code).toBe(ErrorCode.UNAUTHORIZED)
  })

  it('returns 500 for unknown errors', () => {
    const result = handleAPIError(new Error('Random crash'))
    expect(result.statusCode).toBe(500)
  })
})
