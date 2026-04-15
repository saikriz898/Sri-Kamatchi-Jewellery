"use client";

import { useRef } from "react";
import {
  Upload, Sparkles, Download, MessageSquare,
  RefreshCw, Loader2, Calendar, CheckCircle2
} from "lucide-react";

interface PriceEditorProps {
  rates: { gold1g: string; gold8g: string; silver1g: string };
  setGoldPrice: (val: string) => void;
  setGold8Price: (val: string) => void;
  setSilverPrice: (val: string) => void;
  date: string;
  setDate: (val: string) => void;
  activeMetal: 'gold' | 'silver';
  setActiveMetal: (val: 'gold' | 'silver') => void;
  storedImages: string[];
  sessionUploads: Set<string>;
  currentIndex: number;
  totalImages: number;
  isGenerating: boolean;
  isUploading: boolean;
  isSyncing: boolean;
  isDownloading: boolean;
  isSharing: boolean;
  isExportEnabled: boolean;
  isConnected: boolean;
  isLoadingImages: boolean;
  imageError: string | null;
  notification: { message: string; type: 'success' | 'error' | 'warning' } | null;
  // Pagination
  currentPage: number;
  totalPages: number;
  imagesPerPage: number;
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  // Upload progress
  uploadProgress: { completed: number; total: number; message: string } | null;
  onGenerate: () => void;
  onExport: () => void;
  onBackToGenerate: () => void;
  onShare: () => void;
  onSyncDB: () => void;
  onRefreshData: () => void;
  onSelectImage: (index: number) => void;
  onDeleteImage: (src: string) => void;
  onUploadFiles: (files: FileList) => void;
}

