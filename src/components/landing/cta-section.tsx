"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Spotlight } from "./spotlight";

export function CtaSection() {
  return (
    <section className="py-48 px-6 md:px-12 bg-background relative overflow-hidden">
      {/* Dramatic spotlight radial */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] pointer-events-none"
        style={{
          background: "radial-gradient(circle at center, oklch(0.65 0.25 295 / 0.08) 0%, transparent 60%)",
        }}
      />

      {/* Large ambient orb */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-primary/10 blur-[150px] pointer-events-none" />

      <Spotlight className="max-w-5xl mx-auto rounded-3xl" size={700}>
        <motion.div
          className="relative text-center z-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <h2 className="text-5xl sm:text-6xl md:text-8xl font-black text-foreground mb-12 tracking-tighter leading-[0.9]">
            Empieza a estudiar mejor hoy
          </h2>

          <div className="flex flex-col sm:flex-row justify-center gap-8 mt-16">
            <Link
              href="/login"
              className="group relative overflow-hidden bg-primary text-primary-foreground px-14 py-7 rounded-2xl text-2xl font-black transition-all hover:scale-105 active:scale-95"
              style={{
                boxShadow: "0 0 50px oklch(0.65 0.25 295 / 0.25)",
              }}
            >
              <span className="relative z-10 flex items-center justify-center gap-3">
                Crear cuenta gratis
                <ArrowRight className="w-6 h-6 transition-transform group-hover:translate-x-1" />
              </span>
              {/* Beam sweep */}
              <div className="absolute inset-0 overflow-hidden rounded-2xl">
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
              href="#pricing"
              className="bg-transparent border border-white/20 text-foreground px-14 py-7 rounded-2xl text-2xl font-medium hover:bg-white/5 transition-all backdrop-blur-sm"
            >
              Ver planes Pro
            </Link>
          </div>
        </motion.div>
      </Spotlight>
    </section>
  );
}
