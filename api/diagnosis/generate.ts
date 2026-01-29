/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Diagnosis Generation API Endpoint
 * POST /api/diagnosis/generate
 */

import type { Handler, HandlerEvent } from "@netlify/functions";
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
function getRateLimitIdentifier(event: HandlerEvent): string {
  return event.headers['x-forwarded-for']?.split(',')[0] ||
         event.headers['client-ip'] ||
         'unknown';
}

/**
 * Main handler
 */
export const handler: Handler = async (event) => {
  // CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: CORS_HEADERS,
      body: ''
    };
  }

  // Only POST allowed
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    // Rate limiting check
    const ipIdentifier = getRateLimitIdentifier(event);
    const rateLimitOk = checkRateLimit(ipIdentifier, 100, 3600000); // 100 req/hour

    if (!rateLimitOk) {
      return {
        statusCode: 429,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: false,
          error: 'Rate limit exceeded. Please try again later.'
        })
      };
    }

    // Parse and validate request body
    const body = JSON.parse(event.body || '{}');
    const validated = RequestSchema.parse(body);

    console.log(`[API] Diagnosis request - IP: ${ipIdentifier}, Query length: ${validated.query.length}`);

    // Generate diagnosis
    const result = await generateDiagnosis(
      validated.query,
      validated.options as GenerateOptions
    );

    return {
      statusCode: result.success ? 200 : 500,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      body: JSON.stringify(result)
    };

  } catch (error: any) {
    console.error('[API] Request failed:', error);

    // Handle validation errors
    if (error instanceof z.ZodError) {
      return {
        statusCode: 400,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: false,
          error: 'Invalid request format',
          details: error.errors
        })
      };
    }

    // Handle JSON parse errors
    if (error instanceof SyntaxError) {
      return {
        statusCode: 400,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: false,
          error: 'Invalid JSON in request body'
        })
      };
    }

    // Generic error
    return {
      statusCode: 500,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: false,
        error: 'Internal server error',
        message: error.message
      })
    };
  }
};
