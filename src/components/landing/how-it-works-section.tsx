"use client";

import { motion } from "framer-motion";

const steps = [
  {
    number: "1",
    title: "Sube tu material",
    desc: "Sube PDFs, apuntes manuscritos o presentaciones. StudyHub entiende cualquier formato.",
  },
  {
    number: "2",
    title: "La IA procesa",
    desc: "Generamos automáticamente resúmenes, bancos de preguntas y un calendario optimizado.",
  },
  {
    number: "3",
    title: "Estudia y aprueba",
    desc: "Enfócate en lo que importa. Material diseñado para la retención máxima de información.",
  },
];

export function HowItWorksSection() {
  return (
    <section className="py-32 px-6 md:px-12 bg-background relative">
      {/* Center orb */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-primary/5 blur-[80px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          className="text-center mb-24"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-primary font-mono tracking-[0.3em] text-xs uppercase bg-primary/10 px-4 py-1.5 rounded-full">
            Proceso
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mt-6 tracking-tight">
            Tu camino al éxito
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 max-w-6xl mx-auto">
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              className="relative group"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.5, ease: [0.25, 0.4, 0.25, 1] }}
            >
              {/* Large background number */}
              <div className="text-[140px] font-black text-white/[0.03] absolute -top-24 -left-12 select-none group-hover:text-primary/10 transition-colors duration-500">
                {step.number}
              </div>
              <div className="relative">
                <h3 className="text-2xl font-bold text-foreground mb-4">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed text-lg font-light">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
