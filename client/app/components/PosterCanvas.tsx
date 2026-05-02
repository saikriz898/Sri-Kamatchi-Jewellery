"use client";

import React, { forwardRef } from 'react';

const CINZEL = "var(--font-cinzel), serif";
const TAMIL = "var(--font-noto-tamil), serif";
const RATE_FONT = "var(--font-playfair), serif";
const GOLD_TEXT = "#D6B963";
const GOLD_PILL = "#E9D490";

interface PosterCanvasGoldProps {
  rates: { gold1g: string; gold8g: string; silver1g: string };
  imageUrl?: string;
  date?: string;
  isExporting?: boolean;
}

const rateColumns = [
  { tamil: '1 கிராம் தங்கம்', sub: '1 GRAM GOLD', karat: '22K', key: 'gold1g' },
  { tamil: '8 கிராம் தங்கம்', sub: '8 GRAM GOLD', karat: '22K', key: 'gold8g' },
  { tamil: '1 கிராம் வெள்ளி', sub: '1 GRAM SILVER', karat: '999', key: 'silver1g' },
] as const;

function formatDisplayDate(rawDate?: string) {
  if (!rawDate) {
    const d = new Date();
    return `${d.getDate()} - ${d.toLocaleString('en-US', { month: 'long' }).toUpperCase()} - ${d.getFullYear()}`;
  }

  const normalized = rawDate.replace(/[–—/]/g, '-').trim();
  const parts = normalized.split('-').map((part) => part.trim()).filter(Boolean);

  if (parts.length === 3) {
    const [dayPart, monthPart, yearPart] = parts;
    if (/^\d{1,2}$/.test(dayPart) && /^\d{1,2}$/.test(monthPart) && /^\d{4}$/.test(yearPart)) {
      const parsed = new Date(Number(yearPart), Number(monthPart) - 1, Number(dayPart));
      if (!Number.isNaN(parsed.getTime())) {
        return `${parsed.getDate()} - ${parsed.toLocaleString('en-US', { month: 'long' }).toUpperCase()} - ${parsed.getFullYear()}`;
      }
    }
  }

  return normalized.toUpperCase();
}

