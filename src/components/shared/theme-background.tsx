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
      <svg className="pointer-events-none fixed inset-0 -z-10 h-full w-full opacity-[0.04]">
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
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          backgroundImage: `
            radial-gradient(ellipse 60% 50% at 15% 20%, oklch(0.88 0.12 280 / 0.15), transparent 60%),
            radial-gradient(ellipse 40% 60% at 85% 75%, oklch(0.85 0.10 310 / 0.12), transparent 60%),
            radial-gradient(ellipse 50% 40% at 50% 50%, oklch(0.92 0.06 240 / 0.08), transparent 60%)
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
      <svg className="pointer-events-none fixed inset-0 -z-10 h-full w-full opacity-40">
        <defs>
          <radialGradient id="star-glow">
            <stop offset="0%" stopColor="white" stopOpacity="1" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
        </defs>
        {/* Scattered stars — different sizes and positions */}
        {[
          [5, 8, 1.2], [12, 25, 0.8], [20, 15, 1.5], [28, 45, 0.6], [35, 10, 1.0],
          [42, 30, 1.3], [48, 55, 0.7], [55, 20, 1.1], [62, 40, 0.9], [68, 12, 1.4],
          [75, 50, 0.8], [82, 22, 1.0], [88, 35, 0.6], [92, 60, 1.2], [15, 70, 0.9],
          [25, 85, 1.1], [38, 75, 0.7], [52, 90, 1.0], [65, 80, 0.8], [78, 65, 1.3],
          [85, 88, 0.6], [95, 75, 1.0], [8, 55, 0.7], [45, 68, 1.1], [72, 92, 0.9],
          [18, 42, 0.5], [58, 78, 0.8], [32, 92, 1.0], [90, 48, 0.6], [3, 90, 1.2],
        ].map(([x, y, r], i) => (
          <circle
            key={i}
            cx={`${x}%`}
            cy={`${y}%`}
            r={r}
            fill="url(#star-glow)"
            opacity={0.3 + (i % 5) * 0.15}
          />
        ))}
        {/* Constellation lines */}
        <g stroke="oklch(0.70 0.10 265)" strokeWidth="0.3" opacity="0.15">
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
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          backgroundImage: `
            radial-gradient(ellipse 50% 40% at 20% 30%, oklch(0.25 0.12 280 / 0.35), transparent 60%),
            radial-gradient(ellipse 40% 50% at 80% 70%, oklch(0.20 0.10 250 / 0.25), transparent 60%)
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
      <div className="pointer-events-none fixed inset-0 -z-10">
        <svg className="h-full w-full opacity-50">
          {[
            [10, 5, 1.0], [25, 18, 0.7], [40, 8, 1.2], [55, 22, 0.6], [70, 5, 0.9],
            [85, 15, 1.1], [15, 35, 0.8], [30, 42, 1.0], [50, 38, 0.5], [65, 30, 1.3],
            [80, 45, 0.7], [92, 28, 0.9], [8, 60, 1.1], [22, 72, 0.6], [45, 65, 1.0],
            [60, 55, 0.8], [75, 68, 1.2], [88, 58, 0.7], [5, 85, 0.9], [35, 88, 1.0],
            [55, 82, 0.6], [70, 90, 1.1], [90, 80, 0.8], [18, 95, 0.7], [48, 92, 1.0],
          ].map(([x, y, r], i) => (
            <circle
              key={i}
              cx={`${x}%`}
              cy={`${y}%`}
              r={r}
              fill="white"
              opacity={0.4}
              className="animate-twinkle"
              style={{ animationDelay: `${i * 0.4}s` }}
            />
          ))}
        </svg>
      </div>
      {/* Aurora waves */}
      <div
        className="pointer-events-none fixed inset-0 -z-10 animate-aurora-wave"
        style={{
          backgroundImage: `
            radial-gradient(ellipse 120% 20% at 50% 100%, oklch(0.35 0.18 250 / 0.30), transparent),
            radial-gradient(ellipse 80% 15% at 30% 90%, oklch(0.30 0.15 280 / 0.25), transparent),
            radial-gradient(ellipse 60% 10% at 70% 95%, oklch(0.25 0.12 220 / 0.20), transparent)
          `,
        }}
      />
      {/* Deep space gradient */}
      <div
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          backgroundImage: `
            radial-gradient(ellipse 70% 60% at 50% 0%, oklch(0.15 0.06 270 / 0.50), transparent)
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
      {/* Aurora bands — animated vertical waves */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div
          className="absolute inset-0 animate-aurora-bands"
          style={{
            backgroundImage: `
              linear-gradient(180deg, transparent 0%, oklch(0.40 0.20 160 / 0.12) 20%, oklch(0.35 0.18 180 / 0.18) 35%, transparent 50%),
              linear-gradient(180deg, transparent 10%, oklch(0.38 0.15 280 / 0.10) 30%, oklch(0.30 0.20 200 / 0.15) 45%, transparent 60%),
              linear-gradient(180deg, transparent 5%, oklch(0.42 0.18 150 / 0.08) 25%, oklch(0.35 0.12 190 / 0.12) 40%, transparent 55%)
            `,
            backgroundSize: "100% 100%, 100% 100%, 100% 100%",
          }}
        />
        {/* Shimmering particles */}
        <svg className="absolute inset-0 h-full w-full opacity-30">
          {[
            [8, 15], [15, 25], [22, 18], [30, 30], [38, 22],
            [45, 28], [52, 20], [60, 32], [68, 25], [75, 18],
            [82, 28], [90, 22], [12, 38], [35, 40], [58, 35],
            [72, 42], [88, 38], [20, 45], [48, 48], [65, 44],
          ].map(([x, y], i) => (
            <circle
              key={i}
              cx={`${x}%`}
              cy={`${y}%`}
              r={i % 3 === 0 ? 1.5 : 0.8}
              fill={i % 2 === 0 ? "oklch(0.75 0.18 160)" : "oklch(0.70 0.15 280)"}
              className="animate-twinkle"
              style={{ animationDelay: `${i * 0.3}s` }}
            />
          ))}
        </svg>
      </div>
      {/* Base teal glow */}
      <div
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          backgroundImage: `
            radial-gradient(ellipse 80% 40% at 40% 20%, oklch(0.25 0.10 160 / 0.30), transparent),
            radial-gradient(ellipse 60% 30% at 70% 40%, oklch(0.22 0.08 200 / 0.20), transparent)
          `,
        }}
      />
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
      <svg className="pointer-events-none fixed inset-0 -z-10 h-full w-full opacity-[0.07]">
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
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          backgroundImage: `
            radial-gradient(ellipse 100% 30% at 80% 100%, oklch(0.40 0.22 30 / 0.35), transparent),
            radial-gradient(ellipse 80% 25% at 60% 90%, oklch(0.35 0.18 350 / 0.20), transparent),
            radial-gradient(ellipse 60% 40% at 30% 20%, oklch(0.25 0.10 50 / 0.15), transparent)
          `,
        }}
      />
      {/* Warm cloud wisps */}
      <div
        className="pointer-events-none fixed inset-0 -z-10 animate-cloud-drift"
        style={{
          backgroundImage: `
            radial-gradient(ellipse 30% 8% at 20% 25%, oklch(0.35 0.12 30 / 0.12), transparent),
            radial-gradient(ellipse 25% 6% at 55% 35%, oklch(0.30 0.10 40 / 0.10), transparent),
            radial-gradient(ellipse 35% 7% at 75% 20%, oklch(0.32 0.14 25 / 0.08), transparent),
            radial-gradient(ellipse 20% 5% at 40% 45%, oklch(0.28 0.08 50 / 0.10), transparent)
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
      className="pointer-events-none fixed inset-0 -z-10 opacity-[0.025]"
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
