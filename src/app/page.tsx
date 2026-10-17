'use client';

import React, { useEffect, useRef, useState } from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';
import ImageUploader from '@/components/ImageUploader';
import ScanResultCard from '@/components/ScanResultCard';
import ScanHistory from '@/components/ScanHistory';
import { ThriftScanResult } from '@/types/thrift';
import { createArchiveThumbnail } from '@/lib/imageCompression';

const STORAGE_KEY = 'thriftscan_personal_archive_v1';

const SAMPLE_ARCHIVAL_DOSSIER: ThriftScanResult = {
  id: 'archival-j97-1998',
  timestamp: 1729248000000,
  brand: 'Carhartt WIP / USA Workwear',
  item_name: 'J97 Detroit Blanket-Lined Duck Canvas Jacket (Moss Green)',
  category: 'Archival Workwear / Outerwear',
  estimated_era: 'Late 1990s Archival (Made in USA)',
  worth_level: 'JACKPOT',
  worth_reason:
    'Artikel J97 dengan kode warna Moss (MOS) dan kerah korduroi kontras dari akhir era 1990-an memiliki permintaan kolektor global yang sangat tinggi setelah dipopulerkan kembali di skena archival vintage.',
  authenticity_clues: [
    'Patch kulit sintetis/cloth persegi Carhartt pada dada kiri dengan patina alami sesuai usia.',
    'Label bordir putih di bagian dalam leher mencantumkan kode "RN 14806" dan "Made in U.S.A.".',
    'Lapisan dalam (lining) selimut wol bergaris horizontal dengan jahitan triple-stitch kokoh.',
    'Ritsleting kuningan berat berlogo YKK USA / Carhartt dengan puller logam asli.',
  ],
  estimated_price_idr: {
    low: 2400000,
    average: 3650000,
    high: 5200000,
  },
  search_keyword_global: 'Vintage 90s Carhartt J97 Moss Detroit Jacket USA',
  search_keyword_local: 'Jaket Carhartt Detroit J97 Vintage Second',
};

