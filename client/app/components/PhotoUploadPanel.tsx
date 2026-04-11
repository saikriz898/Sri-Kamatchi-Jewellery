import React from 'react';
import { Upload, Loader2 } from 'lucide-react';

interface PhotoUploadPanelProps {
  onUploadPhotos: (files: FileList) => void;
  isUploadingPhotos: boolean;
}

export default function PhotoUploadPanel({ onUploadPhotos, isUploadingPhotos }: PhotoUploadPanelProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) onUploadPhotos(e.target.files);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files) onUploadPhotos(e.dataTransfer.files);
  };

  return (
    <div 
      onClick={() => fileInputRef.current?.click()}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      className={`relative h-32 bg-yellow-900/5 border border-dashed border-yellow-700/20 rounded-[28px] flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-yellow-900/10 hover:border-yellow-700/40 transition-all overflow-hidden shadow-inner group`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-700/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className={`w-10 h-10 rounded-full bg-yellow-700/20 flex items-center justify-center text-yellow-500 group-hover:scale-110 transition-transform`}>
        {isUploadingPhotos ? <Loader2 size={20} className="animate-spin" /> : <Upload size={20} />}
      </div>
      <div className="flex flex-col items-center gap-1">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-yellow-600/80">
          {isUploadingPhotos ? 'Processing...' : 'Upload Photos'}
        </span>
        <span className="text-[8px] font-medium text-yellow-800/40 uppercase tracking-widest">
           Drop files or Tap to select
        </span>
      </div>
      <input type="file" multiple className="hidden" ref={fileInputRef} onChange={handleUpload} accept="image/*" />
    </div>
  );
}
