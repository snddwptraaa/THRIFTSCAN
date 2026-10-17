# Technical Architecture & API Specification - ThriftScan AI

## 1. Tech Stack
- **Framework:** Next.js 15 (App Router) + TypeScript
- **Styling:** Tailwind CSS + Lucide React (Icons)
- **AI Vision Engine:** Google Gemini API (`@google/genai` SDK) menggunakan model `gemini-2.5-flash`
- **Market Search Engine:** Serper.dev API (`https://google.serper.dev/shopping` & `https://google.serper.dev/search`)
- **State & Storage:** React State + Browser `localStorage` (untuk menyimpan riwayat *scan* tanpa memerlukan *database* di tahap MVP)

## 2. Environment Variables (`.env.local`)
```env
GEMINI_API_KEY="your_google_ai_studio_key"
SERPER_API_KEY="your_serper_dev_key"
```

## 3. Struktur Direktori Proyek
```text
src/
├── app/
│   ├── api/
│   │   ├── scan/
│   │   │   └── route.ts          # Endpoint Tahap 1: Gemini Vision Analysis
│   │   └── market-price/
│   │       └── route.ts          # Endpoint Tahap 2: Serper.dev Live Price
│   ├── layout.tsx
│   └── page.tsx                  # Halaman Utama (Scanner, Hasil, History)
├── components/
│   ├── ImageUploader.tsx         # Kamera / Upload 1-2 Foto + Client Compression
│   ├── ScanResultCard.tsx        # Tampilan hasil analisis Gemini
│   ├── ProfitCalculator.tsx      # Kalkulator harga beli vs estimasi jual
│   ├── LiveMarketList.tsx        # Hasil harga dari Serper.dev + Deep Links
│   └── ScanHistory.tsx           # Daftar riwayat scan dari localStorage
└── types/
    └── thrift.ts                 # TypeScript interfaces
```

## 4. Kontrak Data & Skema TypeScript (`src/types/thrift.ts`)

```typescript
export type WorthLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'JACKPOT';

export interface ThriftScanResult {
  id: string;
  timestamp: number;
  brand: string;
  item_name: string;
  category: string;
  estimated_era: string;
  worth_level: WorthLevel;
  worth_reason: string;
  authenticity_clues: string[];
  estimated_price_idr: {
    low: number;
    average: number;
    high: number;
  };
  search_keyword_global: string; // Contoh: "Vintage 90s Carhartt J97 Detroit Jacket"
  search_keyword_local: string;  // Contoh: "Jaket Carhartt Detroit J97 Second"
}

export interface MarketListing {
  title: string;
  source: string;
  price: string;
  link: string;
  thumbnail?: string;
}
```

## 5. Spesifikasi Endpoint API

### A. `POST /api/scan` (Gemini 2.5 Flash)
- **Request Body:**
  ```json
  {
    "images": [
      "data:image/jpeg;base64,...",
      "data:image/jpeg;base64,..."
    ]
  }
  ```
- **System Instruction untuk Gemini:**
  > "Kamu adalah kurator pakaian vintage dan ahli thrifting profesional. Analisis foto pakaian dan neck tag/wash tag yang diberikan. Identifikasi brand, nama model spesifik, estimasi era pembuatan (perhatikan jenis jahitan single/double stitch, font tag, dan negara pembuat seperti Made in USA/Mexico/Japan), ciri keaslian, serta taksiran harga pasar barang bekas di Indonesia dalam Rupiah (IDR). Berikan respons dalam format JSON sesuai skema."
- **Output:** Mengembalikan objek JSON yang sesuai dengan `ThriftScanResult`.

### B. `POST /api/market-price` (Serper.dev)
- **Request Body:**
  ```json
  {
    "keyword_global": "Vintage 90s Carhartt J97 Detroit Jacket",
    "keyword_local": "Carhartt J97 Second"
  }
  ```
- **Logika Pemanggilan Serper.dev:**
  Memanggil `https://google.serper.dev/search` atau `/shopping` dengan header `X-API-KEY: process.env.SERPER_API_KEY`.
  Gunakan query kombinasi seperti:
  `q: "${keyword_global} (site:grailed.com OR site:ebay.com OR site:carousell.co.id OR site:tokopedia.com)"` dengan parameter `gl: "id"` dan `hl: "id"`.
- **Output:** Array dari `MarketListing`.