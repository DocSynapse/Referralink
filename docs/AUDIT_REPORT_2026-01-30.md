# Pre-Cleanup Audit Report
**Date:** 2026-01-30
**Git Tag:** audit-before-cleanup-2026-01-30

## Executive Summary

Project mengalami architecture chaos akibat 20+ commits toggle bolak-balik dalam 24 jam terakhir. Root cause: missing environment variables + no graceful degradation menyebabkan error 500 di `/api/diagnosis` endpoint.

## File Structure Audit

### Client-Side Files
```
services/diagnosisApiClient.ts  ✅ KEEP - Wrapper ke server API
services/geminiService.ts       ❌ DELETE - CSP violated, no references
```

### Server-Side Files
```
api/diagnosis.ts                     ✅ KEEP - Main endpoint (341 lines)
api/diagnosis/generate.ts            ❌ DELETE - Duplicate endpoint
api/diagnosis/circuit-status.ts      ⚠️  EVALUATE - Check if used
api/_services/diagnosisService.ts    ❌ MERGE then DELETE - Consolidate to main
```

### Environment Files
```
.env                        ✅ Base template
.env.example                ✅ Need update with proper docs
.env.local                  ✅ Dev only
.env.production             ✅ Need update
.env.vercel                 ✅ Production config
.env.final.check            ❌ DELETE - temporary
.env.prod.check             ❌ DELETE - temporary
.env.production.example     ❌ DELETE - superseded by .env.example
.env.verify                 ❌ DELETE - temporary
```

## Dependency Analysis

### geminiService.ts
**Status:** SAFE TO DELETE
**Reason:** No import references found in codebase
**Impact:** None

### diagnosisService.ts
**Status:** NEEDS CONSOLIDATION
**Referenced by:**
- `api/diagnosis/generate.ts` (which will be deleted)

**Action:** Merge useful logic to `api/diagnosis.ts`, then delete

### api/diagnosis/generate.ts
**Status:** DUPLICATE - DELETE
**Referenced by:**
- `services/diagnosisApiClient.ts:42` - endpoint URL

**Action:**
1. Update diagnosisApiClient.ts to use `/api/diagnosis`
2. Delete generate.ts

## Architecture Issues Identified

### 1. Route Collision
- `/api/diagnosis.ts` vs `/api/diagnosis/generate.ts`
- Both handle POST requests for diagnosis
- Consolidate to single endpoint: `/api/diagnosis`

### 2. Duplicate AI Client Logic
- `services/geminiService.ts` - client-side (CSP violation)
- `api/_services/diagnosisService.ts` - server-side
- `api/diagnosis.ts` - inline in endpoint

**Target:** Single AI client in `api/diagnosis.ts`

### 3. Environment Variables Chaos
| Variable | Scope | Status |
|----------|-------|--------|
| `VITE_USE_SERVER_DIAGNOSIS` | Hardcoded in vercel.json | ❌ Remove |
| `UPSTASH_VECTOR_REST_URL` | Server | ❌ Missing in production |
| `UPSTASH_VECTOR_REST_TOKEN` | Server | ❌ Missing in production |
| `OPENAI_API_KEY` | Server | ❌ Missing (for embeddings) |
| `OPENROUTER_API_KEY` | Server | ✅ Configured |

### 4. No Graceful Degradation
```typescript
// Current (api/diagnosis.ts:48-51)
if (!url || !token) {
  throw new Error('Upstash Vector credentials not configured'); // ← 500 error
}
```

**Fix:** Return null, allow API to function without cache

## Critical Files for Cleanup

### DELETE (4 files)
1. `services/geminiService.ts` - No references, CSP violated
2. `api/diagnosis/generate.ts` - Duplicate endpoint
3. `api/_services/diagnosisService.ts` - After merge
4. `audit-output.txt` - Temporary

### MODIFY (3 files)
1. `api/diagnosis.ts` - Add graceful degradation
2. `services/diagnosisApiClient.ts` - Fix endpoint URL
3. `vercel.json` - Remove hardcoded env var

### CREATE (3 files)
1. `docs/ENVIRONMENT_VARIABLES.md` - Comprehensive guide
2. `api/health/semantic-cache.ts` - Health check endpoint
3. `docs/POST_CLEANUP_SUMMARY.md` - Final summary

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Delete wrong file | HIGH | Git tag checkpoint created |
| Broken imports | MEDIUM | Grep audit shows limited dependencies |
| Production downtime | HIGH | Incremental commits + local testing |
| Lost semantic cache | LOW | Graceful degradation preserves core function |

## Rollback Plan

**Tag Created:** `audit-before-cleanup-2026-01-30`

### Quick Rollback
```bash
git checkout audit-before-cleanup-2026-01-30
git checkout -b emergency-rollback
git push origin emergency-rollback:main --force
```

### Vercel Rollback
1. Dashboard → Deployments
2. Find tag: audit-before-cleanup-2026-01-30
3. Promote to Production

## Next Steps

1. ✅ Audit complete
2. 🔄 Remove duplicate files (Task 2)
3. 🔄 Add graceful degradation (Task 3)
4. 🔄 Consolidate architecture (Tasks 4-7)
5. 🔄 Documentation (Tasks 8-9)
6. 🔄 Deploy & verify (Tasks 10-13)

## Commit Strategy

Each task = 1 commit dengan format:
```
<type>: <short description>

- Bullet point 1
- Bullet point 2
- Bullet point 3
```

Types: `audit`, `refactor`, `fix`, `feat`, `docs`, `chore`

---

**Audit completed:** 2026-01-30
**Safe to proceed:** ✅ Yes
**Rollback available:** ✅ Tag pushed to remote
