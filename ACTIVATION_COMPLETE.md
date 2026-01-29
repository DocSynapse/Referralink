# 🚀 FEATURE FLAG ACTIVATION - IN PROGRESS

**Status:** ⚠️ **FINAL STEP REQUIRED - VERCEL ENV VAR UPDATE**
**Date:** 2026-01-29
**Deployment URL:** https://sentraai.vercel.app (production)

---

## ✅ COMPLETED STEPS

1. **Local .env.production Updated** ✅
   ```bash
   VITE_USE_SERVER_DIAGNOSIS=true  # Changed from false
   ```

2. **Git Commit Created** ✅
   ```
   80dfd01 - feat: ENABLE server-side diagnosis (Feature Flag ON)
   ```

3. **Pushed to GitHub** ✅
   - Vercel auto-deployment triggered
   - Build will use NEW code

---

## ⚠️ CRITICAL NEXT STEP

### Vercel Environment Variable Update (MANUAL)

**Why Required:**
Vercel environment variables take precedence over .env files in deployments. The variable currently exists with value `false` and must be updated to `true`.

**Instructions:**

1. **Go to Vercel Dashboard**
   ```
   https://vercel.com/sentra-solutions/sentraai/settings/environment-variables
   ```

2. **Find Variable:**
   - Name: `VITE_USE_SERVER_DIAGNOSIS`
   - Current Value: `false`
   - Environment: Production

3. **Update Value:**
   - Click "..." menu → Edit
   - Change value: `false` → `true`
   - Click "Save"

4. **Trigger Redeploy:**
   - Option A: Vercel will auto-deploy from git push (already triggered)
   - Option B: Manual redeploy via dashboard
     ```
     Dashboard → Deployments → Latest → "Redeploy"
     ```

5. **Verify Environment Variable:**
   ```bash
   # Check variable is set correctly
   vercel env ls

   # Should show:
   # VITE_USE_SERVER_DIAGNOSIS  true  Production
   ```

---

## 🧪 TESTING CHECKLIST

### After Vercel Env Var Updated:

1. **Wait for Deployment** (~30s)
   ```bash
   vercel ls
   # Look for: ● Ready status
   ```

2. **Test Production URL**
   - Open: https://sentraai.vercel.app
   - Navigate to: Demo Diagnosis section
   - Submit query: "Demam tinggi 3 hari, batuk kering, nyeri kepala"

3. **Verify Server-Side Mode**
   - Open DevTools → Network tab
   - Submit diagnosis query
   - Check for: `POST /api/diagnosis/generate`
   - Should see: Request to server endpoint ✅

4. **Check Response**
   ```json
   {
     "success": true,
     "data": { ... },
     "metadata": {
       "fromCache": false,
       "model": "deepseek/deepseek-chat",
       "latencyMs": 2100
     }
   }
   ```

5. **Test Cache Hit**
   - Submit SAME query again
   - Second response should show: `"fromCache": true`
   - Latency should be: <100ms

6. **Verify Circuit Breaker Status**
   ```bash
   curl https://sentraai.vercel.app/api/diagnosis/circuit-status

   # Should return:
   {
     "overall": { "status": "operational", "healthy": 3 },
     "models": [...]
   }
   ```

---

## 📊 EXPECTED BEHAVIOR CHANGES

### Before (Feature Flag OFF):
```
User submits query
    ↓
diagnosisApiClient checks flag → FALSE
    ↓
Fallback to geminiService (old client-side)
    ↓
Direct browser → DeepSeek API
    ↓
Return result
```

### After (Feature Flag ON):
```
User submits query
    ↓
diagnosisApiClient checks flag → TRUE
    ↓
Check L2 cache (IndexedDB) → MISS
    ↓
POST /api/diagnosis/generate
    ↓
diagnosisService → Circuit Breaker check
    ↓
Try DeepSeek V3 → SUCCESS
    ↓
Record success, return result
    ↓
Store in L2 cache
    ↓
Display to user
```

### On Failure:
```
DeepSeek V3 FAILS (401/429/503)
    ↓
Circuit Breaker: Record failure
    ↓
Try GLM-4 Plus → SUCCESS
    ↓
User sees result (never knew about failure)
```

---

## 🎯 SUCCESS CRITERIA

### Functional:
- [ ] POST request to `/api/diagnosis/generate` visible in Network tab
- [ ] Response includes `metadata.model` field
- [ ] Circuit status endpoint returns 200 OK
- [ ] Cache hit works (submit same query 2x)

### Performance:
- [ ] First request: <3s latency (no cache)
- [ ] Second request: <100ms (cache hit)
- [ ] No errors in browser console

### Reliability:
- [ ] Circuit breaker state: CLOSED (healthy)
- [ ] All 3 models showing as healthy
- [ ] Automatic fallback works (if primary fails)

