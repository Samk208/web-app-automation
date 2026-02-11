import { z } from "zod";

type RetryOptions = {
    retries?: number;
    delayMs?: number;
    backoffMultiplier?: number;
};

export function enforceSchema<T>(schema: z.ZodType<T>, value: unknown): T {
    return schema.parse(value);
}

export function enforceSize(value: unknown, maxBytes: number, label: string) {
    const serialized = typeof value === "string" ? value : JSON.stringify(value ?? "");
    const size = Buffer.byteLength(serialized, "utf8");
    if (size > maxBytes) {
        throw new Error(`Payload too large for ${label} (${size}b > ${maxBytes}b)`);
    }
}

export async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
    let timer: NodeJS.Timeout | undefined;
    const timeout = new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error("Request timed out")), ms);
    });
    try {
        return await Promise.race([promise, timeout]);
    } finally {
        if (timer) clearTimeout(timer);
    }
}

export async function withRetry<T>(fn: () => Promise<T>, opts: RetryOptions = {}): Promise<T> {
    const { retries = 2, delayMs = 300, backoffMultiplier = 2 } = opts;
    let attempt = 0;
    let lastError: unknown;
    let currentDelay = delayMs;

    while (attempt <= retries) {
        try {
            return await fn();
        } catch (err) {
            lastError = err;
            if (attempt === retries) break;
            await sleep(currentDelay);
            currentDelay *= backoffMultiplier;
            attempt += 1;
        }
    }
    throw lastError instanceof Error ? lastError : new Error(String(lastError));
}

const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));