export default function HomePage() {
  const [garmentImage, setGarmentImage] = useState<string | null>(null);
  const [tagImage, setTagImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [currentResult, setCurrentResult] = useState<ThriftScanResult | null>(null);
  const [history, setHistory] = useState<ThriftScanResult[]>([]);

  const dossierRef = useRef<HTMLDivElement>(null);

  // Load Personal Archive from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setHistory(parsed);
        }
      }
    } catch {
      // Ignore corrupt localStorage entries
    }
  }, []);

  const persistHistory = (nextHistory: ThriftScanResult[]) => {
    setHistory(nextHistory);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextHistory.slice(0, 24)));
    } catch {
      // If storage quota exceeded, keep without thumbnails
      try {
        const light = nextHistory.slice(0, 12).map(({ thumbnail: _t, ...rest }) => rest);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(light));
      } catch {
        // Ignore storage error
      }
    }
  };

  const handleScan = async () => {
    if (!garmentImage) return;

    setIsScanning(true);
    setScanError(null);

    try {
      const imagesPayload = tagImage ? [garmentImage, tagImage] : [garmentImage];
      const response = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ images: imagesPayload }),
      });

      const data = await response.json();
      if (!response.ok) {
        setScanError(
          data?.error ||
            'Gagal menganalisis pakaian. Pastikan foto terang dan tidak buram.'
        );
        return;
      }

      const thumb = await createArchiveThumbnail(garmentImage, 360, 0.6);
      const enrichedResult: ThriftScanResult = {
        ...data,
        thumbnail: thumb,
      };

      setCurrentResult(enrichedResult);
      const updatedHistory = [
        enrichedResult,
        ...history.filter((item) => item.id !== enrichedResult.id),
      ];
      persistHistory(updatedHistory);

      setTimeout(() => {
        dossierRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch {
      setScanError(
        'Gagal terhubung ke server kurasi AI. Periksa koneksi internet Anda lalu coba kembali.'
      );
    } finally {
      setIsScanning(false);
    }
  };

  const handleResetScanner = () => {
    setGarmentImage(null);
    setTagImage(null);
    setCurrentResult(null);
    setScanError(null);
  };

  const handleSelectArchiveItem = (item: ThriftScanResult) => {
    setCurrentResult(item);
    setScanError(null);
    setTimeout(() => {
      dossierRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  };

  const handleLoadSampleDossier = () => {
    setCurrentResult(SAMPLE_ARCHIVAL_DOSSIER);
    setScanError(null);
    if (!history.some((h) => h.id === SAMPLE_ARCHIVAL_DOSSIER.id)) {
      persistHistory([SAMPLE_ARCHIVAL_DOSSIER, ...history]);
    }
    setTimeout(() => {
      dossierRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  };

  const handleClearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F6F1EB] text-[#1E1E1C]">
      {/* Hermès-Inspired Editorial Top Navigation */}
      <header className="sticky top-0 z-30 bg-[#F6F1EB]/95 backdrop-blur-xs border-b border-[#E2DCD3]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="w-24 hidden sm:block">
            <span className="text-[10px] uppercase tracking-[0.2em] text-[#6E6A64]">
              EST. MMXXVI
            </span>
          </div>

          <div className="text-center flex-1">
            <h1 className="font-serif text-2xl sm:text-3xl tracking-[0.22em] text-[#1E1E1C] font-normal">
              THRIFTSCAN
            </h1>
            <p className="text-[10px] uppercase tracking-[0.25em] text-[#6E6A64] mt-0.5">
              MAISON D&apos;EXPERTISE • ARCHIVAL &amp; VINTAGE APPRAISAL
            </p>
          </div>

          <div className="w-24 hidden sm:flex justify-end">
            {(garmentImage || tagImage || currentResult) && (
              <button
                type="button"
                onClick={handleResetScanner}
                className="text-[10px] uppercase tracking-[0.18em] text-[#6E6A64] hover:text-[#F37021] flex items-center gap-1 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {/* Stage 1: Dual-Frame Curatorial Camera / Uploader */}
        <ImageUploader
          garmentImage={garmentImage}
          tagImage={tagImage}
          onGarmentChange={setGarmentImage}
          onTagChange={setTagImage}
          onScan={handleScan}
          isScanning={isScanning}
        />

        {/* Error Banner with Fallback Option */}
        {scanError && (
          <div className="mt-6 bg-[#FAF8F5] border border-[#F37021] p-5">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-[#F37021] shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-[11px] uppercase tracking-[0.2em] text-[#C85000] font-semibold">
                  Pemberitahuan Kurator
                </p>
                <p className="text-xs text-[#1E1E1C] mt-1 leading-relaxed">
                  {scanError}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handleLoadSampleDossier}
                    className="bg-[#1E1E1C] hover:bg-[#F37021] text-[#FAF8F5] text-[10px] uppercase tracking-[0.18em] px-3.5 py-2 transition-colors cursor-pointer"
                  >
                    Lihat Contoh Dossier Kurasi (Carhartt J97)
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Active Archival Dossier (Stage 1 Result + Stage 2 Live Market Trigger) */}
        {currentResult && (
          <div ref={dossierRef} className="mt-8 scroll-mt-24">
            <ScanResultCard result={currentResult} />
          </div>
        )}

        {/* Personal Archive (LocalStorage Catalog) */}
        <ScanHistory
          history={history}
          activeId={currentResult?.id}
          onSelect={handleSelectArchiveItem}
          onClearHistory={handleClearHistory}
          onLoadSample={handleLoadSampleDossier}
        />
      </main>

      {/* Editorial Footer */}
      <footer className="border-t border-[#E2DCD3] bg-[#FAF8F5] mt-16 py-6 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] uppercase tracking-[0.2em] text-[#6E6A64]">
          <span>THRIFTSCAN AI — HERMÈS EDITORIAL EDITION</span>
          <span>SMART 2-STEP QUOTA ARCHITECTURE • GEMINI 3.8 FLASH</span>
        </div>
      </footer>
    </div>
  );
}
