"use client";

import { useEffect, useMemo, useState } from "react";
import { useTheme } from "next-themes";
import dynamic from "next/dynamic";
import { type ISourceOptions } from "@tsparticles/engine";
import { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";

const Particles = dynamic(
  () => import("@tsparticles/react").then((mod) => mod.Particles),
  { ssr: false },
);

export function SnowEffect() {
  const { resolvedTheme } = useTheme();
  const [engineReady, setEngineReady] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => setEngineReady(true));
  }, []);

  const options: ISourceOptions = useMemo(
    () => ({
      fullScreen: false,
      fpsLimit: 60,
      particles: {
        number: {
          value: 60,
          density: {
            enable: true,
          },
        },
        color: {
          value: "#ffffff",
        },
        shape: {
          type: "circle",
        },
        opacity: {
          value: { min: 0.4, max: 0.8 },
        },
        size: {
          value: { min: 1, max: 4 },
        },
        move: {
          enable: true,
          direction: "bottom" as const,
          speed: { min: 1, max: 3 },
          straight: false,
          drift: { min: -0.5, max: 0.5 },
          outModes: {
            default: "out" as const,
          },
        },
        links: {
          enable: false,
        },
        wobble: {
          enable: true,
          distance: 10,
          speed: { min: -2, max: 2 },
        },
      },
      interactivity: {
        events: {
          onClick: { enable: false },
          onHover: { enable: false },
        },
      },
      detectRetina: true,
    }),
    [],
  );

  if (resolvedTheme !== "aurora" || !engineReady) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0"
      style={{ zIndex: 1 }}
    >
      <Particles id="aurora-snow" options={options} className="h-full w-full" />
    </div>
  );
}
