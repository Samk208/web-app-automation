
import { createAnthropic } from '@ai-sdk/anthropic';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createOpenAI } from '@ai-sdk/openai';

/**
 * Returns the best available language model based on environment variables.
 * Priority:
 * 1. Google Gemini (GEMINI_API_KEY or GOOGLE_GENERATIVE_AI_API_KEY)
 * 2. OpenAI (OPENAI_API_KEY)
 * 3. Anthropic (ANTHROPIC_API_KEY)
 * 
 * @param modelIdOptional - Optional model ID override. If not provided, defaults to the provider's standard model.
 */
export function getModel(modelIdOptional?: string) {
    // 1. Check Google / Gemini
    const googleKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GOOGLE_API_KEY;
    if (googleKey) {
        console.log(`[ModelProvider] Using Google Key: ${googleKey.substring(0, 4)}... mapped to model: ${modelIdOptional || 'gemini-1.5-flash'}`);
        const google = createGoogleGenerativeAI({
            apiKey: googleKey,
        });
        // Default to gemini-2.0-flash as 1.5 is not available for this key
        return google(modelIdOptional || 'gemini-2.0-flash');
    }

    // 2. Check OpenAI
    const openaiKey = process.env.OPENAI_API_KEY;
    if (openaiKey) {
        const openai = createOpenAI({
            apiKey: openaiKey,
        });
        // Default to gpt-4o for similar capabilities
        return openai(modelIdOptional || 'gpt-4o');
    }

    // 3. Check Anthropic
    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    if (anthropicKey) {
        const anthropic = createAnthropic({
            apiKey: anthropicKey,
        });
        // Default to Sonnet 3.5
        return anthropic(modelIdOptional || 'claude-3-5-sonnet-20240620');
    }

    throw new Error("No AI API keys found. Please set GEMINI_API_KEY, OPENAI_API_KEY, or ANTHROPIC_API_KEY in .env.local");
}
