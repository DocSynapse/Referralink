# Beta Testing Flow - Referralink

> **Sistem Manajemen Beta Tester untuk Sentra Referralink**

---

## 🎯 Overview

**Status Saat Ini**:
- ✅ Login system sudah ada (password: `123456`)
- ❌ Registration via email belum ada
- ❌ Acceptance/approval flow belum ada
- ❌ Beta tester tracking belum ada

**Target**:
- ✅ Formulir pendaftaran beta tester via email
- ✅ Admin dashboard untuk approval
- ✅ Email notification system
- ✅ Tracking usage & feedback

---

## 📋 User Flow - Beta Tester

### 1. Landing Page (Public)

**URL**: `https://sentraai.id` atau `https://sentraai.id/waitlist`

**Content**:
```
┌─────────────────────────────────────────┐
│  Sentra Referralink - Beta Program     │
│                                         │
│  [Hero Section]                         │
│  "AI-Powered Clinical Decision Support │
│   untuk Faskes di Indonesia"           │
│                                         │
│  [Daftar Beta Testing]                  │
│  ┌───────────────────────────────────┐  │
│  │ Nama Lengkap: ___________        │  │
│  │ Email: ___________               │  │
│  │ Nomor HP (WA): ___________       │  │
│  │ Nama Faskes: ___________         │  │
│  │ Jabatan: [Dropdown]              │  │
│  │   - Dokter Umum                  │  │
│  │   - Perawat                      │  │
│  │   - Admin Faskes                 │  │
│  │   - Lainnya                      │  │
│  │ Kota: ___________                │  │
│  │                                   │  │
│  │ [ ] Saya setuju dengan T&C       │  │
│  │                                   │  │
│  │     [Daftar Beta Testing]        │  │
│  └───────────────────────────────────┘  │
│                                         │
│  Status: "Menunggu Approval Admin"      │
└─────────────────────────────────────────┘
```

**Flow Setelah Submit**:
1. Data tersimpan di database (IndexedDB temporary atau Backend)
2. Email confirmation dikirim ke user
3. Notifikasi ke admin untuk approval
4. User redirect ke "Thank You" page

---

### 2. Thank You Page

```
┌─────────────────────────────────────────┐
│  ✅ Pendaftaran Berhasil!               │
│                                         │
│  Terima kasih telah mendaftar beta     │
│  testing Sentra Referralink.           │
│                                         │
│  Email konfirmasi telah dikirim ke:    │
│  user@example.com                      │
│                                         │
│  Kami akan meninjau pendaftaran Anda   │
│  dalam 1-2 hari kerja.                 │
│                                         │
│  📧 Cek email untuk update status      │
│  📱 Join Telegram Group: [Link]        │
│                                         │
│  [Kembali ke Beranda]                  │
└─────────────────────────────────────────┘
```

---

### 3. Email Confirmation (Auto-sent)

**Subject**: "Pendaftaran Beta Testing Sentra Referralink Diterima"

```html
Hi [Nama],

Terima kasih telah mendaftar sebagai beta tester Sentra Referralink!

Kami telah menerima pendaftaran Anda dengan detail:
- Nama: [Nama Lengkap]
- Email: [Email]
- Faskes: [Nama Faskes]
- Kota: [Kota]

Pendaftaran Anda sedang dalam proses review oleh tim kami.
Kami akan menghubungi Anda dalam 1-2 hari kerja melalui:
✉️ Email: [Email]
📱 WhatsApp: [Nomor HP]

Sementara menunggu approval, Anda bisa:
1. Join Telegram Group Beta Tester: [Link]
2. Baca Dokumentasi: https://sentraai.id/docs
3. Tonton Video Tutorial: [Link]

Terima kasih,
Tim Sentra Healthcare Solutions

---
Questions? Reply to this email or contact support@sentra.id
```

---

### 4. Approval Email (Setelah Admin Approve)

**Subject**: "🎉 Akses Beta Testing Sentra Referralink Disetujui!"

```html
Selamat, [Nama]! 🎉

Pendaftaran Anda sebagai beta tester Sentra Referralink
telah DISETUJUI!

🔐 Akses Login Anda:
URL: https://sentraai.id/login
Email: [email@faskes.id]
Password: [Auto-generated secure password]

📚 Panduan Memulai:
1. Login menggunakan kredensial di atas
2. Ikuti onboarding tutorial (5 menit)
3. Mulai gunakan fitur:
   - Generate Diagnosis ICD-10
   - Rekomendasi Rujukan
   - Generate Surat Medis

⏰ Periode Beta Testing: [Tanggal Mulai] - [Tanggal Selesai]

📋 Yang Kami Harapkan:
- Gunakan minimal 3x per minggu
- Berikan feedback via form: [Link]
- Laporkan bugs: [Link]
- Join weekly sync (optional): [Zoom Link]

🎁 Benefit Beta Tester:
- FREE access selama periode beta
- Priority support via WhatsApp
- Early access ke fitur baru
- Certificate of Appreciation
- Diskon 50% untuk 3 bulan pertama setelah launch

Need help? Contact:
📱 WhatsApp: +62 xxx-xxxx-xxxx
📧 Email: support@sentra.id
💬 Telegram: @sentra_beta

Selamat mencoba!
Tim Sentra Healthcare Solutions
```

