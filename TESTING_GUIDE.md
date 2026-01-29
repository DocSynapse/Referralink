# TESTING GUIDE - DIAGNOSIS API OPTIMIZATION

Quick reference untuk testing implementasi Fase 1A.

---

## PREREQUISITES

```bash
# Ensure dependencies installed
npm install

# Ensure build successful
npm run build
```

---

## LOCAL TESTING (Netlify Dev)

### 1. Start Dev Server:
```bash
netlify dev
# Server akan running di: http://localhost:8888
```

### 2. Test API Endpoint (cURL):
```bash
curl -X POST http://localhost:8888/.netlify/functions/diagnosis/generate \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Pasien laki-laki 45 tahun nyeri dada kiri menjalar ke rahang, berkeringat dingin, sesak napas.",
    "options": {
      "model": "DEEPSEEK_V3",
      "skipCache": false
    }
  }'
```

### 3. Expected Response:
```json
{
  "success": true,
  "data": {
    "code": "I21.0",
    "description": "ST elevation myocardial infarction of anterior wall",
    "proposed_referrals": [
      {
        "code": "I21.0",
        "description": "STEMI Anterior Wall",
        "clinical_reasoning": "Nyeri dada khas STEMI dengan radiasi ke rahang"
      }
    ],
    "evidence": { ... },
    "clinical_notes": "RUJUK SEGERA ke cardiologist"
  },
  "metadata": {
    "fromCache": false,
    "model": "deepseek/deepseek-chat",
    "latencyMs": 2100,
    "timestamp": 1738156800000
  }
}
```

### 4. Test Error Handling:
```bash
# Invalid query (too short)
curl -X POST http://localhost:8888/.netlify/functions/diagnosis/generate \
  -H "Content-Type: application/json" \
  -d '{"query": "ab"}'

# Expected: HTTP 400, validation error

# Rate limit test (101 rapid requests)
for i in {1..101}; do
  curl -X POST http://localhost:8888/.netlify/functions/diagnosis/generate \
    -H "Content-Type: application/json" \
    -d '{"query":"Test query number '"$i"'"}' &
done

# Expected: HTTP 429 after request 100
```

---

## FRONTEND TESTING (Feature Flag OFF)

### 1. Ensure Flag Disabled:
```bash
# Check .env.production
grep VITE_USE_SERVER_DIAGNOSIS .env.production
# Should show: VITE_USE_SERVER_DIAGNOSIS=false
```

### 2. Test UI Flow:
```bash
npm run dev
# Open: http://localhost:5173
```

**Steps:**
1. Scroll to "Demo Diagnosis" section
2. Input query: "Demam tinggi 3 hari, batuk kering, nyeri kepala"
3. Click "Analisis Diagnosis"
4. **Expected:** Result displays normally (using old client-side flow)
5. Open DevTools Network tab
6. **Expected:** NO request to `/api/diagnosis/generate`
7. **Expected:** IndexedDB cache populated (Application tab)

---

## FRONTEND TESTING (Feature Flag ON)

### 1. Enable Server Mode:
```bash
# Edit .env.production
sed -i 's/VITE_USE_SERVER_DIAGNOSIS=false/VITE_USE_SERVER_DIAGNOSIS=true/' .env.production

# Rebuild
npm run build
npm run dev
```

### 2. Test UI Flow:
1. Clear browser cache (Ctrl+Shift+Delete)
2. Repeat same steps as above
3. **Expected:** Result displays normally
4. Open DevTools Network tab
5. **Expected:** POST request to `/api/diagnosis/generate` visible
6. **Expected:** Response matches JSON structure above
7. Submit SAME query again
8. **Expected:** Instant response (<100ms, from L2 cache)

### 3. Test Error Recovery:
```bash
# Simulate API failure: invalid API key
# Edit .env.production temporarily
VITE_DEEPSEEK_API_KEY=invalid_key

# Rebuild & test
npm run build
npm run dev
# Submit query
# Expected: Error message displayed gracefully
```

---

## STAGING DEPLOYMENT TESTING

### 1. Deploy to Vercel:
```bash
vercel deploy --prod
# Note: Ensure environment variables set in Vercel dashboard
```

### 2. Test Production Endpoint:
```bash
curl -X POST https://your-domain.vercel.app/api/diagnosis/generate \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Nyeri perut kanan bawah, mual, demam ringan",
    "options": { "model": "DEEPSEEK_V3" }
  }'
```

