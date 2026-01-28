# 🚀 Claude Quick Start - Sentra Referralink

> **Drop file ini ke Claude untuk instant project context!**

---

## 📍 Project Location

**Local**: `D:\sentrasolutions\referralink`
**GitHub**: https://github.com/DocSynapse/Referralink
**Production**: https://referralink.vercel.app
**Future**: https://sentraai.id (setup pending)

---

## 🎯 What is This?

**Sentra Referralink** = AI-Powered Clinical Decision Support System

**Features**:
1. ✅ Generate ICD-10 diagnosis dari gejala klinis
2. ✅ Rekomendasi rujukan RS yang sesuai
3. ✅ Auto-generate surat rujukan/keterangan sakit/sehat
4. ✅ Loading animation dengan AI flow diagram

**Tech Stack**:
- React 19 + TypeScript + Vite
- TailwindCSS v4 (Neumorphism design)
- DeepSeek AI API (via OpenRouter compatible)
- Vercel deployment (auto-deploy dari main branch)

---

## ⚡ Quick Commands

```bash
# Navigate to project
cd D:\sentrasolutions\referralink

# Development
npm run dev              # http://localhost:3000

# Build & Preview
npm run build
npm run preview          # http://localhost:4173

# Deployment
git add .
git commit -m "feat: your changes"
git push origin main     # Auto-deploy to Vercel

# Manual Vercel deploy
vercel deploy --prod --yes
```

---

## 🔑 Environment Variables

**File**: `.env` (already configured)

```bash
VITE_DEEPSEEK_API_KEY=sk-1816b24b5037439ea5b36c847eba65af
VITE_API_BASE_URL=https://api.deepseek.com
VITE_AI_MODEL_NAME=deepseek-chat
VITE_AUTH_PASSWORD=123456
```

**Vercel Production**: Same values (sudah di-set)

---

## 📁 Key Files (READ THESE FIRST!)

### 1. **Documentation** 📚
- `CLAUDE_INSTRUCTIONS.md` - **BACA INI DULU!** Complete dev guide
- `BETA_TESTING_FLOW.md` - Beta tester system specs
- `SETUP_DOMAIN.md` - Domain setup guide

### 2. **Core Application Files**
- `App.tsx` - Main routing & layout (400 lines)
- `components/WaitlistPage.tsx` - **MAIN PAGE** (3500+ lines!)
  - ⚠️ **HUGE FILE**: Use Grep/Read with offset when working on this
  - Contains: Diagnosis logic, modals, forms, all features
- `services/geminiService.ts` - AI API integration
- `index.css` - Global styles & animations

### 3. **Important Directories**
```
D:\sentrasolutions\referralink\
├── components/          # React components
│   ├── WaitlistPage.tsx    # MAIN (3500 lines!)
│   ├── AdminPanel.tsx      # Admin dashboard
│   └── ui/                 # Reusable UI components
├── services/
│   ├── geminiService.ts    # AI API calls
│   └── cacheService.ts     # IndexedDB caching
├── constants/          # ICD-10, hospitals data
├── types/              # TypeScript definitions
└── public/             # Static assets (images, SVG)
```

---

## 🐛 Recent Fixes (DON'T BREAK THESE!)

### ✅ **Loading Diagram Animation** (Fixed 2026-01-28)
- **File**: `WaitlistPage.tsx` line ~461
- **Issue**: Diagram hilang terlalu cepat
- **Fix**: Minimum loading display 1200ms dengan setTimeout
- **Status**: ✅ WORKING di production

```typescript
// handleGenerate() di WaitlistPage.tsx
const MIN_LOADING_DISPLAY = 1200;
// ... delay logic dengan setTimeout (JANGAN UBAH!)
```

### ✅ **WhatsAppIcon Component** (Fixed 2026-01-28)
- **File**: `WaitlistPage.tsx` line ~13
- **Issue**: WhatsAppIcon was undefined → blank page
- **Fix**: Added custom component using MessageCircle
- **Status**: ✅ WORKING

