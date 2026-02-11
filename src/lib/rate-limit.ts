type Bucket = {
    tokens: number;
    updatedAt: number;
};

const buckets = new Map<string, Bucket>();

export async function enforceRateLimit(key: string, limitPerMinute = 60) {
    const now = Date.now();
    const refillRate = limitPerMinute / 60_000; // tokens per ms
    const bucket = buckets.get(key) || { tokens: limitPerMinute, updatedAt: now };

    // Refill based on elapsed time
    const elapsed = now - bucket.updatedAt;
    bucket.tokens = Math.min(limitPerMinute, bucket.tokens + elapsed * refillRate);
    bucket.updatedAt = now;

    if (bucket.tokens < 1) {
        throw new Error("Rate limit exceeded");
    }

    bucket.tokens -= 1;
    buckets.set(key, bucket);
}

