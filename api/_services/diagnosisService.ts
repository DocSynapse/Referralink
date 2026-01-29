/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Diagnosis Service - Server-Side Business Logic
 * Orchestrates AI model calls, caching, and error handling
 */

import OpenAI from "openai";
import { SYSTEM_INSTRUCTION_REFERRAL, NON_REFERRAL_DIAGNOSES } from "../../constants.js";
import { ICD10Result } from "../../types.js";
import { circuitBreaker, executeWithCircuitBreaker } from "./circuitBreakerService.js";

// AI Model Configuration
// Using OpenRouter for fast model routing (5-8s vs 18-24s direct)
export const AI_MODELS = {
  DEEPSEEK_V3: {
    id: 'deepseek/deepseek-chat', // OpenRouter format
    name: 'DeepSeek V3',
    provider: 'OpenRouter → DeepInfra',
    description: 'Primary model - fast (5-8s) & accurate'
  },
  GLM_CODING: {
    id: 'deepseek/deepseek-chat', // Same model for now
    name: 'DeepSeek V3 (Fallback)',
    provider: 'OpenRouter',
    description: 'Secondary model - reliable fallback'
  },
  QWEN_TURBO: {
    id: 'deepseek/deepseek-chat', // Same model for now
    name: 'DeepSeek V3 (Tertiary)',
    provider: 'OpenRouter',
    description: 'Tertiary model - backup'
  }
} as const;

export type AIModelKey = keyof typeof AI_MODELS;

export interface GenerateOptions {
  model?: AIModelKey;
  skipCache?: boolean;
  temperature?: number;
}

export interface DiagnosisResponse {
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

// Singleton OpenAI client (server-side - NO dangerouslyAllowBrowser)
let clientInstance: OpenAI | null = null;

const getClient = (): OpenAI => {
  if (clientInstance) return clientInstance;

  // Priority: OpenRouter (fast, 5-8s) > DeepSeek Direct (slow, 18-24s)
  // SERVER-SIDE: Use non-VITE prefixed env vars (runtime accessible)
  const baseURL = process.env.OPENROUTER_API_URL ||
                  process.env.API_BASE_URL ||
                  "https://openrouter.ai/api/v1";

  const apiKey = process.env.OPENROUTER_API_KEY ||
                 process.env.DEEPSEEK_API_KEY ||
                 process.env.GEMINI_API_KEY ||
                 process.env.VITE_OPENROUTER_API_KEY ||
                 process.env.VITE_DEEPSEEK_API_KEY ||
                 process.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('[DiagnosisService] No API key found in environment');
  }

  console.log(`[DiagnosisService] Initializing client - Base: ${baseURL}, Key: ${apiKey.substring(0, 20)}...`);

  clientInstance = new OpenAI({
    apiKey,
    baseURL,
    // SERVER-SIDE ONLY - dangerouslyAllowBrowser REMOVED
    defaultHeaders: {
      "HTTP-Referer": "https://www.sentraai.id",
      "X-Title": "Sentra Referral CDSS",
    }
  });

  console.log(`[DiagnosisService] Client initialized successfully`);
  return clientInstance;
};

/**
 * Core diagnosis generation with AI model
 */
async function callAIModel(
  query: string,
  modelKey: AIModelKey,
  options: GenerateOptions = {}
): Promise<ICD10Result> {
  const ai = getClient();
  const selectedModel = AI_MODELS[modelKey];
  const temperature = options.temperature ?? 0.05;

  // Compact prompt optimized for speed
  const prompt = `KASUS: "${query}"

BLACKLIST 4A: ${NON_REFERRAL_DIAGNOSES.slice(0, 10).join(', ')}

TUGAS: Berikan 3 diagnosa alternatif kompetensi 3B/3A yang LOLOS BPJS.
- JANGAN pakai kode 4A
- Urutan: [Paling Aman] → [Moderat] → [Agresif Valid]
- Sertakan tindakan medis & red flags

OUTPUT: JSON valid, BAHASA INDONESIA. proposed_referrals WAJIB 3 opsi.`;

  const isGemini = selectedModel.id.includes('gemini');

  const response = await ai.chat.completions.create({
    model: selectedModel.id,
    messages: [
      { role: "system", content: SYSTEM_INSTRUCTION_REFERRAL },
      { role: "user", content: prompt }
    ],
    temperature,
    max_tokens: 800,
    ...(isGemini ? {} : { response_format: { type: "json_object" } })
  });

  const text = response.choices[0].message.content || "{}";

  // Extract and clean JSON
  let jsonStr = text
    .replace(/```json\n?/g, '')
    .replace(/```\n?/g, '')
    .replace(/^\s*[\r\n]/gm, '')
    .trim();

  const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('No valid JSON found in AI response');
  }

  const parsed = JSON.parse(jsonMatch[0]) as ICD10Result;

  // Ensure proposed_referrals exists
  if (!parsed.proposed_referrals || parsed.proposed_referrals.length === 0) {
    parsed.proposed_referrals = [
      {
        code: parsed.code,
        description: parsed.description,
        clinical_reasoning: parsed.evidence?.clinical_reasoning || parsed.clinical_notes || "Primary diagnosis"
      }
    ];
  }

  return parsed;
}

