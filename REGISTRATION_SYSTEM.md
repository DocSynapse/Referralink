# ReferraLink Medical Professional Registration System

## Architecture Overview

Sistem registrasi 4-gate dengan verifikasi multi-layer untuk tenaga medis Indonesia.

```
┌─────────────────────────────────────────────────────────────────┐
│                    REGISTRATION FLOW                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Step 1: Credential Collection (Gate 3: Access Control)         │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  POST /api/auth/register                                │    │
│  │  • Email validation                                      │    │
│  │  • License format validation                             │    │
│  │  • Password strength check                               │    │
│  │  • Duplicate check (email, license)                      │    │
│  │  └─> Generate email verification token                  │    │
│  └────────────────────────────────────────────────────────┘    │
│                          ↓                                       │
│  Step 2: Verification Layer (Gate 2: Integrity Check)           │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  2a. Email Verification                                 │    │
│  │  POST /api/auth/verify-email?token=xxx                  │    │
│  │  • Validate token (24h expiry)                          │    │
│  │  • Mark email as verified                               │    │
│  │                                                          │    │
│  │  2b. License Verification (Automatic)                   │    │
│  │  • Validate against KEMENKES/IDI (MVP: mock)            │    │
│  │  • Background check (optional, auto-pass for MVP)       │    │
│  │  • Log verification result                              │    │
│  └────────────────────────────────────────────────────────┘    │
│                          ↓                                       │
│  Step 3: Role Assignment (Automatic)                            │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  License Type → Role Mapping                            │    │
│  │  • Doctor      → clinical_user                          │    │
│  │  • Specialist  → specialist_user                        │    │
│  │  • Midwife     → maternal_care_user                     │    │
│  │  • Nurse       → nurse_user                             │    │
│  │  • Admin       → admin_user                             │    │
│  │  └─> Triggered by database trigger on license verify   │    │
│  └────────────────────────────────────────────────────────┘    │
│                          ↓                                       │
│  Step 4: Onboarding Completion (Gate 1: Scope)                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  POST /api/auth/complete-onboarding                     │    │
│  │  • Accept Terms of Service                              │    │
│  │  • Acknowledge HIPAA                                    │    │
│  │  • Generate API key (sk_live_xxx)                       │    │
│  │  • Send welcome email with credentials                  │    │
│  │  └─> Redirect to dashboard                             │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## File Structure

```
D:\sentrasolutions\referralink\
├── api/
│   ├── auth/
│   │   ├── register.ts                # Step 1: Registration
│   │   ├── verify-email.ts            # Step 2a: Email verification
│   │   ├── login.ts                   # User login
│   │   └── complete-onboarding.ts     # Step 4: Onboarding
│   ├── types/
│   │   └── registration.ts            # TypeScript types
│   ├── utils/
│   │   ├── auth.ts                    # Auth utilities (hashing, validation)
│   │   └── db.ts                      # Database queries
│   └── services/
│       ├── licenseVerification.ts     # License verification (KEMENKES integration)
│       └── email.ts                   # Email service (Resend/SendGrid)
├── database/
│   └── schema.sql                     # PostgreSQL schema
└── REGISTRATION_SYSTEM.md             # This file
```

---

## Database Schema Highlights

### Primary Table: `medical_professionals`

**Core Fields**:
- `id` (UUID) - Primary key
- `email` (VARCHAR, UNIQUE) - User email
- `license_number` (VARCHAR, UNIQUE) - Medical license
- `license_type` - doctor, specialist, nurse, midwife, admin
- `role` - Auto-assigned based on license type

**Verification Fields**:
- `email_verified` - Email verification status
- `license_verified` - License verification status
- `background_check_status` - pending/passed/failed/skipped

**Onboarding Fields**:
- `terms_accepted` - ToS acceptance
- `hipaa_acknowledged` - HIPAA acknowledgment
- `onboarding_completed` - Final gate status

**Access Fields**:
- `api_key` - API key for system integration
- `mcp_token` - Optional MCP token

**Audit Fields**:
- `created_at`, `updated_at`, `last_login`
- `created_by_ip` - IP address tracking

### Supporting Tables:
- `role_permissions` - Role-based access control
- `verification_logs` - Audit trail for verifications
- `user_sessions` - Session management
- `audit_logs` - Compliance logging

---

## API Endpoints

### 1. **POST /api/auth/register**

Register new medical professional.

**Request**:
```json
{
  "email": "dr.john@example.com",
  "fullName": "Dr. John Doe",
  "licenseType": "doctor",
  "licenseNumber": "SIP.123456",
  "institutionName": "RSUP Jakarta",
  "phoneNumber": "08123456789",
  "password": "SecureP@ssw0rd123!"
}
```

**Response (201)**:
```json
{
  "success": true,
  "data": {
    "userId": "uuid-here",
    "email": "dr.john@example.com",
    "verificationEmailSent": true,
    "nextStep": "verify_email"
  }
}
```

**Validations**:
- Email format (RFC 5322)
- Password: Min 12 chars, uppercase, lowercase, number, special char
- License format based on type
- Phone: Indonesian format (+62xxx or 08xxx)
- Rate limit: 5 attempts per IP per 15 minutes

---

### 2. **POST /api/auth/verify-email**

Verify email address with token.

**Request**:
```json
{
  "token": "verification-token-here"
}
```

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "message": "Email berhasil diverifikasi",
    "nextStep": "verify_license"
  }
}
```

