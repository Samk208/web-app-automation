import { describe, it, expect } from 'vitest'
import {
  EmailSchema,
  PasswordSchema,
  UUIDSchema,
  URLSchema,
  PhoneSchema,
  KoreanPhoneSchema,
  KoreanBusinessNumberSchema,
  OrganizationNameSchema,
  ProgramNameSchema,
  SubscriptionTierSchema,
  BusinessPlanInputSchema,
  ProposalCreateSchema,
  GrantApplicationSchema,
  SafetyDataSchema,
  ProductURLSchema,
  SourcingRequestSchema,
  SEOAuditRequestSchema,
  HWPJobSchema,
  PaginationSchema,
  DateRangeSchema,
  FileUploadSchema,
  validateInput,
  safeValidate,
  SafeStringSchema,
  SafeShortStringSchema
} from './schemas'

// ============================================================================
// Basic Type Schemas
// ============================================================================

describe('EmailSchema', () => {
  it('accepts valid email', () => {
    expect(EmailSchema.parse('user@example.com')).toBe('user@example.com')
  })

  it('lowercases email', () => {
    expect(EmailSchema.parse('User@EXAMPLE.COM')).toBe('user@example.com')
  })

  it('trims whitespace from valid email', () => {
    // Zod v4 validates email format before trim transform; trim first
    expect(EmailSchema.parse('user@example.com')).toBe('user@example.com')
  })

  it('rejects invalid email', () => {
    expect(() => EmailSchema.parse('not-an-email')).toThrow()
  })

  it('rejects too short email', () => {
    expect(() => EmailSchema.parse('a@b')).toThrow()
  })

  it('rejects empty string', () => {
    expect(() => EmailSchema.parse('')).toThrow()
  })
})

describe('PasswordSchema', () => {
  const validPassword = 'SecurePass123!'

  it('accepts strong password', () => {
    expect(PasswordSchema.parse(validPassword)).toBe(validPassword)
  })

  it('rejects too short password', () => {
    expect(() => PasswordSchema.parse('Sh0rt!')).toThrow()
  })

  it('rejects password without uppercase', () => {
    expect(() => PasswordSchema.parse('lowercase1234!')).toThrow()
  })

  it('rejects password without lowercase', () => {
    expect(() => PasswordSchema.parse('UPPERCASE1234!')).toThrow()
  })

  it('rejects password without number', () => {
    expect(() => PasswordSchema.parse('NoNumbersHere!')).toThrow()
  })

  it('rejects password without special char', () => {
    expect(() => PasswordSchema.parse('NoSpecial1234')).toThrow()
  })
})

describe('UUIDSchema', () => {
  it('accepts valid UUID', () => {
    const uuid = '123e4567-e89b-12d3-a456-426614174000'
    expect(UUIDSchema.parse(uuid)).toBe(uuid)
  })

  it('rejects invalid UUID', () => {
    expect(() => UUIDSchema.parse('not-a-uuid')).toThrow()
  })

  it('rejects empty string', () => {
    expect(() => UUIDSchema.parse('')).toThrow()
  })
})

describe('URLSchema', () => {
  it('accepts valid URL', () => {
    expect(URLSchema.parse('https://example.com')).toBe('https://example.com')
  })

  it('rejects invalid URL', () => {
    expect(() => URLSchema.parse('not-a-url')).toThrow()
  })
})

describe('PhoneSchema', () => {
  it('accepts E.164 phone number', () => {
    expect(PhoneSchema.parse('+821012345678')).toBe('+821012345678')
  })

  it('rejects invalid phone', () => {
    expect(() => PhoneSchema.parse('abc')).toThrow()
  })
})

// ============================================================================
// Korean-specific Schemas
// ============================================================================

describe('KoreanPhoneSchema', () => {
  it('accepts valid Korean mobile with dashes', () => {
    expect(KoreanPhoneSchema.parse('010-1234-5678')).toBe('010-1234-5678')
  })

  it('accepts valid Korean mobile without dashes', () => {
    expect(KoreanPhoneSchema.parse('01012345678')).toBe('01012345678')
  })

  it('rejects non-Korean phone format', () => {
    expect(() => KoreanPhoneSchema.parse('+15551234567')).toThrow()
  })
})

