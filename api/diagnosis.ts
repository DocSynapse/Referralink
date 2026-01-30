/**
 * Server-Side Diagnosis API Endpoint
 * Handles AI diagnosis requests to avoid CSP/CORS issues
 *
 * POST /api/diagnosis
 * Body: { query: string, model?: string, skipCache?: boolean }
 * Returns: ICD10Result
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from "openai";
import { Index } from "@upstash/vector";

// Inline constants to avoid import issues in Vercel serverless
const NON_REFERRAL_DIAGNOSES = [
  "I10 - Hipertensi Esensial (Primer)",
  "J00 - Nasofaringitis Akut (Common Cold)",
  "K30 - Dispepsia (Maag)",
  "R51 - Nyeri Kepala (Tension Headache)",
  "M79.1 - Myalgia",
  "A09 - Gastroenteritis (Diare tanpa dehidrasi)",
  "J06.9 - ISPA Akut",
  "L20 - Dermatitis Atopik (Ringan)",
  "E11.9 - Diabetes Melitus Tipe 2 (Tanpa Komplikasi)",
  "H10.1 - Konjungtivitis Akut"
];

const SYSTEM_INSTRUCTION_REFERRAL = `CDSS untuk rujukan BPJS. Output JSON valid, Bahasa Indonesia.

ATURAN:
- Diagnosa 4A (I10,J00,K30,R51,M79.1,A09,J06.9,L20,E11.9,H10.1) JANGAN jadi kode utama
- Berikan 3 alternatif kompetensi 3B/3A yang LOLOS BPJS
- Sertakan tindakan medis & red flags

JSON: {code,description,category,urgency,triage_score,clinical_notes,evidence:{red_flags,clinical_reasoning},proposed_referrals:[{code,description,kompetensi,clinical_reasoning}x3]}`;

// ICD10Result type inline
interface ICD10Result {
  code: string;
  description: string;
  category?: string;
  urgency?: string;
  triage_score?: number;
  clinical_notes?: string;
  evidence?: {
    red_flags?: string[];
    clinical_reasoning?: string;
  };
  proposed_referrals?: Array<{
    code: string;
    description: string;
    clinical_reasoning?: string;
  }>;
}

// Supported AI Model Providers
const AI_MODELS = {
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

type AIModelKey = keyof typeof AI_MODELS;

// Lazy OpenAI client initialization
let clientInstance: OpenAI | null = null;
let vectorIndex: Index | null = null;

// Get Upstash Vector index
function getVectorIndex(): Index {
  if (vectorIndex) return vectorIndex;

  const url = process.env.UPSTASH_VECTOR_REST_URL;
  const token = process.env.UPSTASH_VECTOR_REST_TOKEN;

  if (!url || !token) {
    throw new Error('Upstash Vector credentials not configured');
  }

  vectorIndex = new Index({ url, token });
  return vectorIndex;
}

// Generate embedding for semantic search
async function generateEmbedding(text: string): Promise<number[]> {
  try {
    // Check availability of OpenAI API key
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured for embeddings');
    }

    const ai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const normalized = text.toLowerCase().trim().replace(/\s+/g, ' ').substring(0, 500);

    const response = await ai.embeddings.create({
      model: "text-embedding-3-small",
      input: normalized,
      encoding_format: "float"
    });

    return response.data[0].embedding;
  } catch (error: any) {
    console.error('[Embeddings] Failed to generate:', error.message);
    throw error; // Re-throw to be caught by checkSemanticCache
  }
}

// Check semantic cache
async function checkSemanticCache(query: string): Promise<{ result: ICD10Result; similarity: number } | null> {
  try {
    // Check credentials availability first
    if (!process.env.UPSTASH_VECTOR_REST_URL || !process.env.UPSTASH_VECTOR_REST_TOKEN) {
      console.warn('[Semantic Cache] Upstash credentials not configured, skipping cache');
      return null;
    }

    if (!process.env.OPENAI_API_KEY) {
      console.warn('[Semantic Cache] OpenAI API key not configured for embeddings, skipping cache');
      return null;
    }

    const embedding = await generateEmbedding(query);
    const index = getVectorIndex();

    const results = await index.query({
      vector: embedding,
      topK: 1,
      includeMetadata: true
    });

    if (results.length === 0 || results[0].score < 0.95) {
      console.log('[Semantic Cache] MISS');
      return null;
    }

    const metadata = results[0].metadata as any;
    console.log('[Semantic Cache] HIT - Score:', results[0].score);
    return {
      result: metadata.result,
      similarity: results[0].score
    };
  } catch (error: any) {
    // Graceful degradation - log error but don't fail request
    console.warn('[Semantic Cache] Error, proceeding without cache:', error.message);
    return null;
  }
}

// Store in semantic cache
async function storeSemanticCache(query: string, result: ICD10Result): Promise<void> {
  try {
    const embedding = await generateEmbedding(query);
    const index = getVectorIndex();

    const id = `diag_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    await index.upsert({
      id,
      vector: embedding,
      metadata: { query, result, timestamp: Date.now() }
    });
  } catch (error) {
    console.warn('[Semantic Cache] Store error:', error);
  }
}

function getClient(): OpenAI {
  if (clientInstance) return clientInstance;

  // Server-side: Use non-VITE_ prefixed env vars (Vercel serverless)
  const provider = (process.env.AI_PROVIDER || 'deepseek').toLowerCase();

  // Trim to remove trailing whitespace/newlines from env vars
  const baseURL = (
    process.env.OPENROUTER_API_URL ||
    process.env.API_BASE_URL ||
    "https://openrouter.ai/api/v1"
  ).trim();

  const apiKey = (
    process.env.OPENROUTER_API_KEY ||
    process.env.DEEPSEEK_API_KEY ||
    process.env.QWEN_API_KEY ||
    process.env.GEMINI_API_KEY ||
    ''
  ).trim();

  if (!apiKey || apiKey === '') {
    console.error('[Diagnosis API] No API key found in environment');
    console.error('[Diagnosis API] Available env vars:', Object.keys(process.env).filter(k => k.includes('API_KEY')));
    throw new Error('No AI API key configured');
  }

  console.log('[Diagnosis API] Using baseURL:', baseURL);
  console.log('[Diagnosis API] API key found:', apiKey ? 'YES' : 'NO');

  clientInstance = new OpenAI({
    apiKey,
    baseURL,
    defaultHeaders: {
      "HTTP-Referer": "https://sentra.healthcare",
      "X-Title": "Sentra Referral CDSS",
    }
  });

  return clientInstance;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle OPTIONS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: { code: 'METHOD_NOT_ALLOWED', message: 'Only POST requests allowed' }
    });
  }

  try {
    const startTime = Date.now();

    // Parse request body
    const { query, model = 'DEEPSEEK_V3' } = req.body;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_QUERY', message: 'Query is required and must be a string' }
      });
    }

    // Validate model
    const modelKey = model as AIModelKey;
    if (!AI_MODELS[modelKey]) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_MODEL', message: `Invalid model: ${model}` }
      });
    }

    const selectedModel = AI_MODELS[modelKey];
    const modelName = process.env.AI_MODEL_NAME || selectedModel.id;

    console.log('[Diagnosis API] Processing query:', query.substring(0, 50) + '...');
    console.log('[Diagnosis API] Using model:', modelName);

    // Check semantic cache first
    const cachedResult = await checkSemanticCache(query);
    if (cachedResult) {
      console.log('[Diagnosis API] Semantic cache HIT - Similarity:', (cachedResult.similarity * 100).toFixed(1) + '%');
      return res.status(200).json({
        success: true,
        data: cachedResult.result,
        metadata: {
          fromCache: true,
          model: modelName,
          latencyMs: Date.now() - startTime,
          timestamp: Date.now()
        }
      });
    }

    console.log('[Diagnosis API] Cache MISS - Calling AI model');

    // Get AI client
    const ai = getClient();

    // Compact prompt for faster response
    const prompt = `KASUS: "${query}"

BLACKLIST 4A: ${NON_REFERRAL_DIAGNOSES.slice(0, 10).join(', ')}

TUGAS: Berikan 3 diagnosa alternatif kompetensi 3B/3A yang LOLOS BPJS.
- JANGAN pakai kode 4A
- Urutan: [Paling Aman] → [Moderat] → [Agresif Valid]
- Sertakan tindakan medis & red flags

OUTPUT: JSON valid, BAHASA INDONESIA. proposed_referrals WAJIB 3 opsi.`;

    // Check if using Gemini (doesn't support response_format)
    const isGemini = modelName.includes('gemini');

    // Call AI API
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

    console.log('[Diagnosis API] AI response received:', text.substring(0, 100) + '...');

    // Clean JSON response
    let jsonStr = text
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .replace(/^\s*[\r\n]/gm, '')
      .trim();

    // Extract JSON object if there's extra text
    const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonStr = jsonMatch[0];
    }

    // Parse and validate with error handling
    let parsed: ICD10Result;
    try {
      parsed = JSON.parse(jsonStr) as ICD10Result;
    } catch (parseError) {
      console.error('[Diagnosis API] JSON Parse Error:', parseError);
      console.error('[Diagnosis API] Raw response:', text.substring(0, 500));
      return res.status(500).json({
        success: false,
        error: {
          code: 'INVALID_AI_RESPONSE',
          message: 'AI returned invalid JSON. Please try again.'
        }
      });
    }

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

    console.log('[Diagnosis API] Success - Code:', parsed.code);

    // Store in semantic cache (non-blocking)
    storeSemanticCache(query, parsed).catch(err => {
      console.warn('[Diagnosis API] Failed to store in cache:', err);
    });

    // Return success response
    return res.status(200).json({
      success: true,
      data: parsed,
      metadata: {
        fromCache: false,
        model: modelName,
        latencyMs: Date.now() - startTime,
        timestamp: Date.now()
      }
    });

  } catch (error: any) {
    // Enhanced logging with full context
    console.error('[Diagnosis API] Error occurred:', {
      message: error?.message,
      status: error?.status,
      type: error?.constructor?.name,
      stack: error?.stack?.split('\n').slice(0, 3), // First 3 lines only
      timestamp: new Date().toISOString()
    });

    let errorType = "Connection Issue";
    let statusCode = 500;

    if (error?.status === 401) {
      errorType = "Authentication Failed";
      statusCode = 401;
    } else if (error?.status === 429) {
      errorType = "Rate Limit Exceeded";
      statusCode = 429;
    } else if (error?.status === 503) {
      errorType = "Service Unavailable";
      statusCode = 503;
    } else if (error?.message?.includes('credentials')) {
      errorType = "Configuration Error";
      statusCode = 500;
    }

    return res.status(statusCode).json({
      success: false,
      error: {
        code: errorType.toUpperCase().replace(/\s+/g, '_'),
        message: error?.message || 'Unknown error occurred',
        // TEMPORARY: Show full details in production for debugging
        details: {
          stack: error?.stack?.split('\n').slice(0, 10),
          type: error?.constructor?.name,
          status: error?.status,
          statusText: error?.statusText,
          response: error?.response?.data || error?.response
        }
      }
    });
  }
}
