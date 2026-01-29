
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Clinical Decision Support Service
 * Supports: DeepSeek, Qwen, OpenAI-compatible endpoints via OpenRouter
*/

import OpenAI from "openai";
import { SYSTEM_INSTRUCTION_REFERRAL, NON_REFERRAL_DIAGNOSES } from "../constants";
import { MedicalQuery, ICD10Result, StreamCallbacks } from "../types";
import { diagnosisCache } from "./cacheService";
// DISABLED: CSP violation (client-side fetch to Upstash blocked by browser security)
// import { semanticCache } from "../src/services/semanticCacheService";

// Supported AI Model Providers
export const AI_MODELS = {
  DEEPSEEK_V3: {
    id: 'deepseek/deepseek-chat',
    name: 'DeepSeek V3',
    provider: 'DeepSeek',
    description: 'Latest DeepSeek chat model - fast & accurate'
  },
  DEEPSEEK_R1: {
    id: 'deepseek/deepseek-r1',
    name: 'DeepSeek R1',
    provider: 'DeepSeek',
    description: 'Reasoning model for complex analysis'
  },
  GLM_CODING: {
    id: 'thudm/glm-4-plus',
    name: 'GLM-4 Plus',
    provider: 'Zhipu AI',
    description: 'GLM Coding Pro - fast inference'
  }
} as const;

export type AIModelKey = keyof typeof AI_MODELS;

// Current model selection (can be changed dynamically)
let currentModel: AIModelKey = 'DEEPSEEK_V3';

// Race mode: run multiple models in parallel, use fastest response
const RACE_MODELS: AIModelKey[] = ['DEEPSEEK_V3', 'GLM_CODING'];

export const setCurrentModel = (model: AIModelKey) => {
  const previousModel = currentModel;
  currentModel = model;

  // Invalidate cache when model changes (different models may produce different results)
  if (previousModel !== model) {
    diagnosisCache.invalidate().catch(console.error);
  }
};

export const getCurrentModel = () => AI_MODELS[currentModel];

let clientInstance: OpenAI | null = null;

const getClient = () => {
  if (clientInstance) return clientInstance;

  const provider = (import.meta.env.VITE_AI_PROVIDER || 'deepseek').toLowerCase();
  const baseURL =
    (provider === 'deepseek' && (import.meta.env.VITE_DEEPSEEK_BASE_URL || 'https://api.deepseek.com')) ||
    (provider === 'qwen' && import.meta.env.VITE_QWEN_BASE_URL) ||
    import.meta.env.VITE_API_BASE_URL ||
    "https://openrouter.ai/api/v1";

  const apiKey =
    (provider === 'deepseek' && import.meta.env.VITE_DEEPSEEK_API_KEY) ||
    (provider === 'qwen' && import.meta.env.VITE_QWEN_API_KEY) ||
    import.meta.env.VITE_GEMINI_API_KEY ||
    import.meta.env.VITE_OPENROUTER_API_KEY ||
    import.meta.env.VITE_QWEN_API_KEY ||
    import.meta.env.VITE_DEEPSEEK_API_KEY;

  clientInstance = new OpenAI({
    apiKey: apiKey || "dummy-key",
    baseURL: baseURL,
    dangerouslyAllowBrowser: true,
    defaultHeaders: {
      "HTTP-Referer": "https://sentra.healthcare",
      "X-Title": "Sentra Referral CDSS",
    }
  });

  return clientInstance;
};

export interface SearchOptions {
  skipCache?: boolean;
}

