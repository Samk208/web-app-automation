/**
 * Error Handler & Sanitization
 * Prevents sensitive information leakage in production
 */

import { createLogger } from './logger'

const logger = createLogger({ agent: 'error-handler' })

export interface SanitizedError {
  message: string
  code?: string
  statusCode?: number
}

/**
 * Error codes for client-friendly responses
 */
export enum ErrorCode {
  // Authentication & Authorization
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',

  // Resource errors
  NOT_FOUND = 'NOT_FOUND',
  ALREADY_EXISTS = 'ALREADY_EXISTS',

  // Validation errors
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',

  // Rate limiting
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',

  // Payment & billing
  PAYMENT_REQUIRED = 'PAYMENT_REQUIRED',
  BUDGET_EXCEEDED = 'BUDGET_EXCEEDED',

  // External service errors
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',

  // Generic errors
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  BAD_REQUEST = 'BAD_REQUEST'
}

/**
 * Sanitize error for client response
 * Shows detailed errors in development, generic messages in production
 */
export function sanitizeError(error: unknown): SanitizedError {
  // In development, show detailed errors
  if (process.env.NODE_ENV === 'development') {
    if (error instanceof Error) {
      return {
        message: error.message,
        code: (error as any).code || ErrorCode.INTERNAL_ERROR,
        statusCode: (error as any).statusCode || 500
      }
    }

    return {
      message: String(error),
      code: ErrorCode.INTERNAL_ERROR,
      statusCode: 500
    }
  }

  // In production, return user-friendly messages
  if (error instanceof Error) {
    const message = error.message.toLowerCase()

    // Authentication & Authorization
    if (message.includes('unauthorized') || message.includes('not logged in')) {
      return {
        message: 'Authentication required. Please log in.',
        code: ErrorCode.UNAUTHORIZED,
        statusCode: 401
      }
    }

    if (message.includes('forbidden') || message.includes('permission') || message.includes('access denied')) {
      return {
        message: 'You do not have permission to access this resource.',
        code: ErrorCode.FORBIDDEN,
        statusCode: 403
      }
    }

    if (message.includes('token expired') || message.includes('session expired')) {
      return {
        message: 'Your session has expired. Please log in again.',
        code: ErrorCode.TOKEN_EXPIRED,
        statusCode: 401
      }
    }

    // Resource errors
    if (message.includes('not found')) {
      return {
        message: 'The requested resource was not found.',
        code: ErrorCode.NOT_FOUND,
        statusCode: 404
      }
    }

    if (message.includes('already exists') || message.includes('duplicate')) {
      return {
        message: 'This resource already exists.',
        code: ErrorCode.ALREADY_EXISTS,
        statusCode: 409
      }
    }

    // Validation errors
    if (message.includes('validation') || message.includes('invalid')) {
      return {
        message: 'The provided data is invalid. Please check your input.',
        code: ErrorCode.VALIDATION_ERROR,
        statusCode: 400
      }
    }

    // Rate limiting
    if (message.includes('rate limit')) {
      return {
        message: 'Too many requests. Please try again later.',
        code: ErrorCode.RATE_LIMIT_EXCEEDED,
        statusCode: 429
      }
    }

    if (message.includes('quota') || message.includes('limit exceeded')) {
      return {
        message: 'Usage quota exceeded. Please upgrade your plan.',
        code: ErrorCode.QUOTA_EXCEEDED,
        statusCode: 429
      }
    }

    // Budget & billing
    if (message.includes('budget exceeded')) {
      return {
        message: 'Monthly AI budget exceeded. Please upgrade your subscription.',
        code: ErrorCode.BUDGET_EXCEEDED,
        statusCode: 402
      }
    }

    if (message.includes('payment')) {
      return {
        message: 'Payment required to access this feature.',
        code: ErrorCode.PAYMENT_REQUIRED,
        statusCode: 402
      }
    }

    // External services
    if (message.includes('api') || message.includes('external') || message.includes('timeout')) {
      return {
        message: 'An external service is temporarily unavailable. Please try again.',
        code: ErrorCode.EXTERNAL_SERVICE_ERROR,
        statusCode: 503
      }
    }
  }

  // Default generic error for production
  return {
    message: 'An unexpected error occurred. Please try again or contact support.',
    code: ErrorCode.INTERNAL_ERROR,
    statusCode: 500
  }
}

/**
 * Log error with context (for server-side debugging)
 * This captures full error details securely server-side
 */
export function logError(
  error: unknown,
  context: {
    service?: string
    userId?: string
    organizationId?: string
    correlationId?: string
    [key: string]: any
  } = {}
): void {
  const errorLogger = createLogger({
    agent: context.service || 'unknown',
    correlationId: context.correlationId
  })

  if (error instanceof Error) {
    errorLogger.error(error.message, {
      stack: error.stack,
      name: error.name,
      ...context
    })
  } else {
    errorLogger.error('Unknown error', {
      error: String(error),
      ...context
    })
  }
}

/**
 * Handle error in API route
 * Logs full error server-side, returns sanitized error to client
 */
export function handleAPIError(
  error: unknown,
  context?: Record<string, any>
): {
  error: SanitizedError
  statusCode: number
} {
  // Log full error details server-side
  logError(error, context)

  // Return sanitized error for client
  const sanitized = sanitizeError(error)

  return {
    error: sanitized,
    statusCode: sanitized.statusCode || 500
  }
}

/**
 * Create error with specific code and status
 */
export class AppError extends Error {
  constructor(
    message: string,
    public code: ErrorCode = ErrorCode.INTERNAL_ERROR,
    public statusCode: number = 500
  ) {
    super(message)
    this.name = 'AppError'
  }
}

/**
 * Common error factories
 */
export const Errors = {
  unauthorized: (message = 'Unauthorized') =>
    new AppError(message, ErrorCode.UNAUTHORIZED, 401),

  forbidden: (message = 'Forbidden') =>
    new AppError(message, ErrorCode.FORBIDDEN, 403),

  notFound: (resource = 'Resource') =>
    new AppError(`${resource} not found`, ErrorCode.NOT_FOUND, 404),

  validation: (message = 'Validation failed') =>
    new AppError(message, ErrorCode.VALIDATION_ERROR, 400),

  rateLimitExceeded: (message = 'Rate limit exceeded') =>
    new AppError(message, ErrorCode.RATE_LIMIT_EXCEEDED, 429),

  budgetExceeded: (message = 'Budget exceeded') =>
    new AppError(message, ErrorCode.BUDGET_EXCEEDED, 402),

  internal: (message = 'Internal server error') =>
    new AppError(message, ErrorCode.INTERNAL_ERROR, 500)
}
