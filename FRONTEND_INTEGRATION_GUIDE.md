# Frontend Integration Guide - Auth & Admin Upgrade

## 🎯 Overview

Upgrade existing auth panel dengan full backend integration + extend AdminPanel dengan user management.

**Yang Sudah Dibuat**:
1. ✅ `services/authService.ts` - API integration layer
2. ✅ `components/AuthPanel.tsx` - Upgraded auth (Login + Register + Simple Admin)
3. ✅ `components/AdminPanelExtended.tsx` - Extended admin panel (Certificates + User Management)

---

## 📋 Integration Steps

### Step 1: Replace Auth Panel di App.tsx

**Current** (App.tsx lines 93-125, 433-484):
```tsx
// Old auth panel dengan hardcoded check
const handleAuthSubmit = async (e?: React.FormEvent) => {
  // Simple local gate; replace with backend auth when available
  const normalizedUser = authUsername.trim().toLowerCase();
  const isValid = normalizedUser === "doc" &&
    authPassword.trim() === (import.meta.env.VITE_AUTH_PASSWORD || "123456");
  // ...
}
```

**New** (Replace dengan):
```tsx
import { AuthPanel } from './components/AuthPanel';
import { isAuthenticated, logoutUser } from './services/authService';

// Replace state variables
const [showAuthPanel, setShowAuthPanel] = useState(false);

// Replace auth UI section (around line 433)
{showAuthPanel && (
  <AuthPanel
    onClose={() => setShowAuthPanel(false)}
    onSuccess={() => {
      setShowAuthPanel(false);
      // Refresh or redirect as needed
      window.location.reload();
    }}
  />
)}

// Add logout button (optional)
{isAuthenticated() && (
  <button onClick={() => { logoutUser(); window.location.reload(); }}>
    Logout
  </button>
)}
```

---

### Step 2: Replace AdminPanel dengan AdminPanelExtended

**Current** (App.tsx line 16):
```tsx
import { AdminPanel } from './components/AdminPanel';
```

**New**:
```tsx
import { AdminPanelExtended } from './components/AdminPanelExtended';
```

Then replace usage (search for `<AdminPanel />` dan ganti dengan `<AdminPanelExtended />`).

---

### Step 3: Add Environment Variable

Add ke `.env.local`:
```env
# API Base URL (leave empty for same-origin)
VITE_API_BASE_URL=

# Legacy admin password (untuk backward compatibility)
VITE_AUTH_PASSWORD=123456
```

---

### Step 4: Install Dependencies (Jika Belum)

```bash
npm install @vercel/postgres @vercel/node
npm install  # Update existing packages
```

---

## 🎨 Design Consistency

Components baru menggunakan **existing design system**:
- ✅ Neumorphic style (`neu-flat`, `neu-pressed`)
- ✅ Color scheme (oxford, accent, slate)
- ✅ Typography (font-display, uppercase tracking)
- ✅ Same animations & transitions

**No breaking changes** - semua backward compatible!

---

## 🔄 Flow Diagram

### Authentication Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     AuthPanel Component                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────────┐             │
│  │  LOGIN   │  │ REGISTER │  │ SIMPLE ADMIN │ <- 3 tabs   │
│  └──────────┘  └──────────┘  └──────────────┘             │
│       │             │                │                       │
│       ├─────────────┼────────────────┤                      │
│       │             │                │                       │
│       ▼             ▼                ▼                       │
│  /api/auth/    /api/auth/     localStorage                  │
│    login        register       (legacy)                     │
│       │             │                │                       │
│       ▼             ▼                ▼                       │
│  Dashboard    Email Verify    Dashboard                     │
│               → Login                                        │
└─────────────────────────────────────────────────────────────┘
```

### Admin Panel Flow

```
┌─────────────────────────────────────────────────────────────┐
│              AdminPanelExtended Component                    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────┐  ┌────────┐  ┌────────────────────────┐       │
│  │ SAKIT  │  │ SEHAT  │  │ USERS (NEW!)           │       │
│  └────────┘  └────────┘  └────────────────────────┘       │
│      │           │               │                          │
│      ├───────────┤               │                          │
│      │           │               │                          │
│      ▼           ▼               ▼                          │
│  Generate     Generate      User Management                │
│  PDF Sakit    PDF Sehat     - View all users               │
│  (existing)   (existing)    - Filter by status             │
│                              - View verification status     │
│                              - Role badges                  │
│                              - Stats dashboard              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔌 API Integration Status

| Feature | Status | Notes |
|---------|--------|-------|
| Registration | ✅ Ready | `/api/auth/register` |
| Login | ✅ Ready | `/api/auth/login` |
| Email Verification | ✅ Ready | `/api/auth/verify-email` |
| Onboarding | ✅ Ready | `/api/auth/complete-onboarding` |
| User Management API | ⏳ TODO | Need to create `/api/admin/users` |
| Simple Admin | ✅ Ready | Backward compatible |

