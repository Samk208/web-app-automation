
import { createAnthropic } from '@ai-sdk/anthropic';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createOpenAI } from '@ai-sdk/openai';
import { generateText } from 'ai';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load .env.local manually
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
    const envConfig = dotenv.parse(fs.readFileSync(envPath));
    for (const k in envConfig) {
        process.env[k] = envConfig[k];
    }
    console.log(`Loaded environment from ${envPath}`);
} else {
    console.warn("Warning: .env.local not found");
}

async function testGemini() {
    const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GOOGLE_API_KEY;
    if (!key) {
        console.log("❌ Gemini: Skipped (No key found)");
        return;
    }
    try {
        const google = createGoogleGenerativeAI({ apiKey: key });
        const { text } = await generateText({
            model: google('gemini-1.5-flash'),
            prompt: 'Say "Gemini OK"',
        });
        console.log(`✅ Gemini: Working (${text.trim()})`);
    } catch (e: any) {
        console.error(`❌ Gemini: Failed - ${e.message}`);
    }
}

async function testOpenAI() {
    const key = process.env.OPENAI_API_KEY;
    if (!key) {
        console.log("❌ OpenAI: Skipped (No key found)");
        return;
    }
    try {
        const openai = createOpenAI({ apiKey: key });
        const { text } = await generateText({
            model: openai('gpt-4o-mini'), // Use mini for cheap test
            prompt: 'Say "OpenAI OK"',
        });
        console.log(`✅ OpenAI: Working (${text.trim()})`);
    } catch (e: any) {
        console.error(`❌ OpenAI: Failed - ${e.message}`);
    }
}

async function testAnthropic() {
    const key = process.env.ANTHROPIC_API_KEY;
    if (!key) {
        console.log("❌ Anthropic: Skipped (No key found)");
        return;
    }
    try {
        const anthropic = createAnthropic({ apiKey: key });
        const { text } = await generateText({
            model: anthropic('claude-3-haiku-20240307'), // Use haiku for cheap test
            prompt: 'Say "Anthropic OK"',
        });
        console.log(`✅ Anthropic: Working (${text.trim()})`);
    } catch (e: any) {
        console.error(`❌ Anthropic: Failed - ${e.message}`);
    }
}

(async () => {
    console.log("--- Starting API Key Connectivity Test ---");
    await testGemini();
    await testOpenAI();
    await testAnthropic();
    console.log("--- Test Complete ---");
})();
