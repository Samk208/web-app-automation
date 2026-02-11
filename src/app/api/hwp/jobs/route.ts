import { requireAuth } from "@/lib/auth/authorization";
import { handleAPIError } from "@/lib/error-handler";
import { createLogger } from "@/lib/logger";
import { enforceRateLimit } from "@/lib/rate-limit-redis";
import { createClient } from "@/lib/supabase/server";
import { URLSchema } from "@/lib/validation/schemas";
import { NextResponse } from "next/server";
import { z } from "zod";

const BodySchema = z.object({
    fileUrl: URLSchema,
    filename: z.string().optional(),
});

export async function POST(request: Request) {
    const logger = createLogger({ agent: "hwp-jobs-api" });
    try {
        const body = BodySchema.parse(await request.json());
        const auth = await requireAuth();
        const supabase = await createClient();

        const { data: membership, error: membershipError } = await supabase
            .from('memberships')
            .select('organization_id')
            .eq('user_id', auth.userId)
            .order('created_at', { ascending: true })
            .limit(1)
            .single();

        const organizationId = membership?.organization_id;
        if (membershipError || !organizationId) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Restrict to this project's Supabase Storage host
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        if (supabaseUrl) {
            const allowedHost = new URL(supabaseUrl).hostname;
            const fileHost = new URL(body.fileUrl).hostname;
            if (allowedHost !== fileHost) {
                return NextResponse.json({ error: "Invalid file URL" }, { status: 400 });
            }
        }

        await enforceRateLimit(`hwp:create:${organizationId}`, 10);

        const { data, error } = await supabase
            .from("hwp_jobs")
            .insert({
                file_url: body.fileUrl,
                status: "QUEUED",
                organization_id: organizationId,
                retry_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            })
            .select()
            .single();

        if (error || !data) {
            logger.error("Failed to create hwp job", error);
            return NextResponse.json({ error: "Failed to create job" }, { status: 500 });
        }

        // Enqueue-only: a separate worker processes QUEUED jobs.
        return NextResponse.json({ success: true, jobId: data.id, status: data.status });
    } catch (err) {
        logger.error("HWP job creation failed", err);
        const sanitized = handleAPIError(err, { service: "hwp-jobs-api" });
        return NextResponse.json({ error: sanitized.error.message }, { status: sanitized.statusCode });
    }
}

