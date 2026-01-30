/**
 * Semantic Cache Health Check Endpoint
 * GET /api/health/semantic-cache
 *
 * Returns the status of semantic cache dependencies:
 * - OpenAI API (for embeddings)
 * - Upstash Vector Database (for storage)
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

export const config = {
  runtime: 'nodejs',
  maxDuration: 10,
};

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Only GET allowed
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const health = {
    semanticCache: {
      available: false,
      embeddings: false,
      vectorStore: false,
      details: {} as Record<string, any>
    }
  };

  // Check Upstash Vector Database credentials
  const hasUpstashUrl = !!process.env.UPSTASH_VECTOR_REST_URL;
  const hasUpstashToken = !!process.env.UPSTASH_VECTOR_REST_TOKEN;
  health.semanticCache.vectorStore = hasUpstashUrl && hasUpstashToken;
  health.semanticCache.details.upstash = {
    configured: hasUpstashUrl && hasUpstashToken,
    urlPresent: hasUpstashUrl,
    tokenPresent: hasUpstashToken
  };

  // Check OpenAI API credentials for embeddings
  const hasOpenAI = !!process.env.OPENAI_API_KEY;
  health.semanticCache.embeddings = hasOpenAI;
  health.semanticCache.details.openai = {
    configured: hasOpenAI
  };

  // Overall availability (both dependencies required)
  health.semanticCache.available =
    health.semanticCache.embeddings &&
    health.semanticCache.vectorStore;

  // Return 200 if healthy, 503 if degraded
  const statusCode = health.semanticCache.available ? 200 : 503;

  return res.status(statusCode).json({
    status: health.semanticCache.available ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    ...health
  });
}