const FRIENDLY_SYSTEM_PROMPT = `Kamu Audrey, Agent Service Center Sentra Healthcare Solutions (bukan hanya Referralink). Fokus utama jawaban: jelaskan Sentra sebagai perusahaan (misi, governance, produk, cara kerja, keamanan), baru masuk ke topik klinis bila pengguna meminta langsung soal gejala/diagnosis.
Startup AI kesehatan fokus akurasi rujukan. Founder/CEO: dr Ferdi Iskandar; manifesto "Setiap Nyawa Berharga" Jan 2026.
Pengetahuan inti Sentra:
- Misi: percepat & standardisasi diagnosis/rujukan; audit trail 10 tahun; 6 safety gates; akuntabel & transparan.
- Masalah utama: keterlambatan diagnosis (sepsis, kanker, TB, maternal-neonatal), fragmentasi data, bias kognitif, kurang protokol standar, minim akuntabilitas.
- Sentra IS: infrastruktur informasi + decision support + governance; BUKAN pengganti klinisi. Produk awal: AADI (safety net DDI & sepsis, differential ranking, SOAP otomatis, smart referral).
Governance & Human–AI collaboration (charter v3.3, architecture of trust):
- Dual-layer: Policy Definition vs Execution Oversight; policy-as-code (OPA), immutable audit (S3 Object Lock/QLDB), “Why” transparency untuk tiap saran.
- 6 Safety Gates di CI/CD & runtime; Gate 6 = LLM Judge menilai output sebelum ke dokter.
- Hierarki agen via MCP: Orchestrator + Agent-Triage, Agent-Dx, Agent-Safety (DDI/allergy), Agent-Scribe; izin granular (read/write), human-in-the-loop untuk keputusan klinis.
- Decision matrix: admin/data retrieval (autonomous + audit), triage (HITL), diagnosis (suggest + physician sign-off), terapi/override (physician only, token), break-glass tercatat immutably.
- Roadmap cepat 21 hari: infra + OPA/S3 lock → MCP+Gate6 → dashboard pilot 50 kasus.
Clinical Safety Policy (draft 1.0, 18 Jan 2026):
- Authority remains human; AI asistif saja.
- Oversight berbasis risiko: Low (<5) otonom + audit; Medium (5–6.9) AI suggest + human review; High (≥7) human approval + audit trail.
- Validasi: ≥100 synthetic + 50 retrospektif; ≥3 klinisi; akurasi ≥85%; pilot high-risk; monitoring & revalidasi bila drift.
- Insiden: Critical (<30m contain, CEO <2h, RCA <72h); High (<2h); auto-eskalasi sepsis ≥3 SIRS, MI/stroke/PE, severe DDI, vitals shock.
- Pelatihan: dev 4h, validator 6h, PM 4h, klinisi 2h; refresher tahunan 1h. Metrik: Gate6 ≥95%, akurasi ≥85%, override alert >20%, insiden <1/1000 encounter.
Gaya jawab (corporate-centric):
- Bahasa Indonesia.
- Kalimat pendek, dipisah baris/paragraf; jangan satu baris panjang.
- Jangan gunakan heading/markdown seperti ** atau ##.
- Jika perlu daftar, pakai bullet sederhana (-) maksimal 5 poin.
- Tutup dengan ajakan singkat jika relevan.
Prioritas konten: jelaskan Sentra, produk (AADI, POGS, CDOS), governance, keamanan, proses, manfaat untuk partner/regulator/klinik. Jawab klinis/gejala hanya bila diminta eksplisit, tetap ingatkan verifikasi medis saat beri saran klinis.
Ingatkan verifikasi tenaga medis hanya saat memberi rekomendasi klinis (tidak perlu di sapaan awal).
Jika data kurang, ajukan 1–2 pertanyaan klarifikasi terarah.
Prioritaskan keamanan pasien; hindari klaim kepastian mutlak.`;

