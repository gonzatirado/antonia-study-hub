"use client";

import { motion } from "framer-motion";
import { FileText, Brain, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

export function QuickActions() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}>
      <h2 className="text-lg font-semibold text-foreground mb-4">Acciones rápidas</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/subjects">
          <Card className="bg-card/50 border-border hover:border-info/30 transition-all duration-300 cursor-pointer group rounded-xl">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-info/10 flex items-center justify-center group-hover:bg-info/20 transition-colors">
                <Plus className="w-6 h-6 text-info" />
              </div>
              <div>
                <p className="font-medium text-foreground">Agregar asignatura</p>
                <p className="text-sm text-muted-foreground">Sube material de estudio</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/summaries">
          <Card className="bg-card/50 border-border hover:border-accent/30 transition-all duration-300 cursor-pointer group rounded-xl">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">Generar resumen</p>
                <p className="text-sm text-muted-foreground">Crea un resumen con IA</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/quizzes">
          <Card className="bg-card/50 border-border hover:border-destructive/30 transition-all duration-300 cursor-pointer group rounded-xl">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center group-hover:bg-destructive/20 transition-colors">
                <Brain className="w-6 h-6 text-destructive" />
              </div>
              <div>
                <p className="font-medium text-foreground">Crear quiz</p>
                <p className="text-sm text-muted-foreground">Practica con preguntas</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </motion.div>
  );
}
