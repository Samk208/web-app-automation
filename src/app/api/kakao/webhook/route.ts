import { NextResponse } from "next/server";
import { createLogger } from "@/lib/logger";
import { createClient } from "@/lib/supabase/server";
import { redis } from "@/lib/redis";
import { getActiveOrg } from "@/lib/org-context";
import { z } from "zod";
import crypto from "crypto";

const FAQ = [
    { keyword: "가격", reply: "가격 문의는 담당 매니저가 안내 드립니다. 연락처를 남겨주세요." },
    { keyword: "문의", reply: "문의 감사합니다. 필요한 서비스와 예상 예산을 알려주세요." },
    { keyword: "데모", reply: "데모 요청 접수되었습니다. 가능한 시간대를 알려주세요." },
];

const KakaoWebhookSchema = z.object({
    userRequest: z.object({
        user: z.object({
            id: z.string(),
        }),
        utterance: z.string(),
    }),
});

/**
 * Verify Kakao webhook signature
 * Uses HMAC-SHA256 on the request body for security
 *
 * @param bodyText - Raw request body as string
 * @param signature - X-Kakao-Signature header value
 * @returns true if signature is valid
 */
function verifySignature(bodyText: string, signature: string | null): boolean {
    const secret = process.env.KAKAO_WEBHOOK_SECRET;

    if (!secret) {
        throw new Error('KAKAO_WEBHOOK_SECRET not configured');
    }

    if (!signature) {
        return false;
    }

    // Calculate expected signature using HMAC-SHA256 on request body
    const expectedSignature = crypto
        .createHmac("sha256", secret)
        .update(bodyText)
        .digest("hex");

    // Use constant-time comparison to prevent timing attacks
    try {
        return crypto.timingSafeEqual(
            Buffer.from(signature),
            Buffer.from(expectedSignature)
        );
    } catch {
        // Lengths don't match
        return false;
    }
}

export async function POST(request: Request) {
    const logger = createLogger({ agent: "kakao-webhook" });
    try {
        // Read body as text first for signature verification
        const bodyText = await request.text();
        const signature = request.headers.get("X-Kakao-Signature");

        // Verify signature before processing
        if (!verifySignature(bodyText, signature)) {
            logger.warn("Invalid signature", { signatureProvided: !!signature });
            return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
        }

        // Parse validated body
        const body = KakaoWebhookSchema.parse(JSON.parse(bodyText));
        const userId = body.userRequest.user.id;
        const utterance = body.userRequest.utterance;

        // Basic rate limit per user (stateless fallback if redis absent)
        if (redis) {
            const key = `kakao:rl:${userId}`;
            const current = await redis.incr(key);
            if (current === 1) await redis.expire(key, 60);
            if (current > 30) {
                logger.warn("Rate limit exceeded", { userId });
                return NextResponse.json({ message: "Please slow down." }, { status: 429 });
            }
        }

        const { organization_id } = await getActiveOrg();
        const supabase = await createClient();

        // Session state
        let turns = 1;
        if (redis) {
            const sessionKey = `kakao:session:${organization_id || "anon"}:${userId}`;
            const session = (await redis.get(sessionKey)) as any || { turns: 0 };
            turns = (session.turns || 0) + 1;
            await redis.set(sessionKey, { turns, last: utterance }, { ex: 3600 });
        }

        await supabase.from("messages").insert({
            channel: "kakao",
            user_external_id: userId,
            content: utterance,
            organization_id,
        });

        // Simple FAQ/intent matching
        const matched = FAQ.find(f => utterance.includes(f.keyword));
        const reply = matched
            ? `(${turns}회차) ${matched.reply}`
            : `(${turns}회차) "${utterance}" 확인했습니다. 도와드릴 내용을 말씀해 주세요.`;

        await supabase.from("messages").insert({
            channel: "kakao",
            user_external_id: userId,
            content: reply,
            role: "assistant",
            organization_id,
        });

        return NextResponse.json({
            version: "2.0",
            template: {
                outputs: [
                    {
                        simpleText: {
                            text: reply,
                        },
                    },
                ],
            },
        });
    } catch (err: any) {
        logger.error("Kakao webhook failed", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

