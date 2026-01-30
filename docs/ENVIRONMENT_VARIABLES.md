# Environment Variables Configuration

## Overview

This document provides comprehensive guidance on configuring environment variables for Sentra Referralink. Understanding the difference between server-side and client-side variables is crucial for proper configuration.

---

## Required Environment Variables

### Server-Side API Variables (No VITE_ prefix)

These variables are accessible **ONLY** in API routes (`/api` directory) and are never exposed to the browser. Safe for secrets.

#### OpenAI API (for embeddings)

```bash
OPENAI_API_KEY=sk-...
```

- **Purpose:** Generate embeddings for semantic cache
- **Used in:** `/api/diagnosis.ts` - `generateEmbedding()` function
- **Optional:** Yes (semantic cache will be disabled if missing)
- **Where to get:** https://platform.openai.com/api-keys

#### Upstash Vector Database

```bash
UPSTASH_VECTOR_REST_URL=https://....upstash.io
UPSTASH_VECTOR_REST_TOKEN=...
```

- **Purpose:** Semantic cache storage and retrieval
- **Used in:** `/api/diagnosis.ts` - `getVectorIndex()` function
- **Optional:** Yes (semantic cache will be disabled if missing)
- **Where to get:** https://console.upstash.com/vector

#### OpenRouter API (for AI diagnosis)

```bash
OPENROUTER_API_KEY=sk-or-v1-...
```

- **Purpose:** Primary AI provider for medical diagnosis
- **Used in:** `/api/diagnosis.ts` - `getClient()` function
- **Optional:** No (**REQUIRED** for API to work)
- **Where to get:** https://openrouter.ai/keys

#### DeepSeek API (fallback)

```bash
DEEPSEEK_API_KEY=sk-...
```

- **Purpose:** Fallback AI provider if OpenRouter fails
- **Used in:** `/api/diagnosis.ts` - `getClient()` function
- **Optional:** Yes (but recommended as fallback)
- **Where to get:** https://platform.deepseek.com/api_keys

---

### Client-Side Variables (VITE_ prefix)

These variables are bundled into the client JavaScript and **visible in the browser**. Never put secrets here.

```bash
VITE_USE_SERVER_DIAGNOSIS=true
```

- **Purpose:** Toggle between server-side and client-side diagnosis
- **Values:** `true` (use /api/diagnosis) | `false` (deprecated - will return error)
- **Default:** `true`

```bash
VITE_API_BASE_PATH=
```

- **Purpose:** Base path for API calls (useful for proxies)
- **Default:** Empty string (uses same origin)

```bash
VITE_ALLOWED_ORIGIN=*
```

- **Purpose:** CORS allowed origin for API responses
- **Default:** `*` (allow all for development)
- **Production:** Set to your domain (e.g., `https://referralink.sentra.healthcare`)

---

## Setup Instructions

### Local Development

1. **Copy the example file:**
   ```bash
   cp .env.example .env.local
   ```

2. **Fill in required credentials in `.env.local`:**

   ```bash
   # AI Provider (REQUIRED)
   OPENROUTER_API_KEY=your-key-here

   # Semantic Cache (OPTIONAL)
   OPENAI_API_KEY=your-openai-key
   UPSTASH_VECTOR_REST_URL=your-upstash-url
   UPSTASH_VECTOR_REST_TOKEN=your-upstash-token

   # Client Config
   VITE_USE_SERVER_DIAGNOSIS=true
   ```

3. **Start dev server:**
   ```bash
   npm run dev
   ```

4. **Test the API:**
   ```bash
   curl -X POST http://localhost:3000/api/diagnosis \
     -H "Content-Type: application/json" \
     -d '{"query": "demam tinggi 3 hari"}'
   ```

---

### Vercel Production

1. **Login to Vercel Dashboard**
   - Navigate to: https://vercel.com/dashboard
   - Select project: `referralink`
   - Go to: **Settings → Environment Variables**

2. **Add server-side environment variables (NO VITE_ prefix):**

   For environments: **Production**, **Preview**, **Development**

   ```
   OPENROUTER_API_KEY = sk-or-v1-...
   DEEPSEEK_API_KEY = sk-...
   OPENAI_API_KEY = sk-...
   UPSTASH_VECTOR_REST_URL = https://...
   UPSTASH_VECTOR_REST_TOKEN = ...
   ```

3. **Add client-side environment variable (VITE_ prefix):**

   ```
   VITE_USE_SERVER_DIAGNOSIS = true
   VITE_ALLOWED_ORIGIN = https://your-domain.vercel.app
   ```

4. **Redeploy aplikasi to apply changes:**
   ```bash
   git push origin main
   # or
   vercel --prod
   ```

5. **Verify deployment:**
   ```bash
   # Check health
   curl https://your-domain.vercel.app/api/health/semantic-cache

   # Test diagnosis
   curl -X POST https://your-domain.vercel.app/api/diagnosis \
     -H "Content-Type: application/json" \
     -d '{"query": "demam tinggi 3 hari"}'
   ```

---

## Troubleshooting

### Error: "Upstash Vector credentials not configured"

