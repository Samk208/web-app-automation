import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createLogger } from "@/lib/logger";
import { enforceSchema } from "@/lib/guard";
import { parseJsonBody, setCorrelationHeader } from "@/lib/api-guard";

const BodySchema = z.object({
    status: z.enum(["approved", "rejected"]).default("approved"),
    note: z.string().max(500).optional(),
});

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { correlationId, body } = await parseJsonBody(request, BodySchema);
    const resolvedParams = await params;
    const logger = createLogger({ agent: "review-approval", correlationId, context: { id: resolvedParams.id } });

    try {
        const supabase = await createClient();

        const { data: approval, error: fetchError } = await supabase
            .from("approval_requests")
            .select("*")
            .eq("id", resolvedParams.id)
            .single();

        if (fetchError || !approval) {
            logger.warn("Approval request not found", { fetchError });
            return NextResponse.json({ error: "Approval request not found" }, { status: 404 });
        }

        const { error: updateError } = await supabase
            .from("approval_requests")
            .update({
                status: body.status,
                resolved_at: new Date().toISOString(),
                reviewer_note: body.note ?? null,
            })
            .eq("id", resolvedParams.id);

        if (updateError) {
            logger.error("Failed to update approval request", updateError);
            return NextResponse.json({ error: "Failed to update approval request" }, { status: 500 });
        }

        logger.info("Approval request updated", { status: body.status });
        const response = NextResponse.json({ success: true, status: body.status });
        setCorrelationHeader(response.headers, correlationId);
        return response;
    } catch (err: any) {
        logger.error("Approval route failed", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