/**
 * Classify error for metrics
 */
function classifyError(error: any): string {
  if (error?.status === 401) return 'AUTHENTICATION_FAILED';
  if (error?.status === 429) return 'RATE_LIMIT_EXCEEDED';
  if (error?.status === 503) return 'SERVICE_UNAVAILABLE';
  if (error?.code === 'ECONNREFUSED') return 'CONNECTION_REFUSED';
  if (error instanceof SyntaxError) return 'JSON_PARSE_ERROR';
  return 'UNKNOWN_ERROR';
}

/**
 * Automatic fallback chain - priority order
 */
const FALLBACK_CHAIN: AIModelKey[] = ['DEEPSEEK_V3', 'GLM_CODING', 'QWEN_TURBO'];

/**
 * Get healthy models from fallback chain (excluding OPEN circuits)
 */
async function getHealthyModels(): Promise<AIModelKey[]> {
  const healthyModels: AIModelKey[] = [];

  for (const modelKey of FALLBACK_CHAIN) {
    const canExecute = await circuitBreaker.canExecute(modelKey);
    if (canExecute) {
      healthyModels.push(modelKey);
    }
  }

  return healthyModels;
}

/**
 * Main diagnosis generation entrypoint with circuit breaker & automatic fallback
 */
export async function generateDiagnosis(
  query: string,
  options: GenerateOptions = {}
): Promise<DiagnosisResponse> {
  const startTime = Date.now();

  // If specific model requested, try that first
  if (options.model) {
    const canExecute = await circuitBreaker.canExecute(options.model);
    if (canExecute) {
      try {
        console.log(`[DiagnosisService] Generate START - Model: ${options.model} (user-specified)`);

        const result = await executeWithCircuitBreaker(
          options.model,
          () => callAIModel(query, options.model!, options)
        );

        const latencyMs = Date.now() - startTime;
        console.log(`[DiagnosisService] Generate SUCCESS - Latency: ${latencyMs}ms`);

        return {
          success: true,
          data: result,
          metadata: {
            fromCache: false,
            model: AI_MODELS[options.model].id,
            latencyMs,
            timestamp: Date.now()
          }
        };
      } catch (error: any) {
        console.warn(`[DiagnosisService] User-specified model ${options.model} failed, trying fallback chain`);
        // Continue to fallback chain
      }
    }
  }

  // Automatic fallback chain with circuit breaker
  const healthyModels = await getHealthyModels();

  if (healthyModels.length === 0) {
    const latencyMs = Date.now() - startTime;
    console.error('[DiagnosisService] All models UNAVAILABLE (circuits OPEN)');

    return {
      success: false,
      error: 'All AI models temporarily unavailable. Please try again in 30 seconds.',
      metadata: {
        fromCache: false,
        latencyMs,
        timestamp: Date.now()
      }
    };
  }

  // Try each healthy model in fallback chain
  let lastError: Error | null = null;

  for (const modelKey of healthyModels) {
    try {
      console.log(`[DiagnosisService] Trying model: ${modelKey} (${healthyModels.indexOf(modelKey) + 1}/${healthyModels.length})`);

      const result = await executeWithCircuitBreaker(
        modelKey,
        () => callAIModel(query, modelKey, options)
      );

      const latencyMs = Date.now() - startTime;
      console.log(`[DiagnosisService] Generate SUCCESS - Model: ${modelKey}, Latency: ${latencyMs}ms`);

      return {
        success: true,
        data: result,
        metadata: {
          fromCache: false,
          model: AI_MODELS[modelKey].id,
          latencyMs,
          timestamp: Date.now()
        }
      };

    } catch (error: any) {
      lastError = error;
      console.warn(`[DiagnosisService] Model ${modelKey} failed:`, error.message);
      // Circuit breaker already recorded failure via executeWithCircuitBreaker
      // Continue to next model
    }
  }

  // All models failed
  const latencyMs = Date.now() - startTime;
  const errorType = classifyError(lastError);

  console.error(`[DiagnosisService] All healthy models FAILED - Last error: ${errorType}`);

  return {
    success: false,
    error: `All AI models failed: ${errorType}. Please try again.`,
    metadata: {
      fromCache: false,
      latencyMs,
      timestamp: Date.now()
    }
  };
}

/**
 * Validate AI response structure
 */
export function validateResponse(response: unknown): response is ICD10Result {
  if (!response || typeof response !== 'object') return false;

  const r = response as any;

  return (
    typeof r.code === 'string' &&
    typeof r.description === 'string' &&
    Array.isArray(r.proposed_referrals) &&
    r.proposed_referrals.length > 0
  );
}
