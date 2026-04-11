import React from 'react';

interface MobileBottomNavbarProps {
  activeTab: 'edit' | 'preview';
  setActiveTab: (tab: 'edit' | 'preview') => void;
  onGenerate: () => void;
  isGenerating: boolean;
}

export default function MobileBottomNavbar({ activeTab, setActiveTab, onGenerate, isGenerating }: MobileBottomNavbarProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 h-20 bg-black/90 backdrop-blur-xl border-t border-yellow-900/30 px-6 flex items-center justify-around z-50 pb-safe">
      <button 
        onClick={() => setActiveTab('edit')}
        className={`flex flex-col items-center gap-1.5 transition-all duration-300 ${activeTab === 'edit' ? 'text-yellow-400 scale-110' : 'text-yellow-700/60'}`}
      >
        <div className={`p-2 rounded-xl border transition-colors ${activeTab === 'edit' ? 'bg-yellow-400/10 border-yellow-400/50' : 'bg-transparent border-transparent'}`}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </div>
        <span className="text-[10px] font-cinzel font-bold tracking-widest">EDIT</span>
      </button>

      <button 
        onClick={() => setActiveTab('preview')}
        className={`flex flex-col items-center gap-1.5 transition-all duration-300 ${activeTab === 'preview' ? 'text-yellow-400 scale-110' : 'text-yellow-700/60'}`}
      >
        <div className={`p-2 rounded-xl border transition-colors ${activeTab === 'preview' ? 'bg-yellow-400/10 border-yellow-400/50' : 'bg-transparent border-transparent'}`}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </div>
        <span className="text-[10px] font-cinzel font-bold tracking-widest">PREVIEW</span>
      </button>

      {/* Generate Shortcut on navigation */}
      <button 
        onClick={onGenerate}
        disabled={isGenerating}
        className={`flex flex-col items-center gap-1.5 transition-all active:scale-90 ${isGenerating ? 'opacity-50' : 'text-yellow-400'}`}
      >
        <div className="p-2 rounded-xl bg-gradient-to-tr from-yellow-700 to-yellow-400 shadow-lg shadow-yellow-900/30 text-black">
          {isGenerating ? (
              <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
          ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
          )}
        </div>
        <span className="text-[10px] font-cinzel font-bold tracking-widest uppercase">New</span>
      </button>
    </nav>
  );
}
