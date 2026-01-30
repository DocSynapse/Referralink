/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Diagnosis API Client (Frontend)
 * Thin wrapper for server-side diagnosis generation
 * Backward compatible with existing searchICD10Code() interface
 */

import { MedicalQuery, ICD10Result } from "../types";
import { diagnosisCache } from "./cacheService";

// AIModelKey type definition (moved from deleted geminiService)
export type AIModelKey = 'DEEPSEEK_V3' | 'DEEPSEEK_R1' | 'GLM_CODING';

export interface SearchOptions {
  skipCache?: boolean;
}

interface ServerResponse {
  success: boolean;
  data?: ICD10Result;
  error?: string;
  metadata: {
    fromCache: boolean;
    model?: string;
    latencyMs: number;
    timestamp: number;
  };
}

/**
 * Check if server-side diagnosis is enabled
 */
function useServerDiagnosis(): boolean {
  return import.meta.env.VITE_USE_SERVER_DIAGNOSIS === 'true';
}

/**
 * Get API endpoint URL
 */
function getApiEndpoint(): string {
  const base = import.meta.env.VITE_API_BASE_PATH || '';
  return `${base}/api/diagnosis`; // Consolidated endpoint (generate.ts deleted)
}

/**
 * Call server-side diagnosis API
 */
async function callServerDiagnosis(
  query: string,
  modelOverride?: AIModelKey,
  options: SearchOptions = {}
): Promise<{ json: ICD10Result | null; logs: string[]; model?: string; fromCache?: boolean }> {

  const endpoint = getApiEndpoint();

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query,
        options: {
          model: modelOverride,
          skipCache: options.skipCache
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Server error: ${response.status}`);
    }

    const result: ServerResponse = await response.json();

    if (!result.success) {
      return {
        json: null,
        model: 'Error',
        fromCache: false,
        logs: [
          `[CDSS] Server Error`,
          `[Detail] ${result.error || 'Unknown error'}`,
          `[Action] Please try again or contact support`
        ]
      };
    }

    return {
      json: result.data || null,
      model: result.metadata.model,
      fromCache: result.metadata.fromCache,
      logs: [
        `[CDSS] Server-side Analysis Complete`,
        `[Model] ${result.metadata.model}`,
        `[Latency] ${result.metadata.latencyMs}ms`,
        `[Cache] ${result.metadata.fromCache ? 'HIT ✓' : 'MISS'}`,
        `[Status] Success ✓`
      ]
    };

  } catch (error: any) {
    console.error('[DiagnosisClient] API call failed:', error);

    return {
      json: null,
      model: 'Error',
      fromCache: false,
      logs: [
        `[CDSS] API Connection Error`,
        `[Detail] ${error.message}`,
        `[Action] Check network connection and retry`
      ]
    };
  }
}

/**
 * Main export - backward compatible with existing interface
 * Auto-detects server vs client-side mode via feature flag
 */
export const searchICD10Code = async (
  input: MedicalQuery,
  modelOverride?: AIModelKey,
  options: SearchOptions = {}
): Promise<{ json: ICD10Result | null; logs: string[]; sources?: unknown[]; model?: string; fromCache?: boolean }> => {

  // Check L2 client-side cache first (faster than server round-trip)
  if (!options.skipCache) {
    try {
      const cached = await diagnosisCache.get(input.query);
      if (cached) {
        console.log('[DiagnosisClient] L2 Cache HIT');
        return {
          json: cached.result,
          model: cached.model,
          fromCache: true,
          logs: [
            `[CDSS] Local Cache HIT`,
            `[Model] ${cached.model}`,
            `[Cached] ${new Date(cached.timestamp).toLocaleString('id-ID')}`,
            `[Status] Instant Response ✓`
          ]
        };
      }
    } catch (cacheError) {
      console.warn('[DiagnosisClient] Cache read error:', cacheError);
    }
  }

  // Feature flag check: use server or fallback to old client-side
  if (useServerDiagnosis()) {
    console.log('[DiagnosisClient] Using SERVER-SIDE diagnosis');
    const result = await callServerDiagnosis(input.query, modelOverride, options);

    // Store in L2 cache if successful
    if (result.json && result.model) {
      try {
        await diagnosisCache.set(input.query, result.json, result.model);
      } catch (cacheError) {
        console.warn('[DiagnosisClient] Cache write error:', cacheError);
      }
    }

    return result;

  } else {
    console.warn('[DiagnosisClient] CLIENT-SIDE mode disabled - geminiService removed');
    console.warn('[DiagnosisClient] Please enable server-side diagnosis via VITE_USE_SERVER_DIAGNOSIS=true');

    // Return error when server-side is not enabled
    return {
      json: null,
      model: 'Error',
      fromCache: false,
      logs: [
        `[CDSS] Configuration Error`,
        `[Detail] Client-side diagnosis deprecated (CSP violation)`,
        `[Action] Enable server-side diagnosis: VITE_USE_SERVER_DIAGNOSIS=true`
      ]
    };
  }
};

/**
 * Export for race mode (future enhancement)
 */
export const searchICD10CodeRace = searchICD10Code;

/**
 * Export cache utilities
 */
export const getCacheStats = async () => {
  return diagnosisCache.getStats();
};

export const clearDiagnosisCache = async (query?: string) => {
  return diagnosisCache.invalidate(query);
};
