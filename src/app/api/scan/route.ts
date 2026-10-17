import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI, Type, Schema } from '@google/genai';
import { ThriftScanResult } from '@/types/thrift';

const SYSTEM_INSTRUCTION = `Kamu adalah kurator pakaian vintage dan ahli thrifting profesional pada rumah lelang high-fashion ("Maison d'Expertise"). Analisis foto pakaian (Garment Silhouette) dan neck tag/care label yang diberikan. Identifikasi brand/maison, nama model/artikel spesifik, kategori pakaian, estimasi era pembuatan (perhatikan jenis jahitan single/double stitch, tipografi font tag, care label, dan negara pembuat seperti Made in USA/Mexico/Japan/Italy/France), ciri-ciri keaslian & konstruksi (craftsmanship & authenticity clues), serta taksiran harga pasar barang bekas (secondhand/vintage) di Indonesia dalam Rupiah (IDR). Berikan respons dalam format JSON sesuai skema.`;

const scanResponseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    brand: {
      type: Type.STRING,
      description: 'Nama brand atau rumah mode (contoh: Carhartt, Levi\'s, Ralph Lauren, Hermès, Unbranded Vintage)',
    },
    item_name: {
      type: Type.STRING,
      description: 'Nama spesifik artikel atau model pakaian (contoh: J97 Detroit Blanket-Lined Jacket, 501 XX Selvedge Denim)',
    },
    category: {
      type: Type.STRING,
      description: 'Kategori pakaian (contoh: Outerwear / Work Jacket, Knitwear, Archival Tee, Tailored Coat)',
    },
    estimated_era: {
      type: Type.STRING,
      description: 'Estimasi era pembuatan (contoh: 1990s Archival, Late 1980s, Y2K Era (2000-2005), Contemporary)',
    },
    worth_level: {
      type: Type.STRING,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'JACKPOT'],
      description: 'Status kurasi: LOW (Pass), MEDIUM (Consider), HIGH (Acquire), JACKPOT (Archival Grail)',
    },
    worth_reason: {
      type: Type.STRING,
      description: 'Penjelasan kuratorial singkat dalam Bahasa Indonesia mengapa item ini memiliki worth_level tersebut di pasar barang bekas/kolektor.',
    },
    authenticity_clues: {
      type: Type.ARRAY,
      items: {
        type: Type.STRING,
      },
      description: 'Daftar 3-5 poin pengamatan konstruksi, jahitan, bahan, hardware, atau detail neck tag/care label.',
    },
    estimated_price_idr: {
      type: Type.OBJECT,
      properties: {
        low: {
          type: Type.NUMBER,
          description: 'Batas bawah harga pasar bekas di Indonesia dalam Rupiah (angka murni, contoh: 250000)',
        },
        average: {
          type: Type.NUMBER,
          description: 'Rata-rata harga pasar bekas yang wajar di Indonesia dalam Rupiah (angka murni, contoh: 450000)',
        },
        high: {
          type: Type.NUMBER,
          description: 'Batas atas harga kolektor/kondisi mint di Indonesia dalam Rupiah (angka murni, contoh: 750000)',
        },
      },
      required: ['low', 'average', 'high'],
    },
    search_keyword_global: {
      type: Type.STRING,
      description: 'Kata kunci pencarian bahasa Inggris yang optimal untuk Grailed / eBay (contoh: "Vintage 90s Carhartt J97 Detroit Jacket")',
    },
    search_keyword_local: {
      type: Type.STRING,
      description: 'Kata kunci pencarian lokal Indonesia yang optimal untuk Tokopedia / Carousell (contoh: "Jaket Carhartt Detroit J97 Second")',
    },
  },
  required: [
    'brand',
    'item_name',
    'category',
    'estimated_era',
    'worth_level',
    'worth_reason',
    'authenticity_clues',
    'estimated_price_idr',
    'search_keyword_global',
    'search_keyword_local',
  ],
};

