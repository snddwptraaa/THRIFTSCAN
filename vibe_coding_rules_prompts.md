# Vibe Coding Guide & AI Rules (.cursorrules)

*Salin bagian "Rules untuk AI" di bawah ini ke dalam file `.cursorrules` atau `CLAUDE.md` di root proyek Anda, lalu gunakan daftar Prompt secara berurutan.*

## Bagian 1: Rules untuk AI Coding Assistant (`.cursorrules`)

```
You are an expert Full-Stack Next.js developer and Luxury Fashion UI Designer building "ThriftScan AI", a mobile-first web app for thrift shoppers.

CRITICAL RULES:
1. Framework: Use Next.js App Router (TypeScript) and Tailwind CSS.
2. SDK: Always use the official `@google/genai` SDK (NOT the deprecated `@google/generative-ai`) with model `gemini-2.5-flash`.
3. Quota Saving Architecture: NEVER call the `/api/market-price` (Serper.dev) endpoint automatically after scanning. It MUST only be called when the user explicitly clicks the "Lihat Harga Pasar Saat Ini" button.
4. Image Handling: Always compress and resize uploaded/captured images on the client side using HTML5 `<canvas>` (max width/height: 1024px, quality: 0.7 JPEG) before sending base64 strings to `/api/scan` to prevent Next.js payload size limits.
5. UI/UX & Aesthetic (HERMÈS REFERENCE):
   - Follow `DESIGN_SYSTEM.md` strictly. Inspired by https://www.hermes.com/us/en/.
   - Light editorial theme ONLY: Warm Cream background (`#F6F1EB`), Soft Ivory cards (`#FAF8F5`), Deep Espresso text (`#1E1E1C`), Muted Taupe labels (`#6E6A64`), Hairline dividers (`#E2DCD3`), and Hermès Orange accents (`#F37021`).
   - Typography: Pair an editorial serif (`Playfair Display` or `Cormorant Garamond`) for headings/brand names with a clean sans-serif (`Plus Jakarta Sans`) and wide uppercase letter-spacing (`tracking-[0.18em]`) for section labels and buttons.
   - Shapes: Sharp or micro-rounded edges (`rounded-none` or `rounded-[2px]`), 1px solid borders, zero heavy drop shadows, generous padding and whitespace.
6. Error Resilience: Provide elegant fallback messages if Gemini fails to read a blurry tag or if `SERPER_API_KEY` is missing/exhausted. Always include free direct deep-link buttons (Carousell, Tokopedia, Grailed, eBay) styled as minimalist editorial pill/box links.
```

## Bagian 2: Urutan Prompt Vibe Coding (Step-by-Step)

Gunakan prompt ini satu per satu di AI Editor Anda:

### Prompt 1: Inisialisasi Fondasi, Font Hermès & Types
> "Baca file `PRD.md`, `ARCHITECTURE.md`, dan `DESIGN_SYSTEM.md`. Konfigurasikan `src/app/layout.tsx` dan Tailwind agar memuat Google Fonts `Cormorant_Garamond` (sebagai font-serif) dan `Plus_Jakarta_Sans` (sebagai font-sans), serta atur warna background dasar body ke `#F6F1EB` dan teks `#1E1E1C`. Selanjutnya, buat `src/types/thrift.ts` dan utilitas kompresi gambar `src/lib/imageCompression.ts` (resize maks 1024px, JPEG quality 0.7)."

### Prompt 2: Pembuatan Endpoint AI Vision (`/api/scan`)
> "Buat endpoint `src/app/api/scan/route.ts` menggunakan `@google/genai` dan model `gemini-2.5-flash`. Endpoint ini menerima array base64 `images` (maksimal 2 foto: foto baju & foto neck tag). Gunakan `responseMimeType: 'application/json'` dan `responseSchema` agar keluarannya sesuai dengan interface `ThriftScanResult` di `src/types/thrift.ts`. Pastikan analisis mencakup estimasi era dari tag, poin-poin ciri keaslian, dan taksiran harga pasar second di Indonesia (IDR)."

### Prompt 3: Pembuatan Endpoint Harga Pasar (`/api/market-price`)
> "Buat endpoint `src/app/api/market-price/route.ts` yang menerima `keyword_global` dan `keyword_local`. Endpoint ini menembak API Serper.dev (`https://google.serper.dev/shopping` dan fallback ke `https://google.serper.dev/search`) menggunakan `process.env.SERPER_API_KEY`. Format hasilnya menjadi array `MarketListing` berisi judul, harga, nama platform, gambar thumbnail, dan link."

### Prompt 4: Pembuatan UI Scanner & Kartu Dossier Gaya Hermès
> "Bangun halaman utama di `src/app/page.tsx` dan komponen pendukungnya dengan mengikuti `DESIGN_SYSTEM.md` (referensi Hermès web: latar `#F6F1EB`, aksen `#F37021`, border tipis `#E2DCD3`, sudut tajam `rounded-none`, dan tipografi serif editorial).
> Fitur yang harus ada:
> 1. Header minimalis bergaya rumah mode dengan judul serif `THRIFTSCAN` dan sub-label `ARCHIVAL & VINTAGE APPRAISAL`.
> 2. Input 2 bingkai foto rasio potret: 'I. Garment Silhouette' dan 'II. Neck Tag / Label' yang mendukung kamera HP langsung (`capture='environment'`) maupun galeri.
> 3. Tombol CTA utama berwarna Hermès Orange (`#F37021`) atau Deep Espresso (`#1E1E1C`) dengan teks uppercase berjarak renggang.
> 4. Kartu Hasil Kurasi ('Archival Dossier') yang menampilkan status Worth Level (`PASS`, `CONSIDER`, `ACQUIRE`, `ARCHIVAL GRAIL`), nama brand dengan font serif besar, estimasi era, detail konstruksi/keaslian, dan rentang valuasi harga IDR.
> 5. Komponen Kalkulator Akuisisi di mana user mengetik 'Harga Akuisisi di Lokasi' lalu sistem menghitung estimasi margin profit bersih.
> 6. Tombol 'Lihat Harga Pasar Saat Ini' (memanggil `/api/market-price`) serta deretan tombol tautan langsung ke Carousell, Tokopedia, Grailed, dan eBay."

### Prompt 5: Fitur Katalog Riwayat (`localStorage`)
> "Tambahkan bagian 'Personal Archive (Riwayat Kurasi)' di bagian bawah halaman menggunakan `localStorage`. Tampilkan daftar baju yang sudah di-scan dalam tata letak grid katalog 2 kolom ala halaman produk Hermès (foto bersih, nama brand serif, era, dan harga rata-rata) yang ketika diklik akan membuka kembali detail Dossier baju tersebut tanpa memotong kuota API."