---

## 🔐 Admin Dashboard - Beta Tester Management

### Dashboard Overview

**URL**: `https://sentraai.id/admin/beta-testers`

```
┌─────────────────────────────────────────────────────┐
│  Sentra Admin - Beta Tester Management             │
├─────────────────────────────────────────────────────┤
│  Statistik:                                         │
│  ┌────────────┬────────────┬────────────┐          │
│  │ Pending    │ Approved   │ Rejected   │          │
│  │    15      │     42     │     8      │          │
│  └────────────┴────────────┴────────────┘          │
│                                                     │
│  Filter: [Semua ▼] [Kota ▼] [Jabatan ▼]           │
│  Search: [___________] 🔍                          │
│                                                     │
│  ┌───────────────────────────────────────────────┐ │
│  │ Nama         │ Faskes    │ Kota   │ Status   │ │
│  ├───────────────────────────────────────────────┤ │
│  │ Dr. Andi     │ PKM A     │ Kediri │ Pending  │ │
│  │   [Approve] [Reject] [Details]               │ │
│  ├───────────────────────────────────────────────┤ │
│  │ Ns. Budi     │ RS B      │ Malang │ Approved │ │
│  │   [Revoke] [Details]                         │ │
│  └───────────────────────────────────────────────┘ │
│                                                     │
│  [Export CSV] [Send Bulk Email]                    │
└─────────────────────────────────────────────────────┘
```

---

### Detail Modal - Pending Application

```
┌─────────────────────────────────────────────┐
│  Beta Tester Application Detail            │
├─────────────────────────────────────────────┤
│  Nama Lengkap: Dr. Andi Wijaya             │
│  Email: andi@puskesmas.id                  │
│  Nomor HP: 0812-3456-7890                  │
│  Nama Faskes: Puskesmas Balowerti          │
│  Jabatan: Dokter Umum                      │
│  Kota: Kediri                              │
│  Tanggal Daftar: 28 Jan 2026, 10:30       │
│                                             │
│  Notes (Internal):                         │
│  ┌─────────────────────────────────────┐   │
│  │ [Admin can add notes here]          │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  Password (auto-generated):                │
│  ┌─────────────────────────────────────┐   │
│  │ RfK9mP2nQ7xL    [Generate New]     │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ☐ Send welcome email immediately          │
│  ☐ Add to Telegram group                   │
│                                             │
│  [Approve & Send Email]  [Reject]  [Close] │
└─────────────────────────────────────────────┘
```

---

## 🗄️ Database Schema

### Collection: `beta_testers`

```typescript
interface BetaTester {
  id: string;                    // Auto-generated UUID
  nama: string;                  // Full name
  email: string;                 // Email (unique)
  nomorHp: string;               // WhatsApp number
  namaFaskes: string;            // Healthcare facility name
  jabatan: 'dokter' | 'perawat' | 'admin' | 'lainnya';
  kota: string;                  // City
  status: 'pending' | 'approved' | 'rejected' | 'revoked';
  password?: string;             // Hashed password (set on approval)
  createdAt: Date;               // Registration timestamp
  approvedAt?: Date;             // Approval timestamp
  approvedBy?: string;           // Admin who approved
  rejectedReason?: string;       // Reason if rejected
  lastLoginAt?: Date;            // Track last login
  usageCount: number;            // Number of times used
  feedbackSubmitted: boolean;    // Has submitted feedback
  notes?: string;                // Internal admin notes
}
```

---

## 🔌 Implementation Plan

### Phase 1: Frontend (Minggu 1)

**Tasks**:
1. ✅ Create waitlist form component
2. ✅ Add form validation
3. ✅ Create "Thank You" page
4. ✅ Add admin beta tester table
5. ✅ Create approval modal

**Files to Create/Modify**:
```
components/
  ├── WaitlistForm.tsx          # NEW
  ├── BetaTesterAdmin.tsx       # NEW
  ├── AdminPanel.tsx             # MODIFY - add beta tab
  └── ThankYouPage.tsx          # NEW

App.tsx                          # MODIFY - add routes
```

---

### Phase 2: Backend Integration (Minggu 2)

