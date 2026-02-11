/**
 * Common Validation Schemas
 * Centralized Zod schemas for input validation across the application
 */

import { z } from 'zod';

// ============================================================================
// Basic Types
// ============================================================================

export const EmailSchema = z.string()
    .email('Invalid email format')
    .min(5, 'Email too short')
    .max(255, 'Email too long')
    .toLowerCase()
    .trim();

export const PasswordSchema = z.string()
    .min(12, 'Password must be at least 12 characters')
    .max(128, 'Password too long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

export const UUIDSchema = z.string()
    .uuid('Invalid ID format');

export const URLSchema = z.string()
    .url('Invalid URL format')
    .max(2048, 'URL too long');

export const PhoneSchema = z.string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format (E.164)');

// ============================================================================
// Safe String Schemas (with XSS protection)
// ============================================================================

/**
 * Remove potential XSS vectors from strings
 */
function sanitizeHTML(str: string): string {
    return str
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, ''); // Remove event handlers
}

// Base safe string with default max length
const createSafeString = (maxLength: number = 10000, errorMsg: string = 'Text too long') =>
    z.string()
        .max(maxLength, errorMsg)
        .transform(sanitizeHTML);

export const SafeStringSchema = createSafeString(10000);

export const SafeShortStringSchema = createSafeString(500);

export const SafeTextAreaSchema = createSafeString(50000);

// ============================================================================
// Korean-specific
// ============================================================================

export const KoreanPhoneSchema = z.string()
    .regex(/^01[016789]-?\d{3,4}-?\d{4}$/, 'Invalid Korean phone number');

export const KoreanBusinessNumberSchema = z.string()
    .regex(/^\d{3}-?\d{2}-?\d{5}$/, 'Invalid business registration number');

// ============================================================================
// Business Domain Schemas
// ============================================================================

export const OrganizationNameSchema = z.string()
    .min(2, 'Organization name too short')
    .max(100, 'Organization name too long')
    .trim();

export const ProgramNameSchema = z.enum([
    'TIPS',
    'K-Startup',
    'NIPA',
    'KOTRA',
    'Other'
]);

export const SubscriptionTierSchema = z.enum([
    'free',
    'starter',
    'pro',
    'business',
    'enterprise',
    'unlimited'
]);

// ============================================================================
// File Upload Schemas
// ============================================================================

export const FileUploadSchema = z.object({
    filename: z.string().max(255),
    size: z.number()
        .max(512 * 1024 * 1024, 'File too large (max 512MB)'),
    mimeType: z.enum([
        'image/png',
        'image/jpeg',
        'image/svg+xml',
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // DOCX
        'application/x-hwp', // HWP
        'text/plain',
        'text/csv'
    ])
});

// ============================================================================
// Business Plan Schemas
// ============================================================================

export const BusinessPlanInputSchema = z.object({
    input_materials: z.string()
        .min(50, 'Please provide more details (min 50 characters)')
        .max(50000, 'Input too long (max 50,000 characters)'),
    target_program: ProgramNameSchema,
    organization_id: UUIDSchema.optional()
});

// ============================================================================
// Proposal Schemas
// ============================================================================

export const ProposalCreateSchema = z.object({
    title: createSafeString(200, 'Title too long'),
    description: SafeTextAreaSchema,
    client_name: createSafeString(100, 'Client name too long'),
    client_email: EmailSchema.optional(),
    client_url: URLSchema.optional(),
    organization_id: UUIDSchema.optional()
});

// ============================================================================
// Grant Application Schemas
// ============================================================================

export const GrantApplicationSchema = z.object({
    company_name: createSafeString(100, 'Company name too long'),
    business_type: z.string().max(50),
    industry: z.string().max(50),
    employee_count: z.number().min(0).max(100000),
    annual_revenue: z.number().min(0),
    target_programs: z.array(z.string()).min(1, 'Select at least one program'),
    organization_id: UUIDSchema.optional()
});

// ============================================================================
// Safety Guardian Schemas
// ============================================================================

export const SafetyDataSchema = z.object({
    sensor_id: z.string().max(100),
    sensor_type: z.enum(['temperature', 'pressure', 'gas', 'motion', 'other']),
    value: z.number(),
    unit: z.string().max(20),
    threshold: z.number().optional(),
    location: z.string().max(200).optional(),
    organization_id: UUIDSchema.optional()
});

// ============================================================================
// Product Sourcing Schemas
// ============================================================================

export const ProductURLSchema = z.string()
    .url('Invalid product URL')
    .refine(
        (url) => url.includes('1688.com') || url.includes('alibaba.com'),
        'Only 1688.com and Alibaba.com URLs are supported'
    );

export const SourcingRequestSchema = z.object({
    product_url: ProductURLSchema,
    target_market: z.string().max(50),
    organization_id: UUIDSchema.optional()
});

// ============================================================================
// Naver SEO Schemas
// ============================================================================

export const SEOAuditRequestSchema = z.object({
    url: URLSchema,
    keywords: z.array(createSafeString(100, 'Keyword too long')).max(10, 'Maximum 10 keywords'),
    organization_id: UUIDSchema.optional()
});

// ============================================================================
// HWP Converter Schemas
// ============================================================================

export const HWPJobSchema = z.object({
    file_url: URLSchema,
    target_format: z.enum(['docx', 'pdf']),
    organization_id: UUIDSchema.optional()
});

// ============================================================================
// KakaoTalk Webhook Schemas
// ============================================================================

export const KakaoWebhookSchema = z.object({
    userRequest: z.object({
        user: z.object({
            id: z.string()
        }),
        utterance: z.string().max(1000)
    })
});

// ============================================================================
// Pagination Schemas
// ============================================================================

export const PaginationSchema = z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(20),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).default('desc')
});

// ============================================================================
// API Query Schemas
// ============================================================================

export const DateRangeSchema = z.object({
    startDate: z.coerce.date(),
    endDate: z.coerce.date()
}).refine(
    (data) => data.endDate >= data.startDate,
    'End date must be after start date'
);

export const SearchSchema = z.object({
    query: createSafeString(200, 'Query too long'),
    filters: z.record(z.string(), z.any()).optional(),
    ...PaginationSchema.shape
});

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Validate and parse input with Zod schema
 * Throws validation error with details if invalid
 */
export function validateInput<T>(schema: z.Schema<T>, data: unknown): T {
    try {
        return schema.parse(data);
    } catch (error) {
        if (error instanceof z.ZodError) {
            const errors = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
            throw new Error(`Validation failed: ${errors}`);
        }
        throw error;
    }
}

/**
 * Safe parse that returns result instead of throwing
 */
export function safeValidate<T>(
    schema: z.Schema<T>,
    data: unknown
): { success: true; data: T } | { success: false; errors: string[] } {
    const result = schema.safeParse(data);

    if (result.success) {
        return { success: true, data: result.data };
    }

    return {
        success: false,
        errors: result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`)
    };
}
