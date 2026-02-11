"use server"

import { requireResourceAccess } from "@/lib/auth/authorization"
import { Errors, handleAPIError } from "@/lib/error-handler"
import { createLogger } from "@/lib/logger"
import { requireActiveOrg } from "@/lib/org-context"
import { enforceRateLimit } from "@/lib/rate-limit-redis"
import { createClient } from "@/lib/supabase/server"
import { URLSchema, UUIDSchema } from "@/lib/validation/schemas"

export async function processHwpJob(jobId: string) {
    const supabase = await createClient()
    const logger = createLogger({ agent: "hwp-converter", context: { jobId } })

    try {
        UUIDSchema.parse(jobId)

        const auth = await requireResourceAccess('hwp_jobs', jobId)
        await enforceRateLimit(`hwp:enqueue:${auth.organizationId}`, 10)

        const { data: job, error } = await supabase
            .from("hwp_jobs")
            .select("*")
            .eq("id", jobId)
            .eq("organization_id", auth.organizationId)
            .single()

        if (error || !job) {
            logger.error("Job not found", error)
            throw Errors.notFound("HWP job")
        }

        // Enqueue Job for Background Processing
        // The worker ignores QUEUED jobs unless retry_at is reached, so we set it to now()
        const { error: updateError } = await supabase.from("hwp_jobs").update({
            status: "QUEUED",
            retry_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        }).eq("id", jobId).eq("organization_id", auth.organizationId)

        if (updateError) {
            throw updateError
        }

        logger.info("HWP job queued for background processing", { jobId })

        // Return immediately to the UI
        return { success: true, message: "Job queued", jobId }

    } catch (err) {
        // Update status to FAILED on error
        try {
            const authOrNull = await (async () => {
                try {
                    return await requireResourceAccess('hwp_jobs', jobId)
                } catch {
                    return null
                }
            })()

            if (authOrNull?.organizationId) {
                await supabase
                    .from('hwp_jobs')
                    .update({ status: 'FAILED' })
                    .eq('id', jobId)
                    .eq('organization_id', authOrNull.organizationId)
            }
        } catch (updateError) {
            logger.error('Failed to update status to FAILED', updateError)
        }

        logger.error("HWP job enqueue failed", err)
        const sanitized = handleAPIError(err, { service: "hwp-converter", jobId })
        throw sanitized.error
    }
}

export async function getHwpJobStatus(fileUrl: string) {
    try {
        const url = URLSchema.parse(fileUrl)

        const { organization_id: organizationId } = await requireActiveOrg()
        const supabase = await createClient()

        await enforceRateLimit(`hwp:status:${organizationId}`, 60)

        // Find the most recent job for this file (org-scoped)
        const { data: job, error } = await supabase
            .from("hwp_jobs")
            .select("id, status, error_message, output_url")
            .eq("file_url", url)
            .eq("organization_id", organizationId)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle()

        if (error) {
            return null
        }

        return job
    } catch {
        return null
    }
}