**Notes**:
- Token expires after 24 hours
- License verification happens automatically after email verification

---

### 3. **POST /api/auth/login**

User login.

**Request**:
```json
{
  "email": "dr.john@example.com",
  "password": "SecureP@ssw0rd123!"
}
```

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "dr.john@example.com",
      "fullName": "Dr. John Doe",
      "role": "clinical_user",
      "licenseVerified": true,
      "emailVerified": true,
      "onboardingCompleted": false
    },
    "sessionToken": "base64-session-token",
    "expiresAt": "2026-02-04T10:00:00Z",
    "requiresOnboarding": true
  }
}
```

**Rate Limiting**: 5 attempts per IP per 15 minutes

---

### 4. **POST /api/auth/complete-onboarding**

Complete onboarding and generate API credentials.

**Headers**:
```
Authorization: Bearer <session-token>
```

**Request**:
```json
{
  "termsAccepted": true,
  "hipaaAcknowledged": true
}
```

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "termsAccepted": true,
    "hipaaAcknowledged": true,
    "apiKey": "sk_live_64-char-hex-here",
    "mcpToken": null
  }
}
```

---

## Security Features

### 1. Password Security
- **Algorithm**: PBKDF2-SHA256
- **Iterations**: 600,000 (OWASP recommendation)
- **Salt**: 32-byte random salt per password
- **Storage**: `salt:hash` format

### 2. Rate Limiting
- Registration: 5 attempts per IP per 15 minutes
- Login: 5 attempts per IP per 15 minutes
- In-memory store (upgrade to Redis for production scale)

### 3. Input Validation
- XSS prevention via sanitization
- SQL injection prevention via parameterized queries
- Email format validation (RFC 5322)
- License format validation per type

### 4. Session Management
- Session tokens: Base64-encoded payload
- Expiry: 7 days
- Stored in database with IP and user agent tracking

### 5. Audit Logging
- All authentication events logged
- IP address tracking
- User agent tracking
- GDPR/HIPAA compliance ready

---

## License Verification Integration

### MVP Implementation (Current)
```typescript
// Mock verification with pattern validation
// Auto-approves all valid formats
// Source: MOCK_API_MVP
```

### Production Implementation (TODO)

**KEMENKES API Integration**:
```typescript
const response = await fetch('https://sip.kemenkes.go.id/api/v1/verify', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${process.env.KEMENKES_API_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    license_number: licenseNumber,
    license_type: 'SIP' // or 'SIPA', 'SIPP', 'SIPB'
  })
});
```

**Required Environment Variables**:
- `KEMENKES_API_KEY` - API key for KEMENKES
- `IDI_API_KEY` - API key for IDI (optional fallback)

**License Format Reference**:
- **Doctor** (SIP): `SIP.123456` or `123456/SIP`
- **Specialist** (SIPA): `SIPA.123456`
- **Nurse** (SIPP): `SIPP.123456`
- **Midwife** (SIPB): `SIPB.123456`
- **Admin**: `ADMIN-123456`

