"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { useRef } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { FloatingOrbs } from "./floating-orbs";

const fadeUp = {
  hidden: { opacity: 0, y: 24, filter: "blur(6px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.6, ease: [0.25, 0.4, 0.25, 1] as const },
  },
};

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.15 } },
};

export function HeroSection() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 0.95]);

  return (
    <section
      ref={heroRef}
      className="min-h-screen flex flex-col items-center justify-center px-6 md:px-12 text-center relative overflow-hidden pt-20"
    >
      {/* Background grid pattern */}
      <div
        className="absolute inset-0 opacity-40 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <FloatingOrbs />

      <motion.div
        style={{ opacity: heroOpacity, scale: heroScale }}
        className="z-10 max-w-5xl"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] uppercase tracking-[0.2em] text-primary mb-8"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
          </span>
          Nueva Era de Aprendizaje
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.7 }}
          className="text-5xl sm:text-6xl md:text-8xl font-black text-foreground leading-tight tracking-tighter mb-8"
          style={{ textShadow: "0 0 30px oklch(0.65 0.25 295 / 0.3), 0 0 60px oklch(0.65 0.25 295 / 0.15)" }}
        >
          Estudia más inteligente, <br />
          <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            no más difícil
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.6 }}
          className="text-lg md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed font-light mb-12"
        >
          Sube tu material, genera resúmenes visuales con IA, practica con quizzes
          y prepara tus pruebas con un plan personalizado.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="flex flex-col md:flex-row gap-6 justify-center items-center"
        >
          <Link
            href="/login"
            className="group relative overflow-hidden bg-gradient-to-r from-primary to-accent text-primary-foreground px-10 py-5 rounded-xl text-lg font-bold shadow-2xl transition-transform hover:scale-105 active:scale-95"
            style={{
              boxShadow: "0 8px 32px oklch(0.65 0.25 295 / 0.25)",
            }}
          >
            <span className="relative z-10 flex items-center gap-2">
              Empezar ahora
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </span>
            {/* Beam sweep effect */}
            <div className="absolute inset-0 overflow-hidden rounded-xl">
              <div
                className="absolute inset-0 animate-beam-sweep"
                style={{
                  background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
                  width: "30%",
                }}
              />
            </div>
          </Link>

          <Link
            href="#features"
            className="bg-white/5 backdrop-blur-md border border-white/10 px-10 py-5 rounded-xl text-lg font-medium text-muted-foreground hover:bg-white/10 hover:text-foreground transition-all duration-300"
          >
            Ver demostración
          </Link>
        </motion.div>
      </motion.div>

      {/* Visual Anchor — mock app preview */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.7, ease: [0.25, 0.4, 0.25, 1] }}
        className="mt-24 w-full max-w-5xl h-80 rounded-t-[40px] border-x border-t border-white/10 bg-gradient-to-b from-white/5 to-transparent flex items-center justify-center relative group overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-accent/5" />
        <div className="relative w-40 h-40">
          <div className="absolute inset-0 bg-primary rounded-full blur-[60px] opacity-30 group-hover:opacity-50 transition-opacity" />
          <Sparkles className="w-24 h-24 text-primary relative z-10 mx-auto mt-8 drop-shadow-[0_0_20px_oklch(0.65_0.25_295_/_0.5)]" />
        </div>
      </motion.div>
    </section>
  );
}