```typescript
// Di top of WaitlistPage.tsx
const WhatsAppIcon = ({ size, style }) => (
  <MessageCircle size={size} style={style} />
);
```

### ✅ **JSON Parse Error Handling** (Fixed 2026-01-28)
- **File**: `services/geminiService.ts` line ~183
- **Issue**: Malformed AI response crashed app
- **Fix**: Regex extraction + try-catch
- **Status**: ✅ WORKING

---

## 🚨 CRITICAL RULES

### 1. **WaitlistPage.tsx is HUGE (3500+ lines)**
```bash
# DON'T read entire file at once!
# Use Grep to find what you need first:
grep -n "function handleGenerate" components/WaitlistPage.tsx

# Then Read with offset:
Read file offset=460 limit=50
```

### 2. **NEVER Block Event Loop**
```typescript
// ❌ BAD: Blocking await in UI flow
await new Promise(resolve => setTimeout(resolve, 1000));
setIsLoading(false); // This blocks UI!

// ✅ GOOD: Non-blocking setTimeout
setTimeout(() => {
  setIsLoading(false);
}, 1000);
```

### 3. **Always Test Locally Before Deploy**
```bash
npm run build && npm run preview
# Test di http://localhost:4173
# Kalau OK, baru push ke GitHub
```

### 4. **Animation Keyframes sudah ada di index.css**
```css
/* JANGAN buat keyframes baru tanpa cek dulu! */
@keyframes fadeInSmooth { ... }    /* ✅ Ada */
@keyframes springIn { ... }        /* ✅ Ada */
@keyframes flowingDash { ... }     /* ✅ Ada */
```

---

## 🎨 Design System

### Colors (Design Tokens)
```typescript
const tokens = {
  dark: '#002147',      // Oxford Blue (primary)
  coral: '#FF5349',     // Coral Red (accent)
  gray: '#64748b',      // Slate Gray
  bgLight: '#f8fafc',   // Light background
  border: '#e2e8f0'     // Border color
};
```

### Typography
- **Primary Font**: Geist (sans-serif)
- **Mono Font**: JetBrains Mono
- **Signature Font**: Satisfy / Caveat

### Style
- **Design Language**: Neumorphism (soft shadows)
- **Animation**: Smooth, subtle (no jarring transitions)
- **Responsiveness**: Mobile-first

---

## 🔧 Common Tasks

### Add New Feature to WaitlistPage
1. Search untuk pattern yang relevan dengan Grep
2. Read section yang perlu dimodifikasi (dengan offset)
3. Edit hanya yang diperlukan
4. Test locally
5. Commit & push

### Fix Bug
1. **Lihat console error** di browser (F12)
2. Search error message di codebase dengan Grep
3. Read context around error (±20 lines)
4. Fix & test locally
5. Commit dengan prefix `fix:`

### Update AI Model/Prompt
1. Edit `services/geminiService.ts`
2. Change `AI_MODELS` or `SYSTEM_INSTRUCTION_REFERRAL`
3. Test dengan sample diagnosis
4. Deploy

---

## 📊 Database (Future - Beta Testing)

**Recommendation**: Vercel Postgres

**Setup**:
1. Vercel Dashboard → Storage → Create Database → Postgres
2. Run schema from `BETA_TESTING_FLOW.md`
3. Create API routes: `/api/beta-testers/*`

**Schema Ready**: See `BETA_TESTING_FLOW.md` for complete SQL

---

## 🌐 Domain Setup (Pending)

**Target**: Migrate dari `referralink.vercel.app` → `sentraai.id`

**Guide**: `SETUP_DOMAIN.md` (complete step-by-step)

**DNS Provider**: [TBD - Cloudflare/Namecheap/GoDaddy]

**Estimated Time**: 15-30 menit setup

---

## 🐞 Known Issues (None Currently!)

**Status**: ✅ All critical bugs fixed

**Last Major Fixes** (2026-01-28):
- ✅ Loading animation fixed
- ✅ WhatsAppIcon fixed
- ✅ JSON parse error handling fixed
- ✅ API key configured properly

