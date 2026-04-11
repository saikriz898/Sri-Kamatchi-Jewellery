import React from 'react';

interface MobileHeaderProps {
  logoImg: string;
  metalMode: 'gold' | 'silver';
  setMetalMode: (mode: 'gold' | 'silver') => void;
}

export default function MobileHeader({ logoImg, metalMode, setMetalMode }: MobileHeaderProps) {
  return (
    <header className="flex-shrink-0 flex items-center justify-between px-4 h-16 border-b border-yellow-900/30 bg-black/40 backdrop-blur-md z-30">
      <div className="flex-1">
        <img src={logoImg} alt="Logo" className="h-8 w-auto object-contain" />
      </div>

      {/* Metal Mode Miniature Toggle */}
      <div className="flex-shrink-0 h-10 w-28 p-1 rounded-full bg-black/60 border border-yellow-900/20 relative flex items-center">
          <div 
            className="absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-full transition-transform duration-300 shadow-lg shadow-black/80"
            style={{ 
              left: metalMode === 'gold' ? 4 : 'calc(50% + 1px)',
              background: metalMode === 'gold' ? 'linear-gradient(135deg, #3d2e00, #2a2000)' : '#222',
              border: '1px solid rgba(212,175,55,0.4)'
            }}
          />
          <button 
            onClick={() => setMetalMode('gold')}
            className={`relative z-10 flex-1 h-full text-[9px] font-cinzel font-bold tracking-widest ${metalMode === 'gold' ? 'text-yellow-400' : 'text-yellow-900/40'}`}
          >GOLD</button>
          <button 
            onClick={() => setMetalMode('silver')}
            className={`relative z-10 flex-1 h-full text-[9px] font-cinzel font-bold tracking-widest ${metalMode === 'silver' ? 'text-gray-200' : 'text-yellow-900/40'}`}
          >SILVER</button>
      </div>
    </header>
  );
}
