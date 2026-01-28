# 🐘 Neon Database Setup Guide

## Your Neon Connection String
```
postgresql://neondb_owner:npg_9lYSpZXm5rkW@ep-plain-hat-a16bvz1l-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

---

## Method 1: Upload via Neon Console (Recommended)

### Step 1: Access Neon SQL Editor
1. Go to: https://console.neon.tech
2. Login to your account
3. Select your project/database
4. Click **SQL Editor** tab

### Step 2: Copy Schema
1. Open file: `database/schema.sql`
2. Copy ALL content (CTRL+A, CTRL+C)

### Step 3: Execute Schema
1. Paste into SQL Editor
2. Click **Run** button
3. Wait for execution (should take 5-10 seconds)
4. You should see: "Query executed successfully"

### Step 4: Verify Tables Created
Run this query in SQL Editor:
```sql
SELECT tablename FROM pg_tables WHERE schemaname = 'public';
```

Expected output (5 tables):
- audit_logs
- medical_professionals
- role_permissions
- user_sessions
- verification_logs

✅ If you see all 5 tables, schema upload SUCCESS!

---

## Method 2: Upload via psql CLI

If you have psql installed locally:

### Windows
```powershell
# Open PowerShell
cd D:\sentrasolutions\referralink

# Upload schema
psql "postgresql://neondb_owner:npg_9lYSpZXm5rkW@ep-plain-hat-a16bvz1l-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require" -f database/schema.sql

# Verify
psql "postgresql://neondb_owner:npg_9lYSpZXm5rkW@ep-plain-hat-a16bvz1l-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require" -c "SELECT tablename FROM pg_tables WHERE schemaname = 'public';"
```

### Mac/Linux
```bash
cd /path/to/referralink

# Upload schema
psql "postgresql://neondb_owner:npg_9lYSpZXm5rkW@ep-plain-hat-a16bvz1l-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require" < database/schema.sql

# Verify
psql "postgresql://neondb_owner:npg_9lYSpZXm5rkW@ep-plain-hat-a16bvz1l-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require" -c "SELECT tablename FROM pg_tables WHERE schemaname = 'public';"
```

---

## Method 3: Upload via Node.js Script

Create a file `upload-schema.js`:

```javascript
import pg from 'pg';
import fs from 'fs';

const connectionString = 'postgresql://neondb_owner:npg_9lYSpZXm5rkW@ep-plain-hat-a16bvz1l-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const client = new pg.Client({ connectionString });

async function uploadSchema() {
  try {
    await client.connect();
    console.log('Connected to Neon database');

    const schema = fs.readFileSync('./database/schema.sql', 'utf8');
    await client.query(schema);
    console.log('Schema uploaded successfully!');

    // Verify tables
    const result = await client.query(`
      SELECT tablename FROM pg_tables WHERE schemaname = 'public'
    `);
    console.log('Tables created:', result.rows);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

uploadSchema();
```

Run:
```bash
npm install pg
node upload-schema.js
```

---

## After Schema Upload: Configure Vercel

### Step 1: Add to Vercel Environment Variables
1. Go to: https://vercel.com/sentra-solutions/referralink/settings/environment-variables
2. Add new variable:
   - **Name:** `POSTGRES_URL`
   - **Value:**
     ```
     postgresql://neondb_owner:npg_9lYSpZXm5rkW@ep-plain-hat-a16bvz1l-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
     ```
   - **Environment:** Production
3. Click **Save**

### Step 2: Add Other Required Variables
Add these if not exist:
- **VITE_APP_URL:** `https://referralink.vercel.app`
- **VITE_AUTH_PASSWORD:** `123456` (or your preferred password)

### Step 3: Redeploy
1. Go to: https://vercel.com/sentra-solutions/referralink
2. Click **Deployments** tab
3. Find latest deployment
4. Click **...** → **Redeploy**
5. Check **Use existing Build Cache** OFF
6. Click **Redeploy**

---

## Verification Queries

After upload, run these in Neon SQL Editor:

### 1. Check all tables exist
```sql
SELECT tablename FROM pg_tables WHERE schemaname = 'public';
```

### 2. Check table structures
```sql
\d medical_professionals
\d role_permissions
\d verification_logs
\d user_sessions
\d audit_logs
```

### 3. Verify triggers
```sql
SELECT trigger_name, event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'public';
```
Expected: `assign_user_role_trigger` on `medical_professionals`

### 4. Count records (should be 0 initially)
```sql
SELECT
  (SELECT COUNT(*) FROM medical_professionals) as users,
  (SELECT COUNT(*) FROM role_permissions) as permissions,
  (SELECT COUNT(*) FROM verification_logs) as verifications,
  (SELECT COUNT(*) FROM user_sessions) as sessions,
  (SELECT COUNT(*) FROM audit_logs) as audits;
```

---

## ✅ Success Checklist

After completing setup:
- [ ] Schema uploaded to Neon
- [ ] 5 tables created successfully
- [ ] Triggers working
- [ ] `POSTGRES_URL` added to Vercel
- [ ] `VITE_APP_URL` added to Vercel
- [ ] `VITE_AUTH_PASSWORD` added to Vercel
- [ ] Vercel redeployed with new env vars
- [ ] Admin login works
- [ ] Admin panel shows (empty users list is OK)
- [ ] Test registration works

---

## 🧪 Test After Setup

### 1. Test Admin Login
1. Visit: https://referralink.vercel.app
2. Click "Enter"
3. Tab "SIMPLE ADMIN"
4. Username: `doc`
5. Password: `123456` (or your VITE_AUTH_PASSWORD)
6. Should see 4 admin cards ✓

### 2. Test Admin Panel
1. Click "All Users" card
2. Modal opens ✓
3. Shows "No users found" (normal if no registrations yet) ✓

### 3. Test Registration
1. Click "Enter" → "REGISTER"
2. Fill form:
   - Name: Test Doctor
   - Email: test@example.com
   - License: Doctor - SIP.TEST123
   - Institution: Test Hospital
   - Phone: 08123456789
   - Password: TestPass@123456
3. Click "Register"
4. Check browser console for response
5. Check Neon console: `SELECT * FROM medical_professionals;`
6. User should appear in database ✓

---

## 🆘 Troubleshooting

### Error: "relation does not exist"
- Schema not uploaded correctly
- Re-run schema upload

### Error: "connection refused"
- Check connection string correct
- Verify Neon database running
- Check Vercel has POSTGRES_URL env var

### Error: "password authentication failed"
- Connection string credentials incorrect
- Regenerate Neon password

### Admin panel shows mock data only
- POSTGRES_URL not set in Vercel
- Or not redeployed after adding env var
- Check browser console for API errors

---

**Next:** Upload schema using Method 1 (Neon Console) - easiest! 🚀
