/**
 * SIMPLIFIED DIAGNOSIS ENDPOINT - For debugging
 * POST /api/diagnosis-simple
 *
 * TEMPORARY - DELETE AFTER DEBUGGING
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';

export const config = {
  runtime: 'nodejs',
  maxDuration: 60,
};

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Query required' });
    }

    console.log('[Simple Diagnosis] Query:', query);

    // Get trimmed API key
    const apiKey = (process.env.OPENROUTER_API_KEY || '').trim();
    const baseURL = (process.env.OPENROUTER_API_URL || 'https://openrouter.ai/api/v1').trim();

    if (!apiKey) {
      return res.status(500).json({ error: 'No API key configured' });
    }

    console.log('[Simple Diagnosis] Creating client...');

    const client = new OpenAI({
      apiKey,
      baseURL,
      defaultHeaders: {
        "HTTP-Referer": "https://sentra.healthcare",
        "X-Title": "Sentra CDSS",
      }
    });

    console.log('[Simple Diagnosis] Making AI call...');

    // Simple diagnosis prompt (no complex instructions)
    const response = await client.chat.completions.create({
      model: 'deepseek/deepseek-chat',
      messages: [
        {
          role: 'system',
          content: 'Kamu adalah dokter AI. Berikan diagnosis sederhana dalam JSON format: {code: string, description: string, notes: string}'
        },
        {
          role: 'user',
          content: `Diagnosa: ${query}`
        }
      ],
      temperature: 0.3,
      max_tokens: 300,
      response_format: { type: 'json_object' }
    });

    console.log('[Simple Diagnosis] AI response received');

    const content = response.choices[0]?.message?.content || '{}';
    let result;

    try {
      result = JSON.parse(content);
    } catch (e) {
      result = { raw: content };
    }

    return res.status(200).json({
      success: true,
      data: result,
      metadata: {
        model: 'deepseek/deepseek-chat',
        query
      }
    });

  } catch (error: any) {
    console.error('[Simple Diagnosis] Error:', error);

    return res.status(500).json({
      success: false,
      error: {
        message: error?.message || 'Unknown error',
        status: error?.status,
        type: error?.constructor?.name,
        stack: error?.stack?.split('\n').slice(0, 5)
      }
    });
  }
}
