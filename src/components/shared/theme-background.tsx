"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

/* ─────────────────────────────────────────────
   LIGHT — Soft geometric hexagon grid + lavender bloom
   ───────────────────────────────────────────── */
function LightDesign() {
  return (
    <>
      {/* Hexagonal grid pattern */}
      <svg className="pointer-events-none fixed inset-0 z-0 h-full w-full opacity-[0.12]">
        <defs>
          <pattern id="hex-grid" width="56" height="100" patternUnits="userSpaceOnUse" patternTransform="scale(2)">
            <path
              d="M28 66L0 50L0 16L28 0L56 16L56 50L28 66L28 100"
              fill="none"
              stroke="oklch(0.55 0.20 265)"
              strokeWidth="0.5"
            />
            <path
              d="M28 0L56 16L56 50L28 66L0 50L0 16"
              fill="none"
              stroke="oklch(0.55 0.20 265)"
              strokeWidth="0.5"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hex-grid)" />
      </svg>
      {/* Soft lavender bloom */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          backgroundImage: `
            radial-gradient(ellipse 60% 50% at 15% 20%, oklch(0.88 0.15 280 / 0.30), transparent 60%),
            radial-gradient(ellipse 40% 60% at 85% 75%, oklch(0.85 0.12 310 / 0.25), transparent 60%),
            radial-gradient(ellipse 50% 40% at 50% 50%, oklch(0.92 0.08 240 / 0.18), transparent 60%)
          `,
        }}
      />
    </>
  );
}

/* ─────────────────────────────────────────────
   DARK — Star constellation field + nebula glow
   ───────────────────────────────────────────── */
function DarkDesign() {
  return (
    <>
      {/* Star field */}
      <svg className="pointer-events-none fixed inset-0 z-0 h-full w-full opacity-80">
        <defs>
          <radialGradient id="star-glow">
            <stop offset="0%" stopColor="white" stopOpacity="1" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
        </defs>
        {/* Big bright stars */}
        {[
          [5, 8, 4.0], [20, 15, 5.0], [42, 30, 4.5], [68, 12, 5.5], [92, 60, 4.0],
          [25, 85, 4.5], [65, 80, 5.0], [85, 40, 4.0], [50, 50, 5.5], [15, 55, 4.5],
        ].map(([x, y, r], i) => (
          <circle key={`big-${i}`} cx={`${x}%`} cy={`${y}%`} r={r} fill="url(#star-glow)" opacity={0.8} />
        ))}
        {/* Medium stars */}
        {[
          [12, 25, 3.0], [35, 10, 2.8], [55, 20, 3.2], [75, 50, 2.8], [88, 35, 3.0],
          [38, 75, 2.5], [52, 90, 3.0], [78, 65, 2.8], [8, 42, 2.5], [45, 68, 3.0],
          [72, 92, 2.8], [32, 45, 2.5], [58, 78, 3.0], [90, 20, 2.5], [3, 90, 3.0],
        ].map(([x, y, r], i) => (
          <circle key={`med-${i}`} cx={`${x}%`} cy={`${y}%`} r={r} fill="url(#star-glow)" opacity={0.6} />
        ))}
        {/* Small accent stars */}
        {[
          [28, 45, 1.5], [48, 55, 1.8], [62, 40, 1.5], [82, 22, 1.8], [15, 70, 1.5],
          [95, 75, 1.8], [18, 95, 1.5], [60, 10, 1.8], [40, 60, 1.5],
        ].map(([x, y, r], i) => (
          <circle key={`sm-${i}`} cx={`${x}%`} cy={`${y}%`} r={r} fill="url(#star-glow)" opacity={0.4} />
        ))}
        {/* Constellation lines */}
        <g stroke="oklch(0.75 0.18 265)" strokeWidth="0.8" opacity="0.45">
          <line x1="5%" y1="8%" x2="12%" y2="25%" />
          <line x1="12%" y1="25%" x2="20%" y2="15%" />
          <line x1="35%" y1="10%" x2="42%" y2="30%" />
          <line x1="42%" y1="30%" x2="48%" y2="55%" />
          <line x1="62%" y1="40%" x2="68%" y2="12%" />
          <line x1="68%" y1="12%" x2="75%" y2="50%" />
          <line x1="82%" y1="22%" x2="88%" y2="35%" />
          <line x1="15%" y1="70%" x2="25%" y2="85%" />
          <line x1="25%" y1="85%" x2="38%" y2="75%" />
          <line x1="65%" y1="80%" x2="78%" y2="65%" />
          <line x1="78%" y1="65%" x2="85%" y2="88%" />
        </g>
      </svg>
      {/* Nebula glow */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          backgroundImage: `
            radial-gradient(ellipse 50% 40% at 20% 30%, oklch(0.30 0.18 280 / 0.50), transparent 60%),
            radial-gradient(ellipse 40% 50% at 80% 70%, oklch(0.25 0.15 250 / 0.40), transparent 60%)
          `,
        }}
      />
    </>
  );
}

