"use server"

import { getActiveOrg as getActiveOrgServer } from "@/lib/org-context"
import { OrgContext } from "@/lib/org"

/**
 * Server Action wrapper for getActiveOrg()
 * Can be called from Client Components
 */
export async function getActiveOrg(): Promise<OrgContext> {
    return await getActiveOrgServer()
}
