# Product Requirements Document (PRD) - ThriftScan AI (Hermès Editorial Edition)

## 1. Gambaran Umum Produk
**ThriftScan AI** adalah aplikasi web berbasis *mobile-first* (PWA) untuk kurasi dan *appraisal* pakaian bekas (*thrifting*). Mengusung estetika **"Luxury Archival & Maison Curatorial"** yang terinspirasi dari situs resmi **Hermès**, aplikasi ini mengubah pengalaman *thrifting* menjadi seperti proses kurasi barang antik/mewah di rumah lelang atau butik *high-fashion*.

## 2. Target Pengguna & Use Case Utama
- **Kondisi Penggunaan:** Pengguna sedang memilih pakaian di pasar *thrift* atau *curated vintage shop*, memegang pakaian dengan satu tangan dan mengoperasikan ponsel dengan tangan lainnya.
- **Kebutuhan:** Antarmuka harus sangat bersih (*clutter-free*), kontras tinggi di bawah cahaya terang (menggunakan *warm ivory background* dan teks *deep charcoal*), responsif untuk satu jempol (*thumb-friendly*), serta hemat kuota API.

## 3. Alur Kerja Utama (Smart 2-Step Trigger Workflow)

Untuk menghemat kuota *free-tier* API pencari harga, aplikasi WAJIB menggunakan alur 2 tahap berikut:

### Tahap 1: Instant AI Vision Appraisal (Gemini 2.5 Flash)
1. Pengguna mengambil 1 atau 2 foto pada bingkai kurasi:
   - **Silhouette / Garment (Wajib):** Foto keseluruhan pakaian atau grafik utama.
   - **Neck Tag / Care Label (Opsional namun disarankan):** Foto *close-up* label merek atau jahitan kerah.
2. Gambar dikompresi di sisi klien (*client-side* `<canvas>`) agar ukuran maksimal < 1MB sebelum dikirim ke server.
3. Server mengirim gambar ke **Gemini 2.5 Flash API** dengan *Structured JSON Output*.
4. Aplikasi menampilkan **Archival Dossier (Kartu Hasil Kurasi)**:
   - Nama Maison/Brand, Model, dan Kategori dengan tipografi *serif* elegan.
   - Estimasi Era Pembuatan (misal: *1990s Archival*, *Y2K Era*, *Contemporary*).
   - Indikator Kurasi (**Worth Level**): `PASS` (Low), `CONSIDER` (Medium), `ACQUIRE` (High), atau `GRAIL / ARCHIVAL` (Jackpot).
   - Taksiran Valuasi Pasar (IDR) dari pengetahuan internal AI.
   - Catatan Keaslian & Konstruksi (*Craftsmanship & Authenticity Clues*).
   - **Margin & Acquisition Calculator:** Input harga beli di lokasi untuk menghitung potensi margin keuntungan secara instan.

### Tahap 2: Live Market Valuation (Serper.dev API)
1. Pada kartu hasil kurasi (Tahap 1), terdapat tombol utama **"Lihat Harga Pasar Saat Ini"**.
2. Tombol ini **HANYA** dipicu jika pengguna menekannya secara manual.
3. Saat ditekan, aplikasi mengirim `search_keyword` ke *endpoint* `/api/market-price` yang memanggil **Serper.dev**.
4. Aplikasi menampilkan daftar katalog harga barang serupa dari pasar lokal (Tokopedia, Carousell) dan global (Grailed, eBay, Vestiaire Collective) dalam tata letak *grid* editorial yang bersih.
5. Tersedia pula deretan tautan langsung (**Direct Marketplace Links**) tanpa memotong kuota API.

## 4. Identitas Visual & UI/UX (Hermès Reference)
- **Filosofi Desain:** *Quiet Luxury*, ruang kosong (*whitespace*) yang lega, garis pembatas tipis (*hairline borders* `1px`), sudut tajam atau sangat sedikit membulat (`rounded-none` hingga `rounded-sm`), dan transisi halus.
- **Palet Warna:** Latar belakang *Warm Alabaster / Cream* (`#F6F1EB`), kartu *Pure Ivory* (`#FAF8F5`), teks *Deep Espresso / Charcoal* (`#1E1E1C`), dan aksen ikonik *Hermès Orange* (`#F37021`).
- **Riwayat Kurasi Lokal (Personal Archive):** Menyimpan riwayat *scan* di `localStorage` dalam tampilan katalog vertikal yang rapi.