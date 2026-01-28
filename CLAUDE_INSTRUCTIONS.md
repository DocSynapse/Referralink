# Instruksi Claude untuk Referralink Project

> **Untuk Developer/AI Assistant yang bekerja di project ini**

---

## 📁 Project Overview

**Project**: Sentra Referralink - AI-Powered Clinical Decision Support System
**Tech Stack**: React 19 + TypeScript + Vite + TailwindCSS + Vercel
**Repository**: https://github.com/DocSynapse/Referralink
**Production**: https://referralink.vercel.app (akan migrate ke https://sentraai.id)

---

## 🎯 Project Purpose

Platform AI untuk:
1. **Diagnosis Assistance**: Generate ICD-10 codes dari gejala klinis
2. **Referral Management**: Rekomendasi rujukan RS yang sesuai
3. **Document Generation**: Auto-generate surat rujukan, keterangan sakit, keterangan sehat
4. **Clinical Intelligence**: AI-powered decision support untuk tenaga medis

---

## 🏗️ Architecture

### Frontend
```
src/
├── components/           # React components
│   ├── WaitlistPage.tsx # Main diagnosis & referral page (LARGE FILE ~3500 lines)
│   ├── AdminPanel.tsx   # Admin dashboard
│   ├── ui/             # Reusable UI components
│   └── ...
├── services/
│   ├── geminiService.ts # AI API integration (DeepSeek)
│   └── cacheService.ts  # IndexedDB caching
├── constants/          # Static data (ICD-10, hospitals, etc)
├── types/              # TypeScript definitions
└── App.tsx             # Main routing component
```

### Key Technologies
- **AI Provider**: DeepSeek API (via OpenRouter compatible endpoint)
- **State**: React useState/useEffect (no Redux)
- **Styling**: TailwindCSS v4 + custom neumorphism
- **Deployment**: Vercel (auto-deploy from main branch)
- **Caching**: IndexedDB untuk diagnosis results

---

## 🔑 Environment Variables

### Required Variables

```bash
# AI Configuration
VITE_DEEPSEEK_API_KEY=sk-xxxxx    # DeepSeek API key
VITE_API_BASE_URL=https://api.deepseek.com
VITE_AI_MODEL_NAME=deepseek-chat

# Optional
VITE_AUTH_PASSWORD=123456          # Simple auth for admin panel
```

### Setup Local Environment

```bash
# 1. Clone repository
git clone https://github.com/DocSynapse/Referralink
cd referralink

# 2. Copy .env.example to .env
cp .env.example .env

# 3. Edit .env dengan API key yang valid
nano .env

# 4. Install dependencies
npm install

# 5. Run development server
npm run dev
```

---

## 🚀 Development Workflow

### Local Development

```bash
# Start dev server (dengan hot reload)
npm run dev
# http://localhost:3000

# Build production
npm run build

# Preview production build
npm run preview
# http://localhost:4173
```

### Git Workflow

```bash
# Always pull latest before work
git pull origin main

# Create feature branch (optional)
git checkout -b feature/nama-fitur

# Make changes, then commit
git add .
git commit -m "feat: deskripsi singkat perubahan"

# Push to GitHub
git push origin main

# Auto-deploy to Vercel (triggered by push)
```

### Commit Message Convention

```
feat: new feature
fix: bug fix
refactor: code refactoring
style: formatting, no code change
docs: documentation update
chore: maintenance tasks
```

---

## 🔧 Common Tasks

### 1. Menambah Fitur Baru di WaitlistPage

**File**: `components/WaitlistPage.tsx` (⚠️ LARGE FILE 3500+ lines)

**Best Practice**:
- Read file dengan offset/limit untuk menghindari token limit
- Search pattern terlebih dahulu dengan Grep tool
- Edit hanya section yang diperlukan

