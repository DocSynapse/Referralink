# API Documentation

This document describes the external APIs and integrations used by Referralink's diagnostic referral analysis algorithm.

## Overview

Referralink integrates with advanced AI services to provide intelligent diagnostic analysis and referral recommendations. These APIs power the core algorithm that analyzes patient clinical presentations and generates accurate specialist referral recommendations. This guide covers configuration and usage of these integrations.

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
Google's Gemini API provides advanced AI capabilities for natural language processing and clinical analysis. Referralink uses Gemini for diagnostic referral analysis and evidence-based recommendations.

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
**Purpose:** Use Gemini to analyze patient clinical presentations and generate diagnostic referral recommendations

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
              text: 'Analyze this patient clinical presentation and provide diagnostic referral recommendations: ...',
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
DeepSeek API provides advanced reasoning capabilities for clinical analysis and diagnostic referral processing. Referralink uses DeepSeek for complex diagnostic reasoning and specialist recommendation generation.

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
**Purpose:** Use DeepSeek for diagnostic analysis and specialist referral recommendations

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
          content: 'Analyze this patient clinical presentation and provide diagnostic classification and specialist referral recommendations...',
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

### Example 1: Analyze Patient Presentation with Gemini

```typescript
import { analyzeWithGemini } from './services/ai-service';

interface PatientPresentation {
  symptoms: string[];
  medicalHistory: string[];
  clinicalFindings: string;
}

async function analyzeDiagnosticReferral(patient: PatientPresentation) {
  try {
    const prompt = `
      Analyze the following patient clinical presentation and provide diagnostic referral recommendations:

      Symptoms: ${patient.symptoms.join(', ')}
      Medical History: ${patient.medicalHistory.join(', ')}
      Clinical Findings: ${patient.clinicalFindings}

      Provide:
      1. ICD-10 diagnostic codes with confidence scores
      2. Clinical urgency assessment (Emergency/Urgent/Semi-Urgent/Routine)
      3. Recommended specialist referrals
      4. Evidence-based clinical reasoning
      5. Red flag indicators (if any)
    `;

    const analysis = await analyzeWithGemini(prompt);
    return analysis;
  } catch (error) {
    console.error('Diagnostic analysis failed:', error);
    throw error;
  }
}
```

### Example 2: Generate Referral Report with DeepSeek

```typescript
import { generateWithDeepSeek } from './services/ai-service';

interface DiagnosticAnalysis {
  icdCodes: string[];
  urgency: string;
  recommendedSpecialist: string;
  reasoning: string;
}

async function generateReferralReport(analysis: DiagnosticAnalysis) {
  try {
    const prompt = `
      Generate a professional diagnostic referral report based on this clinical analysis:
      ${JSON.stringify(analysis, null, 2)}

      Include sections:
      - Patient Presentation Summary
      - Diagnostic Assessment (ICD-10 codes)
      - Clinical Urgency
      - Specialist Recommendation with Competency Requirements
      - Clinical Reasoning and Evidence
      - Referral Documentation
    `;

    const report = await generateWithDeepSeek(prompt);
    return report;
  } catch (error) {
    console.error('Report generation failed:', error);
    throw error;
  }
}
```

### Example 3: Robust Diagnostic Analysis with Fallback

```typescript
async function analyzeWithDiagnosticFallback(patient: PatientPresentation) {
  try {
    // Try primary provider (Gemini) for initial analysis
    return await analyzeWithGemini(createDiagnosticPrompt(patient));
  } catch (primaryError) {
    console.warn('Primary diagnostic API failed, trying fallback:', primaryError);
    try {
      // Fall back to DeepSeek for diagnostic reasoning
      return await generateWithDeepSeek(createDiagnosticPrompt(patient));
    } catch (fallbackError) {
      console.error('All diagnostic APIs failed:', fallbackError);
      throw new Error('Unable to complete diagnostic referral analysis with any available API');
    }
  }
}
```

---

## Troubleshooting

### Issue: Diagnostic Analysis Fails to Complete
**Solution:**
1. Verify API keys are valid in `.env.local`
2. Check API service status and quota limits
3. Ensure patient presentation data is properly formatted
4. Review API response logs for error details

### Issue: API Key Not Found
**Solution:**
1. Verify `.env.local` exists in project root
2. Check environment variable names match exactly (case-sensitive)
3. Restart development server after changing `.env.local`
4. Use `VITE_GEMINI_API_KEY` and `VITE_DEEPSEEK_API_KEY` prefixes

### Issue: CORS Error
**Solution:**
- Diagnostic API calls should be made from backend, not directly from browser
- Implement proxy or API wrapper in backend service for clinical data

### Issue: Timeout During Diagnostic Analysis
**Solution:**
1. Increase `VITE_API_TIMEOUT` value (default 30000ms)
2. Optimize patient presentation payload size
3. Check network connection stability
4. Monitor API service status page
5. Consider using caching for repeated diagnostic patterns

---

## Resources

- [Gemini API Documentation](https://ai.google.dev/) - For clinical analysis and diagnostic support
- [DeepSeek Documentation](https://www.deepseek.com/) - For advanced diagnostic reasoning
- [ICD-10 Code Reference](https://www.cdc.gov/nchs/icd/index.htm) - Medical classification standards
- [RESTful API Best Practices](https://restfulapi.net/) - API design and implementation patterns

---

## Support

For diagnostic API and integration issues:
1. Check API provider's status page for service availability
2. Verify API keys and quota limits
3. Review error codes and troubleshooting solutions above
4. Ensure patient presentation data is properly formatted
5. Open an issue with detailed error logs and clinical context
6. Contact maintainers for diagnostic analysis troubleshooting