const PosterCanvasGold = forwardRef<HTMLDivElement, PosterCanvasGoldProps>(function PosterCanvasGold(
  { rates, imageUrl, date, isExporting }, ref
) {
  const displayDate = formatDisplayDate(date);
  const formatValue = (key: keyof PosterCanvasGoldProps["rates"]) => {
    const val = rates[key]?.toString().replace(/,/g, '') || "0";
    const num = parseFloat(val);
    return isNaN(num) ? "0" : num.toLocaleString('en-IN');
  };

  return (
    <div
      ref={ref}
      id="poster-canvas-area"
      className={`relative overflow-hidden text-white ${isExporting ? 'rounded-none' : 'rounded-2xl'}`}
      style={{
        width: 'min(calc(85vh * 9 / 16), 90vw)',
        height: 'calc(min(calc(85vh * 9 / 16), 90vw) * 16 / 9)',
        aspectRatio: '9 / 16',
        background: '#120803',
        fontFamily: CINZEL,
      }}
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt="Jewellery"
          className="absolute inset-0 h-full w-full object-cover object-center"
          loading="eager"
          decoding="sync"
          crossOrigin="anonymous"
        />
      ) : (
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(circle at 15% 12%, rgba(193,143,48,0.14), transparent 22%),
              radial-gradient(circle at 86% 10%, rgba(193,143,48,0.12), transparent 18%),
              radial-gradient(circle at 75% 78%, rgba(193,143,48,0.1), transparent 16%),
              linear-gradient(180deg, #251107 0%, #120803 100%)
            `,
          }}
        />
      )}

      <div
        className="absolute inset-0"
        style={{
          background: imageUrl
            ? 'linear-gradient(180deg, rgba(14,7,2,0.68) 0%, rgba(14,7,2,0.08) 34%, rgba(14,7,2,0.2) 58%, rgba(8,4,1,0.9) 100%)'
            : 'linear-gradient(180deg, rgba(46,25,9,0.94) 0%, rgba(18,8,3,0.8) 36%, rgba(12,5,2,0.86) 68%, rgba(8,4,1,0.96) 100%)',
        }}
      />

      <div
        className="absolute inset-[1.35%] z-10 pointer-events-none"
        style={{
          border: '2px solid rgba(183,136,36,0.9)',
          borderRadius: '12px',
          boxShadow: '0 0 0 1px rgba(255,214,136,0.08), inset 0 0 26px rgba(184,134,11,0.08)',
        }}
      />

      <div
        className="absolute inset-[2.15%] z-10 pointer-events-none"
        style={{
          border: '1px solid rgba(235,193,106,0.16)',
          borderRadius: '9px',
        }}
      />

      <header className="absolute left-0 right-0 top-0 z-20 flex flex-col items-center pt-[3vh]">
        <img
          src="/Logo_top.png"
          alt="Sri Kamatchi"
          className="object-contain drop-shadow-[0_6px_24px_rgba(184,134,11,0.45)]"
          style={{ height: '11.5vh', width: 'auto' }}
          crossOrigin="anonymous"
          loading="eager"
          decoding="sync"
        />
        <img
          src="/Logo-main.png"
          alt="Sri Kamatchi Jewellery"
          className="object-contain drop-shadow-[0_4px_18px_rgba(184,134,11,0.35)]"
          style={{ width: '72%', height: 'auto', marginTop: '0.5vh' }}
          crossOrigin="anonymous"
          loading="eager"
          decoding="sync"
        />
      </header>

      <div className="absolute inset-x-0 bottom-0 z-30 px-[1.9vh] pb-[2.2vh]">
        <div className="mb-[1.1vh] flex justify-center">
          <div
            className="px-[2.8vh] py-[0.55vh] text-center"
            style={{
              minWidth: '42%',
              borderRadius: '999px',
              border: '1px solid rgba(193,143,48,0.95)',
              background: 'linear-gradient(180deg, rgba(49,26,10,0.98) 0%, rgba(22,11,4,0.99) 100%)',
              boxShadow: '0 0 0 1px rgba(83,46,11,0.7), inset 0 1px 0 rgba(255,223,162,0.12)',
            }}
          >
            <span
              className="font-black uppercase"
              style={{
                fontFamily: CINZEL,
                fontSize: '1.34vh',
                letterSpacing: '0.28em',
                color: GOLD_TEXT,
              }}
            >
              {displayDate}
            </span>
          </div>
        </div>

        <div
          style={{
            borderRadius: '2.2vh',
            border: '1.5px solid rgba(193,143,48,0.98)',
            background: 'linear-gradient(180deg, rgba(30,14,5,0.98) 0%, rgba(10,5,2,0.985) 100%)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,218,146,0.08)',
          }}
        >
          <div
            className="flex items-center justify-center gap-[1.1vh]"
            style={{
              paddingTop: '1.2vh',
              paddingBottom: '1.05vh',
              borderBottom: '1px solid rgba(193,143,48,0.68)',
            }}
          >
            <span style={{ color: GOLD_TEXT, fontSize: '1.04vh' }}>*</span>
            <span
              className="font-black uppercase"
              style={{
                fontFamily: CINZEL,
                fontSize: '1.44vh',
                letterSpacing: '0.22em',
                color: GOLD_TEXT,
              }}
            >
              Today&apos;s Rate
            </span>
            <span style={{ color: GOLD_TEXT, fontSize: '1.04vh' }}>*</span>
          </div>

          <div className="grid grid-cols-3">
            {rateColumns.map((col, idx) => (
              <div
                key={col.key}
                className="flex flex-col items-center"
                style={{
                  padding: '1.05vh 0.65vh 1.2vh',
                  borderRight: idx < 2 ? '1px solid rgba(193,143,48,0.56)' : 'none',
                }}
              >
                <span
                  className="text-center"
                  style={{
                    fontFamily: TAMIL,
                    fontSize: '1.08vh',
                    lineHeight: 1.15,
                    color: GOLD_TEXT,
                    fontWeight: 700,
                    marginBottom: '0.36vh',
                  }}
                >
                  {col.tamil}
                </span>
                <span
                  className="uppercase"
                  style={{
                    fontFamily: CINZEL,
                    fontSize: '0.92vh',
                    letterSpacing: '0.1em',
                    color: GOLD_TEXT,
                    marginBottom: '0.9vh',
                    fontWeight: 700,
                  }}
                >
                  {col.sub}
                </span>
                <div
                  className="flex items-center justify-center"
                  style={{
                    minWidth: '6.1vh',
                    borderRadius: '999px',
                    padding: '0.3vh 1.55vh',
                    marginBottom: '0.76vh',
                    background: GOLD_PILL,
                    boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.45), 0 2px 8px rgba(0,0,0,0.16)',
                  }}
                >
                  <span
                    style={{
                      fontFamily: CINZEL,
                      fontSize: '0.82vh',
                      fontWeight: 900,
                      color: '#5b4210',
                      letterSpacing: '0.04em',
                    }}
                  >
                    {col.karat}
                  </span>
                </div>
                <div className="flex items-start justify-center">
                  <span
                    style={{
                      fontFamily: RATE_FONT,
                      fontSize: '1.3vh',
                      fontWeight: 500,
                      marginTop: '0.3vh',
                      marginRight: '0.1vh',
                      color: GOLD_TEXT,
                    }}
                  >
                    ₹
                  </span>
                  <span
                    style={{
                      fontFamily: RATE_FONT,
                      fontSize: '2.4vh',
                      fontWeight: 600,
                      lineHeight: 1,
                      color: '#FFFFFF',
                      textShadow: '0 2px 4px rgba(0,0,0,0.4)',
                      letterSpacing: '-0.01em'
                    }}
                  >
                    {formatValue(col.key as keyof PosterCanvasGoldProps["rates"])}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>



        <div
          className="flex items-end justify-between"
          style={{ paddingTop: '1vh', paddingInline: '0.15vh' }}
        >
          <div className="flex flex-col">
            <span
              style={{
                fontFamily: CINZEL,
                fontSize: '1.02vh',
                fontWeight: 700,
                lineHeight: 1.14,
                color: GOLD_TEXT,
              }}
            >
              916 KDM 22CT GOLD &amp; SILVER
            </span>
            <span
              style={{
                fontFamily: TAMIL,
                fontSize: '0.87vh',
                lineHeight: 1.14,
                color: GOLD_TEXT,
              }}
            >
              நகைகள் வாங்கிட....
            </span>
          </div>
          <div className="flex flex-col items-end">
            <span
              style={{
                fontFamily: CINZEL,
                fontSize: '1.18vh',
                lineHeight: 1.08,
                fontWeight: 800,
                color: '#fff0cf',
              }}
            >
              +91 9443565847
            </span>
            <span
              style={{
                fontFamily: CINZEL,
                fontSize: '0.82vh',
                lineHeight: 1.08,
                fontWeight: 600,
                color: GOLD_TEXT,
              }}
            >
              156/1 S.S Kovil Street, Pollachi
            </span>
          </div>
        </div>
      </div>
    </div>
  );
});

export default PosterCanvasGold;