```typescript
// Example: Add new modal
const [showNewModal, setShowNewModal] = useState(false);

// Add modal component di akhir file sebelum export
const NewModal = ({ onClose }: { onClose: () => void }) => {
  return (
    <div className="fixed inset-0 z-50 ...">
      {/* Modal content */}
    </div>
  );
};
```

### 2. Mengubah AI Model/Provider

**File**: `services/geminiService.ts`

```typescript
// Change model
export const AI_MODELS = {
  DEEPSEEK_V3: {
    id: 'deepseek/deepseek-chat',
    name: 'DeepSeek V3',
    provider: 'DeepSeek'
  },
  // Add new model here
};

// Set default model
let currentModel: AIModelKey = 'DEEPSEEK_V3';
```

### 3. Update ICD-10 Data

**File**: `constants/index.ts`

```typescript
export const NON_REFERRAL_DIAGNOSES = [
  'J00', 'J06.9', // Add/remove codes here
];
```

### 4. Styling Changes

**Global Styles**: `index.css`
**Component Styles**: Inline TailwindCSS classes

```tsx
// Neumorphism style constants
const tokens = {
  dark: '#002147',      // Oxford Blue
  coral: '#FF5349',     // Coral Red
  gray: '#64748b',      // Slate Gray
  // ...
};
```

---

## ⚠️ Common Issues & Solutions

### Issue 1: Loading Diagram Tidak Muncul

**Cause**: Response terlalu cepat, state update before animation

**Fix**: Sudah di-handle dengan minimum loading time 1200ms di `handleGenerate()`

### Issue 2: WhatsAppIcon Undefined

**Cause**: Missing component import

**Fix**: Sudah di-fix dengan custom `WhatsAppIcon` component menggunakan `MessageCircle` dari lucide-react

### Issue 3: JSON Parse Error dari AI

**Cause**: AI response malformed atau ada extra text

**Fix**: Sudah di-handle dengan regex extraction dan try-catch di `geminiService.ts`

### Issue 4: Blank Page di Production

**Cause**:
1. Browser cache
2. Environment variables missing/corrupt
3. Build error

**Fix**:
```bash
# 1. Hard refresh browser
Ctrl + Shift + R

# 2. Check Vercel env vars
vercel env pull

# 3. Rebuild & redeploy
npm run build
vercel deploy --prod --yes
```

---

## 🧪 Testing Guidelines

### Manual Testing Checklist

**Sebelum Deploy:**

- [ ] **Homepage** loads tanpa error
- [ ] **Referralink page** (`/#/referralink`) accessible
- [ ] **Generate diagnosis** works:
  - [ ] Loading animation muncul ~1.2s
  - [ ] Result tampil dengan 3 opsi ICD-10
  - [ ] No console errors
- [ ] **Modal forms** buka/tutup tanpa crash:
  - [ ] Surat Keterangan Sakit
  - [ ] Surat Keterangan Sehat
  - [ ] Formulir Rujukan
- [ ] **Browser compatibility**:
  - [ ] Chrome/Edge
  - [ ] Firefox
  - [ ] Safari (jika tersedia)

### API Testing

```bash
# Test DeepSeek API key
curl -X POST https://api.deepseek.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-xxxxx" \
  -d '{
    "model": "deepseek-chat",
    "messages": [{"role": "user", "content": "test"}],
    "max_tokens": 10
  }'
```

---

## 📊 Performance Optimization

### Current Bundle Size

```
index.js: 708 kB (222 kB gzipped)
```

**Status**: ✅ Acceptable untuk SPA
**Future Optimization**: Code splitting dengan dynamic imports (optional)

### Caching Strategy

1. **Diagnosis Results**: Cached di IndexedDB (per query)
2. **Static Assets**: Cached oleh browser (Vercel CDN)
3. **API Responses**: No server-side cache (always fresh)

---

## 🔐 Security Considerations

### API Key Safety

⚠️ **CRITICAL**: API key di environment variables, **NEVER** commit ke Git

