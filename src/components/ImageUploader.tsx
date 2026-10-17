'use client';

import React, { useRef, useState } from 'react';
import { Camera, ImagePlus, X, Sparkles, Loader2 } from 'lucide-react';
import { compressImageToBase64 } from '@/lib/imageCompression';

interface ImageUploaderProps {
  garmentImage: string | null;
  tagImage: string | null;
  onGarmentChange: (base64: string | null) => void;
  onTagChange: (base64: string | null) => void;
  onScan: () => void;
  isScanning: boolean;
}

export default function ImageUploader({
  garmentImage,
  tagImage,
  onGarmentChange,
  onTagChange,
  onScan,
  isScanning,
}: ImageUploaderProps) {
  const garmentCameraInputRef = useRef<HTMLInputElement>(null);
  const garmentGalleryInputRef = useRef<HTMLInputElement>(null);
  const tagCameraInputRef = useRef<HTMLInputElement>(null);
  const tagGalleryInputRef = useRef<HTMLInputElement>(null);

  const [compressingSlot, setCompressingSlot] = useState<'garment' | 'tag' | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
    slot: 'garment' | 'tag'
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setCompressingSlot(slot);

    try {
      const compressedBase64 = await compressImageToBase64(file, 1024, 0.7);
      if (slot === 'garment') {
        onGarmentChange(compressedBase64);
      } else {
        onTagChange(compressedBase64);
      }
    } catch (err) {
      setUploadError(
        err instanceof Error ? err.message : 'Gagal memproses gambar. Coba foto lain.'
      );
    } finally {
      setCompressingSlot(null);
      event.target.value = '';
    }
  };

  return (
    <section className="bg-[#FAF8F5] border border-[#E2DCD3] p-5 sm:p-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 pb-5 border-b border-[#E2DCD3]">
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-[#6E6A64] font-medium">
            TAHAP I — AKUISISI VISUAL
          </p>
          <h2 className="font-serif text-2xl sm:text-3xl text-[#1E1E1C] mt-1 tracking-wide">
            Bingkai Kurasi Pakaian
          </h2>
        </div>
        <p className="text-xs text-[#6E6A64] max-w-xs leading-relaxed">
          Unggah siluet pakaian dan detail label kerah untuk diidentifikasi oleh kurator AI.
        </p>
      </div>

      {uploadError && (
        <div className="mt-4 p-3 bg-[#FDF0E6] border border-[#F37021] text-xs text-[#C85000]">
          {uploadError}
        </div>
      )}

      {/* Two Portrait Editorial Frames (3:4 Ratio) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-6">
        {/* Slot I: Garment Silhouette */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] uppercase tracking-[0.2em] text-[#1E1E1C] font-medium">
              I. Garment Silhouette
            </span>
            <span className="text-[10px] uppercase tracking-[0.15em] text-[#F37021] font-medium">
              Wajib
            </span>
          </div>

          <div
            className={`relative aspect-[3/4] w-full overflow-hidden transition-colors ${
              garmentImage
                ? 'border border-solid border-[#1E1E1C] bg-[#FAF8F5]'
                : 'border border-dashed border-[#C7BFB3] bg-[#FAF8F5] hover:border-[#1E1E1C]'
            }`}
          >
            {compressingSlot === 'garment' ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                <Loader2 className="w-6 h-6 text-[#F37021] animate-spin mb-3" />
                <span className="text-[11px] uppercase tracking-[0.18em] text-[#6E6A64]">
                  Mengoptimalkan Resolusi...
                </span>
              </div>
            ) : garmentImage ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={garmentImage}
                  alt="Garment Silhouette"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => onGarmentChange(null)}
                  disabled={isScanning}
                  aria-label="Hapus foto siluet pakaian"
                  className="absolute top-3 right-3 bg-[#1E1E1C] text-[#FAF8F5] p-2 hover:bg-[#F37021] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="absolute bottom-0 inset-x-0 bg-[#1E1E1C]/85 text-[#FAF8F5] px-3 py-2 text-[10px] uppercase tracking-[0.18em] flex justify-between items-center">
                  <span>Siluet Terlampir</span>
                  <span className="font-mono text-[#F37021]">&lt; 1MB JPEG</span>
                </div>
              </>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-between p-6 text-center">
                <div className="text-[10px] uppercase tracking-[0.2em] text-[#6E6A64] border-b border-[#E2DCD3] pb-1.5 w-full">
                  Fig. 01 — Tampak Depan / Grafik
                </div>

                <div className="my-auto flex flex-col items-center">
                  <div className="w-12 h-12 border border-[#E2DCD3] flex items-center justify-center mb-4 bg-[#F6F1EB]">
                    <Camera className="w-5 h-5 text-[#1E1E1C]" strokeWidth={1.25} />
                  </div>
                  <p className="font-serif text-lg text-[#1E1E1C] mb-1">
                    Potret Keseluruhan
                  </p>
                  <p className="text-xs text-[#6E6A64] max-w-[200px] leading-relaxed">
                    Pastikan potongan pakaian, saku, atau cetakan grafis terlihat utuh.
                  </p>
                </div>

                <div className="w-full grid grid-cols-2 gap-2 pt-3 border-t border-[#E2DCD3]">
                  <button
                    type="button"
                    onClick={() => garmentCameraInputRef.current?.click()}
                    disabled={isScanning}
                    className="flex items-center justify-center gap-1.5 bg-[#1E1E1C] text-[#FAF8F5] py-2.5 px-3 text-[10px] uppercase tracking-[0.16em] hover:bg-[#F37021] transition-colors cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Kamera</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => garmentGalleryInputRef.current?.click()}
                    disabled={isScanning}
                    className="flex items-center justify-center gap-1.5 bg-[#F6F1EB] text-[#1E1E1C] border border-[#E2DCD3] py-2.5 px-3 text-[10px] uppercase tracking-[0.16em] hover:border-[#1E1E1C] transition-colors cursor-pointer"
                  >
                    <ImagePlus className="w-3.5 h-3.5" />
                    <span>Galeri</span>
                  </button>
                </div>
              </div>
            )}

            <input
              ref={garmentCameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={(e) => handleFileChange(e, 'garment')}
              className="hidden"
            />
            <input
              ref={garmentGalleryInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(e, 'garment')}
              className="hidden"
            />
          </div>
        </div>

        {/* Slot II: Neck Tag / Care Label */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] uppercase tracking-[0.2em] text-[#1E1E1C] font-medium">
              II. Neck Tag / Care Label
            </span>
            <span className="text-[10px] uppercase tracking-[0.15em] text-[#6E6A64] font-medium">
              Disarankan (Akurasi Era)
            </span>
          </div>

          <div
            className={`relative aspect-[3/4] w-full overflow-hidden transition-colors ${
              tagImage
                ? 'border border-solid border-[#1E1E1C] bg-[#FAF8F5]'
                : 'border border-dashed border-[#C7BFB3] bg-[#FAF8F5] hover:border-[#1E1E1C]'
            }`}
          >
            {compressingSlot === 'tag' ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                <Loader2 className="w-6 h-6 text-[#F37021] animate-spin mb-3" />
                <span className="text-[11px] uppercase tracking-[0.18em] text-[#6E6A64]">
                  Mengoptimalkan Resolusi...
                </span>
              </div>
            ) : tagImage ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={tagImage}
                  alt="Neck Tag / Care Label"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => onTagChange(null)}
                  disabled={isScanning}
                  aria-label="Hapus foto neck tag"
                  className="absolute top-3 right-3 bg-[#1E1E1C] text-[#FAF8F5] p-2 hover:bg-[#F37021] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="absolute bottom-0 inset-x-0 bg-[#1E1E1C]/85 text-[#FAF8F5] px-3 py-2 text-[10px] uppercase tracking-[0.18em] flex justify-between items-center">
                  <span>Label Kerah Terlampir</span>
                  <span className="font-mono text-[#F37021]">&lt; 1MB JPEG</span>
                </div>
              </>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-between p-6 text-center">
                <div className="text-[10px] uppercase tracking-[0.2em] text-[#6E6A64] border-b border-[#E2DCD3] pb-1.5 w-full">
                  Fig. 02 — Detail Makro Label
                </div>

                <div className="my-auto flex flex-col items-center">
                  <div className="w-12 h-12 border border-[#E2DCD3] flex items-center justify-center mb-4 bg-[#F6F1EB]">
                    <Camera className="w-5 h-5 text-[#6E6A64]" strokeWidth={1.25} />
                  </div>
                  <p className="font-serif text-lg text-[#1E1E1C] mb-1">
                    Label Merek &amp; Jahitan
                  </p>
                  <p className="text-xs text-[#6E6A64] max-w-[200px] leading-relaxed">
                    Foto makro font tag, Made in USA/Japan, atau jahitan single-stitch.
                  </p>
                </div>

                <div className="w-full grid grid-cols-2 gap-2 pt-3 border-t border-[#E2DCD3]">
                  <button
                    type="button"
                    onClick={() => tagCameraInputRef.current?.click()}
                    disabled={isScanning}
                    className="flex items-center justify-center gap-1.5 bg-[#1E1E1C] text-[#FAF8F5] py-2.5 px-3 text-[10px] uppercase tracking-[0.16em] hover:bg-[#F37021] transition-colors cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Kamera</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => tagGalleryInputRef.current?.click()}
                    disabled={isScanning}
                    className="flex items-center justify-center gap-1.5 bg-[#F6F1EB] text-[#1E1E1C] border border-[#E2DCD3] py-2.5 px-3 text-[10px] uppercase tracking-[0.16em] hover:border-[#1E1E1C] transition-colors cursor-pointer"
                  >
                    <ImagePlus className="w-3.5 h-3.5" />
                    <span>Galeri</span>
                  </button>
                </div>
              </div>
            )}

            <input
              ref={tagCameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={(e) => handleFileChange(e, 'tag')}
              className="hidden"
            />
            <input
              ref={tagGalleryInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(e, 'tag')}
              className="hidden"
            />
          </div>
        </div>
      </div>

      {/* Primary Action Button (Hermès Orange / Deep Espresso) */}
      <div className="mt-6 pt-5 border-t border-[#E2DCD3]">
        <button
          type="button"
          onClick={onScan}
          disabled={!garmentImage || isScanning || compressingSlot !== null}
          className={`w-full rounded-none py-4 px-6 text-xs uppercase tracking-[0.18em] font-medium transition-colors flex items-center justify-center gap-3 ${
            !garmentImage || isScanning
              ? 'bg-[#E2DCD3] text-[#6E6A64] cursor-not-allowed'
              : 'bg-[#F37021] hover:bg-[#D95D12] text-[#FAF8F5] cursor-pointer'
          }`}
        >
          {isScanning ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Kurator AI Sedang Menganalisis Konstruksi &amp; Era...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Mulai Kurasi &amp; Appraisal (Gemini 3.8 Flash)</span>
            </>
          )}
        </button>
      </div>
    </section>
  );
}