---

## Email Service Configuration

### MVP (Current)
Console logging for development.

### Production Setup

**Option 1: Resend (Recommended)**
```bash
npm install resend
```

```env
RESEND_API_KEY=re_xxxxxxxxxxxx
```

Uncomment production code in `api/services/email.ts`.

**Option 2: SendGrid**
```bash
npm install @sendgrid/mail
```

```env
SENDGRID_API_KEY=SG.xxxxxxxxxxxx
```

---

## Role-Based Access Control

| License Type | Auto-Assigned Role   | Permissions |
|-------------|----------------------|-------------|
| Doctor      | `clinical_user`      | Patient data, diagnostics, referrals |
| Specialist  | `specialist_user`    | Referral input, consultations |
| Midwife     | `maternal_care_user` | POGS module, maternal records |
| Nurse       | `nurse_user`         | Patient care, basic diagnostics |
| Admin       | `admin_user`         | User management, reports, analytics |

**Permission Schema** (JSONB):
```json
{
  "modules": ["patient_data", "diagnostics"],
  "can_create_referral": true,
  "can_view_patient_records": true
}
```

---

## Deployment Checklist

### Environment Variables
```env
# Database
POSTGRES_URL=postgres://user:pass@host:5432/db

# Email Service (Production)
RESEND_API_KEY=re_xxxxxxxxxxxx

# License Verification (Production)
KEMENKES_API_KEY=your-kemenkes-api-key

# App Configuration
VITE_APP_URL=https://referralink.vercel.app
```

### Database Setup
```bash
# Connect to Vercel Postgres
vercel env pull .env.local

# Run schema
psql $POSTGRES_URL < database/schema.sql
```

### Install Dependencies
```bash
npm install @vercel/postgres
npm install resend  # For production email
```

### Deploy to Vercel
```bash
vercel --prod
```

---

## Testing Guide

### 1. Local Development
```bash
# Start Vercel dev server
vercel dev

# API available at:
http://localhost:3000/api/auth/*
```

### 2. Test Registration Flow
```bash
# Step 1: Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "fullName": "Test Doctor",
    "licenseType": "doctor",
    "licenseNumber": "SIP.123456",
    "institutionName": "Test Hospital",
    "phoneNumber": "08123456789",
    "password": "SecureP@ssw0rd123!"
  }'

# Step 2: Check console for verification token (MVP mode)
# Verify email with token

# Step 3: Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecureP@ssw0rd123!"
  }'

# Step 4: Complete onboarding
curl -X POST http://localhost:3000/api/auth/complete-onboarding \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <session-token>" \
  -d '{
    "termsAccepted": true,
    "hipaaAcknowledged": true
  }'
```

### 3. Beta Testing with 10 Users
- **MVP mode**: All features work with mock verification
- **No external API required**
- **Email**: Console logs (or configure Resend)
- **Database**: Vercel Postgres Free (256 MB)

---

## Next Steps

### Phase 1: MVP (Current) ✅
- [x] Database schema
- [x] API routes structure
- [x] Authentication & validation
- [x] Mock license verification
- [x] Console email logging

### Phase 2: Beta Testing (This Week)
- [ ] Frontend registration form
- [ ] Email verification UI
- [ ] Onboarding wizard
- [ ] Dashboard (basic)
- [ ] Test with 10 beta users

### Phase 3: Production Readiness
- [ ] Integrate KEMENKES API
- [ ] Setup Resend/SendGrid
- [ ] Redis for rate limiting
- [ ] Comprehensive error handling
- [ ] Security audit

### Phase 4: Scale
- [ ] Background check integration
- [ ] Advanced analytics
- [ ] Multi-factor authentication
- [ ] Audit log viewer (admin)

---

## Support & Maintenance

**Architecture Owner**: Claude Sonnet 4.5 (Sentra Solutions)
**Documentation**: This file
**Last Updated**: 2026-01-28

**For issues**:
1. Check audit logs in database
2. Review console logs for API errors
3. Verify environment variables

**Critical Security Notes**:
- Never commit `.env` files
- Rotate API keys every 90 days
- Monitor rate limit violations
- Review audit logs weekly
