"use client";

import React, { useState, useEffect, useCallback } from 'react';

interface GlobalDragOverlayProps {
  onDrop: (files: FileList) => void;
}

export default function GlobalDragOverlay({ onDrop }: GlobalDragOverlayProps) {
  const [isDragging, setIsDragging] = useState(false);
  const dragCounter = React.useRef(0);

  const handleDragEnter = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer && e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounter.current = 0;

    if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onDrop(e.dataTransfer.files);
    }
  }, [onDrop]);

  useEffect(() => {
    window.addEventListener('dragenter', handleDragEnter);
    window.addEventListener('dragleave', handleDragLeave);
    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('drop', handleDrop);

    return () => {
      window.removeEventListener('dragenter', handleDragEnter);
      window.removeEventListener('dragleave', handleDragLeave);
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('drop', handleDrop);
    };
  }, [handleDragEnter, handleDragLeave, handleDragOver, handleDrop]);

  if (!isDragging) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-300" />
      
      <div className="relative z-10 w-[80%] max-w-2xl aspect-video border-4 border-dashed border-[#b8860b]/50 rounded-[40px] flex flex-col items-center justify-center gap-6 bg-gradient-to-br from-[#b8860b]/10 to-transparent animate-in zoom-in-95 duration-300">
        <div className="w-24 h-24 rounded-full bg-[#b8860b]/20 flex items-center justify-center shadow-[0_0_50px_rgba(184,134,11,0.2)]">
          <svg className="w-12 h-12 text-[#b8860b] animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
        </div>
        
        <div className="text-center">
          <h2 className="text-3xl font-black text-white tracking-tighter mb-2">DROP ARTWORK HERE</h2>
          <p className="text-[#b8860b] font-bold tracking-[0.3em] text-xs uppercase opacity-80">Instant Studio Upload</p>
        </div>
      </div>
    </div>
  );
}