### 3. Verify Environment Variables:
```bash
# In Vercel dashboard:
# Settings → Environment Variables
# Check:
✓ VITE_DEEPSEEK_API_KEY (set)
✓ VITE_USE_SERVER_DIAGNOSIS (false initially)
✓ VITE_ALLOWED_ORIGIN (production domain)
```

---

## PERFORMANCE TESTING

### 1. Latency Benchmark:
```bash
# Run 10 sequential requests, measure time
for i in {1..10}; do
  time curl -X POST http://localhost:8888/.netlify/functions/diagnosis/generate \
    -H "Content-Type: application/json" \
    -d '{"query":"Nyeri kepala hebat, fotofobia, mual muntah"}'
done

# Expected P95: <8s (baseline, no cache yet)
```

### 2. Cache Hit Rate Test:
```bash
# Submit same query 5x
for i in {1..5}; do
  curl -s -X POST http://localhost:8888/.netlify/functions/diagnosis/generate \
    -H "Content-Type: application/json" \
    -d '{"query":"Demam tinggi, batuk produktif, sesak napas"}' \
    | jq '.metadata.fromCache'
done

# Expected:
# false (1st request)
# true (2nd-5th requests from L2 client cache)
```

---

## ROLLBACK TESTING

### Scenario: High Error Rate Detected

**Action:**
```bash
# 1. Toggle feature flag OFF
vercel env rm VITE_USE_SERVER_DIAGNOSIS production
vercel env add VITE_USE_SERVER_DIAGNOSIS false production

# 2. Redeploy
vercel deploy --prod

# 3. Verify fallback works
curl -X POST https://your-domain.vercel.app/api/diagnosis/generate
# Expected: Still works (auto-fallback to old client-side)
```

**Validation:**
- [ ] Frontend still functional
- [ ] No errors in browser console
- [ ] Results display correctly
- [ ] Network tab shows NO server API calls

---

## MONITORING CHECKLIST

### After Each Deployment:
- [ ] Check Vercel Function Logs (Real-time tab)
- [ ] Verify no 500 errors
- [ ] Check latency distribution (P50, P95, P99)
- [ ] Verify rate limiting triggers correctly
- [ ] Monitor error rate: should be <1%

### Daily (During Rollout):
- [ ] Review Vercel Analytics dashboard
- [ ] Check user feedback channels
- [ ] Verify no production incidents
- [ ] Update CEO status report

---

## TROUBLESHOOTING

### Issue: "No API key found in environment"
**Solution:**
```bash
# Check environment variable is set
echo $VITE_DEEPSEEK_API_KEY
# If empty, add to .env.production and rebuild
```

### Issue: CORS error in browser
**Solution:**
```bash
# Verify VITE_ALLOWED_ORIGIN matches production domain
# In api/diagnosis/generate.ts, check CORS_HEADERS
```

### Issue: Rate limit false positive
**Solution:**
```bash
# Rate limit store is in-memory, resets on function cold start
# For production, upgrade to Redis-based rate limiting
```

### Issue: High latency (>10s)
**Solution:**
```bash
# Check DeepSeek API status: https://status.deepseek.com
# Verify model ID correct in diagnosisService.ts
# Consider enabling race mode (Fase 1B)
```

---

## TEST COMPLETION CRITERIA

### Fase 1A Sign-Off:
- [x] Local build successful
- [x] Git commit completed
- [ ] Netlify Dev endpoint responds
- [ ] Frontend integration works (flag OFF)
- [ ] Frontend integration works (flag ON)
- [ ] L2 cache hit confirmed
- [ ] Error handling graceful
- [ ] Rate limiting functional

### Ready for Staging:
- [ ] All above tests PASS
- [ ] No console errors
- [ ] Performance within baseline
- [ ] Documentation reviewed
- [ ] CEO approval obtained

### Ready for Production:
- [ ] Staging tests PASS (7 days)
- [ ] Internal team validated
- [ ] Rollback tested successfully
- [ ] Monitoring dashboards configured
- [ ] Circuit breaker implemented (Fase 1B)

---

**Test Owner:** Development Team
**Approval Required:** CEO (dr. Ferdi Iskandar)
**Target Date:** 2026-01-31 (2 hari from now)
