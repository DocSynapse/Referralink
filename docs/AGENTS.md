# Repository Guidelines

Panduan ringkas kontribusi Referralink.

## Struktur Proyek
- `App.tsx`: entry routing hash.
- `components/`: UI fitur; `components/ui/` atom + animasi GSAP.
- `services/`: integrasi (`geminiService.ts` LLM, `cacheService.ts`, `memory_service/`).
- `constants/` + `constants.ts`: data bersama; `types.ts` tipe pusat.
- `lib/utils.ts`; aset `public/`; dokumentasi `docs/`; konfigurasi root (`vite.config.ts`, `.env.example`, `tailwind.config.js`).

## Perintah Build/Test/Dev
- Instal: `npm install` (pnpm/yarn OK), Node 18+.
- Dev: `npm run dev` → http://localhost:5173.
- Type-check: `npx tsc --noEmit`.
- Build: `npm run build`; pratinjau: `npm run preview`.

## Gaya Koding & Penamaan
- React 19 fungsi + hooks; state terlokalisasi.
- Indent 2 spasi; impor urut library → lokal; semicolon; return type pada ekspor.
- PascalCase komponen/file; camelCase variabel/fungsi; konstanta lintas modul SCREAMING_SNAKE_CASE.
- Styling: Tailwind di `index.css`; minim inline; reuse `components/ui`.

## Arsitektur & Alur Data
`App.tsx` memicu query → `services/geminiService.ts` (LLM + cache) → hasil ke komponen presentasi (ReferralDeck, LogTerminal) → animasi GSAP/TextBlock; cache di `cacheService.ts`, simpan ringan di `memory_service/`.

## Profil Lingkungan
`VITE_OPENAI_API_KEY` wajib; opsional `VITE_API_BASE`, `VITE_LOG_LEVEL`; semua variabel client berprefix `VITE_`.

## Aksesibilitas & UX
- Label/`aria-*` pada kontrol; fokus keyboard aman di dialog/overlay.
- Kontras minimal WCAG AA; hormati `prefers-reduced-motion` untuk animasi besar.

## Performa
- Target bundle <300 KB gzip; lazy-load modul berat (Leaflet/GSAP) bila tidak perlu awal.
- Kurangi rerender: memo komponen berat, debounce pencarian.

## Observabilitas & Logging
- Level: info (alur), warn (fallback), error (jaringan/LLM).
- Jangan log PII/PHI; redaksi sebelum simpan ke `memory_service/`.

## Proses Rilis
- Pra: `npx tsc --noEmit`, `npm run build`, `npm audit --production`.
- Rilis: tag semver, update CHANGELOG bila ada perubahan user-facing.

## Pedoman Testing
- Saat ini: `npm run build` + `npx tsc --noEmit` + smoke test halaman & `#/referralink` desktop/mobile.
- Tambah test: Vitest + React Testing Library; simpan `*.test.tsx` atau `__tests__/`; mock LLM di `services/`.

## Commit & Pull Request
- Prefix: `feat:`, `fix:`, `refactor:`, `style:`, `docs:`, `chore:` (emoji opsional).
- Komit kecil; jelaskan perubahan logika klinis atau caching.
- PR: ringkasan, link issue/ticket, screenshot UI (desktop & mobile), cek `build` + `tsc` + browser smoke; jangan merge jika build merah.

## Keamanan & Konfigurasi
- Jangan commit rahasia; gunakan `.env`; putar kunci LLM bila bocor.
- Hindari hardcode endpoint; jadikan ENV/konstanta; sanitasi input sebelum kirim ke LLM; siapkan CORS/CSP saat deploy.

## Dokumentasi
- Tambah doc di `docs/` nama kebab-case (mis. `performance-budget.md`) dengan contoh perintah/konfigurasi nyata.
