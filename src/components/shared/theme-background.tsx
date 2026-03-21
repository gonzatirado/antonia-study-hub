"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { SnowEffect } from "./snow-effect";
import { StarfieldEffect } from "./starfield-effect";

/* ─────────────────────────────────────────────
   Shared: Dot grid pattern overlay (Draftly-style)
   ───────────────────────────────────────────── */
function DotGridOverlay({ opacity = 0.05, color = "white", spacing = 24 }: { opacity?: number; color?: string; spacing?: number }) {
  return (
    <svg className="pointer-events-none fixed inset-0 z-0 h-full w-full" style={{ opacity }}>
      <defs>
        <pattern id={`dot-grid-${color.replace(/[^a-z]/g, "")}`} width={spacing} height={spacing} patternUnits="userSpaceOnUse">
          <circle cx={spacing / 2} cy={spacing / 2} r="0.8" fill={color} />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#dot-grid-${color.replace(/[^a-z]/g, "")})`} />
    </svg>
  );
}

/* ─────────────────────────────────────────────
   LIGHT — Soft geometric hexagon grid + warm bloom + dot texture
   ───────────────────────────────────────────── */
function LightDesign() {
  return (
    <>
      {/* Hexagonal grid pattern */}
      <svg className="pointer-events-none fixed inset-0 z-0 h-full w-full opacity-[0.08]">
        <defs>
          <pattern id="hex-grid" width="56" height="100" patternUnits="userSpaceOnUse" patternTransform="scale(2)">
            <path
              d="M28 66L0 50L0 16L28 0L56 16L56 50L28 66L28 100"
              fill="none"
              stroke="oklch(0.55 0.20 265)"
              strokeWidth="0.4"
            />
            <path
              d="M28 0L56 16L56 50L28 66L0 50L0 16"
              fill="none"
              stroke="oklch(0.55 0.20 265)"
              strokeWidth="0.4"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hex-grid)" />
      </svg>
      {/* Subtle dot pattern overlay at 3% for Draftly texture */}
      <DotGridOverlay opacity={0.03} color="oklch(0.40 0.05 265)" spacing={20} />
      {/* Warm gradient bloom — top left warm peach, center lavender, bottom right soft rose */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          backgroundImage: `
            radial-gradient(ellipse 60% 50% at 10% 15%, oklch(0.92 0.08 60 / 0.18), transparent 55%),
            radial-gradient(ellipse 50% 45% at 50% 40%, oklch(0.90 0.10 280 / 0.14), transparent 55%),
            radial-gradient(ellipse 55% 50% at 85% 75%, oklch(0.88 0.09 330 / 0.16), transparent 55%),
            radial-gradient(ellipse 40% 35% at 30% 80%, oklch(0.93 0.06 200 / 0.10), transparent 50%)
          `,
        }}
      />
      {/* Soft top edge highlight — makes it feel designed not flat */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          backgroundImage: `
            linear-gradient(180deg, oklch(0.96 0.03 265 / 0.30) 0%, transparent 12%)
          `,
        }}
      />
    </>
  );
}

/* ─────────────────────────────────────────────
   DARK — Clean professional dark mode: dot grid + subtle glow
   ───────────────────────────────────────────── */
function DarkDesign() {
  return (
    <>
      {/* Subtle dot grid overlay at 4% — Draftly-style texture */}
      <DotGridOverlay opacity={0.04} color="oklch(0.50 0.01 260)" spacing={24} />
      {/* ONE subtle violet radial glow — barely visible ambient light */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          backgroundImage: `
            radial-gradient(ellipse 60% 50% at 30% 20%, oklch(0.18 0.08 280 / 0.18), transparent 65%)
          `,
        }}
      />
    </>
  );
}

/* ─────────────────────────────────────────────
   MIDNIGHT — Stitch deep midnight sky image
   ───────────────────────────────────────────── */
function MidnightDesign() {
  return (
    <StitchBackground src="/themes/fondo-medianoche.png" />
  );
}

/* ─────────────────────────────────────────────
   AURORA — Stitch arctic aurora boreal image
   ───────────────────────────────────────────── */
function AuroraDesign() {
  return (
    <StitchBackground src="/themes/fondo-aurora.png" />
  );
}

/* ─────────────────────────────────────────────
   GOLD — Luxurious parchment with art deco geometry + golden glows
   ───────────────────────────────────────────── */