function parseDataUrl(dataUrl: string): { mimeType: string; data: string } {
  const matches = dataUrl.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
  if (matches && matches.length === 3) {
    return {
      mimeType: matches[1],
      data: matches[2],
    };
  }
  return {
    mimeType: 'image/jpeg',
    data: dataUrl.replace(/^data:image\/\w+;base64,/, ''),
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const images: unknown = body?.images;

    if (!Array.isArray(images) || images.length === 0 || images.length > 2) {
      return NextResponse.json(
        {
          error: 'Mohon unggah minimal 1 foto (maksimal 2 foto: Silhouette & Neck Tag) untuk memulai kurasi.',
        },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'your_google_ai_studio_key') {
      return NextResponse.json(
        {
          error:
            'Kunci API Gemini (GEMINI_API_KEY) belum dikonfigurasi pada environment server (.env.local). Silakan masukkan API key Google AI Studio Anda.',
          code: 'MISSING_API_KEY',
        },
        { status: 503 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    const imageParts = images
      .filter((img): img is string => typeof img === 'string' && img.length > 0)
      .map((imgStr) => {
        const { mimeType, data } = parseDataUrl(imgStr);
        return {
          inlineData: {
            mimeType,
            data,
          },
        };
      });

    if (imageParts.length === 0) {
      return NextResponse.json(
        { error: 'Data gambar tidak valid. Silakan ambil ulang foto pakaian.' },
        { status: 400 }
      );
    }

    const promptText =
      imageParts.length === 2
        ? 'Foto 1 adalah siluet keseluruhan pakaian (Garment Silhouette) dan Foto 2 adalah foto close-up label kerah/perawatan (Neck Tag / Care Label). Lakukan kurasi dan appraisal mendalam.'
        : 'Berikut adalah foto pakaian. Lakukan kurasi dan appraisal mendalam berdasarkan visual konstruksi, grafis, atau label yang terlihat.';

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [
        {
          role: 'user',
          parts: [...imageParts, { text: promptText }],
        },
      ],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
        responseSchema: scanResponseSchema,
        temperature: 0.2,
      },
    });

    const rawText = response.text;
    if (!rawText) {
      return NextResponse.json(
        {
          error:
            'AI tidak dapat membaca detail gambar dengan jelas. Pastikan pencahayaan cukup dan foto neck tag tidak buram.',
        },
        { status: 422 }
      );
    }

    const parsed = JSON.parse(rawText);

    const result: ThriftScanResult = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `scan-${Date.now()}`,
      timestamp: Date.now(),
      brand: parsed.brand || 'Unidentified Maison',
      item_name: parsed.item_name || 'Archival Garment',
      category: parsed.category || 'Apparel',
      estimated_era: parsed.estimated_era || 'Contemporary / Unknown Era',
      worth_level: ['LOW', 'MEDIUM', 'HIGH', 'JACKPOT'].includes(parsed.worth_level)
        ? parsed.worth_level
        : 'MEDIUM',
      worth_reason:
        parsed.worth_reason ||
        'Evaluasi didasarkan pada visual konstruksi pakaian dan estimasi permintaan pasar.',
      authenticity_clues: Array.isArray(parsed.authenticity_clues)
        ? parsed.authenticity_clues
        : ['Periksa kerapian jahitan kerah dan kualitas cetakan care label secara langsung.'],
      estimated_price_idr: {
        low: Number(parsed.estimated_price_idr?.low) || 100000,
        average: Number(parsed.estimated_price_idr?.average) || 250000,
        high: Number(parsed.estimated_price_idr?.high) || 450000,
      },
      search_keyword_global:
        parsed.search_keyword_global || `${parsed.brand || ''} ${parsed.item_name || ''}`.trim(),
      search_keyword_local:
        parsed.search_keyword_local || `${parsed.brand || ''} ${parsed.item_name || ''} second`.trim(),
    };

    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error('Error in /api/scan:', error);
    const message =
      error instanceof Error
        ? error.message
        : 'Terjadi kesalahan saat menganalisis foto pakaian.';
    return NextResponse.json(
      {
        error: `Gagal melakukan kurasi AI: ${message}. Pastikan foto jelas dan tidak buram.`,
      },
      { status: 500 }
    );
  }
}
