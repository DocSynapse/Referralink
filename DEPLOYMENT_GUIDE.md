# 🚀 Deployment Guide - Vercel + Postgres

## Overview
Deploy ReferraLink dengan full backend API dan database untuk production.

---

## ✅ Pre-Deployment Checklist

### 1. Repository Status
- [x] All code committed and pushed to GitHub
- [x] Latest commit: `a2b7056` (admin panel refactor)
- [x] Working tree clean
- [x] Branch: `main`

### 2. Files Ready
- [x] `vercel.json` - API routing configured
- [x] `database/schema.sql` - Database schema ready
- [x] `api/*` - 5 serverless functions ready
- [x] `.gitignore` - Protects sensitive files

### 3. Environment Variables Needed
```env
# Required for Production
POSTGRES_URL=          # From Vercel Postgres
VITE_APP_URL=          # https://referralink.vercel.app
VITE_AUTH_PASSWORD=    # Simple admin password (backward compatibility)

# Optional (for beta testing, can add later)
RESEND_API_KEY=        # Email service (optional for now)
KEMENKES_API_KEY=      # License verification (optional for now)
```

---

## 📋 Step-by-Step Deployment

### Step 1: Deploy to Vercel

#### Option A: Using Vercel Dashboard (Recommended)
1. **Go to Vercel Dashboard**
   - URL: https://vercel.com
   - Login dengan GitHub account

2. **Import Project**
   - Click "Add New..." → "Project"
   - Select repository: `DocSynapse/Referralink`
   - Framework: Vite
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `dist`

3. **Configure Environment Variables** (di Settings)
   ```
   VITE_APP_URL = https://referralink.vercel.app
   VITE_AUTH_PASSWORD = [your-admin-password]
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes
   - Note the deployment URL

#### Option B: Using Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod

# Follow prompts:
# - Link to existing project? Yes → referralink
# - Deploy? Yes
```

---

### Step 2: Create Postgres Database

1. **Go to Vercel Dashboard**
   - Navigate to your project
   - Click "Storage" tab

2. **Create Postgres Database**
   - Click "Create Database"
   - Select "Postgres"
   - Database Name: `referralink-db`
   - Region: Choose closest to your users (e.g., `sin1` for Singapore)
   - Click "Create"

3. **Connect to Project**
   - Click "Connect to Project"
   - Select your project: `referralink`
   - Environment: `Production`
   - Click "Connect"

4. **Note Connection String**
   - Vercel will auto-add these env vars:
     - `POSTGRES_URL`
     - `POSTGRES_PRISMA_URL`
     - `POSTGRES_URL_NON_POOLING`
     - `POSTGRES_USER`
     - `POSTGRES_HOST`
     - `POSTGRES_PASSWORD`
     - `POSTGRES_DATABASE`

---

### Step 3: Upload Database Schema

#### Option A: Using Vercel Postgres Dashboard
1. Go to Storage → Your Database
2. Click "Query" tab
3. Copy contents of `database/schema.sql`
4. Paste into query editor
5. Click "Run Query"
6. Verify tables created:
   ```sql
   SELECT tablename FROM pg_tables WHERE schemaname = 'public';
   ```
   Should show:
   - medical_professionals
   - role_permissions
   - verification_logs
   - user_sessions
   - audit_logs

#### Option B: Using psql CLI
```bash
# Get connection string from Vercel Dashboard
export POSTGRES_URL="postgres://..."

# Upload schema
psql $POSTGRES_URL < database/schema.sql

# Verify
psql $POSTGRES_URL -c "SELECT tablename FROM pg_tables WHERE schemaname = 'public';"
```

---

### Step 4: Verify Deployment

1. **Check Frontend**
   - Visit: https://referralink.vercel.app
   - Should load normally
   - Check diagnosis feature works
   - Check Smart Automation cards work

2. **Check Admin Access**
   - Click "Enter" button
   - Go to "SIMPLE ADMIN" tab
   - Username: `doc`
   - Password: `[VITE_AUTH_PASSWORD]`
   - Should see 4 admin cards
   - Click any card → Modal should open

3. **Check API Endpoints** (using browser DevTools Network tab)
   - Open admin modal
   - Should see API call to `/api/admin/users`
   - Check response (will use mock data until real registrations)

4. **Test Registration Flow**
   - Click "Enter" → "REGISTER" tab
   - Fill form:
     - Full Name: Test User
     - Email: test@example.com
     - License Type: Doctor
     - License Number: SIP.TEST123
     - Institution: Test Hospital
     - Phone: 08123456789
     - Password: TestPass@123456
   - Click "Register"
   - Check browser console for success message

---

## 🧪 Testing Checklist

### Basic Functionality
- [ ] Homepage loads
- [ ] Diagnosis feature works
- [ ] Generate ICD-10 codes
- [ ] Sick leave modal opens
- [ ] Health cert modal opens
- [ ] Referral modal opens