**Option A: Simple (IndexedDB)**
- ✅ Store locally di browser
- ❌ Tidak scalable
- ❌ Tidak bisa multi-admin
- ✅ No backend needed

**Option B: Firebase (Recommended)**
- ✅ Real-time database
- ✅ Built-in auth
- ✅ Email triggers
- ✅ Easy integration
- ✅ Free tier generous

**Option C: Custom Backend**
- ✅ Full control
- ❌ Need development time
- ❌ Need hosting

**Recommendation**: **Firebase** untuk MVP beta testing

---

### Phase 3: Email System (Minggu 2-3)

**Options**:

1. **SendGrid** (Recommended)
   - ✅ 100 emails/day free
   - ✅ Professional templates
   - ✅ Deliverability tracking

2. **Resend**
   - ✅ Developer-friendly
   - ✅ React Email templates
   - ✅ 3000 emails/month free

3. **Firebase Cloud Functions**
   - ✅ Integrated dengan Firebase
   - ✅ Trigger on database changes
   - ⚠️ Need setup

---

## 🚀 Quick Implementation (MVP)

### Minimal Beta Testing Flow (2-3 Hari)

**Day 1: Frontend Form**
```tsx
// components/BetaWaitlistForm.tsx
export const BetaWaitlistForm = () => {
  const [formData, setFormData] = useState({
    nama: '',
    email: '',
    nomorHp: '',
    namaFaskes: '',
    jabatan: 'dokter',
    kota: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Save to IndexedDB temporary
    await saveToBetaList(formData);

    // Redirect to thank you page
    navigate('/thank-you');
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  );
};
```

**Day 2: Admin Table**
```tsx
// components/AdminPanel.tsx - Add Beta Tab
const BetaTestersTab = () => {
  const [testers, setTesters] = useState<BetaTester[]>([]);

  const handleApprove = async (id: string) => {
    const password = generatePassword();

    await updateTester(id, {
      status: 'approved',
      password: hashPassword(password),
      approvedAt: new Date()
    });

    // Send email (manual for MVP)
    alert(`Approved! Send this to user:\nPassword: ${password}`);
  };

  return (
    <table>
      {/* Tester list */}
    </table>
  );
};
```

**Day 3: Integration & Testing**
- Connect form to storage
- Test approval flow
- Manual email sending (copy-paste template)

---

## 📊 Metrics to Track

### Beta Tester Analytics

```typescript
interface BetaMetrics {
  totalRegistrations: number;
  pendingApprovals: number;
  activeUsers: number;
  averageUsagePerWeek: number;
  feedbackSubmissionRate: number;
  topFeatures: string[];
  bugReports: number;
}
```

**Dashboard View**:
```
┌───────────────────────────────────────┐
│  Beta Testing Metrics                 │
├───────────────────────────────────────┤
│  📊 Total Registrations: 65           │
│  ⏳ Pending Approvals: 15             │
│  ✅ Active Users: 42                  │
│  📈 Avg Usage/Week: 4.2x              │
│  💬 Feedback Rate: 68%                │
│  🐛 Bug Reports: 12 (8 resolved)     │
│                                       │
│  Top Used Features:                   │
│  1. Generate Diagnosis (95%)          │
│  2. Surat Rujukan (78%)               │
│  3. Surat Keterangan Sakit (62%)     │
└───────────────────────────────────────┘
```

---

## 🎯 Success Criteria

### Week 1-2 (Onboarding)
- ✅ 50+ beta tester registrations
- ✅ 30+ approved & active users
- ✅ <24h approval turnaround time

### Week 3-4 (Engagement)
- ✅ 3+ uses per user per week
- ✅ 50%+ feedback submission rate
- ✅ <5 critical bugs

### Week 5-8 (Validation)
- ✅ 80%+ user satisfaction
- ✅ 10+ testimonials
- ✅ Ready for public launch

---

## 📝 Next Steps

### Immediate (This Week)
1. [ ] Create `BetaWaitlistForm.tsx` component
2. [ ] Add beta tester table to `AdminPanel.tsx`
3. [ ] Setup IndexedDB storage untuk beta list
4. [ ] Create email templates (manual send for MVP)

### Short Term (Next 2 Weeks)
1. [ ] Integrate Firebase for real-time data
2. [ ] Setup SendGrid/Resend for auto-emails
3. [ ] Add metrics tracking
4. [ ] Create feedback form

### Medium Term (1 Month)
1. [ ] Automated onboarding flow
2. [ ] Usage analytics dashboard
3. [ ] Beta tester leaderboard (gamification)
4. [ ] Integration dengan Telegram bot

---

**Priority**: 🔥 HIGH
**Estimated Time**: 3-5 hari untuk MVP
**Dependencies**: Firebase setup (optional), Email service (optional)

**Status**: 📝 Ready untuk implementation
