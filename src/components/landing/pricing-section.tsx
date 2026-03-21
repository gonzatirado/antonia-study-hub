"use client";

import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { GlowBorder } from "./glow-border";

const plans = [
  {
    name: "Gratis",
    price: "$0",
    period: "/siempre",
    features: [
      "3 resúmenes/mes",
      "5 quizzes/mes",
      "10 archivos max",
      "50 MB de storage",
    ],
    cta: "Elegir Plan",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$9.990",
    period: "CLP/mes",
    features: [
      "30 resúmenes",
      "50 quizzes",
      "5 prep de prueba",
      "Archivos ilimitados",
      "2 GB de storage",
      "Exportar a PDF",
    ],
    cta: "Mejorar Ahora",
    highlighted: true,
  },
  {
    name: "Premium",
    price: "$19.990",
    period: "CLP/mes",
    features: [
      "100 resúmenes",
      "150 quizzes",
      "15 prep de prueba",
      "Modelo IA superior",
      "10 GB de storage",
      "Soporte prioritario",
    ],
    cta: "Contactar Ventas",
    highlighted: false,
  },
];

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
  show: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

export function PricingSection() {
  return (
    <section className="py-32 px-6 md:px-12 bg-background relative overflow-hidden">
      {/* Grid background */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          className="text-center mb-24"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-5xl md:text-6xl font-black text-foreground mb-6 tracking-tighter">
            Planes para todos
          </h2>
          <p className="text-muted-foreground text-xl font-light">
            Sin letras chicas, solo mejores notas.
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto items-stretch"
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          {plans.map((plan) => (
            <motion.div
              key={plan.name}
              variants={fadeUp}
              className={plan.highlighted ? "transform md:scale-110 z-20" : ""}
            >
              {plan.highlighted ? (
                <GlowBorder active className="p-12 h-full flex flex-col">
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] font-black px-5 py-1.5 rounded-full uppercase tracking-widest shadow-lg z-30">
                    Más Popular
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">{plan.name}</h3>
                  <div className="text-5xl font-black text-foreground mb-10">
                    {plan.price}{" "}
                    <span className="text-sm font-light text-muted-foreground">{plan.period}</span>
                  </div>
                  <ul className="space-y-5 mb-12 flex-1">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-4 text-foreground text-sm">
                        <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/login"
                    className="group relative overflow-hidden w-full py-5 rounded-2xl bg-primary text-primary-foreground font-black text-lg text-center hover:opacity-90 transition-all active:scale-95 block"
                    style={{
                      boxShadow: "0 10px 30px oklch(0.65 0.25 295 / 0.3)",
                    }}
                  >
                    <span className="relative z-10">{plan.cta}</span>
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
                </GlowBorder>
              ) : (
                <div
                  className="h-full rounded-[32px] p-12 flex flex-col backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 bg-white/[0.03] border border-white/[0.08] hover:border-primary/30 hover:bg-white/[0.05]"
                  style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.37)" }}
                >
                  <h3 className="text-xl font-bold text-foreground mb-2">{plan.name}</h3>
                  <div className="text-5xl font-black text-foreground mb-10">
                    {plan.price}{" "}
                    <span className="text-lg font-light text-muted-foreground">{plan.period}</span>
                  </div>
                  <ul className="space-y-5 mb-12 flex-1">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-4 text-muted-foreground text-sm">
                        <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/login"
                    className="w-full py-5 rounded-2xl border border-white/10 text-foreground font-bold hover:bg-white/5 transition-all active:scale-95 text-center block"
                  >
                    {plan.cta}
                  </Link>
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