export default function PriceEditor({
  rates, setGoldPrice, setGold8Price, setSilverPrice,
  date, setDate,
  activeMetal, setActiveMetal,
  storedImages, sessionUploads, currentIndex, totalImages,
  isGenerating, isUploading, isDownloading, isSharing, isSyncing,
  isExportEnabled, isLoadingImages, imageError,
  notification,
  currentPage, totalPages, imagesPerPage, goToPage, nextPage, prevPage,
  uploadProgress,
  onGenerate, onExport, onShare, onBackToGenerate, onSyncDB, onRefreshData,
  onSelectImage, onDeleteImage, onUploadFiles,
}: PriceEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const safeIndex = currentIndex >= 0 ? currentIndex % totalImages : -1;
  const cycleLabel = totalImages === 0
    ? 'No Images'
    : safeIndex === -1
      ? `0 / ${totalImages}`
      : `${safeIndex + 1} / ${totalImages}`;

  return (
    <>
      {/* Toast */}
      {notification && (
        <div className="fixed top-24 right-8 z-[200] animate-in fade-in slide-in-from-right-4 duration-300">
          <div className="px-8 py-5 rounded-[22px] flex items-center gap-5 bg-black/80 backdrop-blur-3xl border border-white/5 shadow-[0_30px_70px_-15px_rgba(0,0,0,1)] relative overflow-hidden group">
            <div className="absolute bottom-0 left-0 h-[2px] bg-[#b8860b]/40 w-full animate-progress" />
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center relative ${notification.type === 'error' ? 'bg-red-500/10 text-red-400' :
                notification.type === 'warning' ? 'bg-amber-400/10 text-amber-300' :
                  'bg-[#b8860b]/10 text-[#b8860b]'
              }`}>
              {notification.type === 'success' ? <CheckCircle2 size={18} /> : <RefreshCw size={18} />}
              <div className={`absolute inset-0 blur-lg opacity-40 rounded-full ${notification.type === 'error' ? 'bg-red-500' :
                  notification.type === 'warning' ? 'bg-amber-400' :
                    'bg-[#b8860b]'
                }`} />
            </div>
            <div className="flex flex-col">
              <span className="text-[12px] font-black uppercase tracking-[0.25em] text-white">{notification.message}</span>
              <span className="text-[9px] font-bold uppercase tracking-[0.1em] text-white/30">System Notification</span>
            </div>
          </div>
        </div>
      )}


      <aside className="w-[440px] h-screen flex flex-col bg-[#050402] border-r border-[#1a150f] relative overflow-hidden shadow-[20px_0_60px_rgba(0,0,0,0.9)]">
        <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-[#b8860b]/15 via-[#b8860b]/5 to-transparent pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-[#b8860b]/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-1/4 -right-20 w-40 h-40 bg-[#b8860b]/5 blur-[80px] rounded-full pointer-events-none" />

        {/* Header */}
        <div className="px-10 pt-12 pb-6 flex flex-col gap-8 relative z-10">
          <div className="flex items-center justify-between">
            <div className="relative group">
              <img src="/Logo-main.png" alt="Sri Kamatchi" className="w-40 h-auto drop-shadow-[0_0_20px_rgba(184,134,11,0.3)] transition-transform duration-500 group-hover:scale-105" />
              <div className="absolute -inset-4 bg-[#b8860b]/5 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </div>
            <div className="flex items-center bg-black/40 backdrop-blur-xl p-1.5 rounded-2xl border border-white/5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
              <button
                onClick={() => setActiveMetal('gold')}
                className={`relative px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 cursor-pointer overflow-hidden group ${activeMetal === 'gold' ? 'text-black' : 'text-white/40 hover:text-white/70'}`}
              >
                {activeMetal === 'gold' && (
                  <div className="absolute inset-0 bg-gradient-to-br from-[#b8860b] via-[#d4af37] to-[#7a5a07] animate-in fade-in zoom-in-95 duration-300" />
                )}
                <span className="relative z-10">Gold</span>
              </button>
              <button
                onClick={() => setActiveMetal('silver')}
                className={`relative px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 cursor-pointer overflow-hidden group ${activeMetal === 'silver' ? 'text-black' : 'text-white/40 hover:text-white/70'}`}
              >
                {activeMetal === 'silver' && (
                  <div className="absolute inset-0 bg-gradient-to-br from-white via-white/80 to-white/60 animate-in fade-in zoom-in-95 duration-300" />
                )}
                <span className="relative z-10">Silver</span>
              </button>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-10 pb-44 space-y-12 custom-scrollbar relative z-10 scroll-smooth pt-4">

          {/* Rates Section */}
          <section className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-[#b8860b] shadow-[0_0_8px_rgba(184,134,11,0.5)]" />
                <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Market Ledger</h2>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-px h-3 bg-white/10" />
                <span className="text-[8px] font-bold text-[#b8860b] uppercase tracking-widest">Live Rates</span>
              </div>
            </div>

            <div className="bg-[#0a0907] border border-white/[0.03] rounded-[40px] p-8 space-y-8 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.7)] relative overflow-hidden group/card">
              <div className="absolute inset-0 bg-gradient-to-br from-[#b8860b]/5 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-700" />

              {/* Manifest Date */}
              <div className="space-y-3 group/input">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/20 group-focus-within/input:text-[#b8860b] transition-colors">Manifest Date</label>
                  <Calendar size={11} className="text-white/10 group-focus-within/input:text-[#b8860b]/40 transition-colors" />
                </div>
                <div className="relative">
                  <input
                    type="text" value={date} onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-[#050402] border border-white/[0.05] px-6 py-4.5 text-white text-sm font-bold rounded-2xl focus:outline-none focus:border-[#b8860b]/30 focus:shadow-[0_0_20px_rgba(184,134,11,0.05)] transition-all placeholder:text-white/10"
                    placeholder="DD – MONTH – YYYY"
                  />
                </div>
              </div>

              {/* Gold Rates Grid */}
              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-3 group/input">
                  <label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/20 group-focus-within/input:text-[#b8860b] transition-colors px-1">22K Gold 1G</label>
                  <div className="relative">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-[#b8860b] font-black text-xs italic">₹</span>
                    <input
                      type="number" value={rates.gold1g} onChange={(e) => setGoldPrice(e.target.value)}
                      className="w-full bg-[#050402] border border-white/[0.05] pl-10 pr-5 py-4.5 text-white font-mono text-base font-bold rounded-2xl focus:outline-none focus:border-[#b8860b]/30 transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-3 group/input">
                  <label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/20 group-focus-within/input:text-[#b8860b] transition-colors px-1">22K Gold 8G</label>
                  <div className="relative">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-[#b8860b] font-black text-xs italic">₹</span>
                    <input
                      type="text" value={rates.gold8g} onChange={(e) => setGold8Price(e.target.value)}
                      className="w-full bg-[#050402] border border-white/[0.05] pl-10 pr-5 py-4.5 text-white font-mono text-base font-bold rounded-2xl focus:outline-none focus:border-[#b8860b]/30 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Silver Rate */}
              <div className="space-y-3 group/input">
                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/20 group-focus-within/input:text-[#b8860b] transition-colors px-1">Fine Silver 1G</label>
                <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-[#b8860b] font-black text-xs italic">₹</span>
                  <input
                    type="number" value={rates.silver1g} onChange={(e) => setSilverPrice(e.target.value)}
                    className="w-full bg-[#050402] border border-white/[0.05] pl-10 pr-5 py-4.5 text-white font-mono text-base font-bold rounded-2xl focus:outline-none focus:border-[#b8860b]/30 transition-all"
                  />
                </div>
              </div>

              <div className="absolute top-0 right-0 w-32 h-32 bg-[#b8860b]/5 blur-[60px] rounded-full -mr-16 -mt-16 pointer-events-none group-hover/card:bg-[#b8860b]/10 transition-colors duration-700" />
            </div>
          </section>



          {/* Upload */}
          <section className="space-y-8">
            <div className="flex items-center gap-4 px-1">
              <div className="w-2 h-2 rounded-full bg-gradient-to-br from-[#b8860b] to-[#7a5a07] shadow-[0_0_10px_rgba(184,134,11,0.5)]" />
              <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-white/70">Artisan Upload</h2>
            </div>
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); if (e.dataTransfer.files?.length) onUploadFiles(e.dataTransfer.files); }}
              className="group relative h-40 bg-gradient-to-br from-[#b8860b]/5 to-transparent border-2 border-dashed border-[#b8860b]/20 rounded-[32px] flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-[#b8860b]/50 transition-all duration-500 overflow-hidden"
            >
              <div className="absolute inset-0 bg-[#b8860b]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="w-14 h-14 rounded-[20px] bg-gradient-to-br from-[#b8860b]/20 to-[#7a5a07]/20 border border-[#b8860b]/30 flex items-center justify-center text-[#b8860b] group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg">
                {isUploading ? <Loader2 size={24} className="animate-spin" /> : <Upload size={24} />}
              </div>
              <div className="flex flex-col items-center gap-1.5 relative z-10">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#b8860b]">
                  {isUploading ? 'Securing Files...' : 'Drop Artwork Here'}
                </span>
                <span className="text-[8px] font-bold text-white/20 uppercase tracking-widest group-hover:text-white/40 transition-colors">
                  JPG, PNG, WEBP (Max 10MB)
                </span>
              </div>
              <input
                type="file" multiple className="hidden" ref={fileInputRef} accept="image/*"
                onChange={(e) => { if (e.target.files?.length) onUploadFiles(e.target.files); }}
              />
            </div>
          </section>

          {/* Upload Progress */}
          {uploadProgress && (
            <section className="space-y-3">
              <div className="flex items-center gap-3 px-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60">Upload Progress</h2>
              </div>
              <div className="bg-black/20 border border-green-500/20 rounded-[20px] p-4 backdrop-blur-md">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-green-400 uppercase tracking-widest">
                    {uploadProgress.completed}/{uploadProgress.total} Images
                  </span>
                  <span className="text-[8px] text-green-300/60">
                    {uploadProgress.total > 0 ? Math.round((uploadProgress.completed / uploadProgress.total) * 100) : 0}%
                  </span>
                </div>
                <div className="w-full bg-green-500/10 rounded-full h-2 mb-2">
                  <div
                    className="bg-green-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress.total > 0 ? (uploadProgress.completed / uploadProgress.total) * 100 : 0}%` }}
                  />
                </div>
                <p className="text-[9px] text-green-300/80 font-medium">{uploadProgress.message}</p>
              </div>
            </section>
          )}

          {/* Asset Library */}
          <section className="space-y-8">
            <div className="flex flex-col gap-5 px-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-2 h-2 rounded-full bg-gradient-to-br from-[#b8860b] to-[#7a5a07] shadow-[0_0_10px_rgba(184,134,11,0.5)]" />
                  <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-white/70">Gallery Sequence</h2>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-[#b8860b]/10 rounded-full border border-[#b8860b]/20">
                  <div className={`w-1.5 h-1.5 rounded-full ${currentIndex === -1 ? 'bg-white/20' : 'bg-[#b8860b] shadow-[0_0_8px_#b8860b]'}`} />
                  <span className="text-[9px] font-bold text-[#b8860b] uppercase tracking-widest">{cycleLabel}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={onRefreshData}
                  disabled={isLoadingImages}
                  className="flex items-center justify-center gap-2.5 px-4 py-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl transition-all duration-300 group/btn"
                >
                  <RefreshCw size={12} className={`text-white/40 group-hover/btn:text-[#b8860b] transition-colors ${isLoadingImages ? 'animate-spin' : ''}`} />
                  <span className="text-[9px] font-black uppercase tracking-[0.15em] text-white/40 group-hover/btn:text-white/80 transition-colors">Sync Studio</span>
                </button>
                <button
                  onClick={onSyncDB}
                  disabled={isSyncing}
                  className="flex items-center justify-center gap-2.5 px-4 py-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl transition-all duration-300 group/btn"
                >
                  <RefreshCw size={12} className={`text-white/40 group-hover/btn:text-[#b8860b] transition-colors ${isSyncing ? 'animate-spin' : ''}`} />
                  <span className="text-[9px] font-black uppercase tracking-[0.15em] text-white/40 group-hover/btn:text-white/80 transition-colors">Sync DB</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-5">
              {isLoadingImages ? (
                Array.from({ length: 4 }).map((_, idx) => (
                  <div key={idx} className="aspect-[4/5] rounded-[28px] overflow-hidden bg-white/5 border border-white/5 animate-pulse" />
                ))
              ) : imageError ? (
                <div className="col-span-2 rounded-[32px] border border-red-500/20 bg-red-500/5 p-8 text-center">
                  <p className="text-[10px] font-bold text-red-400/80 uppercase tracking-widest">{imageError}</p>
                </div>
              ) : storedImages.length === 0 ? (
                <div className="col-span-2 rounded-[32px] border border-white/5 bg-white/5 p-12 text-center flex flex-col items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-white/20">
                    <Sparkles size={20} />
                  </div>
                  <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] leading-relaxed max-w-[200px]">
                    No artwork identified. Upload your masterpieces to begin.
                  </p>
                </div>
              ) : (
                storedImages.map((src, idx) => {
                  const globalIdx = (currentPage - 1) * imagesPerPage + idx;
                  const isActive = totalImages > 0 && safeIndex === globalIdx;
                  return (
                    <div
                      key={`${src}-${idx}`}
                      onClick={() => onSelectImage(idx)}
                      className={`aspect-[4/5] rounded-[28px] overflow-hidden bg-white/5 border transition-all duration-700 relative group cursor-pointer ${isActive ? 'border-[#b8860b] shadow-[0_0_30px_rgba(184,134,11,0.3)] scale-[1.02] z-20' : 'border-white/5 opacity-40 hover:opacity-100 hover:border-white/20 hover:scale-[1.02]'}`}
                    >
                      <img
                        src={src}
                        className={`w-full h-full object-cover transition-transform duration-1000 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}
                        loading="lazy"
                        decoding="async"
                        alt="product"
                      />
                      <div className="absolute top-4 left-4 px-3 py-1 bg-black/60 backdrop-blur-xl rounded-xl border border-white/10 shadow-xl">
                        <span className="text-[9px] font-black text-[#b8860b] tracking-wider">#{idx + 1}</span>
                      </div>

                      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0 z-30">
                        {sessionUploads.has(src) && (
                          <button
                            onClick={(e) => { e.stopPropagation(); onDeleteImage(src); }}
                            className="w-8 h-8 flex items-center justify-center bg-red-500/20 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all backdrop-blur-xl cursor-pointer shadow-lg border border-red-500/20"
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" /></svg>
                          </button>
                        )}
                      </div>

                      {isActive && (
                        <div className="absolute inset-x-0 bottom-0 py-3 bg-gradient-to-t from-[#b8860b] to-[#d4af37] text-center shadow-[0_-10px_20px_rgba(0,0,0,0.3)]">
                          <span className="text-[8px] font-black uppercase tracking-[0.3em] text-black">Live Studio</span>
                        </div>
                      )}
                      <div className={`absolute inset-0 transition-opacity duration-700 ${isActive ? 'opacity-0' : 'bg-black/20 group-hover:opacity-0'}`} />
                    </div>
                  );
                })
              )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-4">
                <button
                  onClick={prevPage}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 bg-[#b8860b]/5 hover:bg-[#b8860b]/10 border border-[#b8860b]/10 rounded-lg text-[8px] font-bold text-[#b8860b] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  ← Prev
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                    if (pageNum > totalPages) return null;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => goToPage(pageNum)}
                        className={`px-2 py-1 rounded text-[8px] font-bold transition-all ${pageNum === currentPage
                            ? 'bg-[#b8860b] text-black'
                            : 'bg-[#b8860b]/5 hover:bg-[#b8860b]/10 text-[#b8860b]'
                          }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={nextPage}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 bg-[#b8860b]/5 hover:bg-[#b8860b]/10 border border-[#b8860b]/10 rounded-lg text-[8px] font-bold text-[#b8860b] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  Next →
                </button>
              </div>
            )}
          </section>
        </div>

        {/* Action Buttons */}
        <div className="absolute bottom-0 left-0 w-full px-10 pb-12 pt-6 bg-gradient-to-t from-[#050402] via-[#050402] to-transparent z-30">
          <div className="space-y-4">
            {!isExportEnabled ? (
              <button
                disabled={isGenerating}
                onClick={onGenerate}
                className="group relative w-full h-16 bg-gradient-to-br from-[#b8860b] via-[#d4af37] to-[#7a5a07] rounded-[22px] flex items-center justify-center gap-4 active:scale-[0.98] transition-all overflow-hidden disabled:opacity-50 shadow-[0_10px_40px_rgba(184,134,11,0.3)] shadow-[#b8860b]/20"
              >
                <div className="absolute inset-0 bg-white/30 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 skew-x-[-45deg]" />
                {isGenerating ? <Loader2 className="animate-spin text-black" size={20} /> : <Sparkles className="text-black" size={20} />}
                <span className="text-black font-black uppercase tracking-[0.3em] text-[11px]">
                  {isGenerating ? 'Crafting Poster...' : 'Generate Masterpiece'}
                </span>
              </button>
            ) : (
              <div className="space-y-4 animate-in slide-in-from-bottom-4 fade-in duration-500">
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={onExport} disabled={isDownloading || isGenerating}
                    className="h-14 bg-white/5 border border-white/10 text-[#f3e5ab] text-[10px] font-black uppercase tracking-[0.2em] rounded-[22px] flex items-center justify-center gap-3 hover:bg-white/10 transition-all disabled:opacity-40 group/export"
                  >
                    {isDownloading ? <Loader2 className="animate-spin text-[#b8860b]" size={16} /> : <Download size={16} className="text-[#b8860b] group-hover:scale-110 transition-transform" />}
                    {isDownloading ? 'Saving...' : 'Export'}
                  </button>
                  <button
                    onClick={onShare} disabled={isSharing || isGenerating}
                    className="h-14 bg-[#25D366]/10 border border-[#25D366]/20 text-[#25D366] text-[10px] font-black uppercase tracking-[0.2em] rounded-[22px] flex items-center justify-center gap-3 hover:bg-[#25D366]/20 transition-all disabled:opacity-40 group/share"
                  >
                    {isSharing ? <Loader2 className="animate-spin text-[#25D366]" size={16} /> : <MessageSquare size={16} className="group-hover:scale-110 transition-transform" />}
                    {isSharing ? 'Sending...' : 'WhatsApp'}
                  </button>
                </div>
                <button
                  onClick={onBackToGenerate}
                  className="w-full h-12 bg-white/5 border border-white/5 text-white/40 hover:text-[#b8860b] hover:bg-[#b8860b]/5 hover:border-[#b8860b]/20 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl transition-all"
                >
                  ← Return to Studio
                </button>
              </div>
            )}
          </div>
        </div>

        <style>{`
          @keyframes progress { 0% { width: 100%; } 100% { width: 0%; } }
          .animate-progress { animation: progress 3s linear forwards; }
          .custom-scrollbar::-webkit-scrollbar { width: 4px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(184,134,11,0.1); border-radius: 20px; }
          .custom-scrollbar:hover::-webkit-scrollbar-thumb { background: rgba(184,134,11,0.25); }
        `}</style>
      </aside>
    </>
  );
}
