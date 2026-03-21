"use client";

import { cn } from "@/lib/utils";

export function GlowBorder({
  children,
  className,
  active = false,
}: {
  children: React.ReactNode;
  className?: string;
  active?: boolean;
}) {
  return (
    <div className="group relative p-px rounded-2xl">
      {/* Conic gradient border */}
      <div
        className={cn(
          "absolute inset-0 rounded-2xl transition-opacity duration-500",
          active ? "opacity-100" : "opacity-0 group-hover:opacity-60"
        )}
        style={{
          background: `conic-gradient(from var(--glow-angle, 0deg) at 50% 50%,
            oklch(0.65 0.25 275 / 0.6),
            oklch(0.60 0.22 310 / 0.4),
            oklch(0.70 0.18 330 / 0.5),
            oklch(0.65 0.25 275 / 0.6)
          )`,
          animation: active ? "glow-spin 4s linear infinite" : "none",
        }}
      />
      {/* Blurred glow behind */}
      <div
        className={cn(
          "absolute inset-0 rounded-2xl blur-xl transition-opacity duration-500",
          active ? "opacity-40" : "opacity-0 group-hover:opacity-20"
        )}
        style={{
          background: `conic-gradient(from var(--glow-angle, 0deg) at 50% 50%,
            oklch(0.65 0.25 275 / 0.4),
            oklch(0.60 0.22 310 / 0.3),
            oklch(0.70 0.18 330 / 0.3),
            oklch(0.65 0.25 275 / 0.4)
          )`,
          animation: active ? "glow-spin 4s linear infinite" : "none",
        }}
      />
      <div className={cn("relative rounded-2xl", className)} style={{ background: "var(--card)" }}>
        {children}
      </div>
    </div>
  );
}
