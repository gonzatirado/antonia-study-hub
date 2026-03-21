"use client";

export function FloatingOrbs() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Primary orb — top right */}
      <div
        className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full animate-pulse-glow"
        style={{
          background: "radial-gradient(circle, oklch(0.55 0.25 275 / 0.15), transparent 70%)",
        }}
      />
      {/* Accent orb — bottom left */}
      <div
        className="absolute -bottom-48 -left-48 w-[600px] h-[600px] rounded-full animate-pulse-glow"
        style={{
          background: "radial-gradient(circle, oklch(0.55 0.22 310 / 0.10), transparent 70%)",
          animationDelay: "1.5s",
        }}
      />
      {/* Small orb — mid */}
      <div
        className="absolute top-1/3 left-1/4 w-[300px] h-[300px] rounded-full animate-float-slow opacity-60"
        style={{
          background: "radial-gradient(circle, oklch(0.60 0.18 200 / 0.08), transparent 70%)",
          animationDelay: "0.8s",
        }}
      />
    </div>
  );
}