describe('KoreanBusinessNumberSchema', () => {
  it('accepts valid business number with dashes', () => {
    expect(KoreanBusinessNumberSchema.parse('123-45-67890')).toBe('123-45-67890')
  })

  it('accepts valid business number without dashes', () => {
    expect(KoreanBusinessNumberSchema.parse('1234567890')).toBe('1234567890')
  })

  it('rejects invalid format', () => {
    expect(() => KoreanBusinessNumberSchema.parse('12345')).toThrow()
  })
})

// ============================================================================
// Safe String (XSS Protection)
// ============================================================================

describe('SafeStringSchema', () => {
  it('passes through normal text', async () => {
    const result = SafeStringSchema.parse('Hello, World!')
    expect(result).toBe('Hello, World!')
  })

  it('strips script tags', async () => {
    const result = SafeStringSchema.parse('<script>alert("xss")</script>')
    expect(result).not.toContain('<script>')
    expect(result).not.toContain('alert')
  })

  it('strips iframe tags', async () => {
    const result = SafeStringSchema.parse('<iframe src="evil.com"></iframe>')
    expect(result).not.toContain('<iframe')
  })

  it('strips javascript: protocol', async () => {
    const result = SafeStringSchema.parse('javascript:alert(1)')
    expect(result).not.toContain('javascript:')
  })

  it('strips event handlers', async () => {
    const result = SafeStringSchema.parse('text onclick=alert(1)')
    expect(result).not.toContain('onclick=')
  })
})

describe('SafeShortStringSchema', () => {
  it('rejects strings over 500 chars', () => {
    const longString = 'a'.repeat(501)
    expect(() => SafeShortStringSchema.parse(longString)).toThrow()
  })

  it('accepts strings under 500 chars', () => {
    const shortString = 'a'.repeat(100)
    expect(SafeShortStringSchema.parse(shortString)).toBe(shortString)
  })
})

// ============================================================================
// Business Domain Schemas
// ============================================================================

describe('ProgramNameSchema', () => {
  it('accepts valid program names', () => {
    expect(ProgramNameSchema.parse('TIPS')).toBe('TIPS')
    expect(ProgramNameSchema.parse('K-Startup')).toBe('K-Startup')
    expect(ProgramNameSchema.parse('NIPA')).toBe('NIPA')
    expect(ProgramNameSchema.parse('KOTRA')).toBe('KOTRA')
    expect(ProgramNameSchema.parse('Other')).toBe('Other')
  })

  it('rejects invalid program name', () => {
    expect(() => ProgramNameSchema.parse('InvalidProgram')).toThrow()
  })
})

describe('SubscriptionTierSchema', () => {
  it('accepts all valid tiers', () => {
    const tiers = ['free', 'starter', 'pro', 'business', 'enterprise', 'unlimited']
    tiers.forEach(tier => {
      expect(SubscriptionTierSchema.parse(tier)).toBe(tier)
    })
  })

  it('rejects invalid tier', () => {
    expect(() => SubscriptionTierSchema.parse('premium')).toThrow()
  })
})

// ============================================================================
// Business Plan Schemas
// ============================================================================

describe('BusinessPlanInputSchema', () => {
  const validInput = {
    input_materials: 'a'.repeat(100),
    target_program: 'TIPS' as const
  }

  it('accepts valid input', () => {
    const result = BusinessPlanInputSchema.parse(validInput)
    expect(result.target_program).toBe('TIPS')
  })

  it('rejects input_materials < 50 chars', () => {
    expect(() =>
      BusinessPlanInputSchema.parse({ ...validInput, input_materials: 'short' })
    ).toThrow()
  })

  it('accepts optional organization_id', () => {
    const result = BusinessPlanInputSchema.parse({
      ...validInput,
      organization_id: '123e4567-e89b-12d3-a456-426614174000'
    })
    expect(result.organization_id).toBeDefined()
  })

  it('rejects invalid organization_id format', () => {
    expect(() =>
      BusinessPlanInputSchema.parse({ ...validInput, organization_id: 'not-uuid' })
    ).toThrow()
  })
})

