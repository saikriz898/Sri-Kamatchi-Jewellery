import { useState, useEffect, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import API_URL from "../config";

export function useJewelryStudio() {
  const socketRef = useRef<Socket | null>(null);
  const currentPageRef = useRef(1);
  const isUploadingPhotosRef = useRef(false);
  const storedImagesRef = useRef<string[]>([]);

  const [rates, setRates] = useState({ gold1g: "", gold8g: "", silver1g: "" });
  const [date, setDate] = useState(new Date().toLocaleDateString('en-GB'));
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | undefined>(undefined);
  const [totalImages, setTotalImages] = useState(0);
  const [storedImages, setStoredImages] = useState<string[]>([]);
  const [isLoadingImages, setIsLoadingImages] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [imagesPerPage] = useState(20);
  const [uploadProgress, setUploadProgress] = useState<{ completed: number; total: number; message: string } | null>(null);
  const [activeMetal, setActiveMetal] = useState<'gold' | 'silver'>('gold');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [isUploadingPhotos, setIsUploadingPhotos] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);
  const [isExportEnabled, setIsExportEnabled] = useState(false);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'warning' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  }, []);

  const refreshAssets = useCallback(async (page = 1, forceSelectIndex?: number) => {
    setIsLoadingImages(true);
    try {
      const res = await fetch(`${API_URL}/api/image-library?page=${page}&limit=20`);
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      const data = await res.json();
      const imgs = (data.images || []).map((img: { compressedUrl?: string; imageUrl?: string }) => {
        const rawUrl = img.compressedUrl || img.imageUrl || "";
        if (!rawUrl) return "";
        if (rawUrl.startsWith('http')) return rawUrl;
        
        // Ensure absolute URL to avoid proxy issues on mobile
        const baseUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
        const path = rawUrl.startsWith('/') ? rawUrl : `/${rawUrl}`;
        return `${baseUrl}${path}`;
      }).filter((url: string) => Boolean(url));
      
      setStoredImages(imgs);
      storedImagesRef.current = imgs;
      setTotalImages(data.pagination?.total || imgs.length);
      setTotalPages(data.pagination?.pages || 1);
      
      const pg = data.pagination?.page || 1;
      setCurrentPage(pg);
      currentPageRef.current = pg;

      // If we are forcing a specific global index selection (e.g. on hydrate)
      if (forceSelectIndex !== undefined && forceSelectIndex >= 0) {
        const localIdx = forceSelectIndex % 20;
        if (imgs[localIdx]) {
          setCurrentImageUrl(imgs[localIdx]);
        }
      }

      setImageError(null);
      return imgs;
    } catch (err: unknown) {
      console.error("Failed to load library:", err);
      setStoredImages([]);
      setTotalImages(0);
      setTotalPages(1);
      setImageError(`Library offline: ${err instanceof Error ? err.message : 'Unknown error'}`);
      return [];
    } finally {
      setIsLoadingImages(false);
    }
  }, []);

  // Hydrate on mount
  useEffect(() => {
    const controller = new AbortController();
    async function hydrate() {
      try {
        // Fetch Studio State (Index)
        const stateRes = await fetch(`${API_URL}/api/studio-state`, { signal: controller.signal }).then(r => r.json());
        let initialIndex = -1;
        if (stateRes?.currentIndex !== undefined) {
          initialIndex = stateRes.currentIndex;
          setCurrentIndex(initialIndex);
        }
        if (stateRes?.total !== undefined) setTotalImages(stateRes.total);

        // Fetch Latest Prices from the Vault
        const priceRes = await fetch(`${API_URL}/api/price`, { signal: controller.signal }).then(r => r.json());
        if (priceRes?.gold1g) {
          setRates({
            gold1g: priceRes.gold1g,
            gold8g: priceRes.gold8g,
            silver1g: priceRes.silver1g
          });

          const today = new Date().toLocaleDateString('en-GB');
          if (priceRes.date && priceRes.date === today) {
            setDate(priceRes.date);
          } else {
            setDate(today);
          }
        }

        // Calculate the page that contains the initialIndex
        const initialPage = initialIndex >= 0 ? Math.floor(initialIndex / 20) + 1 : 1;
        const imgs = await refreshAssets(initialPage, initialIndex);

        // Auto-select the first image if none is currently selected and images are available
        if (initialIndex === -1 && imgs.length > 0) {
          setCurrentImageUrl(imgs[0]);
          setCurrentIndex(0);
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name !== 'AbortError') console.warn("Server unavailable, using local state", err);
      }
    }
    hydrate();
    return () => controller.abort();
  }, [refreshAssets]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const savedRates = window.localStorage.getItem('jewelry-rates');
      const savedDate = window.localStorage.getItem('jewelry-price-date');
      const savedUpdatedAt = window.localStorage.getItem('jewelry-price-updated-at');
      if (savedRates) setRates(JSON.parse(savedRates));

      const today = new Date().toLocaleDateString('en-GB');
      const todayTimestamp = new Date().toDateString();
      // Respect manual change only if it's for today. 
      // If it's a new day, auto-reset to today.
      if (savedDate && savedUpdatedAt === todayTimestamp) {
        setDate(savedDate);
      } else {
        setDate(today);
      }
    } catch (err) {
      console.warn('Failed to load local price state:', err);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem('jewelry-rates', JSON.stringify(rates));
      window.localStorage.setItem('jewelry-price-date', date);
      window.localStorage.setItem('jewelry-price-updated-at', new Date().toDateString());
    } catch (err) {
      console.warn('Failed to save local price state:', err);
    }
  }, [rates, date]);

  // Single socket connection
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!socketRef.current) {
      socketRef.current = io(API_URL, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 10000,
        randomizationFactor: 0.5,
        timeout: 20000,
      });
    }
    const socket = socketRef.current;

    const handleConnect = () => { setIsConnected(true); showToast('Connected to server', 'success'); };
    const handleDisconnect = (reason: string) => {
      setIsConnected(false);
      if (reason === 'io server disconnect') socket.connect();
      showToast('Connection lost, reconnecting...', 'warning');
    };
    const handleConnectError = () => setIsConnected(false);
    const handleReconnect = () => {
      setIsConnected(true);
      showToast('Reconnected to server', 'success');
      // Ensure absolute URL is used for refresh
      setTimeout(() => refreshAssets(currentPageRef.current), 1000);
    };
    const handleReconnectFailed = () => { setIsConnected(false); showToast('Failed to reconnect', 'error'); };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect_error', handleConnectError);
    socket.on('reconnect', handleReconnect);
    socket.on('reconnect_failed', handleReconnectFailed);

    // Listen for remote real-time price updates
    socket.on('priceUpdate', (data) => {
      if (data) {
        setRates({
          gold1g: data.gold1g,
          gold8g: data.gold8g,
          silver1g: data.silver1g
        });
        if (data.date) setDate(data.date);
      }
    });

    socket.on('stateUpdate', async (data) => {
      if (data?.currentIndex !== undefined) {
        const newIdx = data.currentIndex;
        setCurrentIndex(newIdx);
        
        // Calculate the page that contains the new index
        const neededPage = Math.floor(newIdx / imagesPerPage) + 1;
        
        // If it's a different page, fetch it. If it's the same page, we can use storedImagesRef.
        let imagesToUse = storedImagesRef.current;
        if (neededPage !== currentPageRef.current) {
          imagesToUse = await refreshAssets(neededPage);
        }
        
        // Sync the URL
        const localIdx = newIdx % imagesPerPage;
        if (newIdx === -1) {
          setCurrentImageUrl(undefined);
        } else if (imagesToUse[localIdx]) {
          setCurrentImageUrl(imagesToUse[localIdx]);
        }
      }
      if (data?.total !== undefined) setTotalImages(Number(data.total));
    });
    socket.on('libraryUpdate', () => {
      if (!isUploadingPhotosRef.current) {
        refreshAssets(currentPageRef.current);
      }
    });
    socket.on('uploadProgress', (data) => {
      console.log("Upload Progress:", data);
      setUploadProgress(data);
      if (data.completed === data.total) {
        setTimeout(() => { refreshAssets(currentPageRef.current); setUploadProgress(null); }, 1000);
      }
    });
    socket.on('syncProgress', (data) => showToast(data.message, 'warning'));
    socket.on('syncComplete', (data) => { showToast(data.message, 'success'); refreshAssets(currentPageRef.current); });

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('connect_error', handleConnectError);
      socket.off('reconnect', handleReconnect);
      socket.off('reconnect_failed', handleReconnectFailed);
      socket.off('priceUpdate');
      socket.off('stateUpdate');
      socket.off('libraryUpdate');
      socket.off('uploadProgress');
      socket.off('syncProgress');
      socket.off('syncComplete');
      socket.disconnect(); 
      socketRef.current = null; // Clear ref to allow recreation if needed
    };
  }, [refreshAssets, showToast, imagesPerPage]);


  const setGoldPrice = (val: string) => {
    const numVal = parseFloat(val.replace(/,/g, ''));
    const gold8gVal = !isNaN(numVal) ? (numVal * 8).toString() : "";
    setRates(prev => ({
      ...prev,
      gold1g: val,
      gold8g: gold8gVal
    }));
  };
  const setGold8Price = (val: string) => setRates(prev => ({ ...prev, gold8g: val }));
  const setSilverPrice = (val: string) => setRates(prev => ({ ...prev, silver1g: val }));

  const handleGenerate = async () => {
    if (!rates.gold1g || parseFloat(rates.gold1g) <= 0) return showToast("Enter Gold Price", 'warning');
    if (totalImages === 0 && storedImages.length === 0) return showToast("Upload an artwork first", 'warning');
    setIsGenerating(true);
    const total = totalImages || storedImages.length;
    const nextIdx = total === 0 ? 0 : currentIndex === -1 ? 0 : (currentIndex + 1) % total;

    // Auto-Pagination Logic
    const nextPageNeeded = Math.floor(nextIdx / imagesPerPage) + 1;
    let finalImages = storedImages;
    if (nextPageNeeded !== currentPageRef.current && nextPageNeeded <= totalPages) {
      currentPageRef.current = nextPageNeeded;
      setCurrentPage(nextPageNeeded);
      finalImages = await refreshAssets(nextPageNeeded);
    } else if (nextIdx === 0 && totalPages > 1 && currentPageRef.current !== 1) {
      // Loop back to page 1 seamlessly
      currentPageRef.current = 1;
      setCurrentPage(1);
      finalImages = await refreshAssets(1);
    }

    setCurrentIndex(nextIdx);
    const localIdx = nextIdx % imagesPerPage;
    if (finalImages[localIdx]) {
      setCurrentImageUrl(finalImages[localIdx]);
    }
    
    setIsExportEnabled(true);
    setIsGenerating(false);

    // Lock in the rates to the DB and broadcast to all devices
    try {
      await fetch(`${API_URL}/api/price`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...rates, date })
      });
    } catch (err) {
      console.error("Failed to sync rates to DB:", err);
    }

    showToast("Poster Generated & Synced", 'success');
  };

  const handleSyncDB = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch(`${API_URL}/api/sync-images`, { method: 'POST' }).then(r => r.json());
      await refreshAssets();
      showToast(res.message || "Database Synced", "success");
    } catch {
      showToast("Sync Failed", "error");
    } finally {
      setIsSyncing(false);
    }
  };

  const onUploadPhotos = async (files: FileList) => {
    setIsUploadingPhotos(true);
    isUploadingPhotosRef.current = true;
    setUploadProgress({ completed: 0, total: files.length, message: 'Starting upload...' });
    try {
      const batchSize = 10;
      let uploadedCount = 0;
      for (let i = 0; i < files.length; i += batchSize) {
        const batch = Array.from(files).slice(i, i + batchSize);
        const formData = new FormData();
        batch.forEach(f => formData.append('photos', f));
        const res = await fetch(`${API_URL}/api/upload-images`, { method: 'POST', body: formData });
        if (!res.ok) throw new Error(`Upload failed: ${res.statusText}`);
        await res.json();
        uploadedCount += batch.length;
        setUploadProgress({ completed: uploadedCount, total: files.length, message: `Uploaded ${uploadedCount}/${files.length} images` });
      }
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Refresh to get latest totals and then jump to the last page
      const res = await fetch(`${API_URL}/api/image-library?page=1&limit=20`);
      const data = await res.json();
      const lastPage = data.pagination?.pages || 1;
      
      await refreshAssets(lastPage);
      showToast(`Successfully uploaded ${files.length} photos!`, "success");
    } catch (err: unknown) {
      showToast(`Upload failed: ${err instanceof Error ? err.message : 'Unknown error'}`, "error");
    } finally {
      setIsUploadingPhotos(false);
      isUploadingPhotosRef.current = false;
      setUploadProgress(null);
    }
  };

  const onSelectImage = (localIndex: number) => {
    const globalIdx = (currentPageRef.current - 1) * imagesPerPage + localIndex;
    setCurrentIndex(globalIdx);
    if (storedImages[localIndex]) {
      setCurrentImageUrl(storedImages[localIndex]);
    }
  };

  const handleDeleteImage = async (src: string) => {
    const id = src.split('/').pop();
    if (!id) return;
    try {
      const wasSelected = currentImageUrl === src;
      const res = await fetch(`${API_URL}/api/images/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed on server');
      
      // Refresh from server — source of truth
      const newImages = await refreshAssets(currentPageRef.current);
      
      // Update local state and selection
      setTotalImages(prev => {
        const newTotal = Math.max(0, prev - 1);
        const newIdx = newTotal === 0 ? -1 : Math.min(currentIndex, newTotal - 1);
        setCurrentIndex(newIdx);
        
        if (wasSelected) {
          if (newIdx === -1) {
            setCurrentImageUrl(undefined);
          } else {
            // Sync with the image now at the same position (clamped)
            const localIdx = newIdx % imagesPerPage;
            setCurrentImageUrl(newImages[localIdx]);
          }
        }
        return newTotal;
      });
      
      showToast('Image Deleted', 'success');
    } catch (err) {
      console.error("Delete failed:", err);
      showToast('Delete Failed', 'error');
      await refreshAssets(currentPageRef.current);
    }
  };

  useEffect(() => {
    if (totalImages === 0 && currentIndex !== -1) {
      setCurrentIndex(-1);
      return;
    }
    if (totalImages > 0 && currentIndex >= totalImages) {
      setCurrentIndex(totalImages - 1);
    }
  }, [totalImages, currentIndex]);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      currentPageRef.current = page;
      setCurrentPage(page);
      refreshAssets(page);
    }
  };
  const nextPage = () => goToPage(currentPage + 1);
  const prevPage = () => goToPage(currentPage - 1);

  const handleRefreshData = async () => {
    showToast('Refreshing data...', 'warning');
    try {
      const stateRes = await fetch(`${API_URL}/api/studio-state`).then(r => r.json());
      if (stateRes?.currentIndex !== undefined) setCurrentIndex(stateRes.currentIndex);
      if (stateRes?.total !== undefined) setTotalImages(stateRes.total);
      await refreshAssets();
      showToast('Data refreshed', 'success');
    } catch {
      showToast('Failed to refresh data', 'error');
    }
  };

  const handleReset = () => { 
    setCurrentIndex(-1); 
    setCurrentImageUrl(undefined);
    showToast('Selection reset', 'success'); 
  };

  // currentImage is now sticky based on URL, not index % 20
  const currentImage = currentImageUrl;

  return {
    rates, setGoldPrice, setGold8Price, setSilverPrice,
    date, setDate,
    currentImage,
    currentIndex, totalImages,
    storedImages,
    isLoadingImages, imageError,
    activeMetal, setActiveMetal,
    isConnected,
    currentPage, totalPages, imagesPerPage,
    goToPage, nextPage, prevPage,
    uploadProgress,
    isGenerating, isDownloading, setIsDownloading,
    isSharing, setIsSharing,
    isExportEnabled, setIsExportEnabled,
    isUploadingPhotos, isSyncing,
    notification,
    handleGenerate, handleSyncDB, handleRefreshData,
    onUploadPhotos, onSelectImage, handleDeleteImage, handleReset,
    showToast,
  };
}