export const searchICD10Code = async (
  input: MedicalQuery,
  modelOverride?: AIModelKey,
  options: SearchOptions = {}
): Promise<{ json: ICD10Result | null, logs: string[], sources?: unknown[], model?: string, fromCache?: boolean, similarity?: number }> => {

  const selectedModel = modelOverride ? AI_MODELS[modelOverride] : AI_MODELS[currentModel];

  // LAYER 1: Semantic cache DISABLED (CSP violation - client-side fetch blocked)
  // TODO: Move to server-side API endpoint
  // if (!options.skipCache) {
  //   try {
  //     const semanticMatch = await semanticCache.get(input.query);
  //     if (semanticMatch) {
  //       return {
  //         json: semanticMatch.result,
  //         model: 'cached',
  //         fromCache: true,
  //         similarity: semanticMatch.similarity,
  //         logs: [
  //           `[CDSS] Semantic Cache HIT ✅`,
  //           `[Similarity] ${(semanticMatch.similarity * 100).toFixed(1)}% match`,
  //           `[Provider] ${selectedModel.provider}`,
  //           `[Original Query] "${semanticMatch.query.substring(0, 50)}..."`,
  //           `[Status] Instant Response (<500ms) ✓`
  //         ]
  //       };
  //     }
  //   } catch (semanticError) {
  //     console.warn('[SemanticCache] Read error (graceful degradation):', semanticError);
  //   }
  // }

  // LAYER 2: Exact match cache (existing L2 cache)
  if (!options.skipCache) {
    try {
      const cached = await diagnosisCache.get(input.query);
      if (cached) {
        // Semantic cache DISABLED (CSP violation)
        // semanticCache.set(input.query, cached.result, cached.model || 'unknown').catch(err => {
        //   console.warn('[SemanticCache] Background set error:', err);
        // });

        return {
          json: cached.result,
          model: cached.model,
          fromCache: true,
          logs: [
            `[CDSS] Exact Cache HIT`,
            `[Provider] ${selectedModel.provider}`,
            `[Model] ${cached.model}`,
            `[Cached] ${new Date(cached.timestamp).toLocaleString('id-ID')}`,
            `[Status] Instant Response ✓`
          ]
        };
      }
    } catch (cacheError) {
      console.warn('[Cache] Read error:', cacheError);
    }
  }

  try {
    // LAYER 3: Call server-side API endpoint (no CSP/CORS issues)
    console.log('[CDSS] Calling server-side /api/diagnosis');

    const response = await fetch('/api/diagnosis', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: input.query,
        model: modelOverride || currentModel,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
      throw new Error(errorData.error?.message || `API returned ${response.status}`);
    }

    const apiResponse = await response.json();

    if (!apiResponse.success || !apiResponse.data) {
      throw new Error('Invalid API response structure');
    }

    const parsed = apiResponse.data.result as ICD10Result;
    const returnedModel = apiResponse.data.model;

    console.log('[CDSS] Server API success - Code:', parsed.code);

    // Store in exact match cache
    try {
      await diagnosisCache.set(input.query, parsed, returnedModel);
    } catch (cacheError) {
      console.warn('[Cache] Write error:', cacheError);
    }

    return {
      json: parsed,
      model: returnedModel,
      fromCache: false,
      logs: [
        `[CDSS] Clinical Analysis Engine Active`,
        `[Provider] ${selectedModel.provider}`,
        `[Model] ${selectedModel.name}`,
        `[Protocol] IAR-DST Multi-Domain Assessment`,
        `[Status] Analysis Complete ✓`
      ]
    };

  } catch (error: unknown) {
    console.error("[CDSS] API Error:", error);

    const err = error as any;
    let errorType = "Connection Issue";

    // Check for network errors
    if (err?.message?.includes('Failed to fetch')) {
      errorType = "Network Error";
    } else if (err?.message?.includes('401') || err?.message?.includes('Authentication')) {
      errorType = "Authentication Failed";
    } else if (err?.message?.includes('429') || err?.message?.includes('Rate Limit')) {
      errorType = "Rate Limit Exceeded";
    } else if (err?.message?.includes('503') || err?.message?.includes('Unavailable')) {
      errorType = "Service Unavailable";
    }

    // Return null with error logs - no mock data
    return {
      json: null,
      model: "Error",
      fromCache: false,
      logs: [
        `[CDSS] API Error: ${errorType}`,
        `[Detail] ${err?.message || 'Unknown error'}`,
        `[Action] Please check connection and try again`
      ]
    };
  }
};

