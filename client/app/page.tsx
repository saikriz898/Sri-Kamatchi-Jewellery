"use client";

import { useState, useRef, useEffect } from "react";
import { toJpeg } from "html-to-image";
import PriceEditor from "./components/PriceEditor";
import PosterCanvas from "./components/PosterCanvas";
import MobileEditor from "./components/mobile/MobileEditor";
import { useJewelryStudio } from "./lib/hooks/useJewelryStudio";

export default function Home() {
  const {
    rates, setGoldPrice, setGold8Price, setSilverPrice,
    date, setDate,
    currentImage,
    storedImages, sessionUploads, currentIndex, totalImages,
    isLoadingImages, imageError,
    activeMetal, setActiveMetal,
    isConnected,
    currentPage, totalPages, imagesPerPage,
    goToPage, nextPage, prevPage,
    uploadProgress,
    isGenerating,
    isDownloading, setIsDownloading,
    isSharing, setIsSharing,
    isUploadingPhotos, isSyncing,
    notification,
    isExportEnabled, setIsExportEnabled,
    handleGenerate, handleSyncDB, handleRefreshData,
    onUploadPhotos, onSelectImage,
    handleDeleteImage, handleReset,
    showToast
  } = useJewelryStudio();

  const [isMobile, setIsMobile] = useState<boolean | null>(null);
  const posterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleDownload = async () => {
    if (!posterRef.current || !isExportEnabled) return;
    setIsDownloading(true);
    
    // Small delay to ensure the DOM has updated (e.g. rounded corners removed)
    await new Promise(resolve => setTimeout(resolve, 150));

    try {
      const el = posterRef.current;
      const dataUrl = await toJpeg(el, { 
        quality: 0.95, 
        pixelRatio: 3,
        width: el.offsetWidth,
        height: el.offsetHeight,
        cacheBust: true,
        style: { transform: 'scale(1)', borderRadius: '0' }
      });
      const link = document.createElement('a');
      link.download = `Sri_Kamatchi_${date.replace(/ /g, '_')}.jpg`;
      link.href = dataUrl;
      link.click();
      setIsExportEnabled(false); // Only one export per generate
      showToast("Saved! Generate New Poster.", "success");
    } catch (err) {
      console.error("Export failed", err);
      showToast("Download Failed", "error");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShare = async () => {
    if (!posterRef.current) return;
    setIsSharing(true);

    // Small delay to ensure the DOM has updated
    await new Promise(resolve => setTimeout(resolve, 150));

    try {
      const el = posterRef.current;
      const dataUrl = await toJpeg(el, { 
        quality: 0.95, 
        pixelRatio: 3,
        width: el.offsetWidth,
        height: el.offsetHeight,
        cacheBust: true,
        style: { transform: 'scale(1)', borderRadius: '0' }
      });
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], `JewelleryPoster.jpg`, { type: 'image/jpeg' });
      
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Daily Gold Rates',
          text: `Check today's gold and silver rates at Sri Kamatchi Jewellery.`
        });
      } else {
        const shareText = encodeURIComponent(`Daily Price Update: Gold 1G: ₹${rates.gold1g}`);
        window.open(`https://wa.me/?text=${shareText}`, '_blank');
      }
      setIsExportEnabled(false); // Disable after sharing
      showToast("Shared! Generate New Poster.", "success");
    } catch (err) {
      console.error("Share failed", err);
      showToast("Share Failed", "error");
    } finally {
      setIsSharing(false);
    }
  };

  if (isMobile === null) return null;

  if (isMobile) {
    return (
      <MobileEditor
        currentImage={currentImage}
        rates={rates}
        setGoldPrice={setGoldPrice}
        setGold8Price={setGold8Price}
        setSilverPrice={setSilverPrice}
        isGenerating={isGenerating}
        isDownloading={isDownloading}
        isSharing={isSharing}
        isExportEnabled={isExportEnabled}
        notification={notification}
        metalMode={activeMetal}
        setMetalMode={setActiveMetal}
        date={date}
        setDate={setDate}
        posterRef={posterRef}
        handleGenerate={handleGenerate}
        handleDownload={handleDownload}
        handleShare={handleShare}
        handleReset={handleReset}
        handleSyncDB={handleSyncDB}
        onBackToGenerate={() => setIsExportEnabled(false)}
        isSyncing={isSyncing}
        images={storedImages}
        sessionUploads={sessionUploads}
        onSelectImage={onSelectImage}
        onDeleteImage={handleDeleteImage}
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
    );
  }

  return (
    <main className="relative w-full h-screen overflow-hidden bg-[#050402] text-white selection:bg-[#b8860b]/30">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#b8860b]/5 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] left-[20%] w-[30%] h-[30%] bg-[#b8860b]/3 blur-[100px] rounded-full" />
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(rgba(184, 134, 11, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(184, 134, 11, 0.1) 1px, transparent 1px)',
            backgroundSize: '80px 80px'
          }}
        />
      </div>

      <div className="relative h-full flex z-10">
        <section className="h-full border-r border-white/5 bg-black/40 backdrop-blur-xl">
          <PriceEditor
            rates={rates}
            setGoldPrice={setGoldPrice}
            setGold8Price={setGold8Price}
            setSilverPrice={setSilverPrice}
            date={date}
            setDate={setDate}
            activeMetal={activeMetal}
            setActiveMetal={setActiveMetal}
            storedImages={storedImages}
            sessionUploads={sessionUploads}
            currentIndex={currentIndex}
            totalImages={totalImages}
            isGenerating={isGenerating}
            isUploading={isUploadingPhotos}
            isSyncing={isSyncing}
            isDownloading={isDownloading}
            isSharing={isSharing}
            isExportEnabled={isExportEnabled}
            isConnected={isConnected}
            isLoadingImages={isLoadingImages}
            imageError={imageError}
            notification={notification}
            currentPage={currentPage}
            totalPages={totalPages}
            imagesPerPage={imagesPerPage}
            goToPage={goToPage}
            nextPage={nextPage}
            prevPage={prevPage}
            uploadProgress={uploadProgress}
            onGenerate={handleGenerate}
            onExport={handleDownload}
            onShare={handleShare}
            onBackToGenerate={() => setIsExportEnabled(false)}
            onSyncDB={handleSyncDB}
            onRefreshData={handleRefreshData}
            onSelectImage={onSelectImage}
            onDeleteImage={handleDeleteImage}
            onUploadFiles={onUploadPhotos}
          />
        </section>

        <section className="flex-1 relative flex flex-col items-center justify-center p-12">
          <header className="absolute top-10 left-12 flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-[#b8860b] shadow-[0_0_8px_#b8860b]" />
              <span className="text-[10px] uppercase font-black tracking-[0.4em] text-white/40">Live Preview</span>
            </div>
            <div className="h-px w-24 bg-gradient-to-r from-white/10 to-transparent" />
          </header>

          <div className="relative group">
            <div className="absolute -inset-4 bg-gradient-to-br from-white/[0.03] to-transparent rounded-[40px] blur-sm opacity-50 pointer-events-none border border-white/5" />
            <div className="relative z-10 shadow-[0_40px_100px_-20px_rgba(0,0,0,1)] bg-black rounded-[24px] overflow-hidden">
              <PosterCanvas
                ref={posterRef}
                rates={rates}
                date={date}
                imageUrl={currentImage}
                isExporting={isDownloading || isSharing}
              />
            </div>
          </div>

          <footer className="absolute bottom-10 flex items-center gap-6 text-white/20">
            <div className="flex items-center gap-2"><span className="text-[9px] font-bold uppercase tracking-widest">9:16 Aspect</span></div>
            <div className="w-1 h-1 rounded-full bg-white/10" />
            <div className="flex items-center gap-2"><span className="text-[9px] font-bold uppercase tracking-widest">4K Ready Export</span></div>
          </footer>
        </section>
      </div>
    </main>
  );
}
