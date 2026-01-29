/**
 * Embedding Service - Convert text to vector representation
 * Uses OpenAI text-embedding-3-small (1536 dimensions)
 *
 * Purpose: Generate vector embeddings untuk semantic similarity matching
 * Latency: ~300ms average per embedding
 * Cost: $0.02 per 1M tokens (negligible)
 */

import OpenAI from "openai";

// Singleton client instance
let clientInstance: OpenAI | null = null;

/**
 * Get or create OpenAI client singleton
 */
const getClient = (): OpenAI => {
  if (clientInstance) return clientInstance;

  const apiKey = import.meta.env.VITE_OPENAI_API_KEY ||
                 import.meta.env.VITE_DEEPSEEK_API_KEY;

  if (!apiKey) {
    throw new Error('[EmbeddingService] No API key found in environment');
  }

  clientInstance = new OpenAI({
    apiKey,
    dangerouslyAllowBrowser: true // Client-side only for now
  });

  return clientInstance;
};

/**
 * Generate embedding vector for semantic similarity
 *
 * @param text - Query text to embed
 * @returns 1536-dimensional vector
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const ai = getClient();

  // Normalize query untuk consistent embeddings
  const normalized = normalizeQuery(text);

  const response = await ai.embeddings.create({
    model: "text-embedding-3-small",
    input: normalized,
    encoding_format: "float"
  });

  return response.data[0].embedding;
}

/**
 * Batch generate embeddings (untuk cache warming)
 * Reduces API calls dari N individual → 1 batch request
 *
 * @param texts - Array of texts to embed
 * @returns Array of 1536-dimensional vectors
 */
export async function generateEmbeddingBatch(texts: string[]): Promise<number[][]> {
  const ai = getClient();

  const normalized = texts.map(normalizeQuery);

  const response = await ai.embeddings.create({
    model: "text-embedding-3-small",
    input: normalized,
    encoding_format: "float"
  });

  return response.data.map(item => item.embedding);
}

/**
 * Normalize query untuk consistent semantic matching
 *
 * Standardization steps:
 * 1. Lowercase untuk case-insensitive matching
 * 2. Trim whitespace
 * 3. Collapse multiple spaces
 * 4. Remove punctuation (semantic meaning preserved)
 * 5. Truncate long queries
 */
function normalizeQuery(query: string): string {
  return query
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')           // Multiple spaces → single space
    .replace(/[^\w\s]/g, '')        // Remove punctuation
    .substring(0, 500);              // Truncate long queries (safety limit)
}

/**
 * Calculate cosine similarity between two vectors
 * Used for local similarity checks if needed
 *
 * @param vecA - First vector
 * @param vecB - Second vector
 * @returns Similarity score (0-1, higher = more similar)
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));

  return dotProduct / (magnitudeA * magnitudeB);
}
