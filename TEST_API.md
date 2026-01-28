# 🔬 LOCAL API TESTING GUIDE

Karena saya (Claude) tidak bisa browse web, ini adalah cara untuk **Anda test sendiri secara local**.

## Step 1: Run Vercel Dev Server

Di terminal, jalankan:

```bash
cd D:\sentrasolutions\referralink
vercel dev
```

Ini akan:
- ✅ Start local server di `http://localhost:3000`
- ✅ Load API routes dari folder `api/`
- ✅ Load environment variables dari `.env.local`
- ✅ Simulate production environment

**PENTING:** Tunggu sampai muncul message:
```
Ready! Available at http://localhost:3000
```

## Step 2: Open Test Page

Buka browser dan navigate ke:

```
http://localhost:3000/test-api.html
```

Anda akan lihat halaman test dengan 4 tombol.

## Step 3: Click Buttons (In Order)

### Button 1: Test /api/health
- **No auth, no DB**
- Should return: `{ success: true, message: "API is working" }`
- **If this fails:** API routing broken

### Button 2: Test /api/admin/test
- **No auth, no DB, hardcoded data**
- Should return: `{ success: true, data: { users: [...] } }`
- **If this fails:** API routing broken

### Button 3: Test /api/admin/users-simple
- **With auth, with DB**
- Should return: Real users from database
- **If this fails:** Database connection issue

### Button 4: Test /api/admin/users
- **Full complex endpoint**
- Should return: Real users with full logic
- **If this fails:** Issue in auth/db utility functions

## Step 4: Check Results

Setiap button akan show:
- ✅ **Green "SUCCESS"** = Working!
- ❌ **Red "NOT JSON"** = API returning HTML/text instead of JSON
- ❌ **Red "ERROR"** = Network/fetch error

## Step 5: Report Back

Screenshot hasil atau copy-paste output dari test page.

---

## Alternative: Test with curl

Di terminal lain (sementara `vercel dev` masih running):

```bash
# Test health
curl http://localhost:3000/api/health

# Test simple endpoint
curl http://localhost:3000/api/admin/test

# Test with auth
curl -H "Authorization: Bearer simple-admin-session" http://localhost:3000/api/admin/users-simple

# Test full endpoint
curl -H "Authorization: Bearer simple-admin-session" http://localhost:3000/api/admin/users
```

Semua response harus berupa valid JSON.

---

## Troubleshooting

### "vercel: command not found"
```bash
npm install -g vercel
```

### "No such file or directory: .vercel"
Vercel CLI butuh link ke project. Run:
```bash
vercel link
```
Pilih existing project atau create new.

### "POSTGRES_URL not set"
Check `.env.local` file exists dengan content:
```
POSTGRES_URL=postgresql://neondb_owner:...
```

---

## Expected Timeline

- ⏱️ Run `vercel dev` → 10 seconds
- ⏱️ Open `test-api.html` → 5 seconds
- ⏱️ Click all buttons → 30 seconds
- ⏱️ Total: **45 seconds to complete test**

This will definitively show mana endpoint yang work dan mana yang gagal.
