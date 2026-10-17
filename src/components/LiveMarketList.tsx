'use client';

import React, { useState } from 'react';
import { ExternalLink, Globe, Loader2, Search, AlertCircle } from 'lucide-react';
import { MarketListing } from '@/types/thrift';

interface LiveMarketListProps {
  keywordGlobal: string;
  keywordLocal: string;
}

export default function LiveMarketList({
  keywordGlobal,
  keywordLocal,
}: LiveMarketListProps) {
  const [listings, setListings] = useState<MarketListing[]>([]);
  const [hasFetched, setHasFetched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [warning, setWarning] = useState<string | null>(null);

  const handleFetchMarketPrices = async () => {
    setIsLoading(true);
    setWarning(null);

    try {
      const response = await fetch('/api/market-price', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keyword_global: keywordGlobal,
          keyword_local: keywordLocal,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setWarning(
          data?.error || 'Tidak dapat memuat harga pasar langsung saat ini.'
        );
      } else {
        setListings(Array.isArray(data?.listings) ? data.listings : []);
        if (data?.warning) {
          setWarning(data.warning);
        }
      }
    } catch {
      setWarning(
        'Koneksi ke server pencarian terputus. Gunakan tautan langsung marketplace di bawah ini.'
      );
    } finally {
      setIsLoading(false);
      setHasFetched(true);
    }
  };

  const encodedLocal = encodeURIComponent(keywordLocal || keywordGlobal);
  const encodedGlobal = encodeURIComponent(keywordGlobal || keywordLocal);

  const directMarketplaces = [
    {
      name: 'Carousell ID',
      region: 'Lokal',
      url: `https://id.carousell.com/search/${encodedLocal}`,
    },
    {
      name: 'Tokopedia',
      region: 'Lokal',
      url: `https://www.tokopedia.com/search?st=product&q=${encodedLocal}`,
    },
    {
      name: 'Grailed',
      region: 'Global Archival',
      url: `https://www.grailed.com/shop?query=${encodedGlobal}`,
    },
    {
      name: 'eBay Vintage',
      region: 'Global',
      url: `https://www.ebay.com/sch/i.html?_nkw=${encodedGlobal}`,
    },
    {
      name: 'Vestiaire',
      region: 'Luxury',
      url: `https://www.vestiairecollective.com/search/?q=${encodedGlobal}`,
    },
  ];

  return (
    <div className="border-t border-[#E2DCD3] pt-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <span className="text-[11px] uppercase tracking-[0.2em] text-[#6E6A64] font-medium flex items-center gap-2">
            <Globe className="w-3.5 h-3.5 text-[#F37021]" />
            TAHAP II — LIVE MARKET VALUATION
          </span>
          <p className="text-xs text-[#6E6A64] mt-1">
            Pencarian real-time hanya dipicu secara manual untuk menghemat kuota API.
          </p>
        </div>

        <button
          type="button"
          onClick={handleFetchMarketPrices}
          disabled={isLoading}
          className="rounded-none bg-[#1E1E1C] hover:bg-[#F37021] text-[#FAF8F5] uppercase tracking-[0.15em] text-xs py-3.5 px-6 transition-colors flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-60"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Memindai Katalog Global &amp; Lokal...</span>
            </>
          ) : (
            <>
              <Search className="w-4 h-4" />
              <span>
                {hasFetched
                  ? 'Perbarui Harga Pasar Saat Ini'
                  : 'Lihat Harga Pasar Saat Ini'}
              </span>
            </>
          )}
        </button>
      </div>

      {/* Warning or Fallback Notice */}
      {warning && (
        <div className="mb-4 p-4 bg-[#F5EBE1] border border-[#E2C9B0] text-xs text-[#8C5A32] flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#C85000]" />
          <div className="leading-relaxed">{warning}</div>
        </div>
      )}

      {/* Live Serper Results Editorial Grid */}
      {hasFetched && listings.length > 0 && (
        <div className="mt-4 mb-6">
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#6E6A64] mb-3">
            Referensi Katalog Aktif ({listings.length} Listing Ditemukan)
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {listings.map((item, idx) => (
              <a
                key={`${item.link}-${idx}`}
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-[#F6F1EB] border border-[#E2DCD3] hover:border-[#1E1E1C] p-3.5 flex gap-3.5 transition-colors"
              >
                {item.thumbnail && (
                  <div className="w-16 h-20 shrink-0 border border-[#E2DCD3] bg-[#FAF8F5] overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.thumbnail}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] uppercase tracking-[0.18em] text-[#F37021] font-medium">
                        {item.source}
                      </span>
                      <ExternalLink className="w-3 h-3 text-[#6E6A64] group-hover:text-[#1E1E1C] transition-colors shrink-0" />
                    </div>
                    <h4 className="text-xs text-[#1E1E1C] font-medium line-clamp-2 mt-1 leading-snug">
                      {item.title}
                    </h4>
                  </div>
                  <p className="font-mono text-xs text-[#1E1E1C] font-medium mt-2 pt-1.5 border-t border-[#E2DCD3]">
                    {item.price}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Free Direct Marketplace Deep Links (Zero API Quota) */}
      <div className="mt-4 bg-[#F6F1EB] border border-[#E2DCD3] p-4">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[10px] uppercase tracking-[0.2em] text-[#6E6A64] font-medium">
            Direct Marketplace Links (Bebas Kuota API)
          </span>
          <span className="font-mono text-[10px] text-[#6E6A64] truncate max-w-[200px]">
            &ldquo;{keywordGlobal}&rdquo;
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {directMarketplaces.map((mp) => (
            <a
              key={mp.name}
              href={mp.url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#FAF8F5] border border-[#E2DCD3] hover:border-[#1E1E1C] px-3 py-2.5 flex flex-col justify-between transition-colors group"
            >
              <span className="text-[9px] uppercase tracking-[0.16em] text-[#6E6A64]">
                {mp.region}
              </span>
              <span className="text-xs font-medium text-[#1E1E1C] group-hover:text-[#F37021] flex items-center justify-between mt-1 transition-colors">
                <span>{mp.name}</span>
                <ExternalLink className="w-3 h-3" />
              </span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
