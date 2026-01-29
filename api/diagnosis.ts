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
import { SYSTEM_INSTRUCTION_REFERRAL, NON_REFERRAL_DIAGNOSES } from "../constants";
import type { ICD10Result } from "../types";

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

function getClient(): OpenAI {
  if (clientInstance) return clientInstance;

  // Server-side: Use non-VITE_ prefixed env vars (Vercel serverless)
  const provider = (process.env.AI_PROVIDER || 'deepseek').toLowerCase();
  const baseURL =
    process.env.OPENROUTER_API_URL ||
    process.env.API_BASE_URL ||
    "https://openrouter.ai/api/v1";

  const apiKey =
    process.env.OPENROUTER_API_KEY ||
    process.env.DEEPSEEK_API_KEY ||
    process.env.QWEN_API_KEY ||
    process.env.GEMINI_API_KEY;

  if (!apiKey) {
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

    // Return success response
    return res.status(200).json({
      success: true,
      data: {
        result: parsed,
        model: modelName,
        provider: selectedModel.provider
      }
    });

  } catch (error: any) {
    console.error('[Diagnosis API] Error:', error);

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
    }

    return res.status(statusCode).json({
      success: false,
      error: {
        code: errorType.toUpperCase().replace(/\s+/g, '_'),
        message: error?.message || 'Unknown error occurred',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }
    });
  }
}