/* ─────────────────────────────────────────────
   MIDNIGHT — Deep space aurora waves + twinkling stars
   ───────────────────────────────────────────── */
function MidnightDesign() {
  return (
    <>
      {/* Twinkling stars with CSS animation */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <svg className="h-full w-full opacity-80">
          {/* Big twinkling stars */}
          {[
            [10, 5, 4.5], [40, 8, 5.0], [70, 5, 4.0], [30, 42, 4.5], [65, 30, 5.5],
            [92, 28, 4.0], [45, 65, 5.0], [75, 68, 4.5], [5, 85, 4.0], [55, 82, 5.0],
          ].map(([x, y, r], i) => (
            <circle key={`big-${i}`} cx={`${x}%`} cy={`${y}%`} r={r} fill="white" opacity={0.7}
              className="animate-twinkle" style={{ animationDelay: `${i * 0.5}s` }} />
          ))}
          {/* Medium stars */}
          {[
            [25, 18, 3.0], [55, 22, 2.8], [85, 15, 3.2], [15, 35, 2.8], [50, 38, 3.0],
            [80, 45, 2.5], [8, 60, 3.0], [22, 72, 2.8], [60, 55, 3.0], [88, 58, 2.5],
            [35, 88, 3.0], [70, 90, 2.8], [90, 80, 3.0], [18, 95, 2.5], [48, 92, 3.0],
          ].map(([x, y, r], i) => (
            <circle key={`med-${i}`} cx={`${x}%`} cy={`${y}%`} r={r} fill="white" opacity={0.5}
              className="animate-twinkle" style={{ animationDelay: `${i * 0.3}s` }} />
          ))}
        </svg>
      </div>
      {/* Aurora waves */}
      <div
        className="pointer-events-none fixed inset-0 z-0 animate-aurora-wave"
        style={{
          backgroundImage: `
            radial-gradient(ellipse 120% 20% at 50% 100%, oklch(0.40 0.22 250 / 0.50), transparent),
            radial-gradient(ellipse 80% 15% at 30% 90%, oklch(0.35 0.18 280 / 0.40), transparent),
            radial-gradient(ellipse 60% 10% at 70% 95%, oklch(0.30 0.15 220 / 0.35), transparent)
          `,
        }}
      />
      {/* Deep space gradient */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          backgroundImage: `
            radial-gradient(ellipse 70% 60% at 50% 0%, oklch(0.20 0.10 270 / 0.60), transparent)
          `,
        }}
      />
    </>
  );
}

/* ─────────────────────────────────────────────
   AURORA — Northern lights animated bands + particle glow
   ───────────────────────────────────────────── */
function AuroraDesign() {
  return (
    <>
      {/* === CURTAIN 1: Main green aurora — tall, bright, animated === */}
      <div
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
        style={{
          background: `
            linear-gradient(
              180deg,
              transparent 0%,
              oklch(0.55 0.30 155 / 0.08) 5%,
              oklch(0.60 0.32 155 / 0.30) 12%,
              oklch(0.65 0.35 155 / 0.55) 22%,
              oklch(0.60 0.30 160 / 0.45) 35%,
              oklch(0.50 0.25 170 / 0.30) 48%,
              oklch(0.40 0.18 180 / 0.15) 60%,
              transparent 75%
            )
          `,
          animation: "aurora-curtain-1 8s ease-in-out infinite",
        }}
      />
      {/* === CURTAIN 2: Purple/violet secondary aurora === */}
      <div
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
        style={{
          background: `
            linear-gradient(
              180deg,
              transparent 0%,
              oklch(0.45 0.25 290 / 0.06) 8%,
              oklch(0.50 0.28 285 / 0.25) 18%,
              oklch(0.55 0.30 280 / 0.40) 28%,
              oklch(0.50 0.25 290 / 0.30) 40%,
              oklch(0.40 0.20 300 / 0.15) 55%,
              transparent 70%
            )
          `,
          animation: "aurora-curtain-2 12s ease-in-out infinite",
        }}
      />
      {/* === CURTAIN 3: Teal accent band === */}
      <div
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
        style={{
          background: `
            linear-gradient(
              180deg,
              transparent 0%,
              oklch(0.52 0.28 175 / 0.20) 15%,
              oklch(0.58 0.32 170 / 0.35) 25%,
              oklch(0.52 0.25 180 / 0.25) 38%,
              transparent 55%
            )
          `,
          animation: "aurora-curtain-3 15s ease-in-out infinite",
        }}
      />
      {/* === Bottom glow: ground reflection === */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background: `
            radial-gradient(ellipse 100% 30% at 50% 100%, oklch(0.30 0.18 160 / 0.40), transparent 70%),
            radial-gradient(ellipse 60% 20% at 30% 95%, oklch(0.25 0.15 280 / 0.25), transparent 60%),
            radial-gradient(ellipse 50% 25% at 75% 100%, oklch(0.28 0.16 170 / 0.30), transparent 60%)
          `,
        }}
      />
      {/* === Stars behind the aurora === */}
      <svg className="pointer-events-none fixed inset-0 z-0 h-full w-full opacity-70">
        <defs>
          <radialGradient id="aurora-star">
            <stop offset="0%" stopColor="white" stopOpacity="1" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
        </defs>
        {[
          [8, 6, 3.0], [22, 3, 2.5], [38, 8, 3.5], [55, 4, 2.8], [72, 7, 3.2],
          [88, 5, 2.5], [15, 15, 2.0], [45, 12, 2.2], [65, 18, 2.5], [82, 14, 2.0],
          [5, 50, 2.5], [30, 55, 2.0], [60, 48, 2.8], [85, 52, 2.2], [48, 62, 2.5],
          [12, 75, 2.0], [35, 78, 2.5], [68, 72, 2.2], [90, 68, 2.8], [25, 88, 2.0],
          [55, 85, 2.5], [78, 82, 2.2], [42, 95, 2.0], [92, 90, 2.5],
        ].map(([x, y, r], i) => (
          <circle key={i} cx={`${x}%`} cy={`${y}%`} r={r} fill="url(#aurora-star)"
            opacity={0.5 + (i % 4) * 0.1}
            className="animate-twinkle" style={{ animationDelay: `${i * 0.4}s` }} />
        ))}
      </svg>
    </>
  );
}

