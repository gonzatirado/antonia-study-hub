"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { SnowEffect } from "./snow-effect";

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
   DARK — Star constellation field + nebula glow + dot grid
   ───────────────────────────────────────────── */
function DarkDesign() {
  return (
    <>
      {/* Subtle dot grid overlay at 5% — Draftly depth texture */}
      <DotGridOverlay opacity={0.05} color="oklch(0.70 0.10 265)" spacing={24} />
      {/* Purple radial glow wash at top-center */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          backgroundImage: `
            radial-gradient(ellipse 70% 45% at 50% 0%, oklch(0.22 0.15 280 / 0.55), transparent 65%)
          `,
        }}
      />
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
        {/* Constellation lines — refined: thinner, lower opacity, dashed for elegance */}
        <g stroke="oklch(0.70 0.15 270)" strokeWidth="0.5" opacity="0.25" strokeDasharray="4 6">
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
        {/* Constellation node dots — small bright dots at connection points */}
        {[
          [5, 8], [12, 25], [20, 15], [35, 10], [42, 30], [48, 55],
          [62, 40], [68, 12], [75, 50], [82, 22], [88, 35],
          [15, 70], [25, 85], [38, 75], [65, 80], [78, 65], [85, 88],
        ].map(([x, y], i) => (
          <circle key={`node-${i}`} cx={`${x}%`} cy={`${y}%`} r="1.8" fill="url(#star-glow)" opacity={0.55} />
        ))}
      </svg>
      {/* Nebula glow — multi-layer */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          backgroundImage: `
            radial-gradient(ellipse 50% 40% at 20% 30%, oklch(0.28 0.16 280 / 0.40), transparent 60%),
            radial-gradient(ellipse 40% 50% at 80% 70%, oklch(0.23 0.13 250 / 0.35), transparent 60%),
            radial-gradient(ellipse 35% 30% at 60% 85%, oklch(0.20 0.10 300 / 0.20), transparent 55%)
          `,
        }}
      />
    </>
  );
}

/* ─────────────────────────────────────────────
   MIDNIGHT — Deep space nebula + twinkling stars + shooting star
   ───────────────────────────────────────────── */
function MidnightDesign() {
  return (
    <>
      {/* Deep space nebula effect — multiple colored radial gradients */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          backgroundImage: `
            radial-gradient(ellipse 60% 50% at 25% 20%, oklch(0.18 0.12 260 / 0.45), transparent 60%),
            radial-gradient(ellipse 50% 45% at 75% 30%, oklch(0.16 0.10 285 / 0.35), transparent 55%),
            radial-gradient(ellipse 45% 40% at 50% 60%, oklch(0.14 0.08 240 / 0.25), transparent 50%),
            radial-gradient(ellipse 55% 35% at 80% 80%, oklch(0.15 0.09 270 / 0.20), transparent 50%)
          `,
        }}
      />
      {/* Dot grid overlay for depth */}
      <DotGridOverlay opacity={0.04} color="oklch(0.60 0.12 260)" spacing={22} />
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
      {/* Shooting star — thin line that crosses once every ~9s */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="animate-shooting-star absolute" style={{
          top: "12%",
          left: "-10%",
          width: "80px",
          height: "1px",
          background: "linear-gradient(90deg, transparent, oklch(0.90 0.05 250 / 0.8), oklch(0.95 0.02 260 / 0.4), transparent)",
          borderRadius: "1px",
          transform: "rotate(-15deg)",
          filter: "blur(0.3px)",
        }} />
        <div className="animate-shooting-star-2 absolute" style={{
          top: "35%",
          left: "-10%",
          width: "60px",
          height: "1px",
          background: "linear-gradient(90deg, transparent, oklch(0.85 0.06 270 / 0.7), oklch(0.90 0.03 280 / 0.3), transparent)",
          borderRadius: "1px",
          transform: "rotate(-20deg)",
          filter: "blur(0.3px)",
        }} />
      </div>
      {/* Aurora waves at bottom — more intense */}
      <div
        className="pointer-events-none fixed inset-0 z-0 animate-aurora-wave"
        style={{
          backgroundImage: `
            radial-gradient(ellipse 130% 25% at 50% 100%, oklch(0.42 0.25 250 / 0.60), transparent),
            radial-gradient(ellipse 90% 20% at 30% 92%, oklch(0.38 0.22 280 / 0.50), transparent),
            radial-gradient(ellipse 70% 15% at 70% 96%, oklch(0.35 0.18 220 / 0.45), transparent),
            radial-gradient(ellipse 50% 10% at 55% 100%, oklch(0.40 0.20 260 / 0.35), transparent)
          `,
        }}
      />
      {/* Deep space top gradient */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          backgroundImage: `
            radial-gradient(ellipse 70% 60% at 50% 0%, oklch(0.18 0.10 270 / 0.50), transparent)
          `,
        }}
      />
    </>
  );
}