---

## 📞 Quick References

### Git Workflow
```bash
# Always pull first
git pull origin main

# Make changes, then:
git add .
git commit -m "type: description"
git push origin main

# Commit types:
# feat: new feature
# fix: bug fix
# refactor: code improvement
# docs: documentation
# style: formatting
# chore: maintenance
```

### Vercel Commands
```bash
# Check env vars
vercel env ls

# Pull env to local
vercel env pull

# Deploy
vercel deploy --prod --yes

# View logs
vercel logs --prod
```

### Debug Checklist
1. ✅ Check browser console (F12)
2. ✅ Check Vercel deployment logs
3. ✅ Verify environment variables
4. ✅ Test in incognito (clear cache)
5. ✅ Compare with localhost behavior

---

## 🎯 Current Status (2026-01-28)

### ✅ Working
- Homepage dengan portfolio selection
- Referralink page dengan diagnosis generator
- Loading animation (smooth 1.2s dengan flow diagram)
- Generate ICD-10 dari gejala
- Rekomendasi rujukan RS
- Surat keterangan sakit/sehat modals
- API integration dengan DeepSeek
- Production deployment di Vercel

### 🚧 Pending
- Custom domain: sentraai.id
- Beta tester registration system
- Database setup (Vercel Postgres)
- Email automation (SendGrid/Resend)
- Analytics tracking

### 📋 Next Sprint
1. Setup Vercel Postgres database
2. Implement beta tester registration form
3. Build admin approval dashboard
4. Setup email notifications
5. Migrate to sentraai.id domain

---

## 💡 Pro Tips

### For Claude Code
1. **Use Grep before Read** - WaitlistPage.tsx is huge!
2. **Test locally first** - `npm run preview` sebelum deploy
3. **Read docs first** - `CLAUDE_INSTRUCTIONS.md` has everything
4. **Don't break working features** - loading animation & modals sudah fix!
5. **Use git log** - `git log --oneline -10` to see recent changes

### For Development
1. **Hard refresh** after deploy: `Ctrl + Shift + R`
2. **Clear IndexedDB cache** jika diagnosis results stuck
3. **Check Vercel logs** jika production error: `vercel logs`
4. **Use incognito** untuk test clean state
5. **Mobile test** - app harus responsive

---

## 📚 Full Documentation

**For detailed info**, read these in order:

1. **`CLAUDE_INSTRUCTIONS.md`** (30 min read)
   - Complete developer guide
   - Architecture deep-dive
   - Common issues & solutions

2. **`BETA_TESTING_FLOW.md`** (20 min read)
   - Beta tester system specs
   - Registration & approval flow
   - Database schema & email templates

3. **`SETUP_DOMAIN.md`** (10 min read)
   - Custom domain setup guide
   - DNS configuration
   - SSL/HTTPS setup

---

## 🚀 Start Developing NOW

```bash
# 1. Open project
cd D:\sentrasolutions\referralink

# 2. Start dev server
npm run dev

# 3. Open browser
# http://localhost:3000

# 4. Read full docs while app running
# Start with: CLAUDE_INSTRUCTIONS.md

# 5. Make changes & test locally
# 6. When ready: git add, commit, push
# 7. Auto-deploy to Vercel!
```

---

## ✅ Checklist - First 10 Minutes

- [ ] `cd D:\sentrasolutions\referralink`
- [ ] `npm run dev` to start server
- [ ] Read `CLAUDE_INSTRUCTIONS.md` (full dev guide)
- [ ] Check `git log --oneline -10` (recent changes)
- [ ] Open browser to http://localhost:3000
- [ ] Test: Generate diagnosis di Referralink page
- [ ] Verify: Loading animation muncul ~1.2s
- [ ] Confirm: No console errors (F12)

---

**Status**: ✅ Production Ready
**Last Updated**: 2026-01-28
**Maintainer**: Sentra Healthcare Solutions
**Emergency Contact**: dr. Ferdi Iskandar

---

🎉 **READY TO CODE!** Drop this file to Claude and start developing immediately!
