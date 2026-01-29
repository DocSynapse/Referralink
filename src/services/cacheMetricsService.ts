/**
 * Cache Metrics Service - Track semantic cache performance
 *
 * Purpose: Monitor cache hit rates, latency improvements, similarity scores
 * Used by: Admin dashboard, performance optimization
 */

interface CacheMetrics {
  // Hit/Miss tracking
  totalQueries: number;
  semanticHits: number;
  exactHits: number;
  misses: number;

  // Performance tracking
  avgLatencyHit: number;       // Average latency untuk cache hits (ms)
  avgLatencyMiss: number;      // Average latency untuk cache misses (ms)
  avgSimilarity: number;       // Average similarity score untuk semantic hits

  // Time period
  periodStart: number;
  periodEnd: number;
}

class CacheMetricsService {
  private metrics: CacheMetrics = this.resetMetrics();

  /**
   * Reset metrics to initial state
   */
  private resetMetrics(): CacheMetrics {
    return {
      totalQueries: 0,
      semanticHits: 0,
      exactHits: 0,
      misses: 0,
      avgLatencyHit: 0,
      avgLatencyMiss: 0,
      avgSimilarity: 0,
      periodStart: Date.now(),
      periodEnd: Date.now()
    };
  }

  /**
   * Record query result
   *
   * @param type - Query result type (semantic_hit, exact_hit, miss)
   * @param latency - Query latency in milliseconds
   * @param similarity - Similarity score (untuk semantic hits)
   */
  recordQuery(
    type: 'semantic_hit' | 'exact_hit' | 'miss',
    latency: number,
    similarity?: number
  ) {
    this.metrics.totalQueries++;

    switch (type) {
      case 'semantic_hit':
        this.metrics.semanticHits++;
        this.updateAvgLatency('hit', latency);
        if (similarity !== undefined) {
          this.updateAvgSimilarity(similarity);
        }
        break;

      case 'exact_hit':
        this.metrics.exactHits++;
        this.updateAvgLatency('hit', latency);
        break;

      case 'miss':
        this.metrics.misses++;
        this.updateAvgLatency('miss', latency);
        break;
    }

    this.metrics.periodEnd = Date.now();
  }

  /**
   * Update average latency (running average)
   */
  private updateAvgLatency(type: 'hit' | 'miss', latency: number) {
    const key = type === 'hit' ? 'avgLatencyHit' : 'avgLatencyMiss';
    const count = type === 'hit'
      ? this.metrics.semanticHits + this.metrics.exactHits
      : this.metrics.misses;

    // Running average: (old_avg * (n-1) + new_value) / n
    this.metrics[key] = (this.metrics[key] * (count - 1) + latency) / count;
  }

  /**
   * Update average similarity score (running average)
   */
  private updateAvgSimilarity(similarity: number) {
    const count = this.metrics.semanticHits;
    this.metrics.avgSimilarity = (this.metrics.avgSimilarity * (count - 1) + similarity) / count;
  }

  /**
   * Get current metrics snapshot dengan calculated fields
   *
   * @returns Metrics with hit rate, semantic hit rate, latency improvement
   */
  getMetrics(): CacheMetrics & {
    hitRate: number;
    semanticHitRate: number;
    exactHitRate: number;
    missRate: number;
    latencyImprovement: number;
  } {
    const total = this.metrics.totalQueries || 1; // Avoid division by zero

    const hitRate = (this.metrics.semanticHits + this.metrics.exactHits) / total;
    const semanticHitRate = this.metrics.semanticHits / total;
    const exactHitRate = this.metrics.exactHits / total;
    const missRate = this.metrics.misses / total;

    // Calculate latency improvement percentage
    const latencyImprovement = this.metrics.avgLatencyMiss > 0
      ? ((this.metrics.avgLatencyMiss - this.metrics.avgLatencyHit) / this.metrics.avgLatencyMiss) * 100
      : 0;

    return {
      ...this.metrics,
      hitRate,
      semanticHitRate,
      exactHitRate,
      missRate,
      latencyImprovement
    };
  }

  /**
   * Reset metrics (untuk daily rollover atau testing)
   */
  reset() {
    this.metrics = this.resetMetrics();
    console.log('[CacheMetrics] Metrics reset');
  }

  /**
   * Export metrics untuk persistence/analytics
   */
  export(): string {
    const metrics = this.getMetrics();
    return JSON.stringify(metrics, null, 2);
  }

  /**
   * Import metrics dari persistence
   */
  import(data: string) {
    try {
      const parsed = JSON.parse(data);
      this.metrics = {
        totalQueries: parsed.totalQueries || 0,
        semanticHits: parsed.semanticHits || 0,
        exactHits: parsed.exactHits || 0,
        misses: parsed.misses || 0,
        avgLatencyHit: parsed.avgLatencyHit || 0,
        avgLatencyMiss: parsed.avgLatencyMiss || 0,
        avgSimilarity: parsed.avgSimilarity || 0,
        periodStart: parsed.periodStart || Date.now(),
        periodEnd: parsed.periodEnd || Date.now()
      };
      console.log('[CacheMetrics] Metrics imported');
    } catch (error) {
      console.error('[CacheMetrics] Import error:', error);
    }
  }
}

// Singleton export
export const cacheMetrics = new CacheMetricsService();
