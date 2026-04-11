import React from 'react';

interface MobilePriceEditorProps {
  rates: { gold1g: string; gold8g: string; silver1g: string };
  setGoldPrice: (val: string) => void;
  setGold8Price: (val: string) => void;
  setSilverPrice: (val: string) => void;
  date: string;
  setDate: (date: string) => void;
}

export default function MobilePriceEditor({
  rates, setGoldPrice, setGold8Price, setSilverPrice, date, setDate
}: MobilePriceEditorProps) {
  return (
    <div className="flex flex-col gap-1">

      <div className="flex items-center gap-2 mb-3">
        <div className="w-1 h-1 rounded-full bg-[#b8860b]" />
        <span className="text-[9px] font-black tracking-[0.3em] uppercase text-white/30">Market Ledger</span>
        <div className="flex-1 h-px bg-white/[0.04]" />
        <span className="text-[8px] font-bold text-[#b8860b]/50 tracking-widest uppercase">Live</span>
      </div>

      <div className="bg-[#0a0907] border border-white/[0.04] rounded-2xl p-4 space-y-3">

        <div className="flex items-center gap-3">
          <span className="text-[8px] font-black tracking-[0.2em] uppercase text-white/20 w-16 shrink-0">Date</span>
          <div className="flex-1 relative">
            <input
              type="text"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-white/[0.04] border border-white/[0.06] rounded-xl px-3 py-2 text-[12px] font-bold text-white/80 focus:outline-none focus:border-[#b8860b]/30 transition-all placeholder:text-white/10"
              placeholder="DD – MONTH – YYYY"
            />
          </div>
        </div>

        <div className="h-px bg-white/[0.04]" />

        <div className="flex items-center gap-3">
          <span className="text-[8px] font-black tracking-[0.15em] uppercase text-[#b8860b]/50 w-16 shrink-0 leading-tight">22K Gold<br/>1 Gram</span>
          <div className="flex-1 relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#b8860b]/70 font-black text-[11px]">₹</span>
            <input
              type="text"
              value={rates.gold1g}
              onChange={(e) => setGoldPrice(e.target.value)}
              className="w-full bg-white/[0.04] border border-white/[0.06] rounded-xl pl-7 pr-3 py-2 text-[12px] font-mono font-bold text-white/80 focus:outline-none focus:border-[#b8860b]/30 transition-all placeholder:text-white/10"
              placeholder="0,000"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[8px] font-black tracking-[0.15em] uppercase text-[#b8860b]/50 w-16 shrink-0 leading-tight">22K Gold<br/>8 Gram</span>
          <div className="flex-1 relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#b8860b]/70 font-black text-[11px]">₹</span>
            <input
              type="text"
              value={rates.gold8g}
              onChange={(e) => setGold8Price(e.target.value)}
              className="w-full bg-white/[0.02] border border-white/[0.04] rounded-xl pl-7 pr-3 py-2 text-[12px] font-mono font-bold text-white/40 cursor-not-allowed placeholder:text-white/10"
              placeholder="0,00,000"
              readOnly
            />
          </div>
        </div>

        <div className="h-px bg-white/[0.04]" />

        <div className="flex items-center gap-3">
          <span className="text-[8px] font-black tracking-[0.15em] uppercase text-white/20 w-16 shrink-0 leading-tight">Silver<br/>1 Gram</span>
          <div className="flex-1 relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20 font-black text-[11px]">₹</span>
            <input
              type="text"
              value={rates.silver1g}
              onChange={(e) => setSilverPrice(e.target.value)}
              className="w-full bg-white/[0.04] border border-white/[0.06] rounded-xl pl-7 pr-3 py-2 text-[12px] font-mono font-bold text-white/60 focus:outline-none focus:border-white/20 transition-all placeholder:text-white/10"
              placeholder="00"
            />
          </div>
        </div>

      </div>
    </div>
  );
}
