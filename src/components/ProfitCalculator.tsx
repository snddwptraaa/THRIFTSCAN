'use client';

import React, { useState } from 'react';
import { Calculator } from 'lucide-react';
import { formatIdrCurrency } from '@/lib/format';

interface ProfitCalculatorProps {
  estimatedAverageIdr: number;
  estimatedHighIdr: number;
}

const QUICK_PRICES = [35000, 50000, 75000, 100000, 150000, 250000];

export default function ProfitCalculator({
  estimatedAverageIdr,
  estimatedHighIdr,
}: ProfitCalculatorProps) {
  const [buyPriceRaw, setBuyPriceRaw] = useState<string>('75000');

  const buyPrice = Number(buyPriceRaw.replace(/\D/g, '')) || 0;
  const platformFeeEstimate = Math.round(estimatedAverageIdr * 0.08); // ~8% marketplace & packing buffer
  const netProfitAverage = estimatedAverageIdr - buyPrice - platformFeeEstimate;
  const netProfitHigh = estimatedHighIdr - buyPrice - Math.round(estimatedHighIdr * 0.08);
  const roiPercentage =
    buyPrice > 0 ? Math.round((netProfitAverage / buyPrice) * 100) : 0;
  return (
    <div className="border-t border-[#E2DCD3] py-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] uppercase tracking-[0.2em] text-[#6E6A64] font-medium flex items-center gap-2">
          <Calculator className="w-3.5 h-3.5 text-[#F37021]" />
          Margin &amp; Acquisition Calculator
        </span>
        <span className="text-[10px] uppercase tracking-[0.15em] text-[#6E6A64]">
          Sudah termasuk ~8% estimasi biaya admin
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-stretch mt-3">
        {/* Acquisition Input */}
        <div className="sm:col-span-5 bg-[#F6F1EB] border border-[#E2DCD3] p-4 flex flex-col justify-between">
          <label
            htmlFor="acquisition-price-input"
            className="text-[10px] uppercase tracking-[0.18em] text-[#6E6A64] block mb-2"
          >
            Harga Akuisisi di Lokasi (IDR)
          </label>
          <div className="flex items-baseline border-b border-[#1E1E1C] pb-1.5">
            <span className="font-mono text-sm text-[#6E6A64] mr-2">Rp</span>
            <input
              id="acquisition-price-input"
              type="text"
              inputMode="numeric"
              value={buyPrice ? buyPrice.toLocaleString('id-ID') : ''}
              onChange={(e) => setBuyPriceRaw(e.target.value.replace(/\D/g, ''))}
              placeholder="75.000"
              className="w-full bg-transparent font-mono text-xl text-[#1E1E1C] focus:outline-none"
            />
          </div>

          {/* Preset Quick Buttons for One-Thumb Thrifting */}
          <div className="flex flex-wrap gap-1.5 mt-3">
            {QUICK_PRICES.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setBuyPriceRaw(String(preset))}
                className={`px-2 py-1 text-[10px] font-mono border transition-colors cursor-pointer ${
                  buyPrice === preset
                    ? 'bg-[#1E1E1C] text-[#FAF8F5] border-[#1E1E1C]'
                    : 'bg-[#FAF8F5] text-[#6E6A64] border-[#E2DCD3] hover:border-[#1E1E1C]'
                }`}
              >
                {preset / 1000}rb
              </button>
            ))}
          </div>
        </div>

        {/* Calculated Margin Output */}
        <div className="sm:col-span-7 bg-[#F6F1EB] border border-[#E2DCD3] p-4 flex flex-col justify-between">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] text-[#6E6A64]">
                Estimasi Margin Bersih (Avg)
              </p>
              <p
                className={`font-mono text-lg sm:text-xl font-medium mt-1 ${
                  netProfitAverage > 0 ? 'text-[#1E1E1C]' : 'text-[#C85000]'
                }`}
              >
                {netProfitAverage >= 0 ? '+' : ''}
                {formatIdrCurrency(netProfitAverage)}
              </p>
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] text-[#6E6A64]">
                Potensi Kolektor (High)
              </p>
              <p className="font-mono text-lg sm:text-xl text-[#1E1E1C] mt-1">
                {netProfitHigh >= 0 ? '+' : ''}
                {formatIdrCurrency(netProfitHigh)}
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#E2DCD3] flex items-center justify-between text-xs">
            <span className="text-[#6E6A64]">Potensi Return on Investment (ROI):</span>
            <span
              className={`font-mono font-medium px-2 py-0.5 border ${
                roiPercentage >= 100
                  ? 'bg-[#FDF0E6] text-[#C85000] border-[#F37021]'
                  : roiPercentage > 0
                  ? 'bg-[#EFECE6] text-[#1E1E1C] border-[#D8D3C8]'
                  : 'bg-[#EFECE6] text-[#6E6A64] border-[#D8D3C8]'
              }`}
            >
              {roiPercentage > 0 ? `+${roiPercentage}%` : `${roiPercentage}%`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
