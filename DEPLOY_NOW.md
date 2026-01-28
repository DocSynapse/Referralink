# 🚀 DEPLOY NOW - Quick Start (5 Minutes)

## Prerequisites
- ✅ GitHub account dengan repo ReferraLink
- ✅ Vercel account (free tier OK)
- ✅ Latest code pushed to main branch

---

## Step 1: Deploy to Vercel (2 min)

1. **Visit:** https://vercel.com/new
2. **Import:** `DocSynapse/Referralink`
3. **Configure:**
   - Framework: Vite
   - Build: `npm run build`
   - Output: `dist`
4. **Add Env Vars:**
   ```
   VITE_APP_URL = https://referralink.vercel.app
   VITE_AUTH_PASSWORD = 123456
   ```
5. **Click:** Deploy
6. **Wait:** 2-3 minutes

✅ **Result:** Frontend live at https://referralink.vercel.app

---

## Step 2: Create Database (2 min)

1. **Go to:** Vercel Dashboard → Your Project
2. **Click:** Storage tab → Create Database
3. **Select:** Postgres
4. **Name:** `referralink-db`
5. **Region:** `sin1` (Singapore) or closest
6. **Click:** Create
7. **Click:** Connect to Project → Select `referralink` → Production

✅ **Result:** Database created, `POSTGRES_URL` auto-added

---

## Step 3: Upload Schema (1 min)

1. **Go to:** Storage → Your Database → Query tab
2. **Open:** `database/schema.sql` di local
3. **Copy:** Seluruh isi file
4. **Paste:** Di query editor
5. **Click:** Run Query

✅ **Result:** 5 tables created (medical_professionals, role_permissions, verification_logs, user_sessions, audit_logs)

---

## ✅ DONE! Test Deployment

### Test 1: Homepage
- Visit: https://referralink.vercel.app
- Should load normally ✓

### Test 2: Admin Login
1. Click "Enter" button
2. Tab "SIMPLE ADMIN"
3. Username: `doc`
4. Password: `123456`
5. Should see 4 admin cards ✓

### Test 3: Admin Panel
1. Click any admin card (e.g., "All Users")
2. Modal opens with user list ✓
3. Should show mock data initially ✓

### Test 4: Registration
1. Click "Enter" → "REGISTER"
2. Fill form:
   - Name: Test Doctor
   - Email: test@example.com
   - License: Doctor - SIP.TEST123
   - Institution: Test Hospital
   - Phone: 08123456789
   - Password: TestPass@123456
3. Click "Register"
4. Should get success message ✓
5. Check admin panel → User appears ✓

---

## 🎉 Production Ready!

Your deployment is now live with:
- ✅ Frontend + Backend API
- ✅ Postgres Database
- ✅ Admin Panel
- ✅ Registration System

**Next:** Invite 10 beta testers!

---

## 🆘 Problems?

### API errors?
- Check: Vercel → Project → Logs
- Verify: `POSTGRES_URL` exists in env vars

### Database errors?
- Re-run schema.sql in Query tab
- Check: Tables exist with `SELECT tablename FROM pg_tables WHERE schemaname = 'public';`

### Frontend blank?
- Clear browser cache
- Check: Browser console for errors
- Verify: Build succeeded in Vercel logs

---

**Total Time:** ~5 minutes
**Cost:** $0 (Vercel free tier + Postgres 256MB free)

Ready? **Start with Step 1!** 🚀
