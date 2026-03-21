"use client";

import { motion } from "framer-motion";

const testimonials = [
  {
    name: "Valentina R.",
    role: "Ingeniería Civil, PUC",
    text: "Pasé de estudiar 6 horas a 2 y mis notas subieron.",
    initials: "VR",
    highlighted: true,
  },
  {
    name: "Matías C.",
    role: "Derecho, UCH",
    text: "Los quizzes me salvaron el semestre.",
    initials: "MC",
    highlighted: false,
  },
  {
    name: "Francisca L.",
    role: "Medicina, UDP",
    text: "La preparación de pruebas es genial.",
    initials: "FL",
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

export function TestimonialsSection() {
  return (
    <section className="py-32 px-6 md:px-12 bg-white/[0.02] relative overflow-hidden">
      {/* Ambient orb */}
      <div className="absolute -bottom-[20%] -left-[10%] w-[600px] h-[600px] rounded-full bg-accent/5 blur-[80px] pointer-events-none" />

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-20 items-center relative z-10">
        <motion.div
          className="md:w-1/3"
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-8 tracking-tight">
            La voz de los estudiantes
          </h2>
          <p className="text-muted-foreground text-xl leading-relaxed font-light">
            Únete a miles de alumnos que ya transformaron su forma de aprender en las mejores universidades del país.
          </p>
        </motion.div>

        <motion.div
          className="md:w-2/3 grid grid-cols-1 gap-8"
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          {testimonials.map((t) => (
            <motion.div
              key={t.name}
              variants={fadeUp}
              className={`
                relative overflow-hidden rounded-[32px] p-10 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1
                bg-white/[0.03] border border-white/[0.08]
                hover:border-primary/30 hover:bg-white/[0.05]
                ${t.highlighted ? "border-l-4 border-l-primary" : ""}
              `}
              style={{
                boxShadow: "0 8px 32px rgba(0,0,0,0.37)",
              }}
            >
              {/* Decorative quote mark */}
              <span className="absolute top-6 right-10 text-6xl text-white/5 font-serif select-none">
                &ldquo;
              </span>
              <p className="text-xl text-foreground italic mb-8 relative z-10">
                &ldquo;{t.text}&rdquo;
              </p>
              <div className="flex items-center gap-4">
                <div
                  className={`
                    w-14 h-14 rounded-full flex items-center justify-center font-bold text-lg
                    ${t.highlighted
                      ? "bg-primary/10 border border-primary/30 text-primary shadow-[0_0_15px_oklch(0.65_0.25_295_/_0.2)]"
                      : "bg-accent/10 border border-accent/30 text-accent"
                    }
                  `}
                >
                  {t.initials}
                </div>
                <div>
                  <h4 className="font-bold text-foreground">{t.name}</h4>
                  <p className="text-muted-foreground text-sm tracking-wide">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