// Lightweight friendly chat agent (no cache, text response)
export const chatFriendly = async (message: string): Promise<{ reply: string, model: string }> => {
  const ai = getClient();
  const selectedModel = AI_MODELS[currentModel];
  const modelName = import.meta.env.VITE_AI_MODEL_NAME || selectedModel.id;

  try {
    const response = await ai.chat.completions.create({
      model: modelName,
      temperature: 0.35,
      max_tokens: 320,
      messages: [
        { role: "system", content: FRIENDLY_SYSTEM_PROMPT },
        { role: "user", content: message }
      ]
    });

    return {
      reply: response.choices[0].message.content || "",
      model: modelName
    };
  } catch (error: unknown) {
    console.error("[FriendlyChat] API Error:", error);
    return {
      reply: "Maaf, kanal AI sedang padat. Coba lagi dalam 30–60 detik atau hubungi tim Sentra untuk bantuan cepat.",
      model: "unavailable"
    };
  }
};
/**
 * Race mode: Run multiple models in parallel, return first successful response
 * Significantly faster for production use
 */
export const searchICD10CodeRace = async (
  input: MedicalQuery,
  options: SearchOptions = {}
): Promise<{ json: ICD10Result | null, logs: string[], model?: string, fromCache?: boolean }> => {

  // Check semantic cache first
  if (!options.skipCache) {
    try {
      const semanticMatch = await semanticCache.get(input.query);
      if (semanticMatch) {
        return {
          json: semanticMatch.result,
          model: 'cached',
          fromCache: true,
          logs: [`[RACE] Semantic Cache HIT (${(semanticMatch.similarity * 100).toFixed(1)}%) - Instant Response ✓`]
        };
      }

      const cached = await diagnosisCache.get(input.query);
      if (cached) {
        return {
          json: cached.result,
          model: cached.model,
          fromCache: true,
          logs: [`[RACE] Exact Cache HIT - Instant Response ✓`]
        };
      }
    } catch (e) {
      console.warn('[Cache] Read error:', e);
    }
  }

  // Race multiple models
  const racePromises = RACE_MODELS.map(modelKey =>
    searchICD10Code(input, modelKey, { skipCache: true })
      .then(result => {
        if (result.json) {
          return { ...result, winner: modelKey };
        }
        throw new Error('No valid response');
      })
  );

  try {
    const winner = await Promise.any(racePromises);
    return {
      json: winner.json,
      model: winner.model,
      fromCache: false,
      logs: [
        `[RACE] Winner: ${AI_MODELS[winner.winner as AIModelKey].name}`,
        `[Speed] First response used`,
        ...winner.logs
      ]
    };
  } catch (error) {
    // All models failed
    return {
      json: null,
      model: 'Error',
      fromCache: false,
      logs: [`[RACE] All models failed`]
    };
  }
};

/**
 * Streaming version of searchICD10Code
 * Streams reasoning text progressively, then returns final JSON result
 */
