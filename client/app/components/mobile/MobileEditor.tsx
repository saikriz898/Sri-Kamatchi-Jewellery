"use client";

import React, { useState } from 'react';
import MobileHeader from './MobileHeader';
import MobileBottomNavbar from './MobileBottomNavbar';
import MobileControlPanel from './MobileControlPanel';
import PosterCanvas from '../PosterCanvas';

interface MobileEditorProps {
  currentImage?: string;
  rates: { gold1g: string; gold8g: string; silver1g: string };
  setGoldPrice: (val: string) => void;
  setGold8Price: (val: string) => void;
  setSilverPrice: (val: string) => void;
  isGenerating: boolean;
  isDownloading: boolean;
  isSharing: boolean;
  isExportEnabled: boolean;
  notification: { message: string, type: 'success' | 'error' | 'warning' } | null;
  priceDropNote: string;
  setPriceDropNote: (note: string) => void;
  metalMode: 'gold' | 'silver';
  setMetalMode: (mode: 'gold' | 'silver') => void;
  date: string;
  setDate: (date: string) => void;
  posterRef: React.RefObject<HTMLDivElement | null>;
  handleGenerate: () => void;
  handleDownload: () => void;
  handleShare: () => void;
  onBackToGenerate: () => void;
  handleReset: () => void;
  handleSyncDB: () => void;
  isSyncing: boolean;
  images: string[];
  sessionUploads: Set<string>;
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

export default function MobileEditor({
  currentImage, rates, setGoldPrice, setGold8Price, setSilverPrice,
  isGenerating, isDownloading, isSharing, isExportEnabled, isSyncing,
  notification, priceDropNote, setPriceDropNote,
  metalMode, setMetalMode, date, setDate,
  posterRef, handleGenerate, handleDownload,
  handleShare, onBackToGenerate, handleReset, handleSyncDB,
  images, sessionUploads, onSelectImage, onDeleteImage, isLoadingImages, imageError,
  onUploadPhotos, isUploadingPhotos,
  currentIndex, totalImages, currentPage, totalPages, goToPage,
}: MobileEditorProps) {
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');

  return (
    <div className="fixed inset-0 flex flex-col pt-safe bg-[#0A0A0A] overflow-hidden">
      {/* Mobile Header Component */}
      <MobileHeader
        logoImg="/Logo-main.png"
        metalMode={metalMode}
        setMetalMode={setMetalMode}
      />

      {/* Dynamic Content Area */}
      <main className={`flex-1 w-full relative overflow-y-auto overflow-x-hidden px-4 pb-safe custom-scrollbar ${activeTab === 'preview' ? 'pt-2' : 'pt-4'}`}>
        {activeTab === 'preview' ? (
          /* Preview View — Full Page Style */
          <div className="flex flex-col items-center animate-fade-in py-2 pb-40 min-h-full">
            <div className="relative flex items-center justify-center w-full mb-10 overflow-visible">
              <div className="transform origin-top scale-[0.85] sm:scale-[1.0] transition-transform duration-500 flex items-center justify-center">
                <PosterCanvas
                  ref={posterRef}
                  rates={rates}
                  imageUrl={currentImage}
                  date={date}
                  isExporting={isDownloading || isSharing}
                />
              </div>
            </div>

            <div className="flex flex-col items-center w-full max-w-[405px] mt-2 mb-12 relative z-10 px-2">
              {!isExportEnabled ? (
                <>
                  <button
                    type="button"
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="mb-8 w-full bg-gradient-to-br from-[#b8860b] via-[#d4af37] to-[#7a5a07] text-black font-cinzel font-black py-5 rounded-2xl flex items-center justify-center gap-2 text-[13px] shadow-2xl shadow-yellow-900/30 active:scale-95 transition-transform disabled:opacity-40"
                  >
                    {isGenerating ? 'GENERATING...' : '✨ GENERATE MASTERPIECE'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('edit')}
                    className="text-[12px] font-cinzel font-black tracking-[0.3em] uppercase text-yellow-400/50 bg-transparent py-3"
                  >
                    Return to Settings
                  </button>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4 w-full mb-6">
                    <button
                      onClick={handleDownload}
                      disabled={isDownloading}
                      className="btn-gold py-5 rounded-2xl flex items-center justify-center gap-2 text-[13px] shadow-2xl shadow-yellow-900/30 active:scale-95 transition-transform disabled:opacity-40"
                    >
                      {isDownloading ? 'SAVING...' : '💾 DOWNLOAD'}
                    </button>
                    <button
                      onClick={handleShare}
                      disabled={isSharing}
                      className="bg-green-600/10 border-2 border-green-600/50 text-green-500 font-cinzel font-black py-5 rounded-2xl flex items-center justify-center gap-2 text-[13px] active:scale-95 transition-transform disabled:opacity-40"
                    >
                      {isSharing ? 'SENDING...' : '📲 WHATSAPP'}
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onBackToGenerate();
                      setActiveTab('edit');
                    }}
                    className="w-full text-[12px] font-cinzel font-black tracking-[0.3em] uppercase text-yellow-500/70 bg-yellow-400/5 border border-yellow-400/20 px-8 py-3 rounded-xl active:scale-95 transition-all shadow-[0_0_20px_rgba(184,134,11,0.1)] hover:bg-yellow-400/10"
                  >
                    ← Back to Generation
                  </button>
                </>
              )}
              <p className="mt-8 text-[11px] font-playfair italic text-yellow-900/50 text-center uppercase tracking-[0.3em] opacity-60">Optimized for 9:16 High-Res Status</p>
            </div>
          </div>
        ) : (
          /* Editor View */
          <div className="animate-fade-in max-w-lg mx-auto">
            <MobileControlPanel
              rates={rates}
              setGoldPrice={setGoldPrice}
              setGold8Price={setGold8Price}
              setSilverPrice={setSilverPrice}
              date={date} setDate={setDate}
              priceDropNote={priceDropNote} setPriceDropNote={setPriceDropNote}
              onGenerate={handleGenerate} onDownload={handleDownload}
              onShare={handleShare} onBackToGenerate={onBackToGenerate} onReset={handleReset} onSyncDB={handleSyncDB}
              isGenerating={isGenerating} isDownloading={isDownloading}
              isSharing={isSharing} isExportEnabled={isExportEnabled} isSyncing={isSyncing}
              images={images}
              sessionUploads={sessionUploads}
              currentImage={currentImage}
              onSelectImage={onSelectImage}
              onDeleteImage={onDeleteImage}
              isLoadingImages={isLoadingImages}
              imageError={imageError}
              onUploadPhotos={onUploadPhotos}
              isUploadingPhotos={isUploadingPhotos}
              currentIndex={currentIndex}
              totalImages={totalImages}
              currentPage={currentPage}
              totalPages={totalPages}
              goToPage={goToPage}
            />
          </div>
        )}
      </main>

      {/* Bottom Navigation Component */}
      <MobileBottomNavbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onGenerate={handleGenerate}
        isGenerating={isGenerating}
      />

      {/* Mobile Toast Notification Overlay */}
      {notification && (
        <div className="fixed top-20 right-4 z-[60] w-[80%] max-w-xs animate-in fade-in slide-in-from-right-4 duration-300">
          <div className={`px-5 py-3.5 rounded-2xl flex items-center gap-3 backdrop-blur-xl border shadow-2xl ${notification.type === 'error'
              ? 'bg-red-950/90 border-red-500/40 text-red-100'
              : notification.type === 'warning'
                ? 'bg-yellow-950/90 border-yellow-500/40 text-yellow-100'
                : 'bg-[#1a1008]/95 border-yellow-500/40 text-yellow-400'
            }`}>
            <span className="font-cinzel text-xs font-bold tracking-widest">{notification.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}
