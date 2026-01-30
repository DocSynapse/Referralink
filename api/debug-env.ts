/**
 * DEBUG ENDPOINT - Check Environment Variables
 * GET /api/debug-env
 *
 * TEMPORARY - DELETE AFTER DEBUGGING
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Mask API keys for security (show only first 8 chars)
  const maskKey = (key: string | undefined) => {
    if (!key) return 'NOT SET';
    if (key.length < 12) return '***';
    return key.substring(0, 8) + '***' + key.substring(key.length - 4);
  };

  const envCheck = {
    ai_providers: {
      openrouter: {
        api_key: maskKey(process.env.OPENROUTER_API_KEY),
        base_url: process.env.OPENROUTER_API_URL || 'default: https://openrouter.ai/api/v1'
      },
      deepseek: {
        api_key: maskKey(process.env.DEEPSEEK_API_KEY)
      },
      openai: {
        api_key: maskKey(process.env.OPENAI_API_KEY)
      }
    },
    semantic_cache: {
      upstash_url: process.env.UPSTASH_VECTOR_REST_URL ? 'SET ✓' : 'NOT SET ✗',
      upstash_token: process.env.UPSTASH_VECTOR_REST_TOKEN ? 'SET ✓' : 'NOT SET ✗',
      openai_key: process.env.OPENAI_API_KEY ? 'SET ✓' : 'NOT SET ✗'
    },
    client_config: {
      use_server_diagnosis: process.env.VITE_USE_SERVER_DIAGNOSIS || 'NOT SET',
      api_base_path: process.env.VITE_API_BASE_PATH || 'NOT SET'
    },
    runtime: {
      node_env: process.env.NODE_ENV || 'NOT SET',
      vercel_env: process.env.VERCEL_ENV || 'NOT SET'
    }
  };

  return res.status(200).json({
    status: 'Debug endpoint active',
    timestamp: new Date().toISOString(),
    environment: envCheck,
    warning: 'DELETE THIS ENDPOINT AFTER DEBUGGING'
  });
}