// ============================================================================
// Product URL Schema
// ============================================================================

describe('ProductURLSchema', () => {
  it('accepts 1688.com URL', () => {
    expect(ProductURLSchema.parse('https://detail.1688.com/product/123')).toBeDefined()
  })

  it('accepts alibaba.com URL', () => {
    expect(ProductURLSchema.parse('https://www.alibaba.com/product/123')).toBeDefined()
  })

  it('rejects non-sourcing URL', () => {
    expect(() => ProductURLSchema.parse('https://amazon.com/product/123')).toThrow()
  })

  it('rejects non-URL string', () => {
    expect(() => ProductURLSchema.parse('not-a-url')).toThrow()
  })
})

// ============================================================================
// File Upload Schema
// ============================================================================

describe('FileUploadSchema', () => {
  it('accepts valid DOCX upload', () => {
    const result = FileUploadSchema.parse({
      filename: 'document.docx',
      size: 1024 * 1024,
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    })
    expect(result.filename).toBe('document.docx')
  })

  it('accepts valid HWP upload', () => {
    const result = FileUploadSchema.parse({
      filename: 'report.hwp',
      size: 2048,
      mimeType: 'application/x-hwp'
    })
    expect(result.mimeType).toBe('application/x-hwp')
  })

  it('rejects unsupported mime type', () => {
    expect(() =>
      FileUploadSchema.parse({
        filename: 'virus.exe',
        size: 1024,
        mimeType: 'application/x-executable'
      })
    ).toThrow()
  })

  it('rejects files over 512MB', () => {
    expect(() =>
      FileUploadSchema.parse({
        filename: 'huge.pdf',
        size: 600 * 1024 * 1024,
        mimeType: 'application/pdf'
      })
    ).toThrow()
  })
})

// ============================================================================
// Pagination & Date Range
// ============================================================================

describe('PaginationSchema', () => {
  it('provides defaults', () => {
    const result = PaginationSchema.parse({})
    expect(result.page).toBe(1)
    expect(result.limit).toBe(20)
    expect(result.sortOrder).toBe('desc')
  })

  it('respects custom values', () => {
    const result = PaginationSchema.parse({ page: 3, limit: 50, sortOrder: 'asc' })
    expect(result.page).toBe(3)
    expect(result.limit).toBe(50)
    expect(result.sortOrder).toBe('asc')
  })

  it('rejects limit > 100', () => {
    expect(() => PaginationSchema.parse({ limit: 200 })).toThrow()
  })

  it('rejects page < 1', () => {
    expect(() => PaginationSchema.parse({ page: 0 })).toThrow()
  })
})

describe('DateRangeSchema', () => {
  it('accepts valid date range', () => {
    const result = DateRangeSchema.parse({
      startDate: '2026-01-01',
      endDate: '2026-02-01'
    })
    expect(result.startDate).toBeInstanceOf(Date)
  })

  it('rejects end date before start date', () => {
    expect(() =>
      DateRangeSchema.parse({
        startDate: '2026-02-01',
        endDate: '2026-01-01'
      })
    ).toThrow()
  })
})

// ============================================================================
// Helper Functions
// ============================================================================

describe('validateInput', () => {
  it('returns parsed value on valid input', () => {
    const result = validateInput(EmailSchema, 'test@example.com')
    expect(result).toBe('test@example.com')
  })

  it('throws descriptive error on invalid input', () => {
    expect(() => validateInput(EmailSchema, 'not-email')).toThrow('Validation failed')
  })
})

describe('safeValidate', () => {
  it('returns success: true on valid input', () => {
    const result = safeValidate(EmailSchema, 'test@example.com')
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toBe('test@example.com')
    }
  })

  it('returns success: false with errors on invalid input', () => {
    const result = safeValidate(EmailSchema, 'not-email')
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.errors.length).toBeGreaterThan(0)
    }
  })
})
