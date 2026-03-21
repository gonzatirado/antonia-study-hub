"use client";

import { cn } from "@/lib/utils";

export function GridBeam({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* Grid pattern */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, oklch(0.80 0 0 / 0.04) 1px, transparent 1px),
            linear-gradient(to bottom, oklch(0.80 0 0 / 0.04) 1px, transparent 1px)
          `,
          backgroundSize: "80px 80px",
        }}
      />
      {/* Center beam */}
      <div className="pointer-events-none absolute inset-0 z-0 flex justify-center">
        <div
          className="w-px h-full"
          style={{
            background: `linear-gradient(to bottom, transparent, oklch(0.65 0.25 275 / 0.25) 30%, oklch(0.65 0.25 275 / 0.25) 70%, transparent)`,
          }}
        />
      </div>
      {/* Side beams */}
      <div className="pointer-events-none absolute inset-0 z-0 flex justify-between px-[20%]">
        <div
          className="w-px h-full opacity-50"
          style={{
            background: `linear-gradient(to bottom, transparent, oklch(0.65 0.25 275 / 0.12) 40%, transparent 80%)`,
          }}
        />
        <div
          className="w-px h-full opacity-50"
          style={{
            background: `linear-gradient(to bottom, transparent 20%, oklch(0.65 0.25 275 / 0.12) 60%, transparent)`,
          }}
        />
      </div>
      {/* Top/bottom fade */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 50% 0%, oklch(0.15 0.02 270 / 0.9), transparent 50%),
            radial-gradient(ellipse 80% 50% at 50% 100%, oklch(0.15 0.02 270 / 0.9), transparent 50%)
          `,
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
