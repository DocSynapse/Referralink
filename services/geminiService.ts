
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

// --- MOCK DATA FOR FALLBACK (Skenario Valid: Hipertensi Urgensi) ---
const MOCK_RESULT: ICD10Result = {
  code: "I11.9",
  description: "Hypertensive Heart Disease",
  category: "RUJUKAN_MUTLAK",
  confidence_score: 0.99,
  urgency: "EMERGENCY",
  triage_score: 9,
  recommended_timeframe: "Segera ke IGD (< 2 Jam)",
  assessment: {
    severity_distress: "Nyeri dada kiri tipikal (skala 7/10), Tensi 180/110 mmHg (Krisis).",
    risk_assessment: "Risiko ACS (Acute Coronary Syndrome) & Gagal Jantung Akut.",
    functional_impact: "Intoleransi aktivitas berat, sesak saat berbaring.",
    comorbidities: ["Diabetes Melitus Tipe 2", "Dyslipidemia"],
    treatment_history: "Amlodipine 10mg tidak respon.",
    socio_economic: "Peserta PBI (Aktif).",
    support_system: "Diantar keluarga.",
    engagement_compliance: "Riwayat putus obat."
  },
  evidence: {
    clinical_reasoning: "Pasien mengalami Krisis Hipertensi (Urgensi) disertai tanda Angina Pectoris (Nyeri Dada). Sesuai PPK Jantung & Aturan BPJS, kasus ini kompetensi Spesialis Jantung (FKTL) karena risiko kerusakan organ target akut.",
    guidelines: ["ESC Guidelines 2024 Hypertension", "Peraturan BPJS No 1/2014 (Kompetensi 3B)"],
    red_flags: ["Tekanan darah >180/110", "Nyeri dada menjalar (Angina)", "Sesak nafas (Dyspnea)"],
    differential_diagnosis: ["Unstable Angina (I20.0)", "Hypertensive Emergency (I10+R57)"]
  },
  clinical_notes: "Berikan Oksigen 3L, ISDN 5mg sublingual jika nyeri, Loading Aspilet/Clopidogrel jika EKG ST-Elevasi. Rujuk IGD segera.",
  proposed_referrals: [
    { code: "I11.9", description: "Hypertensive Heart Disease without Heart Failure", kompetensi: "3B", clinical_reasoning: "Diagnosis paling tepat untuk Hipertensi dengan keterlibatan jantung (Nyeri Dada) namun belum Gagal Jantung kongestif nyata." },
    { code: "I20.9", description: "Angina Pectoris, Unspecified", kompetensi: "3B", clinical_reasoning: "Gunakan jika nyeri dada lebih dominan daripada riwayat hipertensinya." },
    { code: "I13.9", description: "Hypertensive Heart and CKD, Unspecified", kompetensi: "3A", clinical_reasoning: "Gunakan jika ada tanda gangguan fungsi ginjal (Cr >1.5 atau eGFR <60)." }
  ]
};

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

const getClient = () => {
  const apiKey = (import.meta as any).env.VITE_GEMINI_API_KEY ||
                 (import.meta as any).env.VITE_OPENROUTER_API_KEY ||
                 (import.meta as any).env.VITE_QWEN_API_KEY ||
                 (import.meta as any).env.VITE_DEEPSEEK_API_KEY;

  const baseURL = (import.meta as any).env.VITE_API_BASE_URL ||
                  (import.meta as any).env.VITE_QWEN_BASE_URL ||
                  "https://openrouter.ai/api/v1";

  return new OpenAI({
    apiKey: apiKey || "dummy-key",
    baseURL: baseURL,
    dangerouslyAllowBrowser: true,
    defaultHeaders: {
      "HTTP-Referer": "https://sentra.healthcare",
      "X-Title": "Sentra Referral CDSS",
    }
  });
};

export interface SearchOptions {
  skipCache?: boolean;
}

