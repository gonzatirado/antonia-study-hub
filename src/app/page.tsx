"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { BookOpen, Brain, FileText, Calendar, Sparkles, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: FileText,
    title: "Resúmenes IA",
    description: "Sube tus archivos y obtén resúmenes visualmente atractivos con diagramas, colores y estructura clara.",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: Brain,
    title: "Quizzes Inteligentes",
    description: "Genera cuestionarios de selección múltiple basados en tu material de estudio.",
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: Calendar,
    title: "Preparación de Pruebas",
    description: "Crea un plan de estudio día a día hasta la fecha de tu examen con contenido personalizado.",
    color: "from-orange-500 to-red-500",
  },
  {
    icon: BookOpen,
    title: "Organiza tus Ramos",
    description: "Sube archivos, organiza por asignatura y accede a todo desde un solo lugar.",
    color: "from-green-500 to-emerald-500",
  },
];

const plans = [
  {
    name: "Gratis",
    price: "$0",
    period: "para siempre",
    features: ["3 resúmenes/mes", "5 quizzes/mes", "10 archivos", "50 MB almacenamiento"],
    cta: "Empezar gratis",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$4.990",
    period: "CLP/mes",
    features: [
      "30 resúmenes/mes",
      "50 quizzes/mes",
      "5 preparaciones de prueba",
      "200 preguntas de práctica",
      "Archivos ilimitados",
      "2 GB almacenamiento",
      "Exportar a PDF",
    ],
    cta: "Comenzar prueba gratuita",
    highlighted: true,
  },
  {
    name: "Premium",
    price: "$9.990",
    period: "CLP/mes",
    features: [
      "100 resúmenes/mes",
      "150 quizzes/mes",
      "15 preparaciones de prueba",
      "600 preguntas de práctica",
      "Modelo IA superior",
      "10 GB almacenamiento",
      "Soporte prioritario",
    ],
    cta: "Ir Premium",
    highlighted: false,
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen text-foreground">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-background/60 backdrop-blur-xl border-b border-foreground/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-foreground" />
            </div>
            <span className="text-xl font-bold">StudyHub</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" className="text-foreground/80 hover:text-foreground">
                Iniciar sesión
              </Button>
            </Link>
            <Link href="/login">
              <Button className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90">
                Registrarse
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm mb-8">
              <Sparkles className="w-4 h-4" />
              Potenciado con Inteligencia Artificial
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Estudia más{" "}
              <span className="bg-gradient-to-r from-primary via-accent to-pink-400 bg-clip-text text-transparent">
                inteligente
              </span>
              ,{" "}
              <br className="hidden md:block" />
              no más difícil
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Sube tu material, genera resúmenes visuales con IA, practica con quizzes
              y prepara tus pruebas con un plan personalizado.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link href="/login">
                <Button size="lg" className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-lg px-8 py-6">
                  Empezar gratis
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Todo lo que necesitas para{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                aprobar
              </span>
            </h2>
            <p className="text-muted-foreground text-lg">
              Herramientas diseñadas para maximizar tu rendimiento académico
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-2 gap-6"
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            {features.map((feature) => (
              <motion.div
                key={feature.title}
                variants={item}
                whileHover={{ scale: 1.02, y: -4 }}
                className="group relative p-8 rounded-2xl bg-card/80 backdrop-blur-sm border border-border/50 hover:border-border transition-all duration-300"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4`}>
                  <feature.icon className="w-6 h-6 text-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Planes simples y transparentes</h2>
            <p className="text-muted-foreground text-lg">Elige el plan que se adapte a tu ritmo de estudio</p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto"
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            {plans.map((plan) => (
              <motion.div
                key={plan.name}
                variants={item}
                whileHover={{ scale: 1.03, y: -4 }}
                className={`relative p-8 rounded-2xl border transition-all duration-300 ${
                  plan.highlighted
                    ? "bg-gradient-to-b from-primary/10 to-card/80 backdrop-blur-sm border-primary/50 shadow-lg shadow-primary/10"
                    : "bg-card/80 backdrop-blur-sm border-border/50 hover:border-border"
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-primary to-accent rounded-full text-sm font-medium">
                    Más popular
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-foreground/80 mb-2">{plan.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">/{plan.period}</span>
                  </div>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-foreground/80">
                      <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  className={`w-full ${
                    plan.highlighted
                      ? "bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                      : "bg-secondary hover:bg-secondary/80"
                  }`}
                >
                  {plan.cta}
                </Button>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-border bg-background/40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto text-center text-muted-foreground text-sm">
          StudyHub &copy; {new Date().getFullYear()}. Hecho para estudiantes, por estudiantes.
        </div>
      </footer>
    </div>
  );
}
