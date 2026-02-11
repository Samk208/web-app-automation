import { createOpenAI } from '@ai-sdk/openai';
import { embed } from 'ai';

const openai = createOpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Standardize on 1536 dimensions (OpenAI Small)
const EMBEDDING_MODEL = 'text-embedding-3-small';

export async function generateEmbedding(text: string): Promise<number[]> {
    if (!process.env.OPENAI_API_KEY) {
        throw new Error("OPENAI_API_KEY is required for embeddings");
    }

    try {
        const { embedding } = await embed({
            model: openai.embedding(EMBEDDING_MODEL),
            value: text.replace(/\n/g, ' '), // Normalize newlines
        });

        return embedding;
    } catch (error) {
        console.error("Embedding generation failed:", error);
        throw error;
    }
}

/**
 * Generates embeddings for a batch of texts.
 * Useful for bulk ingestion.
 */
export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
    if (!process.env.OPENAI_API_KEY) {
        throw new Error("OPENAI_API_KEY is required for embeddings");
    }

    try {
        const results = await Promise.all(texts.map(text => embed({
            model: openai.embedding(EMBEDDING_MODEL),
            value: text.replace(/\n/g, ' '),
        })));

        return results.map(r => r.embedding);
    } catch (error) {
        console.error("Batch embedding generation failed:", error);
        throw error;
    }
}
