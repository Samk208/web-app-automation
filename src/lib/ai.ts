
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createOpenAI } from '@ai-sdk/openai';

// Allow switching providers via env
const provider = process.env.AI_PROVIDER || 'google';

export const google = createGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY,
});

export const openai = createOpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export const defaultModel = provider === 'openai'
    ? openai('gpt-4o')
    : google('gemini-flash-latest');
