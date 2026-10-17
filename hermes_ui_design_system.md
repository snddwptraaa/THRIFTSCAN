# Design System & Style Guide - Hermès Reference (`hermes.com`)

Dokumen ini menjadi acuan mutlak bagi AI *coding assistant* dalam merancang setiap komponen UI aplikasi **ThriftScan AI**.

## 1. Palet Warna (Color Tokens)

Jangan gunakan warna *dark mode* neon atau abu-abu standar Tailwind. Gunakan variabel warna hangat khas Hermès berikut:

- **Background Primary (Canvas):** `#F6F1EB` (*Warm Cream / Alabaster*)
- **Background Secondary (Surface / Card):** `#FAF8F5` (*Soft Ivory*)
- **Text Primary (Headings & Body):** `#1E1E1C` (*Deep Charcoal / Espresso Black*)
- **Text Secondary (Captions & Labels):** `#6E6A64` (*Warm Taupe / Muted Stone*)
- **Accent Primary (Brand Signature):** `#F37021` (*Hermès Orange* — gunakan untuk CTA utama & indikator fokus)
- **Accent Hover:** `#D95D12` (*Deep Burnt Orange*)
- **Border & Hairline Divider:** `#E2DCD3` (*Warm Sand Border*, selalu gunakan ketebalan `1px`)

### Warna Status Kurasi (Worth Level Badges)
Tetap gunakan nuansa *luxury/editorial* (bukan warna lampu lalu lintas yang mencolok):
- `LOW` (**PASS**): Background `#EFECE6`, Text `#6E6A64`, Border `#D8D3C8`
- `MEDIUM` (**CONSIDER**): Background `#F5EBE1`, Text `#8C5A32`, Border `#E2C9B0`
- `HIGH` (**ACQUIRE**): Background `#FDF0E6`, Text `#C85000`, Border `#F37021`
- `JACKPOT` (**ARCHIVAL GRAIL**): Background `#1E1E1C`, Text `#FAF8F5`, Border `#F37021` (dengan aksen titik *Hermès Orange*)

## 2. Tipografi (Typography)

Gunakan kombinasi *Editorial Serif* untuk judul dan *Clean Geometric Sans* untuk data/angka:
- **Heading Font (`font-serif`):** `Playfair Display`, `Cormorant Garamond`, atau `Instrument Serif` (via `next/font/google`).
  - Gunakan untuk nama Brand, Judul Halaman, dan Nilai Valuasi Utama.
- **Body & UI Font (`font-sans`):** `Plus Jakarta Sans` atau `Inter`.
  - Gunakan untuk label *form*, deskripsi keaslian, dan navigasi.
  - Untuk sub-judul bagian (*section label*), selalu gunakan format: `text-[11px] uppercase tracking-[0.2em] text-[#6E6A64] font-medium`.
- **Monospace Font (`font-mono`):** `JetBrains Mono` (khusus untuk angka kalkulator, tahun era, dan rentang harga agar sejajar rapi).

## 3. Karakteristik Komponen (Component Styling)

1. **Header / Top Navigation:**
   - Tinggi ramping, latar `#F6F1EB` dengan garis bawah `border-b border-[#E2DCD3]`.
   - Judul aplikasi di tengah dengan *serif* kapital berjarak renggang: `THRIFTSCAN` dan sub-teks kecil `MAISON D'EXPERTISE`.
2. **Slot Kamera / Upload (The Frame):**
   - Tidak menggunakan *dropzone* bulat bergaya SaaS biasa.
   - Gunakan bingkai persegi panjang vertikal (rasio 3:4 atau 4:5 seperti foto katalog mode) dengan `border border-dashed border-[#C7BFB3] bg-[#FAF8F5]`.
   - Saat foto terunggah, tampilkan foto penuh dengan bingkai tipis `1px solid #1E1E1C`.
3. **Tombol Utama (Primary Button):**
   - Bentuk tegas (`rounded-none` atau `rounded-[2px]`), latar belakang `#1E1E1C` atau `#F37021`, teks putih `#FAF8F5` dengan huruf kapital semua `uppercase tracking-[0.15em] text-xs py-4`.
4. **Kartu Hasil (The Archival Dossier):**
   - Terlihat seperti sertifikat keaslian atau *tag* harga butik mewah.
   - Setiap bagian informasi (Era, Valuasi, Ciri Keaslian, Kalkulator) dipisahkan oleh garis horizontal tipis `border-t border-[#E2DCD3] py-5`.
   - Hindari penggunaan `box-shadow` tebal; gunakan *flat border* `1px solid #E2DCD3`.