function GoldDesign() {
  return (
    <>
      {/* Art deco geometric pattern — layered diamond + inner ornament at very low opacity */}
      <svg className="pointer-events-none fixed inset-0 z-0 h-full w-full opacity-[0.10]">
        <defs>
          <pattern id="gold-art-deco" width="80" height="80" patternUnits="userSpaceOnUse" patternTransform="scale(1.5)">
            {/* Outer diamond */}
            <path d="M40 0L80 40L40 80L0 40Z" fill="none" stroke="oklch(0.55 0.18 85)" strokeWidth="0.7" />
            {/* Inner diamond */}
            <path d="M40 12L68 40L40 68L12 40Z" fill="none" stroke="oklch(0.62 0.14 85)" strokeWidth="0.3" />
            {/* Cross lines through center */}
            <line x1="40" y1="0" x2="40" y2="80" stroke="oklch(0.62 0.14 85)" strokeWidth="0.2" />
            <line x1="0" y1="40" x2="80" y2="40" stroke="oklch(0.62 0.14 85)" strokeWidth="0.2" />
            {/* Corner ornament dots */}
            <circle cx="40" cy="0" r="1.5" fill="oklch(0.65 0.12 85)" opacity="0.6" />
            <circle cx="80" cy="40" r="1.5" fill="oklch(0.65 0.12 85)" opacity="0.6" />
            <circle cx="40" cy="80" r="1.5" fill="oklch(0.65 0.12 85)" opacity="0.6" />
            <circle cx="0" cy="40" r="1.5" fill="oklch(0.65 0.12 85)" opacity="0.6" />
            {/* Center ornament */}
            <circle cx="40" cy="40" r="2" fill="none" stroke="oklch(0.65 0.12 85)" strokeWidth="0.4" />
            <circle cx="40" cy="40" r="0.8" fill="oklch(0.68 0.14 85)" opacity="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#gold-art-deco)" />
      </svg>
      {/* Warm golden radial glows — multiple positioned for richness */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          backgroundImage: `
            radial-gradient(ellipse 55% 45% at 15% 20%, oklch(0.90 0.10 80 / 0.25), transparent 55%),
            radial-gradient(ellipse 45% 50% at 85% 25%, oklch(0.88 0.08 90 / 0.20), transparent 55%),
            radial-gradient(ellipse 50% 40% at 50% 75%, oklch(0.86 0.09 75 / 0.18), transparent 50%),
            radial-gradient(ellipse 60% 30% at 70% 50%, oklch(0.92 0.06 95 / 0.14), transparent 50%),
            radial-gradient(ellipse 40% 35% at 25% 65%, oklch(0.85 0.07 70 / 0.12), transparent 45%)
          `,
        }}
      />
      {/* Warm top-edge highlight — parchment glow */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          backgroundImage: `
            linear-gradient(180deg, oklch(0.94 0.04 80 / 0.35) 0%, transparent 15%),
            linear-gradient(0deg, oklch(0.90 0.05 75 / 0.15) 0%, transparent 10%)
          `,
        }}
      />
      {/* Floating golden particles — refined with shimmer animation */}
      <svg className="pointer-events-none fixed inset-0 z-0 h-full w-full opacity-[0.20]">
        <defs>
          <radialGradient id="gold-particle">
            <stop offset="0%" stopColor="oklch(0.78 0.14 85)" stopOpacity="1" />
            <stop offset="100%" stopColor="oklch(0.78 0.14 85)" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="gold-particle-warm">
            <stop offset="0%" stopColor="oklch(0.75 0.16 75)" stopOpacity="1" />
            <stop offset="100%" stopColor="oklch(0.75 0.16 75)" stopOpacity="0" />
          </radialGradient>
        </defs>
        {[
          [8, 12, 3.5, "gold-particle"], [25, 8, 4.0, "gold-particle-warm"],
          [45, 18, 3.0, "gold-particle"], [68, 10, 4.5, "gold-particle-warm"],
          [88, 22, 3.5, "gold-particle"], [15, 45, 3.0, "gold-particle-warm"],
          [38, 55, 4.0, "gold-particle"], [62, 42, 3.5, "gold-particle-warm"],
          [82, 50, 3.0, "gold-particle"], [50, 72, 4.0, "gold-particle-warm"],
          [20, 80, 3.5, "gold-particle"], [72, 78, 3.0, "gold-particle-warm"],
          [42, 90, 3.5, "gold-particle"], [90, 85, 4.0, "gold-particle-warm"],
          [5, 65, 3.0, "gold-particle"],
        ].map(([x, y, r, grad], i) => (
          <circle
            key={i}
            cx={`${x}%`}
            cy={`${y}%`}
            r={r as number}
            fill={`url(#${grad})`}
            opacity={0.25 + (i % 4) * 0.1}
            className="animate-gold-float"
            style={{ animationDelay: `${i * 0.6}s` }}
          />
        ))}
      </svg>
      {/* Subtle dot grid for texture depth */}
      <DotGridOverlay opacity={0.025} color="oklch(0.55 0.10 80)" spacing={18} />
    </>
  );
}

/* ─────────────────────────────────────────────
   Shared: Full-screen background image from Stitch
   ───────────────────────────────────────────── */
function StitchBackground({ src }: { src: string }) {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-0"
      style={{
        backgroundImage: `url(${src})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        imageRendering: "pixelated",
      }}
    />
  );
}

/* ─────────────────────────────────────────────
   NEON — Stitch cyberpunk urban night image
   ───────────────────────────────────────────── */
function NeonDesign() {
  return (
    <>
      <StitchBackground src="/themes/fondo-neon.png" />
      <DotGridOverlay opacity={0.03} color="oklch(0.65 0.30 340)" spacing={30} />
    </>
  );
}

/* ─────────────────────────────────────────────
   ALPES — Swiss Alps: mountains, clouds, pines, light sky
   ───────────────────────────────────────────── */
/* ─────────────────────────────────────────────
   ALPES — Stitch Swiss Alps image
   ───────────────────────────────────────────── */
function AlpesDesign() {
  return (
    <>
      <StitchBackground src="/themes/fondo-alpes.png" />
      <DotGridOverlay opacity={0.02} color="oklch(0.50 0.04 230)" spacing={20} />
    </>
  );
}

/* ─────────────────────────────────────────────
   BOSQUE — Stitch autumn forest image
   ───────────────────────────────────────────── */
function BosqueDesign() {
  return (
    <>
      <StitchBackground src="/themes/fondo-bosque.png" />
      <DotGridOverlay opacity={0.02} color="oklch(0.45 0.12 75)" spacing={22} />
    </>
  );
}

/* ─────────────────────────────────────────────
   PLAYA — Stitch pixel art beach image
   ───────────────────────────────────────────── */
function PlayaDesign() {
  return (
    <>
      <StitchBackground src="/themes/fondo-playa.png" />
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
  gold: GoldDesign,
  neon: NeonDesign,
  alpes: AlpesDesign,
  bosque: BosqueDesign,
  playa: PlayaDesign,
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
      <SnowEffect />
      <StarfieldEffect />
    </>
  );
}
