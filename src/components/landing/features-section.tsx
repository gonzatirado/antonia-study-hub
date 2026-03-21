"use client";

import { motion } from "framer-motion";
import {
  FileText,
  Cloud,
  CalendarCheck,
  PenLine,
} from "lucide-react";
import { BentoCard } from "./bento-card";

const features = [
  {
    icon: FileText,
    title: "Resúmenes IA",
    desc: "Convierte textos extensos en resúmenes visuales con diagramas lógicos y conceptos clave destacados.",
    glowColor: "oklch(0.65 0.25 295)",
  },
  {
    icon: Cloud,
    title: "Tu Nube",
    desc: "Un espacio seguro y organizado para todos tus archivos académicos, accesible desde cualquier dispositivo.",
    glowColor: "oklch(0.65 0.22 340)",
  },
  {
    icon: CalendarCheck,
    title: "Agenda Inteligente",
    desc: "Planifica tus sesiones de estudio basándote en tus fechas de examen y la complejidad del contenido.",
    glowColor: "oklch(0.65 0.25 295)",
  },
  {
    icon: PenLine,
    title: "Notas",
    desc: "Toma apuntes dinámicos vinculados a tu material original para una referencia rápida y eficiente.",
    glowColor: "oklch(0.65 0.22 340)",
  },
];

const additionalFeatures = [
  "Pomodoro",
  "Horario semanal",
  "Seguimiento de notas",
  "Gestor de archivos",
  "Dashboard personalizado",
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-32 px-6 md:px-12 bg-background relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/5 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          className="mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl font-bold tracking-tight text-foreground mb-4">
            Potencia tu aprendizaje
          </h2>
          <p className="text-muted-foreground text-xl font-light">
            Herramientas diseñadas para la excelencia académica.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((f) => (
            <BentoCard key={f.title} glowColor={f.glowColor} className="p-10 md:p-12 rounded-[32px]">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-8 border border-primary/20 group-hover:scale-110 transition-transform">
                <f.icon className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4">{f.title}</h3>
              <p className="text-muted-foreground text-lg leading-relaxed font-light">{f.desc}</p>
            </BentoCard>
          ))}
        </div>

        {/* Additional features pill */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mt-16 flex flex-col items-center justify-center gap-4"
        >
          <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-3 px-8 py-4 rounded-full bg-white/[0.02] border border-white/5 backdrop-blur-sm">
            <span className="text-[10px] uppercase tracking-[0.2em] text-primary/60 font-bold whitespace-nowrap italic">
              +5 funciones adicionales
            </span>
            <div className="h-4 w-px bg-white/10 hidden md:block" />
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-2">
              {additionalFeatures.map((name, i) => (
                <span key={name} className="flex items-center gap-4">
                  <span className="text-xs text-muted-foreground/80 font-light hover:text-primary transition-colors cursor-default">
                    {name}
                  </span>
                  {i < additionalFeatures.length - 1 && (
                    <span className="text-white/10 select-none text-[8px] flex items-center">
                      &bull;
                    </span>
                  )}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