**Cause:** Missing Upstash environment variables

**Solution:**
- Add `UPSTASH_VECTOR_REST_URL` and `UPSTASH_VECTOR_REST_TOKEN` to environment variables, OR
- Semantic cache will be automatically disabled (API will still work)

### Error: "OpenAI API key not configured for embeddings"

**Cause:** Missing OpenAI API key for generating embeddings

**Solution:**
- Add `OPENAI_API_KEY` to environment variables, OR
- API will fallback without semantic cache (still functional)

### Error: "No AI API key configured"

**Cause:** No AI provider key found (OpenRouter, DeepSeek, etc.)

**Solution:**
- Add at least one AI provider key:
  - `OPENROUTER_API_KEY` (recommended - supports all models)
  - `DEEPSEEK_API_KEY` (alternative - direct DeepSeek access)

### API works locally but fails in production

**Cause:** Vercel environment variables not set correctly

**Solution:**
- Verify server-side variables are set **WITHOUT** `VITE_` prefix in Vercel Dashboard
- Client-side variables **WITH** `VITE_` prefix
- Check variable names match exactly (case-sensitive)

### Semantic cache not working

**Cause:** Missing one or more cache dependencies

**Solution:**
1. Check health endpoint:
   ```bash
   curl https://your-domain.vercel.app/api/health/semantic-cache
   ```

2. Verify response shows:
   ```json
   {
     "status": "healthy",
     "semanticCache": {
       "available": true,
       "embeddings": true,
       "vectorStore": true
     }
   }
   ```

3. If `embeddings: false` → Add `OPENAI_API_KEY`
4. If `vectorStore: false` → Add Upstash credentials

---

## Variable Priority & Fallback Chain

### AI Provider Priority (for diagnosis)

The API checks for API keys in this order:

1. `OPENROUTER_API_KEY` (primary - recommended)
2. `DEEPSEEK_API_KEY` (fallback)
3. `QWEN_API_KEY` (fallback)
4. `GEMINI_API_KEY` (fallback)

**Recommendation:** Use OpenRouter as it provides access to all models through a single API key.

### Semantic Cache Dependencies

Both required for semantic cache to work:

- `OPENAI_API_KEY` (for generating embeddings) → if missing, cache disabled
- `UPSTASH_VECTOR_REST_URL` + `UPSTASH_VECTOR_REST_TOKEN` (for storage) → if missing, cache disabled

**Note:** API will function normally without semantic cache, just without caching performance benefits.

---

## Security Best Practices

### DO NOT:
- ❌ Commit `.env.local` or `.env.production` with real secrets to git
- ❌ Put server-side API keys in VITE_ prefixed variables
- ❌ Share API keys in public channels
- ❌ Use production keys in development

### DO:
- ✅ Use `.env.example` as a template (no real values)
- ✅ Keep server-side keys WITHOUT `VITE_` prefix
- ✅ Store production secrets only in Vercel Dashboard
- ✅ Rotate API keys periodically
- ✅ Use different keys for dev/staging/prod

---

## Environment Variable Reference

| Variable Name | Scope | Required | Purpose |
|--------------|-------|----------|---------|
| `OPENROUTER_API_KEY` | Server | Yes | Primary AI provider |
| `DEEPSEEK_API_KEY` | Server | No | Fallback AI provider |
| `OPENAI_API_KEY` | Server | No | Embeddings for cache |
| `UPSTASH_VECTOR_REST_URL` | Server | No | Cache vector storage |
| `UPSTASH_VECTOR_REST_TOKEN` | Server | No | Cache authentication |
| `VITE_USE_SERVER_DIAGNOSIS` | Client | Yes | Feature toggle |
| `VITE_API_BASE_PATH` | Client | No | API proxy path |
| `VITE_ALLOWED_ORIGIN` | Client | No | CORS configuration |

---

## Health Check Endpoint

Monitor your environment variables configuration:

```bash
GET /api/health/semantic-cache
```

**Response (healthy):**
```json
{
  "status": "healthy",
  "timestamp": "2026-01-30T...",
  "semanticCache": {
    "available": true,
    "embeddings": true,
    "vectorStore": true,
    "details": {
      "upstash": {
        "configured": true,
        "urlPresent": true,
        "tokenPresent": true
      },
      "openai": {
        "configured": true
      }
    }
  }
}
```

**Response (degraded - missing credentials):**
```json
{
  "status": "degraded",
  "semanticCache": {
    "available": false,
    "embeddings": false,
    "vectorStore": false,
    "details": {...}
  }
}
```

Use this endpoint to verify your environment configuration after deployment.

---

## Additional Resources

- **Vercel Environment Variables Guide:** https://vercel.com/docs/concepts/projects/environment-variables
- **Vite Environment Variables:** https://vitejs.dev/guide/env-and-mode.html
- **OpenRouter Documentation:** https://openrouter.ai/docs
- **Upstash Vector Database:** https://upstash.com/docs/vector/overall/getstarted

---

**Last Updated:** 2026-01-30
**Maintained by:** Sentra Solutions Team
