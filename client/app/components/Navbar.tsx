"use client";

import { useState } from "react";

export default function Navbar() {
  const [activeTab, setActiveTab] = useState<"GOLD" | "SILVER">("GOLD");

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between px-8 py-3 bg-[#0a0502]/95 backdrop-blur-md border-b border-[#2a1b0c] shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
      {/* Decorative left flare */}
      <div className="absolute left-0 top-0 h-[1px] w-1/4 bg-gradient-to-r from-transparent via-[#b8860b]/30 to-transparent"></div>
      
      {/* Left section */}
      <div className="flex-1 hidden md:flex items-center">
      </div>

      {/* Center section - Logo */}
      <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center">
        <img 
          src="/Logo-main.png" 
          alt="Sri Kamatchi Jewellery" 
          className="h-12 w-auto object-contain brightness-110 drop-shadow-[0_0_15px_rgba(184,134,11,0.2)]"
        />
      </div>

      {/* Right section - Custom Toggle Controls */}
      <div className="flex-1 flex items-center justify-end z-10">
        <div className="p-[3px] bg-[#1a110a] rounded-full flex items-center border border-[#3a2b1c] shadow-inner">
          <button
            onClick={() => setActiveTab("GOLD")}
            className={`px-6 py-1.5 rounded-full text-xs font-bold transition-all duration-300 tracking-widest ${
              activeTab === "GOLD"
                ? "bg-[#b8860b] text-[#0a0502] shadow-[0_0_15px_rgba(184,134,11,0.4)]"
                : "text-[#8a765a] hover:text-[#b8860b]"
            }`}
          >
            GOLD
          </button>
          <button
            onClick={() => setActiveTab("SILVER")}
            className={`px-6 py-1.5 rounded-full text-xs font-bold transition-all duration-300 tracking-widest ${
              activeTab === "SILVER"
                ? "bg-[#c0c0c0] text-[#0a0502] shadow-[0_0_15px_rgba(192,192,192,0.4)]"
                : "text-[#8a765a] hover:text-[#c0c0c0]"
            }`}
          >
            SILVER
          </button>
        </div>
      </div>
    </nav>
  );
}
