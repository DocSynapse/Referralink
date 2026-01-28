# Setup Custom Domain: sentraai.id

## Dokumentasi Lengkap Setup Domain untuk Referralink

---

## 📋 Prerequisites

- ✅ Domain: `sentraai.id` sudah terdaftar
- ✅ Akses ke DNS management (Cloudflare/Namecheap/GoDaddy/dll)
- ✅ Akses ke Vercel Dashboard
- ✅ Project sudah deployed: https://referralink.vercel.app

---

## 🎯 Target Setup

**Sebelum**: `https://referralink.vercel.app`
**Sesudah**: `https://sentraai.id` atau `https://app.sentraai.id`

---

## 🚀 Langkah-Langkah Setup

### Step 1: Tambah Domain di Vercel

1. **Buka Vercel Dashboard**
   - URL: https://vercel.com/sentra-solutions/referralink
   - Login dengan akun yang sudah ada

2. **Navigasi ke Settings → Domains**
   - Klik tab **"Settings"** di menu atas
   - Pilih **"Domains"** di sidebar kiri

3. **Add Domain**
   - Klik tombol **"Add"**
   - Masukkan domain: `sentraai.id` atau `app.sentraai.id`
   - Klik **"Add"**

4. **Vercel akan memberikan DNS Records yang perlu ditambahkan**

---

### Step 2: Konfigurasi DNS Records

Pilih salah satu konfigurasi:

#### **Option A: Root Domain (sentraai.id)**

Tambahkan DNS records berikut di provider DNS Anda:

```
Type: A
Name: @
Value: 76.76.21.21
TTL: Auto (atau 3600)
```

**Atau gunakan CNAME (jika DNS provider support CNAME flattening):**
```
Type: CNAME
Name: @
Value: cname.vercel-dns.com
TTL: Auto
```

#### **Option B: Subdomain (app.sentraai.id)** ⭐ Recommended

```
Type: CNAME
Name: app
Value: cname.vercel-dns.com
TTL: Auto
```

#### **Option C: WWW (www.sentraai.id)**

```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: Auto
```

---

### Step 3: Verifikasi Domain

1. **Tunggu DNS Propagation**
   - Biasanya 5-15 menit
   - Maksimal 48 jam (jarang terjadi)

2. **Cek DNS dengan Tools**
   ```bash
   nslookup sentraai.id
   # atau
   dig sentraai.id
   ```

3. **Vercel akan auto-verify**
   - Jika berhasil, status akan berubah jadi **"Valid Configuration"**
   - SSL certificate otomatis di-provision

---

### Step 4: SSL/HTTPS Certificate

Vercel **otomatis** provision SSL certificate dari Let's Encrypt.

**Tidak perlu setup manual!**

✅ Certificate auto-renew setiap 60 hari
✅ Mendukung wildcard subdomain
✅ HTTPS redirect otomatis aktif

---

## 🔧 DNS Provider Specific Guides

### **Cloudflare**

1. Login ke Cloudflare Dashboard
2. Pilih domain: `sentraai.id`
3. Klik **"DNS"** → **"Records"**
4. **Add Record**:
   - Type: `CNAME`
   - Name: `app` (atau `@` untuk root)
   - Target: `cname.vercel-dns.com`
   - Proxy status: **DNS only** (⚠️ Important! Jangan proxy)
   - TTL: Auto
5. **Save**

**⚠️ PENTING**: Set Cloudflare proxy ke **"DNS only"** (grey cloud), bukan "Proxied" (orange cloud), agar SSL Vercel bisa berfungsi.

---

### **Namecheap**

1. Login ke Namecheap
2. Dashboard → Domain List → Manage `sentraai.id`
3. **Advanced DNS** tab
4. **Add New Record**:
   - Type: `CNAME Record`
   - Host: `app` (atau `@` untuk root)
   - Value: `cname.vercel-dns.com`
   - TTL: Automatic
5. **Save Changes**

---

### **GoDaddy**

1. Login ke GoDaddy
2. My Products → DNS → Manage Zones
3. Pilih `sentraai.id`
4. **Add Record**:
   - Type: `CNAME`
   - Name: `app`
   - Value: `cname.vercel-dns.com`
   - TTL: 1 Hour
5. **Save**

---

## ✅ Verification & Testing

### 1. **Check DNS Propagation**

Online tools:
- https://dnschecker.org
- https://www.whatsmydns.net

Masukkan: `app.sentraai.id` (atau domain yang disetup)

### 2. **Test di Browser**

```
https://app.sentraai.id
```

Harus redirect ke aplikasi Referralink dengan:
- ✅ HTTPS/SSL aktif (gembok hijau)
- ✅ No security warnings
- ✅ Aplikasi load normal

### 3. **Test dengan curl**

```bash
curl -I https://app.sentraai.id
```

Expected response:
```
HTTP/2 200
x-vercel-id: pdx1::xxxxx
```

---

## 🔄 Redirect Configuration (Optional)

### Redirect www → non-www (atau sebaliknya)

Di Vercel Dashboard → Settings → Domains:

1. Add domain: `sentraai.id`
2. Add domain: `www.sentraai.id`
3. Pilih salah satu sebagai **"Primary Domain"**
4. Domain lain akan auto-redirect

---

## 🐛 Troubleshooting

### ❌ DNS_PROBE_FINISHED_NXDOMAIN

**Cause**: DNS belum propagate atau salah konfigurasi

**Fix**:
1. Cek DNS records sudah benar
2. Tunggu 15 menit - 1 jam
3. Clear browser DNS cache: `chrome://net-internals/#dns`

---

### ❌ SSL Certificate Error

**Cause**: Cloudflare proxy mode atau DNS belum propagate

**Fix**:
1. **Jika pakai Cloudflare**: Set ke "DNS only" (grey cloud)
2. Tunggu 5-10 menit untuk SSL provision
3. Force refresh: `Ctrl + Shift + R`

---

### ❌ Domain shows "Domain Not Found"

**Cause**: Belum ditambahkan di Vercel atau sedang pending verification

**Fix**:
1. Vercel Dashboard → Settings → Domains
2. Pastikan domain sudah ditambahkan
3. Klik **"Refresh"** untuk re-verify
4. Tunggu hingga status **"Valid Configuration"**

---

## 📊 DNS Record Summary

Untuk referensi cepat:

| Purpose | Type | Name | Value | Priority |
|---------|------|------|-------|----------|
| Root domain | A | @ | 76.76.21.21 | Recommended |
| Subdomain | CNAME | app | cname.vercel-dns.com | ⭐ Best |
| WWW | CNAME | www | cname.vercel-dns.com | Optional |

---

## 🔐 Security Best Practices

1. ✅ **Always use HTTPS** (enforced by Vercel)
2. ✅ **Enable HSTS** (di Vercel Settings → Headers)
3. ✅ **Set proper CORS** jika ada API external
4. ✅ **Monitor SSL expiry** (auto-renew tapi tetap monitor)

---

## 📞 Support

**Jika ada masalah:**

1. **Vercel Support**: https://vercel.com/support
2. **DNS Provider Support**: Contact DNS provider (Cloudflare/Namecheap/dll)
3. **Team Internal**: Hubungi tim DevOps Sentra

---

## 📝 Changelog

- **2026-01-28**: Initial documentation
- Domain: `sentraai.id` ready untuk setup
- Project: Referralink (https://referralink.vercel.app)

---

**Status**: ✅ Ready untuk production deployment

**Estimated Setup Time**: 15-30 menit (termasuk DNS propagation)
