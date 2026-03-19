export const springs = {
  snappy: { type: "spring" as const, stiffness: 500, damping: 20, mass: 0.5 },
  smooth: { type: "spring" as const, stiffness: 300, damping: 30, mass: 0.8 },
  gentle: { type: "spring" as const, stiffness: 200, damping: 20, mass: 1.0 },
  bounce: { type: "spring" as const, stiffness: 400, damping: 15, mass: 0.8 },
  stiff: { type: "spring" as const, stiffness: 600, damping: 35, mass: 1.0 },
} as const;

export const stagger = {
  grid: { staggerChildren: 0.05, delayChildren: 0.1 },
  list: { staggerChildren: 0.08, delayChildren: 0.1 },
  fast: { staggerChildren: 0.03, delayChildren: 0.05 },
} as const;

export const fadeUp = {
  hidden: { opacity: 0, y: 12, filter: "blur(4px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: springs.smooth,
  },
} as const;

export const fadeIn = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.3 } },
} as const;

export const pageTransition = {
  hidden: { opacity: 0, y: 8, filter: "blur(4px)" },
  enter: { opacity: 1, y: 0, filter: "blur(0px)" },
  exit: { opacity: 0, y: -8, filter: "blur(4px)" },
} as const;
