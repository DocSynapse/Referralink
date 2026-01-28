# 📚 LESSONS LEARNED - API Debugging Best Practices

## Issue: "Unexpected token 'A', 'Authentica'... is not valid JSON"
**Date:** 2026-01-29
**Duration:** 4+ hours
**Status:** In systematic resolution

---

## ❌ WHAT WENT WRONG

### 1. **Reactive Instead of Systematic**
- Made changes without verifying previous fixes worked
- Didn't establish baseline testing methodology
- Jumped between different possible causes

### 2. **Assumptions Without Verification**
- Assumed deployment was successful (never verified)
- Assumed environment variables were set (never checked)
- Assumed testing on correct URL (never confirmed)

### 3. **No Incremental Testing**
- Changed multiple things at once
- Couldn't isolate which change caused issue
- No clear success/failure criteria per step

### 4. **Missing Diagnostics**
- No health check endpoint from start
- No logging to verify execution
- No simple test cases before complex ones

---

## ✅ CORRECT APPROACH (Applied Now)

### 1. **Start with Simplest Possible Test**
```typescript
// api/health.ts - No auth, no DB, just JSON response
export default (req, res) => {
  res.json({ success: true, message: "API works" });
}
```

**Why:** Isolates API routing from business logic

### 2. **Incremental Complexity**
1. ✅ Health endpoint (no auth, no DB) → Verifies routing
2. ✅ Test endpoint (no auth, no DB, hardcoded data) → Verifies JSON serialization
3. ✅ Simple auth endpoint (auth only) → Verifies authentication
4. ✅ Database endpoint (auth + DB) → Verifies database connection
5. ✅ Full endpoint (all logic) → Verifies complete flow

**Each step must pass before proceeding to next.**

### 3. **Verify Deployment**
Before any testing:
- [ ] Check Vercel dashboard shows "Ready"
- [ ] Verify commit hash matches latest push
- [ ] Note production URL explicitly
- [ ] Confirm environment variables are set

### 4. **Test in Correct Environment**

| Environment | URL | Has API Routes? | When to Use |
|------------|-----|-----------------|-------------|
| Vite dev (`npm run dev`) | localhost:5173 | ❌ NO | Frontend development only |
| Vercel dev (`vercel dev`) | localhost:3000 | ✅ YES | Full-stack local testing |
| Production | xxx.vercel.app | ✅ YES | Final testing |

**Common Mistake:** Testing on Vite dev server (localhost:5173) and expecting API routes to work.

### 5. **Structured Logging**
```typescript
export default (req, res) => {
  console.log('1. Handler called');
  console.log('2. Method:', req.method);
  console.log('3. Headers:', req.headers);

  // ... business logic with numbered log points

  console.log('N. Sending response');
  res.json({ success: true });
}
```

**Why:** Vercel function logs show exact execution point where failure occurs.

### 6. **Diagnostic Checklist**
Before debugging code, verify:
- [ ] Deployment successful
- [ ] Environment variables set
- [ ] Testing on correct URL
- [ ] Latest code is deployed
- [ ] Browser cache cleared

**80% of "code bugs" are actually environment/deployment issues.**

---

## 🎯 DEBUGGING METHODOLOGY

### Phase 1: Establish Known-Good Baseline
1. Deploy simplest possible endpoint
2. Verify it returns valid JSON
3. **Do not proceed until this works**

### Phase 2: Add Complexity Incrementally
1. Add one feature at a time
2. Test after each addition
3. If breaks, previous addition is culprit

### Phase 3: Add Proper Error Handling
```typescript
try {
  // business logic
} catch (error) {
  console.error('Detailed error:', error);
  return res.status(500).json({
    success: false,
    error: {
      code: 'SPECIFIC_ERROR_CODE',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }
  });
}
```

### Phase 4: Add Comprehensive Logging
- Log request received
- Log authentication result
- Log database query execution
- Log response being sent

**Logs are visible in Vercel Dashboard → Functions → [function-name]**

---

## 🔧 TOOLING BEST PRACTICES

### 1. **Health Check Endpoint** (Always)
```typescript
// api/health.ts
export default (req, res) => {
  res.json({
    success: true,
    timestamp: new Date().toISOString(),
    environment: {
      nodeVersion: process.version,
      hasDbUrl: !!process.env.DATABASE_URL
    }
  });
}
```

### 2. **Test Suite** (Before Production)
Create `test-api.html` with buttons to test each endpoint independently.

### 3. **Deployment Verification Script**
```bash
#!/bin/bash
# verify-deployment.sh

echo "1. Checking deployment status..."
vercel ls

echo "2. Testing health endpoint..."
curl https://myapp.vercel.app/api/health | jq

echo "3. Testing with auth..."
curl -H "Authorization: Bearer token" https://myapp.vercel.app/api/endpoint | jq
```

---

## 📋 PREVENTION CHECKLIST

For future API development, always:

- [ ] Start with health check endpoint
- [ ] Create test endpoints before complex logic
- [ ] Use structured logging with numbered steps
- [ ] Test incrementally (one feature at a time)
- [ ] Verify deployment before testing
- [ ] Document production URL explicitly
- [ ] Check environment variables in dashboard
- [ ] Test on correct environment (not Vite dev)
- [ ] Clear browser cache when testing
- [ ] Check Vercel function logs if error occurs

---

## 🎓 KEY TAKEAWAYS

1. **"It doesn't work" is not actionable**
   - Which endpoint?
   - Which environment?
   - What's the exact error?
   - What does the response actually say?

2. **Always establish baseline first**
   - Simplest endpoint must work
   - Then add complexity incrementally

3. **Logs are your friend**
   - Add logging before debugging
   - Numbered log points show execution flow

4. **Environment matters**
   - Vite dev ≠ Vercel dev ≠ Production
   - Know which environment you're testing

5. **Verify before assuming**
   - Deployment successful? Check dashboard
   - Env vars set? Check settings
   - Latest code deployed? Check commit hash

---

## 🔄 SYSTEMATIC APPROACH (Template)

When facing API issues:

```
1. VERIFY ENVIRONMENT
   - Deployment status: ?
   - Testing URL: ?
   - Latest commit: ?

2. TEST SIMPLEST CASE
   - curl /api/health
   - Expected: JSON
   - Actual: ?

3. IF STEP 2 FAILS:
   - Problem is deployment/routing
   - Fix: Check Vercel dashboard, check build logs

4. IF STEP 2 SUCCEEDS:
   - Add next feature incrementally
   - Test after each addition

5. USE LOGS
   - Vercel dashboard → Functions → View logs
   - Shows exact execution trace
```

---

## 💡 THIS SITUATION

**Root Cause (Hypothesis):**
Testing on localhost:5173 (Vite dev) which doesn't have API routes.

**How to Verify:**
1. Check Vercel deployment status
2. Test on production URL explicitly
3. Use `vercel dev` for local testing

**Prevention:**
- Always document which URL to test
- Create test suite that works on correct environment
- Add deployment verification to workflow

---

**Remember:** Most "bugs" are environment mismatches, not code errors.
