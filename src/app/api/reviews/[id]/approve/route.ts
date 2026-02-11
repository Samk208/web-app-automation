import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth/authorization";
import { handleAPIError } from "@/lib/error-handler";
import { createLogger } from "@/lib/logger";
import { parseJsonBody, setCorrelationHeader } from "@/lib/api-guard";

const BodySchema = z.object({
    status: z.enum(["approved", "rejected"]).default("approved"),
    note: z.string().max(500).optional(),
});

const ParamsSchema = z.object({
    id: z.string().uuid("Invalid approval request ID"),
});

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { correlationId, body } = await parseJsonBody(request, BodySchema);
    const resolvedParams = await params;
    const { id: approvalId } = ParamsSchema.parse(resolvedParams);
    const logger = createLogger({ agent: "review-approval", correlationId, context: { id: approvalId } });

    try {
        // 1. Require authentication
        const { userId } = await requireAuth();
        const supabase = await createClient();

        // 2. Get user's organization for scoped access
        const { data: membership } = await supabase
            .from("organization_members")
            .select("organization_id, role")
            .eq("user_id", userId)
            .order("created_at", { ascending: true })
            .limit(1)
            .single();

        if (!membership?.organization_id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // 3. Only admins and owners can approve
        if (!["admin", "owner"].includes(membership.role || "")) {
            logger.warn("Insufficient role for approval", { userId, role: membership.role });
            return NextResponse.json({ error: "Forbidden: Admin or Owner role required" }, { status: 403 });
        }

        // 4. Fetch approval request with org scope
        const { data: approval, error: fetchError } = await supabase
            .from("approval_requests")
            .select("*")
            .eq("id", approvalId)
            .eq("organization_id", membership.organization_id)
            .single();

        if (fetchError || !approval) {
            logger.warn("Approval request not found", { fetchError, approvalId });
            return NextResponse.json({ error: "Approval request not found" }, { status: 404 });
        }

        // 5. Update with org-scoped check
        const { error: updateError } = await supabase
            .from("approval_requests")
            .update({
                status: body.status,
                resolved_at: new Date().toISOString(),
                reviewer_note: body.note ?? null,
            })
            .eq("id", approvalId)
            .eq("organization_id", membership.organization_id);

        if (updateError) {
            logger.error("Failed to update approval request", updateError);
            return NextResponse.json({ error: "Failed to update approval request" }, { status: 500 });
        }

        logger.info("Approval request updated", { status: body.status, userId, approvalId });
        const response = NextResponse.json({ success: true, status: body.status });
        setCorrelationHeader(response.headers, correlationId);
        return response;
    } catch (err: any) {
        const { error: sanitizedError, statusCode } = handleAPIError(err, {
            service: "review-approval",
            correlationId,
        });
        return NextResponse.json({ error: sanitizedError.message }, { status: statusCode });
    }
}

