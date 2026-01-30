/**
 * TEST ENDPOINT - Direct OpenRouter API Call
 * POST /api/test-openrouter
 *
 * TEMPORARY - DELETE AFTER DEBUGGING
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get and trim API key
    const rawApiKey = process.env.OPENROUTER_API_KEY || '';
    const apiKey = rawApiKey.trim();

    const rawBaseURL = process.env.OPENROUTER_API_URL || 'https://openrouter.ai/api/v1';
    const baseURL = rawBaseURL.trim();

    console.log('[Test] Raw API key length:', rawApiKey.length);
    console.log('[Test] Trimmed API key length:', apiKey.length);
    console.log('[Test] Has newline in raw:', rawApiKey.includes('\n'));
    console.log('[Test] Has newline after trim:', apiKey.includes('\n'));
    console.log('[Test] Base URL:', baseURL);

    if (!apiKey) {
      return res.status(400).json({
        error: 'No API key configured',
        debug: {
          rawLength: rawApiKey.length,
          trimmedLength: apiKey.length
        }
      });
    }

    // Initialize OpenAI client with OpenRouter
    const client = new OpenAI({
      apiKey,
      baseURL,
      defaultHeaders: {
        "HTTP-Referer": "https://sentra.healthcare",
        "X-Title": "Sentra Test",
      }
    });

    console.log('[Test] Making API call to OpenRouter...');

    // Simple test call
    const response = await client.chat.completions.create({
      model: 'deepseek/deepseek-chat',
      messages: [
        { role: 'user', content: 'Say "API working" in Indonesian' }
      ],
      max_tokens: 20
    });

    const reply = response.choices[0]?.message?.content || 'No response';

    return res.status(200).json({
      success: true,
      message: 'OpenRouter API call successful',
      reply,
      debug: {
        apiKeyLength: apiKey.length,
        hasNewline: apiKey.includes('\n'),
        baseURL,
        model: 'deepseek/deepseek-chat',
        rawKeyLength: rawApiKey.length
      }
    });

  } catch (error: any) {
    console.error('[Test] Error occurred:', error);

    return res.status(500).json({
      success: false,
      error: {
        message: error?.message || 'Unknown error',
        status: error?.status,
        statusText: error?.statusText,
        type: error?.constructor?.name,
        code: error?.code,
        response: error?.response?.data || error?.response,
        stack: error?.stack?.split('\n').slice(0, 5)
      }
    });
  }
}
