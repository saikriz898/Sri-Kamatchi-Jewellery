import React, { useState } from 'react';
import ImageLibraryGrid from '../ImageLibraryGrid';
import PhotoUploadPanel from '../PhotoUploadPanel';
import MobilePriceEditor from './MobilePriceEditor';

function SectionLabel({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 px-1 mb-4">
      <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-yellow-900/30" />
      <span className="text-[11px] tracking-[0.2em] uppercase text-yellow-600/80 font-bold whitespace-nowrap">{label}</span>
      <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-yellow-900/30" />
    </div>
  );
}

interface MobileControlPanelProps {
  rates: { gold1g: string; gold8g: string; silver1g: string };
  setGoldPrice: (val: string) => void;
  setGold8Price: (val: string) => void;
  setSilverPrice: (val: string) => void;
  date: string;
  setDate: (date: string) => void;
  onGenerate: () => void;
  onDownload: () => void;
  onShare: () => void;
  onReset: () => void;
  onSyncDB: () => void;
  onBackToGenerate: () => void;
  isSyncing: boolean;
  isGenerating: boolean;
  isDownloading: boolean;
  isSharing: boolean;
  isExportEnabled: boolean;
  images: string[];
  sessionUploads: Set<string>;
  currentImage?: string;
  currentIndex: number;
  totalImages: number;
  currentPage: number;
  totalPages: number;
  goToPage: (page: number) => void;
  onSelectImage: (index: number) => void;
  onDeleteImage: (src: string) => void;
  isLoadingImages: boolean;
  imageError?: string | null;
  onUploadPhotos: (files: FileList) => void;
  isUploadingPhotos: boolean;
}

export default function MobileControlPanel({
  rates, setGoldPrice, setGold8Price, setSilverPrice, date, setDate,
  onGenerate, onDownload, onShare, onReset, onSyncDB, onBackToGenerate,
  isGenerating, isDownloading, isSharing, isSyncing, isExportEnabled,
  images, sessionUploads, currentImage, currentIndex, totalImages,
  currentPage, totalPages, goToPage,
  onSelectImage, onDeleteImage, isLoadingImages, imageError,
  onUploadPhotos, isUploadingPhotos,
}: MobileControlPanelProps) {
  const [editMode, setEditMode] = useState(false);

  const cycleLabel = totalImages === 0
    ? 'படங்கள் இல்லை'
    : currentIndex === -1
      ? `0 / ${totalImages}`
      : `${(currentIndex % totalImages) + 1} / ${totalImages}`;

  return (
    <div className="w-full flex flex-col gap-8 pb-32">

      <MobilePriceEditor
        rates={rates}
        setGoldPrice={setGoldPrice}
        setGold8Price={setGold8Price}
        setSilverPrice={setSilverPrice}
        date={date}
        setDate={setDate}
      />

      <div className="flex flex-col gap-4">
        <SectionLabel label="Poster Actions" />
        <div className="flex flex-col gap-3 px-1">
          {!isExportEnabled ? (
            <button
              onClick={onGenerate} disabled={isGenerating}
              className="btn-gold w-full py-4 rounded-xl flex items-center justify-center gap-3 text-base shadow-xl shadow-yellow-900/10 active:scale-[0.98] transition-transform disabled:opacity-50"
            >
              {isGenerating
                ? <><span className="inline-block w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />Processing...</>
                : <>✨ Generate New Poster</>}
            </button>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                <button onClick={onDownload} disabled={isDownloading}
                  className="py-3.5 rounded-xl flex items-center justify-center gap-2 text-sm font-bold border border-yellow-500/40 text-yellow-400 bg-yellow-500/5 active:scale-[0.98] transition-transform disabled:opacity-50"
                >
                  {isDownloading ? <span className="inline-block w-4 h-4 border-2 border-yellow-600/30 border-t-yellow-400 rounded-full animate-spin" /> : <>💾 Save</>}
                </button>
                <button onClick={onShare} disabled={isSharing}
                  className="py-3.5 rounded-xl flex items-center justify-center gap-2 text-sm font-bold border border-green-600/50 text-green-500 bg-green-500/5 active:scale-[0.98] transition-transform disabled:opacity-50"
                >
                  {isSharing ? <span className="inline-block w-4 h-4 border-2 border-green-800 border-t-green-400 rounded-full animate-spin" /> : <>📲 WhatsApp</>}
                </button>
              </div>
              <button
                onClick={onBackToGenerate}
                className="w-full py-3 border border-yellow-500/20 text-yellow-500/60 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all"
              >
                ← Back to Generate
              </button>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={onSyncDB}
              disabled={isSyncing}
              className="py-3 rounded-xl flex items-center justify-center gap-2 text-[10px] font-bold tracking-widest border border-yellow-600/20 text-yellow-600 bg-yellow-600/5 active:scale-95 transition-all disabled:opacity-40"
            >
              <span className={`inline-block border-2 border-yellow-600/30 border-t-yellow-600 rounded-full ${isSyncing ? 'w-3 h-3 animate-spin' : 'hidden'}`} />
              SYNC DATABASE
            </button>
            <button
              onClick={onReset}
              className="py-3 rounded-xl flex items-center justify-center gap-2 text-[10px] font-bold tracking-widest border border-yellow-900/20 text-yellow-900/40 bg-yellow-900/5 active:scale-95 transition-all"
            >
              RESET SEQUENCE
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 px-1">
        <SectionLabel label="Upload Photos" />
        <PhotoUploadPanel onUploadPhotos={onUploadPhotos} isUploadingPhotos={isUploadingPhotos} />
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between px-1">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-yellow-600/80">படங்கள் தொகுப்பு</span>
            <span className="text-[8px] text-yellow-900/50 tracking-widest">{cycleLabel}</span>
          </div>
          <button
            onClick={() => setEditMode(e => !e)}
            className={`px-3 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest border transition-all ${editMode
              ? 'bg-red-500/10 border-red-500/30 text-red-400'
              : 'bg-white/5 border-white/10 text-white/40'
            }`}
          >
            {editMode ? '✕ Done' : '✎ Edit'}
          </button>
        </div>

        <ImageLibraryGrid
          images={images}
          currentImage={currentImage}
          onSelectImage={onSelectImage}
          onDeleteImage={onDeleteImage}
          canDeleteImage={(src) => editMode && sessionUploads.has(src)}
          isLoading={isLoadingImages}
          error={imageError}
          columnsClassName="grid-cols-2"
        />

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-2">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1.5 bg-yellow-500/5 border border-yellow-500/10 rounded-lg text-[9px] font-bold text-yellow-500 disabled:opacity-30"
            >
              ← Prev
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const p = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
              if (p > totalPages) return null;
              return (
                <button key={p} onClick={() => goToPage(p)}
                  className={`w-8 h-8 rounded-lg text-[9px] font-bold transition-all ${p === currentPage ? 'bg-yellow-500 text-black' : 'bg-yellow-500/5 text-yellow-500'}`}
                >{p}</button>
              );
            })}
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 bg-yellow-500/5 border border-yellow-500/10 rounded-lg text-[9px] font-bold text-yellow-500 disabled:opacity-30"
            >
              Next →
            </button>
          </div>
        )}
      </div>

      <div className="px-4 py-8 text-center opacity-40 mt-4 border-t border-yellow-900/10">
        <p className="text-[12px] text-yellow-700 font-bold tracking-wide">ஸ்ரீ காமாட்சி நகை நிலையம்</p>
        <p className="text-[9px] text-yellow-900/60 mt-1">பொள்ளாச்சி</p>
      </div>
    </div>
  );
}
