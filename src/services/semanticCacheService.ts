/**
 * Semantic Cache Service - Vector Similarity Matching
 * Upstash Redis Vector integration untuk intelligent caching
 *
 * Architecture:
 * - Vector Database: Upstash Redis Vector (serverless, pay-as-you-go)
 * - Embedding Model: OpenAI text-embedding-3-small (1536 dims)
 * - Similarity Metric: COSINE similarity
 * - Threshold: 95% untuk cache hit (tunable)
 *
 * Performance Expectations:
 * - Cache HIT: <500ms (embedding 300ms + vector search 50ms)
 * - Cache MISS: <350ms overhead (before AI call)
 *
 * Cost:
 * - Upstash: ~$15-20/month (50K queries)
 * - Embeddings: ~$0.02/month (negligible)
 */

import { Index } from "@upstash/vector";
import { generateEmbedding } from "./embeddingService";
import type { ICD10Result } from "../../types";

/**
 * Cache entry metadata stored in vector database
 */
interface SemanticCacheEntry {
  query: string;
  result: ICD10Result;
  model: string;
  timestamp: number;
}

/**
 * Match result from vector search
 */
interface SemanticMatch {
  query: string;
  result: ICD10Result;
  similarity: number;
  fromCache: boolean;
}

// Singleton index instance
let indexInstance: Index | null = null;

/**
 * Get or create Upstash Vector index singleton
 */
const getIndex = (): Index => {
  if (indexInstance) return indexInstance;

  const url = import.meta.env.VITE_UPSTASH_VECTOR_REST_URL;
  const token = import.meta.env.VITE_UPSTASH_VECTOR_REST_TOKEN;

  if (!url || !token) {
    throw new Error('[SemanticCache] Missing Upstash Vector credentials');
  }

  indexInstance = new Index({
    url,
    token
  });

  return indexInstance;
};

class SemanticCacheService {
  /**
   * Similarity threshold untuk cache hit
   * 0.95 = 95% similarity required
   *
   * Tuning guide:
   * - Too low (0.85): More hits, but risk of wrong matches
   * - Too high (0.98): Fewer hits, very conservative
   * - Sweet spot: 0.93-0.96
   */
  private readonly SIMILARITY_THRESHOLD = 0.95;

  /**
   * Cache TTL (Time To Live)
   * 86400s = 24 jam
   *
   * Rationale: Medical guidelines stable dalam 24h window
   */
  private readonly TTL_SECONDS = 86400;

  /**
   * Search semantic cache untuk similar queries
   * Returns cached result jika similarity >= 95%
   *
   * @param query - Medical symptom query
   * @returns Semantic match jika found, null otherwise
   */
  async get(query: string): Promise<SemanticMatch | null> {
    try {
      const startTime = Date.now();

      // Generate embedding untuk query
      const embedding = await generateEmbedding(query);
      const embeddingTime = Date.now() - startTime;
      console.log(`[SemanticCache] Embedding generated: ${embeddingTime}ms`);

      // Query vector database (topK=1 karena hanya butuh best match)
      const index = getIndex();
      const results = await index.query({
        vector: embedding,
        topK: 1,
        includeMetadata: true
      });

      const searchTime = Date.now() - startTime;
      console.log(`[SemanticCache] Vector search completed: ${searchTime}ms`);

      // No results found
      if (results.length === 0) {
        console.log('[SemanticCache] MISS - No similar queries found');
        return null;
      }

      const match = results[0];
      const similarity = match.score;

      // Check similarity threshold
      if (similarity < this.SIMILARITY_THRESHOLD) {
        console.log(`[SemanticCache] MISS - Similarity too low: ${(similarity * 100).toFixed(1)}% (threshold: ${(this.SIMILARITY_THRESHOLD * 100).toFixed(0)}%)`);
        return null;
      }

      // Extract metadata
      const metadata = match.metadata as SemanticCacheEntry;

      // Validate TTL
      const age = Date.now() - metadata.timestamp;
      if (age > this.TTL_SECONDS * 1000) {
        console.log(`[SemanticCache] MISS - Entry expired (age: ${(age / 1000 / 60).toFixed(0)} minutes)`);
        await this.invalidate(match.id as string);
        return null;
      }

      // Cache HIT! 🎯
      const totalTime = Date.now() - startTime;
      console.log(`[SemanticCache] HIT ✅ - Similarity: ${(similarity * 100).toFixed(1)}%, Latency: ${totalTime}ms`);
      console.log(`[SemanticCache] Original query: "${metadata.query.substring(0, 60)}..."`);
      console.log(`[SemanticCache] Current query:  "${query.substring(0, 60)}..."`);

      return {
        query: metadata.query,
        result: metadata.result,
        similarity,
        fromCache: true
      };

    } catch (error) {
      console.error('[SemanticCache] Error during get:', error);
      // Graceful degradation - fallback ke AI call
      return null;
    }
  }

