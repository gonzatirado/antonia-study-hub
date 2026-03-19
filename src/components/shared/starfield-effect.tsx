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

export function StarfieldEffect() {
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
          value: 100,
          density: {
            enable: true,
          },
        },
        color: {
          value: ["#ffffff", "#d4e4ff", "#c8d8ff", "#e8f0ff"],
        },
        shape: {
          type: "circle",
        },
        opacity: {
          value: { min: 0.3, max: 1.0 },
          animation: {
            enable: true,
            speed: 0.8,
            minimumValue: 0.2,
            sync: false,
          },
        },
        size: {
          value: { min: 1, max: 4 },
          animation: {
            enable: true,
            speed: 0.5,
            minimumValue: 0.8,
            sync: false,
          },
        },
        move: {
          enable: true,
          direction: "none" as const,
          speed: { min: 0.1, max: 0.3 },
          random: true,
          straight: false,
          outModes: {
            default: "bounce" as const,
          },
        },
        links: {
          enable: true,
          distance: 150,
          color: "#ffffff",
          opacity: 0.08,
          width: 0.5,
        },
        twinkle: {
          particles: {
            enable: true,
            frequency: 0.08,
            opacity: 1,
            color: {
              value: "#ffffff",
            },
          },
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

  if (resolvedTheme !== "midnight" || !engineReady) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0"
      style={{ zIndex: 1 }}
    >
      <Particles id="midnight-starfield" options={options} className="h-full w-full" />
    </div>
  );
}
