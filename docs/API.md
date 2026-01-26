# API Documentation

This document describes the external APIs and integrations used by Referralink.

## Overview

Referralink integrates with multiple AI and external APIs to provide intelligent data analysis capabilities. This guide covers how to configure and use these integrations.

## Table of Contents
- [Gemini API](#gemini-api)
- [DeepSeek API](#deepseek-api)
- [Configuration](#configuration)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [Examples](#examples)

---

## Gemini API

### Overview
Google's Gemini API provides advanced AI capabilities for natural language processing and data analysis.

### Authentication

**API Key Setup:**
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add to your `.env.local` file:
   ```env
   VITE_GEMINI_API_KEY=your_api_key_here
   ```

### Endpoints

#### Generate Content
**Purpose:** Use Gemini to analyze referral data and generate insights

**Request:**
```javascript
const response = await fetch(
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.VITE_GEMINI_API_KEY,
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: 'Analyze this referral data: ...',
            },
          ],
        },
      ],
    }),
  }
);
```

**Response:**
```json
{
  "candidates": [
    {
      "content": {
        "parts": [
          {
            "text": "Analysis results..."
          }
        ]
      }
    }
  ]
}
```

### Rate Limits
- **Free Tier:** 60 requests per minute
- **Paid Tier:** Up to 10,000 requests per minute

### Error Codes
- `400` - Invalid request
- `401` - Authentication failed
- `429` - Rate limit exceeded
- `500` - Server error

### Documentation
- [Gemini API Docs](https://ai.google.dev/tutorials)
- [Model Cards](https://ai.google.dev/models)

---

## DeepSeek API

### Overview
DeepSeek API provides alternative AI capabilities for data analysis and processing.

### Authentication

**API Key Setup:**
1. Visit [DeepSeek](https://www.deepseek.com/)
2. Create an account and generate API key
3. Add to your `.env.local`:
   ```env
   VITE_DEEPSEEK_API_KEY=your_api_key_here
   VITE_DEEPSEEK_API_URL=https://api.deepseek.com/v1
   ```

### Endpoints

#### Chat Completions
**Purpose:** Use DeepSeek for referral analysis and insights

**Request:**
```javascript
const response = await fetch(
  'https://api.deepseek.com/v1/chat/completions',
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.VITE_DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        {
          role: 'user',
          content: 'Analyze this referral data...',
        },
      ],
    }),
  }
);
```

**Response:**
```json
{
  "id": "chatcmpl-xxx",
  "object": "chat.completion",
  "created": 1234567890,
  "model": "deepseek-chat",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "Analysis results..."
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 10,
    "completion_tokens": 20,
    "total_tokens": 30
  }
}
```

### Rate Limits
- **Standard:** 100 requests per minute
- **Premium:** Up to 1000 requests per minute

### Error Codes
- `400` - Invalid request
- `401` - Authentication failed
- `402` - Insufficient credits
- `429` - Rate limit exceeded
- `500` - Server error

### Documentation
- [DeepSeek API Docs](https://www.deepseek.com/)

---

## Configuration

### Environment Variables

Create a `.env.local` file in the root directory:

```env
# Gemini Configuration
VITE_GEMINI_API_KEY=sk-xxx...

# DeepSeek Configuration
VITE_DEEPSEEK_API_KEY=sk-xxx...
VITE_DEEPSEEK_API_URL=https://api.deepseek.com/v1

# Optional: Timeout settings
VITE_API_TIMEOUT=30000
VITE_MAX_RETRIES=3
```

### API Selection

The application can be configured to use different APIs. Modify the service configuration in `src/services/`:

```typescript
// Example service configuration
const API_CONFIG = {
  primary: 'gemini',    // Primary AI provider
  fallback: 'deepseek', // Fallback provider
  timeout: 30000,
  maxRetries: 3,
};
```

---

## Error Handling

### Common Error Scenarios

#### Invalid API Key
```
Error: 401 Unauthorized
Solution: Verify API key in .env.local and check key validity
```

#### Rate Limit Exceeded
```
Error: 429 Too Many Requests
Solution: Implement exponential backoff or upgrade tier
```

#### Network Timeout
```
Error: Timeout after 30000ms
Solution: Increase VITE_API_TIMEOUT or reduce data payload
```

### Retry Strategy

Implement exponential backoff for failed requests:

```typescript
async function callWithRetry(
  fn: () => Promise<any>,
  maxRetries: number = 3,
  delayMs: number = 1000
) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, delayMs * Math.pow(2, i)));
    }
  }
}
```

---

## Rate Limiting

### Best Practices
1. **Cache Results:** Store API responses to avoid redundant calls
2. **Batch Requests:** Combine multiple queries into single request
3. **Implement Queuing:** Use task queue for scheduled API calls
4. **Monitor Usage:** Track API calls and remaining quota

### Example: Rate Limiting Implementation

```typescript
class APIRateLimiter {
  private queue: Array<() => Promise<any>> = [];
  private isProcessing = false;
  private requestsPerMinute = 60;
  private requestTimestamps: number[] = [];

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await fn();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });

      this.process();
    });
  }

  private async process() {
    if (this.isProcessing || this.queue.length === 0) return;

    this.isProcessing = true;

    while (this.queue.length > 0) {
      // Check rate limit
      const now = Date.now();
      this.requestTimestamps = this.requestTimestamps.filter(
        ts => now - ts < 60000
      );

      if (this.requestTimestamps.length >= this.requestsPerMinute) {
        const oldestRequest = this.requestTimestamps[0];
        const waitTime = 60000 - (now - oldestRequest);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }

      const fn = this.queue.shift();
      if (fn) {
        this.requestTimestamps.push(Date.now());
        await fn();
      }
    }

    this.isProcessing = false;
  }
}
```

---

## Examples

### Example 1: Analyze Referral Data with Gemini

```typescript
import { analyzeWithGemini } from './services/ai-service';

async function analyzeReferrals(data: ReferralData[]) {
  try {
    const prompt = `
      Analyze the following referral data and provide insights:
      ${JSON.stringify(data, null, 2)}

      Provide:
      1. Key performance metrics
      2. Trends and patterns
      3. Recommendations for improvement
    `;

    const analysis = await analyzeWithGemini(prompt);
    return analysis;
  } catch (error) {
    console.error('Analysis failed:', error);
    throw error;
  }
}
```

### Example 2: Generate Report with DeepSeek

```typescript
import { generateWithDeepSeek } from './services/ai-service';

async function generateReport(referralData: ReferralData[]) {
  try {
    const prompt = `
      Generate a professional referral report based on this data:
      ${JSON.stringify(referralData, null, 2)}

      Include sections:
      - Executive Summary
      - Performance Metrics
      - Analysis
      - Recommendations
    `;

    const report = await generateWithDeepSeek(prompt);
    return report;
  } catch (error) {
    console.error('Report generation failed:', error);
    throw error;
  }
}
```

### Example 3: Fallback Strategy

```typescript
async function analyzeWithFallback(data: ReferralData[]) {
  try {
    // Try primary provider (Gemini)
    return await analyzeWithGemini(createPrompt(data));
  } catch (primaryError) {
    console.warn('Primary API failed, trying fallback:', primaryError);
    try {
      // Fall back to DeepSeek
      return await generateWithDeepSeek(createPrompt(data));
    } catch (fallbackError) {
      console.error('All APIs failed:', fallbackError);
      throw new Error('Unable to complete analysis with any available API');
    }
  }
}
```

---

## Troubleshooting

### Issue: API Key Not Found
**Solution:**
1. Verify `.env.local` exists
2. Check environment variable names match exactly
3. Restart development server after changing .env
4. Try `VITE_GEMINI_API_KEY` instead of `GEMINI_API_KEY`

### Issue: CORS Error
**Solution:**
- API calls should be made from backend, not directly from browser
- Implement proxy or API wrapper in backend service

### Issue: Timeout Errors
**Solution:**
1. Increase `VITE_API_TIMEOUT` value
2. Optimize data payload size
3. Check network connection
4. Monitor API service status

---

## Resources

- [Gemini API Documentation](https://ai.google.dev/)
- [DeepSeek Documentation](https://www.deepseek.com/)
- [OpenAI API Reference](https://platform.openai.com/docs)
- [API Best Practices](https://restfulapi.net/)

---

## Support

For API-related issues:
1. Check API provider's status page
2. Review error codes and solutions above
3. Open an issue with detailed error information
4. Contact maintainers for debugging help