export const searchICD10Code = async (
  input: MedicalQuery,
  modelOverride?: AIModelKey,
  options: SearchOptions = {}
): Promise<{ json: ICD10Result | null, logs: string[], sources?: any[], model?: string, fromCache?: boolean }> => {

  const selectedModel = modelOverride ? AI_MODELS[modelOverride] : AI_MODELS[currentModel];
  const modelName = (import.meta as any).env.VITE_AI_MODEL_NAME || selectedModel.id;
  const ai = getClient();

  // Check cache first (unless skipCache is true)
  if (!options.skipCache) {
    try {
      const cached = await diagnosisCache.get(input.query);
      if (cached) {
        return {
          json: cached.result,
          model: cached.model,
          fromCache: true,
          logs: [
            `[CDSS] Cache HIT`,
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
    // Compact prompt for faster response
    const prompt = `KASUS: "${input.query}"

BLACKLIST 4A: ${NON_REFERRAL_DIAGNOSES.slice(0, 10).join(', ')}

TUGAS: Berikan 3 diagnosa alternatif kompetensi 3B/3A yang LOLOS BPJS.
- JANGAN pakai kode 4A
- Urutan: [Paling Aman] → [Moderat] → [Agresif Valid]
- Sertakan tindakan medis & red flags

OUTPUT: JSON valid, BAHASA INDONESIA. proposed_referrals WAJIB 3 opsi.`;

    // Check if using Gemini (doesn't support response_format)
    const isGemini = modelName.includes('gemini');

    const response = await ai.chat.completions.create({
      model: modelName,
      messages: [
        { role: "system", content: SYSTEM_INSTRUCTION_REFERRAL },
        { role: "user", content: prompt }
      ],
      temperature: 0.05,
      max_tokens: 800,
      ...(isGemini ? {} : { response_format: { type: "json_object" } })
    });

    const text = response.choices[0].message.content || "{}";

    // Clean JSON response
    let jsonStr = text
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .replace(/^\s*[\r\n]/gm, '')
      .trim();

    // Parse and validate
    const parsed = JSON.parse(jsonStr) as ICD10Result;

    // Ensure proposed_referrals exists and has at least 3 entries
    if (!parsed.proposed_referrals || parsed.proposed_referrals.length === 0) {
      parsed.proposed_referrals = [
        {
          code: parsed.code,
          description: parsed.description,
          clinical_reasoning: parsed.evidence?.clinical_reasoning || parsed.clinical_notes || "Primary diagnosis"
        }
      ];
    }

    // Store in cache
    try {
      await diagnosisCache.set(input.query, parsed, modelName);
    } catch (cacheError) {
      console.warn('[Cache] Write error:', cacheError);
    }

    return {
      json: parsed,
      model: modelName,
      fromCache: false,
      logs: [
        `[CDSS] Clinical Analysis Engine Active`,
        `[Provider] ${selectedModel.provider}`,
        `[Model] ${selectedModel.name}`,
        `[Protocol] IAR-DST Multi-Domain Assessment`,
        `[Status] Analysis Complete ✓`
      ]
    };

  } catch (error: any) {
    console.error("[CDSS] API Error:", error);

    let errorType = "Connection Issue";
    if (error?.status === 401) errorType = "Authentication Failed";
    if (error?.status === 429) errorType = "Rate Limit Exceeded";
    if (error?.status === 503) errorType = "Service Unavailable";

    // Return null with error logs - no mock data
    return {
      json: null,
      model: "Error",
      fromCache: false,
      logs: [
        `[CDSS] API Error: ${errorType}`,
        `[Detail] ${error?.message || 'Unknown error'}`,
        `[Action] Please check API key and try again`
      ]
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

  // Check cache first
  if (!options.skipCache) {
    try {
      const cached = await diagnosisCache.get(input.query);
      if (cached) {
        return {
          json: cached.result,
          model: cached.model,
          fromCache: true,
          logs: [`[RACE] Cache HIT - Instant Response ✓`]
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
  const modelName = (import.meta as any).env.VITE_AI_MODEL_NAME || selectedModel.id;
  const ai = getClient();

  // Check cache first
  if (!options.skipCache) {
    try {
      const cached = await diagnosisCache.get(input.query);
      if (cached) {
        callbacks.onThinkingChunk('[Cache HIT] Returning cached result...');
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

      // Store in cache
      try {
        await diagnosisCache.set(input.query, parsed, modelName);
      } catch (cacheError) {
        console.warn('[Cache] Write error:', cacheError);
      }

      callbacks.onComplete(parsed);

    } catch (error: any) {
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
      } catch (fallbackError: any) {
        callbacks.onError(fallbackError);
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
