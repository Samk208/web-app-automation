import { z } from "zod";
import { correlationHeader, getCorrelationIdFromHeaders } from "./correlation";

type ParsedRequest<T> = {
    correlationId: string;
    body: T;
};

export async function parseJsonBody<T>(
    request: Request,
    schema: z.ZodType<T>,
    opts?: { maxBytes?: number }
): Promise<ParsedRequest<T>> {
    const correlationId = getCorrelationIdFromHeaders(request.headers);

    const cloned = request.clone();
    const text = await cloned.text();
    const maxBytes = opts?.maxBytes ?? 32_000;
    const size = Buffer.byteLength(text, "utf8");
    if (size > maxBytes) {
        throw new Error(`Payload too large (${size}b > ${maxBytes}b)`);
    }

    const body = schema.parse(text ? JSON.parse(text) : {});
    return { correlationId, body };
}

export function setCorrelationHeader(headers: Headers, correlationId: string) {
    headers.set(correlationHeader, correlationId);
}

