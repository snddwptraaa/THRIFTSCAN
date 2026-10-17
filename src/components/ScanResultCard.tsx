'use client';

import React from 'react';
import { ShieldCheck, Sparkles, Tag, Clock } from 'lucide-react';
import { ThriftScanResult, WorthLevel } from '@/types/thrift';
import { formatIdrCurrency } from '@/lib/format';
import ProfitCalculator from './ProfitCalculator';
import LiveMarketList from './LiveMarketList';

interface ScanResultCardProps {
  result: ThriftScanResult;
}

const WORTH_BADGE_CONFIG: Record<
  WorthLevel,
  {
    label: string;
    subtitle: string;
    bg: string;
    text: string;
    border: string;
    dotColor?: string;
  }
> = {
  LOW: {
    label: 'PASS',
    subtitle: 'Low Curatorial Value',
    bg: 'bg-[#EFECE6]',
    text: 'text-[#6E6A64]',
    border: 'border-[#D8D3C8]',
  },
  MEDIUM: {
    label: 'CONSIDER',
    subtitle: 'Moderate Market Demand',
    bg: 'bg-[#F5EBE1]',
    text: 'text-[#8C5A32]',
    border: 'border-[#E2C9B0]',
  },
  HIGH: {
    label: 'ACQUIRE',
    subtitle: 'High Desirability & Margin',
    bg: 'bg-[#FDF0E6]',
    text: 'text-[#C85000]',
    border: 'border-[#F37021]',
  },
  JACKPOT: {
    label: 'ARCHIVAL GRAIL',
    subtitle: 'Rare Collector Piece',
    bg: 'bg-[#1E1E1C]',
    text: 'text-[#FAF8F5]',
    border: 'border-[#F37021]',
    dotColor: '#F37021',
  },
};

export default function ScanResultCard({ result }: ScanResultCardProps) {
  const badge = WORTH_BADGE_CONFIG[result.worth_level] || WORTH_BADGE_CONFIG.MEDIUM;
  return (
    <article className="bg-[#FAF8F5] border border-[#E2DCD3] p-5 sm:p-8">
      {/* Certificate Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#E2DCD3]">
        <div className="flex items-center gap-2.5">
          <span className="text-[11px] uppercase tracking-[0.2em] text-[#6E6A64] font-medium">
            THE ARCHIVAL DOSSIER
          </span>
          <span className="text-[#E2DCD3]">•</span>
          <span className="font-mono text-[11px] text-[#6E6A64]">
            REF #{result.id.slice(0, 8).toUpperCase()}
          </span>
        </div>

        {/* Worth Level Badge */}
        <div
          className={`inline-flex items-center gap-2 px-3.5 py-1.5 border ${badge.bg} ${badge.text} ${badge.border}`}
        >
          {badge.dotColor && (
            <span
              className="w-2 h-2 rounded-full inline-block"
              style={{ backgroundColor: badge.dotColor }}
            />
          )}
          <span className="text-[11px] uppercase tracking-[0.2em] font-semibold">
            {badge.label}
          </span>
          <span className="text-[10px] opacity-80 hidden sm:inline">
            — {badge.subtitle}
          </span>
        </div>
      </div>

      {/* Maison / Brand, Model, and Era */}
      <div className="py-6 grid grid-cols-1 sm:grid-cols-12 gap-6 items-start">
        {result.thumbnail && (
          <div className="sm:col-span-3">
            <div className="aspect-[3/4] w-28 sm:w-full border border-[#1E1E1C] bg-[#F6F1EB] overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={result.thumbnail}
                alt={result.item_name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}

        <div className={result.thumbnail ? 'sm:col-span-9' : 'sm:col-span-12'}>
          <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-[#6E6A64] font-medium">
            <span className="inline-flex items-center gap-1">
              <Tag className="w-3 h-3 text-[#F37021]" />
              {result.category}
            </span>
            <span>/</span>
            <span className="inline-flex items-center gap-1 font-mono text-[#1E1E1C]">
              <Clock className="w-3 h-3 text-[#F37021]" />
              {result.estimated_era}
            </span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl text-[#1E1E1C] tracking-wide mt-2 leading-tight">
            {result.brand}
          </h2>
          <p className="font-serif italic text-xl sm:text-2xl text-[#6E6A64] mt-0.5">
            {result.item_name}
          </p>

          <p className="mt-4 text-sm text-[#1E1E1C] leading-relaxed bg-[#F6F1EB] border-l-2 border-[#F37021] p-3.5">
            {result.worth_reason}
          </p>
        </div>
      </div>

      {/* Market Valuation Range (IDR) */}
      <div className="border-t border-[#E2DCD3] py-5">
        <span className="text-[11px] uppercase tracking-[0.2em] text-[#6E6A64] font-medium block mb-3">
          Taksiran Valuasi Pasar Sekunder (IDR)
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-[#F6F1EB] border border-[#E2DCD3] p-4">
            <span className="text-[10px] uppercase tracking-[0.18em] text-[#6E6A64] block">
              Quick Flip / Low
            </span>
            <span className="font-mono text-lg text-[#1E1E1C] mt-1 block">
              {formatIdrCurrency(result.estimated_price_idr.low)}
            </span>
          </div>

          <div className="bg-[#FAF8F5] border border-[#1E1E1C] p-4 relative">
            <span className="text-[10px] uppercase tracking-[0.18em] text-[#F37021] font-semibold block">
              Valuasi Kurasi / Average
            </span>
            <span className="font-serif text-2xl sm:text-3xl font-semibold text-[#1E1E1C] mt-0.5 block">
              {formatIdrCurrency(result.estimated_price_idr.average)}
            </span>
          </div>

          <div className="bg-[#F6F1EB] border border-[#E2DCD3] p-4">
            <span className="text-[10px] uppercase tracking-[0.18em] text-[#6E6A64] block">
              Mint / Archival Collector
            </span>
            <span className="font-mono text-lg text-[#1E1E1C] mt-1 block">
              {formatIdrCurrency(result.estimated_price_idr.high)}
            </span>
          </div>
        </div>
      </div>

      {/* Craftsmanship & Authenticity Clues */}
      <div className="border-t border-[#E2DCD3] py-5">
        <span className="text-[11px] uppercase tracking-[0.2em] text-[#6E6A64] font-medium flex items-center gap-2 mb-3">
          <ShieldCheck className="w-3.5 h-3.5 text-[#F37021]" />
          Craftsmanship &amp; Authenticity Clues
        </span>

        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {result.authenticity_clues.map((clue, index) => (
            <li
              key={index}
              className="bg-[#F6F1EB] border border-[#E2DCD3] px-3.5 py-2.5 text-xs text-[#1E1E1C] flex items-start gap-2.5 leading-relaxed"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#F37021] shrink-0 mt-0.5" />
              <span>{clue}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Margin & Acquisition Calculator */}
      <ProfitCalculator
        estimatedAverageIdr={result.estimated_price_idr.average}
        estimatedHighIdr={result.estimated_price_idr.high}
      />

      {/* Stage 2: Manual Trigger Live Market Valuation */}
      <LiveMarketList
        key={result.id}
        keywordGlobal={result.search_keyword_global}
        keywordLocal={result.search_keyword_local}
      />
    </article>
  );
}
