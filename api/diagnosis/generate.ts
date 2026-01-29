/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Diagnosis Generation API Endpoint (VERCEL FORMAT)
 * POST /api/diagnosis/generate
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from "zod";
import { generateDiagnosis, type AIModelKey, type GenerateOptions } from "../_services/diagnosisService";
import { checkRateLimit } from "../_utils/auth";

// Request validation schema
const RequestSchema = z.object({
  query: z.string().min(3).max(500),
  options: z.object({
    model: z.enum(['DEEPSEEK_V3', 'GLM_CODING', 'QWEN_TURBO']).optional(),
    skipCache: z.boolean().optional(),
    temperature: z.number().min(0).max(1).optional()
  }).optional()
});

// CORS configuration
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': process.env.VITE_ALLOWED_ORIGIN || '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400'
};

/**
 * Rate limiting per IP: 100 requests/hour
 */
function getRateLimitIdentifier(req: VercelRequest): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0];
  }
  return req.headers['x-real-ip'] as string || 'unknown';
}

/**
 * Main handler (Vercel Serverless Function)
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(204).setHeader('Access-Control-Allow-Origin', CORS_HEADERS['Access-Control-Allow-Origin'])
      .setHeader('Access-Control-Allow-Methods', CORS_HEADERS['Access-Control-Allow-Methods'])
      .setHeader('Access-Control-Allow-Headers', CORS_HEADERS['Access-Control-Allow-Headers'])
      .end();
  }

  // Only POST allowed
  if (req.method !== 'POST') {
    return res.status(405)
      .setHeader('Access-Control-Allow-Origin', CORS_HEADERS['Access-Control-Allow-Origin'])
      .json({ success: false, error: 'Method Not Allowed' });
  }

  try {
    // Rate limiting check
    const ipIdentifier = getRateLimitIdentifier(req);
    const rateLimitOk = checkRateLimit(ipIdentifier, 100, 3600000); // 100 req/hour

    if (!rateLimitOk) {
      return res.status(429)
        .setHeader('Access-Control-Allow-Origin', CORS_HEADERS['Access-Control-Allow-Origin'])
        .json({
          success: false,
          error: 'Rate limit exceeded. Please try again later.'
        });
    }

    // Parse and validate request body
    const validated = RequestSchema.parse(req.body);

    console.log(`[API] Diagnosis request - IP: ${ipIdentifier}, Query length: ${validated.query.length}`);

    // Generate diagnosis
    const result = await generateDiagnosis(
      validated.query,
      validated.options as GenerateOptions
    );

    return res.status(result.success ? 200 : 500)
      .setHeader('Access-Control-Allow-Origin', CORS_HEADERS['Access-Control-Allow-Origin'])
      .setHeader('Content-Type', 'application/json')
      .json(result);

  } catch (error: any) {
    console.error('[API] Request failed:', error);

    // Handle validation errors
    if (error instanceof z.ZodError) {
      return res.status(400)
        .setHeader('Access-Control-Allow-Origin', CORS_HEADERS['Access-Control-Allow-Origin'])
        .json({
          success: false,
          error: 'Invalid request format',
          details: error.issues // Zod v4 uses 'issues' not 'errors'
        });
    }

    // Generic error
    return res.status(500)
      .setHeader('Access-Control-Allow-Origin', CORS_HEADERS['Access-Control-Allow-Origin'])
      .json({
        success: false,
        error: 'Internal server error',
        message: error.message
      });
  }
}