/* ─────────────────────────────────────────────
   SUNSET — Warm horizon with sun rays + warm clouds
   ───────────────────────────────────────────── */
function SunsetDesign() {
  return (
    <>
      {/* Sun rays emanating from bottom-right */}
      <svg className="pointer-events-none fixed inset-0 z-0 h-full w-full opacity-[0.18]">
        <defs>
          <linearGradient id="ray-fade" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="oklch(0.75 0.20 40)" stopOpacity="1" />
            <stop offset="100%" stopColor="oklch(0.75 0.20 40)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <g transform="translate(85%, 95%)" opacity="0.8">
          {Array.from({ length: 12 }, (_, i) => {
            const angle = -90 - 80 + i * (160 / 11);
            const rad = (angle * Math.PI) / 180;
            const len = 1200;
            return (
              <line
                key={i}
                x1="0"
                y1="0"
                x2={Math.cos(rad) * len}
                y2={Math.sin(rad) * len}
                stroke="oklch(0.75 0.20 40)"
                strokeWidth={i % 2 === 0 ? "2" : "1"}
                opacity={0.3 + (i % 3) * 0.2}
              />
            );
          })}
        </g>
      </svg>
      {/* Warm horizon gradient */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          backgroundImage: `
            radial-gradient(ellipse 100% 30% at 80% 100%, oklch(0.45 0.25 30 / 0.50), transparent),
            radial-gradient(ellipse 80% 25% at 60% 90%, oklch(0.40 0.22 350 / 0.35), transparent),
            radial-gradient(ellipse 60% 40% at 30% 20%, oklch(0.30 0.15 50 / 0.25), transparent)
          `,
        }}
      />
      {/* Warm cloud wisps */}
      <div
        className="pointer-events-none fixed inset-0 z-0 animate-cloud-drift"
        style={{
          backgroundImage: `
            radial-gradient(ellipse 30% 8% at 20% 25%, oklch(0.40 0.15 30 / 0.22), transparent),
            radial-gradient(ellipse 25% 6% at 55% 35%, oklch(0.35 0.12 40 / 0.18), transparent),
            radial-gradient(ellipse 35% 7% at 75% 20%, oklch(0.38 0.16 25 / 0.15), transparent),
            radial-gradient(ellipse 20% 5% at 40% 45%, oklch(0.32 0.10 50 / 0.18), transparent)
          `,
        }}
      />
    </>
  );
}

/* ─────────────────────────────────────────────
   Noise texture — shared across all themes
   ───────────────────────────────────────────── */
function NoiseOverlay() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 opacity-[0.025]"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
      }}
    />
  );
}

/* ─────────────────────────────────────────────
   Main export — renders per-theme design
   ───────────────────────────────────────────── */
const themeDesigns: Record<string, () => React.JSX.Element> = {
  light: LightDesign,
  dark: DarkDesign,
  midnight: MidnightDesign,
  aurora: AuroraDesign,
  sunset: SunsetDesign,
};

export function ThemeBackground() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const Design = themeDesigns[resolvedTheme ?? "dark"] ?? DarkDesign;

  return (
    <>
      <Design />
      <NoiseOverlay />
    </>
  );
}
