import { NextRequest, NextResponse } from 'next/server';
import { MarketListing } from '@/types/thrift';

interface SerperShoppingItem {
  title?: string;
  source?: string;
  price?: string;
  link?: string;
  imageUrl?: string;
  thumbnailUrl?: string;
}

interface SerperOrganicItem {
  title?: string;
  link?: string;
  snippet?: string;
  priceRange?: string;
  currency?: string;
  price?: number | string;
  imageUrl?: string;
}

function detectPlatformName(url: string, fallbackSource?: string): string {
  if (fallbackSource && fallbackSource.trim().length > 0) {
    return fallbackSource;
  }
  try {
    const hostname = new URL(url).hostname.replace(/^www\./, '');
    if (hostname.includes('grailed.com')) return 'Grailed';
    if (hostname.includes('ebay.')) return 'eBay';
    if (hostname.includes('carousell.')) return 'Carousell';
    if (hostname.includes('tokopedia.com')) return 'Tokopedia';
    if (hostname.includes('vestiairecollective.com')) return 'Vestiaire Collective';
    if (hostname.includes('depop.com')) return 'Depop';
    if (hostname.includes('shopee.')) return 'Shopee';
    return hostname;
  } catch {
    return 'Marketplace';
  }
}

function extractPriceFromSnippet(item: SerperOrganicItem): string {
  if (item.priceRange) return item.priceRange;
  if (item.price) {
    return item.currency ? `${item.currency} ${item.price}` : String(item.price);
  }
  if (item.snippet) {
    const match = item.snippet.match(
      /(Rp\s?[\d.,]+(?:\s?(?:rb|ribu|jt|juta))?|\$\s?[\d.,]+|US\$\s?[\d.,]+|IDR\s?[\d.,]+|€\s?[\d.,]+|£\s?[\d.,]+)/i
    );
    if (match) {
      return match[0];
    }
  }
  if (item.title) {
    const titleMatch = item.title.match(
      /(Rp\s?[\d.,]+|\$\s?[\d.,]+|US\$\s?[\d.,]+|IDR\s?[\d.,]+)/i
    );
    if (titleMatch) {
      return titleMatch[0];
    }
  }
  return 'Lihat di Platform';
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const keywordGlobal = (body?.keyword_global || '').trim();
    const keywordLocal = (body?.keyword_local || '').trim();

    if (!keywordGlobal && !keywordLocal) {
      return NextResponse.json(
        { error: 'Kata kunci pencarian (keyword_global atau keyword_local) diperlukan.' },
        { status: 400 }
      );
    }

    const serperApiKey = process.env.SERPER_API_KEY;
    if (!serperApiKey || serperApiKey === 'your_serper_dev_key') {
      return NextResponse.json(
        {
          listings: [],
          warning:
            'Kunci SERPER_API_KEY belum dikonfigurasi di .env.local. Anda tetap dapat mengecek harga pasar secara langsung melalui tautan marketplace di bawah ini tanpa kuota API.',
          code: 'MISSING_SERPER_KEY',
        },
        { status: 200 }
      );
    }

    const listings: MarketListing[] = [];
    const seenLinks = new Set<string>();

    // 1. Primary call: Serper Shopping endpoint
    const shoppingResponse = await fetch('https://google.serper.dev/shopping', {
      method: 'POST',
      headers: {
        'X-API-KEY': serperApiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: keywordLocal || keywordGlobal,
        gl: 'id',
        hl: 'id',
        num: 6,
      }),
    });

    if (shoppingResponse.ok) {
      const shoppingData = await shoppingResponse.json();
      const shoppingItems: SerperShoppingItem[] = Array.isArray(shoppingData?.shopping)
        ? shoppingData.shopping
        : [];

      for (const item of shoppingItems) {
        if (item.title && item.link && !seenLinks.has(item.link)) {
          seenLinks.add(item.link);
          listings.push({
            title: item.title,
            source: detectPlatformName(item.link, item.source),
            price: item.price || 'Lihat Harga',
            link: item.link,
            thumbnail: item.imageUrl || item.thumbnailUrl,
          });
        }
      }
    }

    // 2. Combined marketplace search / fallback via Serper Search endpoint
    if (listings.length < 6) {
      const searchQuery = `${keywordGlobal || keywordLocal} (site:grailed.com OR site:ebay.com OR site:carousell.co.id OR site:tokopedia.com OR site:vestiairecollective.com)`;
      const searchResponse = await fetch('https://google.serper.dev/search', {
        method: 'POST',
        headers: {
          'X-API-KEY': serperApiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: searchQuery,
          gl: 'id',
          hl: 'id',
          num: 8,
        }),
      });

      if (searchResponse.ok) {
        const searchData = await searchResponse.json();
        const organicItems: SerperOrganicItem[] = Array.isArray(searchData?.organic)
          ? searchData.organic
          : [];

        for (const item of organicItems) {
          if (item.title && item.link && !seenLinks.has(item.link)) {
            seenLinks.add(item.link);
            listings.push({
              title: item.title,
              source: detectPlatformName(item.link),
              price: extractPriceFromSnippet(item),
              link: item.link,
              thumbnail: item.imageUrl,
            });
          }
          if (listings.length >= 8) break;
        }
      }
    }

    return NextResponse.json({
      listings,
      warning:
        listings.length === 0
          ? 'Tidak ditemukan katalog langsung untuk artikel spesifik ini. Gunakan tautan marketplace di bawah untuk eksplorasi manual.'
          : undefined,
    });
  } catch (error: unknown) {
    console.error('Error in /api/market-price:', error);
    return NextResponse.json(
      {
        listings: [],
        warning:
          'Layanan pencarian harga pasar sedang tidak dapat dijangkau. Silakan gunakan tautan langsung marketplace di bawah ini.',
      },
      { status: 200 }
    );
  }
}