  /**
   * Store successful diagnosis result dalam vector cache
   *
   * @param query - Original medical query
   * @param result - ICD10 diagnosis result
   * @param model - AI model used (for tracking)
   */
  async set(query: string, result: ICD10Result, model: string): Promise<void> {
    try {
      const startTime = Date.now();

      // Generate embedding
      const embedding = await generateEmbedding(query);

      // Generate unique ID (deterministic hash dari query)
      const id = this.generateId(query);

      // Prepare cache entry
      const entry: SemanticCacheEntry = {
        query,
        result,
        model,
        timestamp: Date.now()
      };

      // Upsert ke vector database
      const index = getIndex();
      await index.upsert({
        id,
        vector: embedding,
        metadata: entry
      });

      const totalTime = Date.now() - startTime;
      console.log(`[SemanticCache] Stored ✓ - ID: ${id}, Latency: ${totalTime}ms`);

    } catch (error) {
      console.error('[SemanticCache] Error during set:', error);
      // Non-blocking error - cache write failures tidak break functionality
    }
  }

  /**
   * Invalidate specific cache entry
   *
   * @param id - Vector entry ID to delete
   */
  async invalidate(id: string): Promise<void> {
    try {
      const index = getIndex();
      await index.delete(id);
      console.log(`[SemanticCache] Invalidated: ${id}`);
    } catch (error) {
      console.error('[SemanticCache] Error during invalidate:', error);
    }
  }

  /**
   * Clear entire cache (danger zone!)
   * Use for testing or data corruption recovery
   */
  async clear(): Promise<void> {
    try {
      const index = getIndex();
      await index.reset();
      console.log('[SemanticCache] Cache cleared (reset)');
    } catch (error) {
      console.error('[SemanticCache] Error during clear:', error);
    }
  }

  /**
   * Generate deterministic ID dari query
   * Uses simple hash function untuk consistent IDs
   *
   * @param query - Medical query text
   * @returns Deterministic hash ID
   */
  private generateId(query: string): string {
    // Normalize query before hashing
    const normalized = query.toLowerCase().trim().replace(/\s+/g, ' ');

    // Simple hash function (32-bit integer hash)
    let hash = 0;
    for (let i = 0; i < normalized.length; i++) {
      const char = normalized.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }

    return `diag_${Math.abs(hash).toString(36)}`;
  }

  /**
   * Get cache statistics
   * Useful untuk monitoring & optimization
   *
   * @returns Cache stats (total entries, etc)
   */
  async getStats(): Promise<{
    totalEntries: number;
    dimension: number;
    similarityFunction: string;
  }> {
    try {
      const index = getIndex();
      const info = await index.info();

      return {
        totalEntries: info.vectorCount || 0,
        dimension: info.dimension || 1536,
        similarityFunction: info.similarityFunction || 'COSINE'
      };

    } catch (error) {
      console.error('[SemanticCache] Error getting stats:', error);
      return {
        totalEntries: 0,
        dimension: 1536,
        similarityFunction: 'COSINE'
      };
    }
  }
}

// Singleton export
export const semanticCache = new SemanticCacheService();
