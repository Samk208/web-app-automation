
import { ShortTermMemory } from '@/lib/memory/session-manager';
import { config } from 'dotenv';
config({ path: '.env.local' });

async function testRedis() {
    console.log("Testing Redis Connection...");

    console.log("Environment Check:");
    console.log(" - UPSTASH_REDIS_REST_URL Present:", !!process.env.UPSTASH_REDIS_REST_URL);
    console.log(" - UPSTASH_REDIS_REST_TOKEN Present:", !!process.env.UPSTASH_REDIS_REST_TOKEN);

    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
        console.error("❌ Missing environment variables. Please check .env.local");
        // Attempt to read file manually to debug path issues (safe log)
        try {
            const fs = require('fs');
            const path = require('path');
            const envPath = path.resolve('.env.local');
            console.log("Looking for .env.local at:", envPath);
            if (fs.existsSync(envPath)) {
                console.log("File exists.");
            } else {
                console.error("File DOES NOT exist at expected path.");
            }
        } catch (e) { }
        return;
    }

    const memory = new ShortTermMemory();
    const testKey = "test-connection-" + Date.now();
    const testValue = { status: "active", timestamp: Date.now() };

    try {
        console.log("Setting key:", testKey);
        await memory.set("test-session", testKey, testValue);

        console.log("Getting key...");
        const retrieved = await memory.get("test-session", testKey);

        console.log("Retrieved value:", retrieved);

        if (JSON.stringify(retrieved) === JSON.stringify(testValue)) {
            console.log("✅ Redis Connection Successful!");
        } else {
            console.error("❌ Parsed value mismatch!");
        }

        await memory.delete("test-session");

    } catch (error: any) {
        console.error("❌ Redis Error:", error.message);
    }
}

testRedis();