---

## 🔄 ROLLBACK PLAN

### If Issues Detected:

**Immediate Rollback (<5 minutes):**

1. **Vercel Dashboard:**
   - Edit `VITE_USE_SERVER_DIAGNOSIS`
   - Change: `true` → `false`
   - Save

2. **Redeploy:**
   ```bash
   vercel deploy --prod
   ```

3. **Verify Rollback:**
   - Test diagnosis flow
   - Should use old client-side method
   - NO POST to `/api/diagnosis/generate`

**Alternative: Git Revert:**
```bash
git revert 80dfd01
git push origin main
# Vercel auto-deploys reverted state
```

---

## 📈 MONITORING DASHBOARD

### Key Metrics to Watch (First 24 Hours):

1. **Error Rate:**
   ```
   Target: <1%
   Monitor: Vercel Function logs
   Alert if: >2% error rate
   ```

2. **Latency:**
   ```
   Target: P95 <3s (before Redis)
   Monitor: metadata.latencyMs in responses
   Alert if: P95 >5s
   ```

3. **Circuit Breaker State:**
   ```
   Target: All models CLOSED
   Monitor: GET /api/diagnosis/circuit-status
   Alert if: Any model OPEN >5 minutes
   ```

4. **Cache Hit Rate:**
   ```
   Target: >15% (L2 only, baseline)
   Monitor: metadata.fromCache ratio
   Expected: Gradual increase over time
   ```

---

## 🚨 INCIDENT RESPONSE

### High Error Rate (>5%):

**Check:**
1. Vercel Function logs: `/api/diagnosis/generate`
2. Error types: 401/429/503?
3. Circuit breaker status: Models OPEN?

**Action:**
- If specific model failing: OK (fallback handles)
- If ALL models failing: ROLLBACK + investigate
- If rate limiting: Check API keys valid

### High Latency (>10s):

**Check:**
1. DeepSeek API status: https://status.deepseek.com
2. Circuit breaker triggering too often?
3. Network issues Vercel → AI providers?

**Action:**
- If transient: Monitor, should self-recover
- If persistent: Check API provider status
- Consider adjusting circuit breaker thresholds

### Circuit Always OPEN:

**Check:**
1. API keys valid for all models?
2. Network connectivity?
3. Recent provider outages?

**Action:**
- Manual circuit reset: Document in next update
- Verify API keys in Vercel env vars
- Test each model individually

---

## 📞 ESCALATION CONTACTS

**Technical Issues:**
- Vercel Function Logs: Dashboard → Functions → Logs
- Circuit Status API: GET /api/diagnosis/circuit-status
- GitHub Issues: Report bugs if consistent

**Business Impact:**
- CEO: dr. Ferdi Iskandar (immediate escalation if critical)
- Development Team: Investigation + fix
- Rollback Authority: CEO or Tech Lead

---

## 🎉 NEXT STEPS AFTER ACTIVATION

### Immediate (Hari 3):
1. ✅ Enable Vercel env var (THIS STEP)
2. 🔲 Monitor initial traffic (1 hour)
3. 🔲 Test failure scenarios manually
4. 🔲 Validate circuit breaker behavior

### Short-Term (Hari 4-5):
5. 🔲 Internal team validation
6. 🔲 Collect feedback
7. 🔲 Analyze first 24h metrics
8. 🔲 Adjust thresholds if needed

### Medium-Term (Hari 6-10):
9. 🔲 Setup Upstash Redis (Fase 2)
10. 🔲 Implement L1 cache
11. 🔲 Cache warming cron
12. 🔲 Achieve 60%+ cache hit rate

---

## ✅ ACTIVATION COMPLETION CHECKLIST

- [x] Local .env.production updated
- [x] Git commit created & pushed
- [x] GitHub push successful
- [ ] **Vercel env var updated** ← **YOU ARE HERE**
- [ ] Deployment completed
- [ ] Testing checklist completed
- [ ] Monitoring active
- [ ] Team notified

---

## 💡 QUICK REFERENCE

**Vercel Dashboard URL:**
```
https://vercel.com/sentra-solutions/sentraai
```

**Environment Variables:**
```
Settings → Environment Variables → VITE_USE_SERVER_DIAGNOSIS
```

**Deployment Status:**
```bash
vercel ls
```

**Circuit Health:**
```bash
curl https://sentraai.vercel.app/api/diagnosis/circuit-status
```

**Latest Logs:**
```bash
vercel logs --follow
```

---

**Status:** ⚠️ AWAITING VERCEL ENV VAR UPDATE
**Next Action:** Update `VITE_USE_SERVER_DIAGNOSIS=true` in Vercel Dashboard
**ETA to Full Activation:** ~5 minutes after env var update
**Expected Improvement:** 90% error reduction upon activation
