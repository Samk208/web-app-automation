/**
 * Authorization Middleware
 * Provides functions to verify user permissions and organization access
 */

import { createLogger } from "@/lib/logger"
import { createClient } from "@/lib/supabase/server"

const logger = createLogger({ agent: "authorization" })

export interface AuthContext {
  userId: string
  organizationId: string
  role: string
}

/**
 * Get authenticated user and verify they're logged in
 */
export async function requireAuth(): Promise<{ userId: string; email: string }> {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    logger.warn("Unauthorized access attempt")
    throw new Error("Unauthorized: Please log in")
  }

  return {
    userId: user.id,
    email: user.email || ""
  }
}

/**
 * Verify user belongs to organization and return their role
 */
export async function requireOrganizationAccess(
  organizationId: string,
  requiredRoles?: string[]
): Promise<AuthContext> {
  const { userId, email } = await requireAuth()
  const supabase = await createClient()

  // Check organization membership
  const { data: membership, error } = await supabase
    .from('organization_members')
    .select('role, organization_id')
    .eq('organization_id', organizationId)
    .eq('user_id', userId)
    .single()

  if (error || !membership) {
    logger.warn("Forbidden: User not member of organization", {
      userId,
      email,
      organizationId,
      error: error?.message
    })
    throw new Error("Forbidden: You don't have access to this organization")
  }

  // Check role if required
  if (requiredRoles && !requiredRoles.includes(membership.role)) {
    logger.warn("Forbidden: Insufficient permissions", {
      userId,
      email,
      organizationId,
      userRole: membership.role,
      requiredRoles
    })
    throw new Error(`Forbidden: Requires one of: ${requiredRoles.join(', ')}`)
  }

  logger.info("Authorization successful", {
    userId,
    organizationId,
    role: membership.role
  })

  return {
    userId,
    organizationId,
    role: membership.role
  }
}

/**
 * Verify user can access a specific resource (business plan, proposal, etc.)
 * Checks both organization membership and resource ownership
 */
export async function requireResourceAccess(
  table: string,
  resourceId: string,
  requiredRoles?: string[]
): Promise<AuthContext> {
  const { userId } = await requireAuth()
  const supabase = await createClient()

  // Fetch resource with organization_id
  const { data: resource, error: resourceError } = await supabase
    .from(table)
    .select('organization_id')
    .eq('id', resourceId)
    .single()

  if (resourceError || !resource) {
    logger.warn("Resource not found", {
      table,
      resourceId,
      userId,
      error: resourceError?.message
    })
    throw new Error("Resource not found")
  }

  // Verify organization access
  return requireOrganizationAccess(resource.organization_id, requiredRoles)
}

/**
 * Check if user has admin/owner role in their organization
 */
export async function requireAdminRole(organizationId: string): Promise<AuthContext> {
  return requireOrganizationAccess(organizationId, ['admin', 'owner'])
}

/**
 * Get user's organizations (all orgs they're a member of)
 */
export async function getUserOrganizations(): Promise<Array<{
  id: string
  name: string
  role: string
}>> {
  const { userId } = await requireAuth()
  const supabase = await createClient()

  const { data: memberships, error } = await supabase
    .from('organization_members')
    .select(`
      role,
      organization:organizations(id, name)
    `)
    .eq('user_id', userId)

  if (error) {
    logger.error("Failed to fetch user organizations", error)
    throw new Error("Failed to fetch organizations")
  }

  return (memberships || []).map(m => ({
    id: (m.organization as any).id,
    name: (m.organization as any).name,
    role: m.role
  }))
}

/**
 * Verify resource belongs to user's organization
 * Throws if not authorized
 */
export async function verifyResourceOwnership(
  table: string,
  resourceId: string
): Promise<string> {
  const { organizationId } = await requireResourceAccess(table, resourceId)
  return organizationId
}

/**
 * Rate limiting key for user
 */
export function getRateLimitKey(userId: string, scope: string = "global"): string {
  return `ratelimit:user:${userId}:${scope}`
}

/**
 * Rate limiting key for organization
 */
export function getOrgRateLimitKey(organizationId: string, scope: string = "global"): string {
  return `ratelimit:org:${organizationId}:${scope}`
}
