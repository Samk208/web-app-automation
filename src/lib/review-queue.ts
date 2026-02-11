import { SupabaseClient } from "@supabase/supabase-js";
import { createLogger } from "./logger";

type ReviewPayload = {
    agent: string;
    resourceId: string;
    organizationId?: string | null;
    summary?: string;
    data?: Record<string, unknown>;
};

// Best-effort enqueue into approval_requests; if table/policy missing, log and continue.
export async function enqueueReview(supabase: SupabaseClient, payload: ReviewPayload) {
    const logger = createLogger({
        agent: payload.agent,
        context: { resourceId: payload.resourceId, organizationId: payload.organizationId },
    });

    try {
        const { error } = await supabase.from("approval_requests").insert({
            agent: payload.agent,
            resource_id: payload.resourceId,
            organization_id: payload.organizationId,
            status: "pending",
            summary: payload.summary ?? null,
            data: payload.data ?? null,
        });

        if (error) {
            logger.warn("Approval request insert failed (non-fatal)", { error: error.message });
        } else {
            logger.info("Approval request enqueued");
        }
    } catch (err) {
        logger.warn("Approval request insert threw (non-fatal)", { error: err instanceof Error ? err.message : String(err) });
    }
}

