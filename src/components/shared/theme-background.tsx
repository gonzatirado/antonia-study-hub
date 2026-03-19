"use client";

export function ThemeBackground() {
  return (
    <>
      {/* Gradient mesh layer */}
      <div
        className="pointer-events-none fixed inset-0 -z-10 opacity-60"
        style={{
          backgroundImage: `
            radial-gradient(ellipse 80% 60% at 20% 30%, var(--bg-gradient-1), transparent),
            radial-gradient(ellipse 60% 80% at 80% 70%, var(--bg-gradient-2), transparent),
            radial-gradient(ellipse 70% 50% at 50% 50%, var(--bg-gradient-3), transparent)
          `,
          backgroundSize: "200% 200%, 200% 200%, 100% 100%",
          animation: "aurora-shift 60s ease-in-out infinite",
        }}
      />
      {/* Noise texture overlay */}
      <div
        className="pointer-events-none fixed inset-0 -z-10 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />
    </>
  );
}
