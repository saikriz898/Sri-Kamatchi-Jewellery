import React from 'react';

interface ImageLibraryGridProps {
  images: string[];
  currentImage?: string;
  onSelectImage: (index: number) => void;
  onDeleteImage?: (src: string) => void;
  isLoading?: boolean;
  error?: string | null;
  columnsClassName?: string;
  canDeleteImage?: (src: string) => boolean; // dynamic deletion gate
}

export default function ImageLibraryGrid({
  images,
  currentImage,
  onSelectImage,
  onDeleteImage,
  isLoading,
  error,
  columnsClassName = 'grid-cols-2',
  canDeleteImage,
}: ImageLibraryGridProps) {
  if (isLoading) return (
    <div className="p-4 text-center text-yellow-500/50 animate-pulse text-xs uppercase tracking-widest">
      Loading Library...
    </div>
  );
  if (error) return (
    <div className="p-4 text-center text-red-500/50 text-xs uppercase tracking-widest">
      Library Offline
    </div>
  );
  if (images.length === 0) return (
    <div className="p-4 text-center text-yellow-900/40 text-xs uppercase tracking-widest">
      No images yet
    </div>
  );

  return (
    <div className={`grid ${columnsClassName} gap-3 px-1`}>
      {images.map((img, idx) => {
        const isActive = currentImage === img;
        return (
          <div
            key={img}
            className={`relative aspect-[4/5] rounded-2xl overflow-hidden border-2 transition-all active:scale-95 cursor-pointer ${
              isActive
                ? 'border-yellow-500 shadow-lg shadow-yellow-900/40 scale-95'
                : 'border-transparent opacity-60'
            }`}
          >
            <div onClick={() => onSelectImage(idx)} className="w-full h-full">
              <img
                src={img}
                className="w-full h-full object-cover"
                alt="jewelry"
                loading="lazy"
                decoding="async"
              />
            </div>

            <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-black/60 rounded text-[8px] font-bold text-yellow-400">
              #{idx + 1}
            </div>

            {/* Delete only shown when caller wants it & image is deletable */}
            {onDeleteImage && canDeleteImage && canDeleteImage(img) && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm('Delete this image?')) onDeleteImage(img);
                }}
                className="absolute top-2 right-2 p-1.5 bg-red-600/80 hover:bg-red-600 rounded-lg text-white shadow-lg transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}

            {isActive && (
              <div
                onClick={() => onSelectImage(idx)}
                className="absolute inset-0 bg-yellow-500/10 flex items-center justify-center pointer-events-none"
              >
                <div className="bg-yellow-500 text-black p-1 rounded-full shadow-lg">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