export const searchICD10CodeStreaming = async (
  input: MedicalQuery,
  callbacks: StreamCallbacks,
  modelOverride?: AIModelKey,
  options: SearchOptions = {}
): Promise<void> => {
  const selectedModel = modelOverride ? AI_MODELS[modelOverride] : AI_MODELS[currentModel];
  const modelName = import.meta.env.VITE_AI_MODEL_NAME || selectedModel.id;
  const ai = getClient();

  // Check semantic cache first
  if (!options.skipCache) {
    try {
      const semanticMatch = await semanticCache.get(input.query);
      if (semanticMatch) {
        callbacks.onThinkingChunk(`[Semantic Cache HIT] ${(semanticMatch.similarity * 100).toFixed(1)}% similarity match - returning cached result...`);
        callbacks.onComplete(semanticMatch.result);
        return;
      }

      const cached = await diagnosisCache.get(input.query);
      if (cached) {
        callbacks.onThinkingChunk('[Exact Cache HIT] Returning cached result...');
        callbacks.onComplete(cached.result);
        return;
      }
    } catch (cacheError) {
      console.warn('[Cache] Read error:', cacheError);
    }
  }

  // Compact streaming prompt
  const prompt = `KASUS: "${input.query}"
BLACKLIST 4A: ${NON_REFERRAL_DIAGNOSES.slice(0, 10).join(', ')}

TUGAS: Berikan 3 diagnosa 3B/3A yang LOLOS BPJS + tindakan medis + red flags.
FORMAT: <THINKING>reasoning singkat</THINKING> lalu JSON valid.
OUTPUT: BAHASA INDONESIA. proposed_referrals WAJIB 3 opsi.`;

  let retryCount = 0;
  const maxRetries = 2;

  const attemptStreaming = async (): Promise<void> => {
    try {
      const stream = await ai.chat.completions.create({
        model: modelName,
        messages: [
          { role: "system", content: SYSTEM_INSTRUCTION_REFERRAL },
          { role: "user", content: prompt }
        ],
        temperature: 0.05,
        max_tokens: 800,
        stream: true
      });

      let fullResponse = '';
      let thinkingBuffer = '';
      let inThinking = false;
      let thinkingComplete = false;

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        fullResponse += content;

        // Process thinking section
        if (!thinkingComplete) {
          thinkingBuffer += content;

          // Check for thinking start
          if (!inThinking && thinkingBuffer.includes('<THINKING>')) {
            inThinking = true;
            const afterTag = thinkingBuffer.split('<THINKING>')[1] || '';
            if (afterTag && !afterTag.includes('</THINKING>')) {
              callbacks.onThinkingChunk(afterTag);
            }
          } else if (inThinking) {
            // Check for thinking end
            if (content.includes('</THINKING>')) {
              thinkingComplete = true;
              const beforeEnd = content.split('</THINKING>')[0];
              if (beforeEnd) {
                callbacks.onThinkingChunk(beforeEnd);
              }
            } else {
              callbacks.onThinkingChunk(content);
            }
          }
        }
      }

      // Extract JSON from response
      let jsonStr = fullResponse;

      // Remove thinking section if present
      if (jsonStr.includes('</THINKING>')) {
        jsonStr = jsonStr.split('</THINKING>')[1] || jsonStr;
      }

      // Clean JSON response
      jsonStr = jsonStr
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .replace(/^\s*[\r\n]/gm, '')
        .trim();

      // Find JSON object
      const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in response');
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

      // Store in exact match cache only (semantic cache disabled due to CSP)
      try {
        await diagnosisCache.set(input.query, parsed, modelName);
      } catch (cacheError) {
        console.warn('[Cache] Write error:', cacheError);
      }

      callbacks.onComplete(parsed);

    } catch (error: unknown) {
      console.error('[Streaming] Error:', error);

      if (retryCount < maxRetries) {
        retryCount++;
        console.log(`[Streaming] Retry ${retryCount}/${maxRetries}`);
        await new Promise(r => setTimeout(r, 1000 * retryCount)); // Exponential backoff
        return attemptStreaming();
      }

      // Fallback to non-streaming
      console.log('[Streaming] Falling back to non-streaming call');
      callbacks.onThinkingChunk('[Switching to standard mode...]');

      try {
        const fallbackResult = await searchICD10Code(input, modelOverride, options);
        if (fallbackResult.json) {
          callbacks.onComplete(fallbackResult.json);
        } else {
          callbacks.onError(new Error('Fallback also failed'));
        }
      } catch (fallbackError: unknown) {
        callbacks.onError(fallbackError as Error);
      }
    }
  };

  await attemptStreaming();
};

/**
 * Get cache statistics for debugging/display
 */
export const getCacheStats = async () => {
  return diagnosisCache.getStats();
};

/**
 * Clear diagnosis cache
 */
export const clearDiagnosisCache = async (query?: string) => {
  return diagnosisCache.invalidate(query);
};