---

## 🚀 Quick Implementation (Copy-Paste)

### Complete App.tsx Integration

```tsx
// 1. Add imports at top
import { AuthPanel } from './components/AuthPanel';
import { AdminPanelExtended } from './components/AdminPanelExtended';
import { isAuthenticated, logoutUser, getUserRole } from './services/authService';

// 2. Update state (around line 53)
const [showAuthPanel, setShowAuthPanel] = useState(false);
// Remove: authUsername, authPassword, authError, isAuthSubmitting, etc.

// 3. Replace openAuthPanel function (around line 93)
const openAuthPanel = () => {
  if (showAuthPanel) return;
  setShowAuthPanel(true);
};

// 4. Remove handleAuthSubmit function entirely (lines 103-125)

// 5. Replace auth panel UI (around line 433-484)
<div ref={authTriggerRef} onClick={openAuthPanel} className="...">
  {/* Existing trigger button */}
</div>

{showAuthPanel && (
  <AuthPanel
    onClose={() => setShowAuthPanel(false)}
    onSuccess={() => {
      setShowAuthPanel(false);
      window.location.reload();
    }}
  />
)}

// 6. Replace AdminPanel with AdminPanelExtended
// Find: <AdminPanel />
// Replace with: <AdminPanelExtended />
```

---

## 🧪 Testing Checklist

### Auth Panel Testing:
- [ ] Simple Admin tab - Verify legacy login works (username: doc)
- [ ] Login tab - Try login dengan registered user
- [ ] Register tab - Create new medical professional
  - [ ] Doctor registration
  - [ ] Specialist registration
  - [ ] Nurse registration
  - [ ] Midwife registration
- [ ] Error handling - Invalid inputs show proper errors
- [ ] Success messages display correctly
- [ ] Mode switching between tabs works smoothly

### Admin Panel Testing:
- [ ] Sakit tab - Generate PDF works (existing functionality)
- [ ] Sehat tab - Generate PDF works (existing functionality)
- [ ] Users tab - Displays user list
- [ ] Filter buttons - All, Pending, Verified, Active
- [ ] User cards show correct info
- [ ] Status badges (email, license, onboarded) display correctly
- [ ] Stats counters update correctly

---

## 📊 User Management API (TODO)

Create `/api/admin/users.ts`:

```typescript
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '@vercel/postgres';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Verify admin role
  const authHeader = req.headers.authorization;
  // ... validate session token ...

  if (req.method === 'GET') {
    const { status } = req.query;

    let query = sql`SELECT * FROM medical_professionals ORDER BY created_at DESC`;

    if (status === 'pending') {
      query = sql`SELECT * FROM medical_professionals WHERE email_verified = FALSE OR license_verified = FALSE ORDER BY created_at DESC`;
    } else if (status === 'verified') {
      query = sql`SELECT * FROM medical_professionals WHERE email_verified = TRUE AND license_verified = TRUE AND onboarding_completed = FALSE ORDER BY created_at DESC`;
    } else if (status === 'active') {
      query = sql`SELECT * FROM medical_professionals WHERE onboarding_completed = TRUE ORDER BY created_at DESC`;
    }

    const result = await query;

    return res.status(200).json({
      success: true,
      data: { users: result.rows }
    });
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
}
```

Then update `AdminPanelExtended.tsx` line 40:
```typescript
const response = await fetch('/api/admin/users', {
  headers: { 'Authorization': `Bearer ${localStorage.getItem('sessionToken')}` }
});
const data = await response.json();
setUsers(data.data.users);
```

---

## 🎯 Benefits

### Untuk Admin:
1. **Single Dashboard** - Manage certificates + users di satu tempat
2. **Real-time User Monitoring** - Lihat status registrations
3. **Filter & Stats** - Quick overview registrations
4. **Backward Compatible** - Legacy admin login masih berfungsi

### Untuk Medical Professionals:
1. **Professional Registration** - Complete 4-gate verification
2. **Email Verification** - Secure account activation
3. **License Verification** - KEMENKES integration (MVP: mock)
4. **Role-based Access** - Auto-assigned based on license type

---

## 🔒 Security Notes

- ✅ Password hashing (PBKDF2-SHA256, 600k iterations)
- ✅ Rate limiting (5 attempts per 15 min)
- ✅ Input validation & sanitization
- ✅ Session token management
- ✅ Admin role verification
- ⚠️ TODO: Add CSRF protection untuk admin endpoints
- ⚠️ TODO: Implement proper session expiry checks

---

## 📞 Support

**Issues?** Check:
1. Browser console untuk errors
2. Network tab untuk failed API calls
3. localStorage untuk session token

**API not working?**
1. Verify Vercel deployment
2. Check database connection
3. Validate environment variables

---

**Implementation Status**: Ready for integration
**Estimated Time**: 15-30 minutes
**Breaking Changes**: None (fully backward compatible)

Let's ship it! 🚀
