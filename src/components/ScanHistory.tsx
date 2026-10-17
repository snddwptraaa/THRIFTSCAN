'use client';

import React from 'react';
import { Archive, Trash2, ArrowUpRight, Sparkles } from 'lucide-react';
import { ThriftScanResult, WorthLevel } from '@/types/thrift';
import { formatIdrCurrency } from '@/lib/format';

interface ScanHistoryProps {
  history: ThriftScanResult[];
  activeId?: string;
  onSelect: (item: ThriftScanResult) => void;
  onClearHistory: () => void;
  onLoadSample?: () => void;
}

const BADGE_LABEL: Record<WorthLevel, { text: string; className: string }> = {
  LOW: {
    text: 'PASS',
    className: 'bg-[#EFECE6] text-[#6E6A64] border-[#D8D3C8]',
  },
  MEDIUM: {
    text: 'CONSIDER',
    className: 'bg-[#F5EBE1] text-[#8C5A32] border-[#E2C9B0]',
  },
  HIGH: {
    text: 'ACQUIRE',
    className: 'bg-[#FDF0E6] text-[#C85000] border-[#F37021]',
  },
  JACKPOT: {
    text: 'ARCHIVAL GRAIL',
    className: 'bg-[#1E1E1C] text-[#FAF8F5] border-[#F37021]',
  },
};

export default function ScanHistory({
  history,
  activeId,
  onSelect,
  onClearHistory,
  onLoadSample,
}: ScanHistoryProps) {
  return (
    <section className="mt-10 pt-8 border-t border-[#E2DCD3]">
      <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
        <div>
          <span className="text-[11px] uppercase tracking-[0.2em] text-[#6E6A64] font-medium flex items-center gap-2">
            <Archive className="w-3.5 h-3.5 text-[#F37021]" />
            PERSONAL ARCHIVE (RIWAYAT KURASI)
          </span>
          <h3 className="font-serif text-2xl sm:text-3xl text-[#1E1E1C] mt-1">
            Katalog Koleksi Terpindai
          </h3>
        </div>

        <div className="flex items-center gap-3">
          {onLoadSample && (
            <button
              type="button"
              onClick={onLoadSample}
              className="text-[10px] uppercase tracking-[0.18em] text-[#1E1E1C] border border-[#E2DCD3] bg-[#FAF8F5] hover:border-[#1E1E1C] px-3 py-2 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3 h-3 text-[#F37021]" />
              <span>Muat Contoh Dossier Arsip</span>
            </button>
          )}

          {history.length > 0 && (
            <button
              type="button"
              onClick={onClearHistory}
              className="text-[10px] uppercase tracking-[0.18em] text-[#6E6A64] hover:text-[#C85000] border border-[#E2DCD3] px-3 py-2 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3 h-3" />
              <span>Bersihkan Arsip</span>
            </button>
          )}
        </div>
      </div>

      {history.length === 0 ? (
        <div className="bg-[#FAF8F5] border border-[#E2DCD3] p-8 text-center">
          <p className="font-serif text-xl text-[#1E1E1C]">
            Belum Ada Artikel dalam Arsip Pribadi
          </p>
          <p className="text-xs text-[#6E6A64] mt-1.5 max-w-md mx-auto leading-relaxed">
            Setiap pakaian yang Anda pindai akan tersimpan secara otomatis di perangkat ini untuk perbandingan harga tanpa memotong kuota API.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {history.map((item) => {
            const badge = BADGE_LABEL[item.worth_level] || BADGE_LABEL.MEDIUM;
            const isSelected = activeId === item.id;
            const formattedAvg = formatIdrCurrency(item.estimated_price_idr.average);

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelect(item)}
                className={`text-left bg-[#FAF8F5] border transition-colors p-3 sm:p-4 flex flex-col justify-between group cursor-pointer ${
                  isSelected
                    ? 'border-[#F37021] ring-1 ring-[#F37021]'
                    : 'border-[#E2DCD3] hover:border-[#1E1E1C]'
                }`}
              >
                <div>
                  <div className="aspect-[3/4] w-full bg-[#F6F1EB] border border-[#E2DCD3] mb-3 overflow-hidden relative flex items-center justify-center">
                    {item.thumbnail ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.thumbnail}
                        alt={item.item_name}
                        className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                      />
                    ) : (
                      <div className="p-4 text-center">
                        <span className="font-serif italic text-sm text-[#6E6A64]">
                          {item.brand}
                        </span>
                      </div>
                    )}
                    <span
                      className={`absolute top-2 left-2 px-2 py-0.5 text-[9px] uppercase tracking-[0.16em] border ${badge.className}`}
                    >
                      {badge.text}
                    </span>
                  </div>

                  <p className="font-mono text-[10px] text-[#6E6A64] uppercase tracking-[0.14em] truncate">
                    {item.estimated_era}
                  </p>
                  <h4 className="font-serif text-lg sm:text-xl text-[#1E1E1C] leading-snug mt-0.5 truncate">
                    {item.brand}
                  </h4>
                  <p className="text-xs text-[#6E6A64] line-clamp-1 mt-0.5">
                    {item.item_name}
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-[#E2DCD3] flex items-center justify-between">
                  <span className="font-mono text-xs font-medium text-[#1E1E1C]">
                    {formattedAvg}
                  </span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#6E6A64] group-hover:text-[#F37021] transition-colors" />
                </div>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}