### Admin Features
- [ ] Simple admin login works
- [ ] 4 admin cards visible (after admin login)
- [ ] "All Users" modal opens
- [ ] "Pending" modal opens
- [ ] "Verified" modal opens
- [ ] "Active" modal opens
- [ ] Modal shows mock/real data

### Registration System
- [ ] Register form opens
- [ ] Form validation works
- [ ] Registration submits successfully
- [ ] API returns success response
- [ ] User appears in admin panel (if real DB)

---

## 🔧 Post-Deployment Configuration

### 1. Update Environment Variables (if needed)
```bash
# Using Vercel CLI
vercel env add RESEND_API_KEY production

# Or use Dashboard → Settings → Environment Variables
```

### 2. Enable Email Service (Optional - for beta testing)
1. Sign up for Resend: https://resend.com
2. Get API key
3. Add to Vercel env vars: `RESEND_API_KEY`
4. Redeploy project

### 3. Monitor Logs
```bash
# Using Vercel CLI
vercel logs --follow

# Or use Dashboard → Logs tab
```

---

## 🐛 Troubleshooting

### Issue: API returns 500 errors
**Fix:**
1. Check Vercel logs: `vercel logs`
2. Verify `POSTGRES_URL` env var exists
3. Verify database schema uploaded correctly
4. Check API file syntax errors

### Issue: "Module not found" errors
**Fix:**
1. Verify `package.json` has all dependencies
2. Run locally: `npm install`
3. Commit `package-lock.json`
4. Redeploy

### Issue: CORS errors
**Fix:**
1. Verify `vercel.json` has CORS headers
2. Check API route returns proper headers
3. Redeploy

### Issue: Registration fails
**Fix:**
1. Open browser DevTools → Network tab
2. Check API request/response
3. Verify email format, password strength
4. Check database connection

### Issue: Admin panel shows no users
**Fix:**
1. This is normal if no real registrations yet
2. Mock data should appear in local dev
3. In production, register a test user
4. User should appear in "All Users" modal

---

## 📊 Database Management

### View All Users
```sql
SELECT
  full_name, email, license_type, license_number,
  email_verified, license_verified, onboarding_completed,
  created_at
FROM medical_professionals
ORDER BY created_at DESC;
```

### Count Users by Status
```sql
SELECT
  COUNT(*) FILTER (WHERE email_verified = FALSE OR license_verified = FALSE) as pending,
  COUNT(*) FILTER (WHERE email_verified = TRUE AND license_verified = TRUE AND onboarding_completed = FALSE) as verified,
  COUNT(*) FILTER (WHERE onboarding_completed = TRUE) as active,
  COUNT(*) as total
FROM medical_professionals;
```

### View Recent Registrations
```sql
SELECT
  full_name, email, role, created_at
FROM medical_professionals
WHERE created_at > NOW() - INTERVAL '7 days'
ORDER BY created_at DESC;
```

---

## 🔐 Security Notes

### What's Protected
- ✅ Passwords hashed with PBKDF2-SHA256 (600k iterations)
- ✅ Rate limiting on registration/login (5 attempts per 15 min)
- ✅ SQL injection protection (parameterized queries)
- ✅ XSS protection (input sanitization)
- ✅ Session tokens with 7-day expiry
- ✅ CORS configured properly

### Environment Variables
- ✅ `.env*` files in `.gitignore`
- ✅ Secrets managed via Vercel dashboard
- ✅ No hardcoded credentials in code

### Next Steps for Production
- ⏳ Add KEMENKES API for real license verification
- ⏳ Enable email service for verification emails
- ⏳ Add Redis for distributed rate limiting
- ⏳ Security audit before full launch

---

## 📈 Monitoring

### Key Metrics to Watch
1. **API Response Times**
   - Registration endpoint: <2s
   - Login endpoint: <1s
   - Admin users endpoint: <1s

2. **Database Performance**
   - Query response time: <500ms
   - Connection pool utilization
   - Table sizes

3. **Error Rates**
   - API 5xx errors: <0.1%
   - Failed registrations: Monitor reasons
   - Failed logins: Monitor attempts

### Vercel Analytics
- Enable in Dashboard → Analytics
- Track page views, performance, Web Vitals
- Monitor API endpoint usage

---

## ✅ Deployment Complete!

Your production deployment should now be live with:
- ✅ Frontend deployed and accessible
- ✅ 5 API endpoints operational
- ✅ Postgres database created
- ✅ Database schema uploaded
- ✅ Admin panel functional
- ✅ Registration system ready

**Next:** Test with 10 beta users and gather feedback!

---

## 🆘 Support

### Quick Links
- Vercel Dashboard: https://vercel.com/dashboard
- GitHub Repo: https://github.com/DocSynapse/Referralink
- Vercel Docs: https://vercel.com/docs
- Postgres Docs: https://vercel.com/docs/storage/vercel-postgres

### Contact
- Issues: GitHub Issues
- Questions: Project documentation files

---

**Last Updated:** 2026-01-29
**Version:** 1.0.0
**Status:** Production Ready