/* ─────────────────────────────────────────────
   AURORA — Northern lights animated bands + grid overlay + particle glow
   ───────────────────────────────────────────── */
function AuroraDesign() {
  return (
    <>
      {/* === Subtle grid overlay behind aurora for Draftly-style depth === */}
      <svg className="pointer-events-none fixed inset-0 z-0 h-full w-full opacity-[0.04]">
        <defs>
          <pattern id="aurora-depth-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="oklch(0.70 0.15 160)" strokeWidth="0.4" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#aurora-depth-grid)" />
      </svg>

      {/* === SVG Aurora Curtains — organic wavy shapes like real northern lights === */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1440 900" preserveAspectRatio="none">
          <defs>
            {/* Main green aurora gradient — bright at bottom edge, fading up */}
            <linearGradient id="aurora-green" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="oklch(0.75 0.35 155)" stopOpacity="0.7" />
              <stop offset="30%" stopColor="oklch(0.65 0.30 155)" stopOpacity="0.5" />
              <stop offset="60%" stopColor="oklch(0.50 0.20 165)" stopOpacity="0.25" />
              <stop offset="85%" stopColor="oklch(0.40 0.15 180)" stopOpacity="0.08" />
              <stop offset="100%" stopColor="oklch(0.30 0.10 200)" stopOpacity="0" />
            </linearGradient>
            {/* Purple/pink aurora gradient */}
            <linearGradient id="aurora-purple" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="oklch(0.60 0.28 290)" stopOpacity="0.5" />
              <stop offset="35%" stopColor="oklch(0.50 0.25 285)" stopOpacity="0.35" />
              <stop offset="65%" stopColor="oklch(0.40 0.18 300)" stopOpacity="0.15" />
              <stop offset="100%" stopColor="oklch(0.30 0.12 310)" stopOpacity="0" />
            </linearGradient>
            {/* Teal accent gradient */}
            <linearGradient id="aurora-teal" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="oklch(0.70 0.30 170)" stopOpacity="0.55" />
              <stop offset="40%" stopColor="oklch(0.55 0.22 175)" stopOpacity="0.3" />
              <stop offset="100%" stopColor="oklch(0.40 0.15 185)" stopOpacity="0" />
            </linearGradient>
            {/* Glow filter for soft edges */}
            <filter id="aurora-blur">
              <feGaussianBlur stdDeviation="12" />
            </filter>
            <filter id="aurora-blur-lg">
              <feGaussianBlur stdDeviation="20" />
            </filter>
          </defs>

          {/* Curtain 1: Main green — wavy ribbon across the sky */}
          <g className="animate-aurora-wave" filter="url(#aurora-blur)">
            <path
              d="M-50,350 C100,280 200,380 350,300 C500,220 550,350 700,280 C850,210 900,330 1050,260 C1200,190 1300,310 1500,250 L1500,150 C1300,220 1200,100 1050,170 C900,240 850,120 700,190 C550,260 500,130 350,200 C200,270 100,180 -50,220 Z"
              fill="url(#aurora-green)"
            />
          </g>

          {/* Curtain 2: Purple — offset, slightly higher */}
          <g className="animate-aurora-curtain-2" filter="url(#aurora-blur)">
            <path
              d="M-50,300 C150,230 250,320 400,250 C550,180 650,300 800,230 C950,160 1050,280 1200,210 C1350,140 1400,260 1500,200 L1500,100 C1400,160 1350,60 1200,120 C1050,180 950,80 800,140 C650,200 550,100 400,160 C250,220 150,140 -50,190 Z"
              fill="url(#aurora-purple)"
            />
          </g>

          {/* Curtain 3: Teal accent — lower, brighter edge */}
          <g className="animate-aurora-curtain-3" filter="url(#aurora-blur-lg)">
            <path
              d="M-50,420 C100,370 250,440 400,380 C550,320 650,410 800,360 C950,310 1100,400 1250,340 C1400,280 1450,370 1500,330 L1500,250 C1450,290 1400,200 1250,260 C1100,320 950,230 800,280 C650,330 550,240 400,300 C250,360 100,290 -50,340 Z"
              fill="url(#aurora-teal)"
            />
          </g>

          {/* Bright green edge line — the sharp bottom edge of the aurora */}
          <g className="animate-aurora-wave" filter="url(#aurora-blur)">
            <path
              d="M-50,355 C100,285 200,385 350,305 C500,225 550,355 700,285 C850,215 900,335 1050,265 C1200,195 1300,315 1500,255"
              fill="none"
              stroke="oklch(0.80 0.35 150)"
              strokeWidth="3"
              strokeOpacity="0.6"
            />
          </g>
        </svg>
      </div>
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

      {/* === Arctic mountain silhouettes — 3 layers for depth === */}
      {/* Back layer — farthest mountains, lightest */}
      <svg
        className="pointer-events-none fixed bottom-0 left-0 z-0 w-full"
        style={{ height: "20vh" }}
        viewBox="0 0 1440 200"
        preserveAspectRatio="none"
      >
        <path
          d="M0 200 L0 120 L60 95 L110 110 L160 70 L210 100 L270 55 L320 85 L380 40 L430 75 L490 50 L540 80 L600 35 L660 65 L710 45 L770 78 L830 30 L890 60 L940 42 L1000 72 L1060 38 L1110 68 L1170 48 L1220 80 L1280 55 L1330 90 L1380 65 L1440 85 L1440 200 Z"
          fill="oklch(0.18 0.04 200 / 0.50)"
        />
      </svg>
      {/* Mid layer — medium depth */}
      <svg
        className="pointer-events-none fixed bottom-0 left-0 z-0 w-full"
        style={{ height: "17vh" }}
        viewBox="0 0 1440 170"
        preserveAspectRatio="none"
      >
        <path
          d="M0 170 L0 130 L40 115 L80 95 L120 120 L170 72 L220 100 L280 55 L330 88 L390 45 L440 78 L500 35 L550 65 L610 42 L670 75 L720 50 L780 82 L840 38 L900 70 L950 48 L1010 80 L1070 52 L1120 85 L1180 60 L1230 92 L1290 68 L1340 105 L1390 82 L1440 95 L1440 170 Z"
          fill="oklch(0.14 0.05 210 / 0.65)"
        />
      </svg>
      {/* Front layer — closest mountains, darkest */}
      <svg
        className="pointer-events-none fixed bottom-0 left-0 z-0 w-full"
        style={{ height: "15vh" }}
        viewBox="0 0 1440 150"
        preserveAspectRatio="none"
      >
        <path
          d="M0 150 L0 110 L50 88 L100 105 L150 68 L200 92 L260 50 L310 78 L370 42 L420 70 L480 30 L530 58 L590 38 L650 65 L700 45 L760 72 L820 35 L870 62 L930 40 L990 68 L1050 48 L1100 75 L1160 55 L1210 85 L1270 62 L1320 95 L1380 78 L1440 90 L1440 150 Z"
          fill="oklch(0.10 0.06 215 / 0.80)"
        />
      </svg>

      {/* === Frosty ground glow — ice-blue snow reflection === */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background: `
            radial-gradient(ellipse 120% 15% at 50% 100%, oklch(0.85 0.05 200 / 0.20), transparent 70%),
            radial-gradient(ellipse 80% 10% at 40% 100%, oklch(0.90 0.03 210 / 0.15), transparent 60%),
            radial-gradient(ellipse 60% 8% at 70% 100%, oklch(0.80 0.06 190 / 0.18), transparent 55%)
          `,
        }}
      />
    </>
  );
}

/* ─────────────────────────────────────────────
   GOLD — Luxurious parchment with art deco geometry + golden glows
   ───────────────────────────────────────────── */
function GoldDesign() {
  return (
    <>
      {/* Art deco geometric pattern — layered diamond + inner ornament at very low opacity */}
      <svg className="pointer-events-none fixed inset-0 z-0 h-full w-full opacity-[0.07]">
        <defs>
          <pattern id="gold-art-deco" width="80" height="80" patternUnits="userSpaceOnUse" patternTransform="scale(1.5)">
            {/* Outer diamond */}
            <path d="M40 0L80 40L40 80L0 40Z" fill="none" stroke="oklch(0.62 0.14 85)" strokeWidth="0.5" />
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
    </>
  );
}