```bash
# .gitignore already includes:
.env
.env.local
.env.production
```

### CORS & API Endpoint

```typescript
// geminiService.ts uses dangerouslyAllowBrowser: true
// ✅ OK for client-side API calls
// ⚠️ API key exposed in network requests (unavoidable in browser)
```

**Recommendation**: Consider backend proxy untuk production (future improvement)

---

## 📝 Code Style Guidelines

### TypeScript

```typescript
// Use explicit types
const handleGenerate = async (): Promise<void> => {
  // ...
};

// Avoid 'any'
const response: ICD10Result = await searchICD10Code(...);
```

### React Components

```typescript
// Functional components with TypeScript
interface Props {
  onClose: () => void;
  data: SomeData;
}

const MyComponent: React.FC<Props> = ({ onClose, data }) => {
  return <div>...</div>;
};
```

### Styling

```tsx
// Use TailwindCSS classes
<div className="px-6 py-4 rounded-xl bg-white shadow-lg">

// Inline styles untuk dynamic values
<div style={{ backgroundColor: tokens.coral }}>
```

---

## 🚨 Emergency Procedures

### Rollback Deployment

```bash
# Check recent commits
git log --oneline -10

# Rollback to specific commit
git reset --hard <commit-hash>
git push origin main --force

# Vercel akan auto-deploy rollback version
```

### Quick Fix Workflow

```bash
# 1. Identify issue dari error logs
vercel logs --prod

# 2. Fix locally
# ... make changes ...

# 3. Test locally
npm run build && npm run preview

# 4. Deploy fix
git add .
git commit -m "fix: deskripsi bug fix"
git push origin main

# 5. Monitor Vercel deployment
# Check https://vercel.com/sentra-solutions/referralink
```

---

## 📞 Support & Resources

### Documentation

- **React**: https://react.dev
- **TypeScript**: https://www.typescriptlang.org/docs
- **TailwindCSS**: https://tailwindcss.com/docs
- **Vite**: https://vitejs.dev/guide
- **Vercel**: https://vercel.com/docs

### Internal Resources

- **GitHub Repo**: https://github.com/DocSynapse/Referralink
- **Vercel Dashboard**: https://vercel.com/sentra-solutions/referralink
- **Domain Setup**: Lihat `SETUP_DOMAIN.md`

### Contact

- **Tech Lead**: dr. Ferdi Iskandar
- **Repository Issues**: https://github.com/DocSynapse/Referralink/issues

---

## 🎓 Knowledge Base

### Important Files to Understand

1. **WaitlistPage.tsx** (3500+ lines)
   - Main feature page
   - Contains all diagnosis logic
   - Multiple modals & forms

2. **geminiService.ts**
   - AI API integration
   - Caching logic
   - Error handling

3. **App.tsx**
   - Routing logic
   - Main layout
   - State management

4. **index.css**
   - Global styles
   - Animation keyframes
   - Theme variables

### Key Concepts

- **Neumorphism Design**: Soft UI dengan subtle shadows
- **Oxford Blue (#002147)**: Primary brand color
- **Coral Red (#FF5349)**: Accent color
- **Geist Font**: Primary typography
- **Clinical Safety**: Always validate medical data

---

## 📅 Changelog

### 2026-01-28
- ✅ Fixed loading diagram animation
- ✅ Fixed WhatsAppIcon undefined error
- ✅ Improved JSON parsing error handling
- ✅ Updated favicon to Sentra logo
- ✅ Cleaned API key configuration

### Future Roadmap
- [ ] Code splitting untuk bundle optimization
- [ ] Backend proxy untuk API key security
- [ ] Automated testing (Vitest/Playwright)
- [ ] Performance monitoring (Sentry/LogRocket)

---

**Last Updated**: 2026-01-28
**Maintainer**: Sentra Healthcare Solutions
**Status**: ✅ Production Ready
