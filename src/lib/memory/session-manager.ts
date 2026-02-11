import { createLogger } from "@/lib/logger";
import { createClient } from "@/lib/supabase/server";
import { Redis } from "@upstash/redis";

const logger = createLogger({ agent: "memory-system" });

export interface MemoryConfig {
    ttlSeconds?: number;
    namespace?: string;
}

/**
 * Short-Term Memory (Redis)
 * Fast, ephemeral storage for active sessions
 */
export class ShortTermMemory {
    private redis: Redis;
    private ttl: number;

    constructor(config: MemoryConfig = {}) {
        // Requires REDIS_URL and REDIS_TOKEN in env
        this.redis = Redis.fromEnv();
        this.ttl = config.ttlSeconds || 24 * 60 * 60; // Default 24h
    }

    private getKey(sessionId: string, key: string): string {
        return `session:${sessionId}:${key}`;
    }

    /**
     * Set a value in the session context
     */
    async set(sessionId: string, key: string, value: any): Promise<void> {
        const redisKey = this.getKey(sessionId, key);
        await this.redis.set(redisKey, value, { ex: this.ttl });
    }

    /**
     * Get a value from the session context
     */
    async get<T>(sessionId: string, key: string): Promise<T | null> {
        const redisKey = this.getKey(sessionId, key);
        return await this.redis.get<T>(redisKey);
    }

    /**
     * Push an item to a list (for message history)
     */
    async pushToList(sessionId: string, listKey: string, value: any): Promise<void> {
        const redisKey = this.getKey(sessionId, listKey);
        await this.redis.rpush(redisKey, value);
        await this.redis.expire(redisKey, this.ttl);
    }

    /**
     * Get range of items from a list
     */
    async getListRange<T>(sessionId: string, listKey: string, start: number = 0, end: number = -1): Promise<T[]> {
        const redisKey = this.getKey(sessionId, listKey);
        return await this.redis.lrange<T>(redisKey, start, end);
    }

    /**
     * Trim list to keep only the last N items
     */
    async trimList(sessionId: string, listKey: string, maxLength: number): Promise<void> {
        const redisKey = this.getKey(sessionId, listKey);
        // Keep last N: LTRIM key -N -1
        // Actually safe way ensuring we keep tail: LTRIM key -maxLength -1
        // Does LTRIM support negative? Yes.
        // LTRIM list 0 99 keeps first 100.
        // To keep LAST 50: 
        // We need to know length? Or just use negative indexing.
        // Redis LTRIM key start stop.
        // If we want to keep last 50, we can't easily do it with LTRIM unless we know length.
        // Actually, RPUSH + LTRIM is a common pattern.
        // LTRIM key -50 -1 keeps the last 50.
        await this.redis.ltrim(redisKey, -maxLength, -1);
    }

    async delete(sessionId: string): Promise<void> {
        const keys = await this.redis.keys(`session:${sessionId}:*`);
        if (keys.length > 0) {
            await this.redis.del(...keys);
        }
    }
}

/**
 * Long-Term Memory (Supabase)
 * Persistent storage for audit and retrieval
 */
export class LongTermMemory {

    /**
     * Append an event to the user's history
     */
    async appendEvent(
        userId: string,
        organizationId: string,
        sessionId: string,
        eventType: string,
        content: any,
        metadata: any = {}
    ): Promise<void> {
        const supabase = await createClient();

        const { error } = await supabase.from('user_history').insert({
            user_id: userId,
            organization_id: organizationId,
            session_id: sessionId,
            event_type: eventType,
            content: content,
            metadata: metadata
        });

        if (error) {
            logger.error("Failed to append to LongTermMemory", error);
            // Non-blocking error, log and continue
        }
    }

    /**
     * Retrieve history for a user
     */
    async getHistory(userId: string, limit: number = 50): Promise<any[]> {
        const supabase = await createClient();

        const { data, error } = await supabase
            .from('user_history')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) {
            logger.error("Failed to retrieve LongTermMemory", error);
            return [];
        }

        return data || [];
    }
}

export const shortTermMemory = new ShortTermMemory();
export const longTermMemory = new LongTermMemory();
