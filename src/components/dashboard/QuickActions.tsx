"use client";

import { motion } from "framer-motion";
import { FileText, Brain, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

export function QuickActions() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}>
      <h2 className="text-lg font-semibold text-white mb-4">Acciones rápidas</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/subjects">
          <Card className="bg-slate-900/50 border-slate-800 hover:border-blue-500/30 transition-all duration-300 cursor-pointer group rounded-xl">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                <Plus className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <p className="font-medium text-white">Agregar ramo</p>
                <p className="text-sm text-slate-400">Sube material de estudio</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/summaries">
          <Card className="bg-slate-900/50 border-slate-800 hover:border-purple-500/30 transition-all duration-300 cursor-pointer group rounded-xl">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
                <FileText className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <p className="font-medium text-white">Generar resumen</p>
                <p className="text-sm text-slate-400">Crea un resumen con IA</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/quizzes">
          <Card className="bg-slate-900/50 border-slate-800 hover:border-pink-500/30 transition-all duration-300 cursor-pointer group rounded-xl">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-pink-500/10 flex items-center justify-center group-hover:bg-pink-500/20 transition-colors">
                <Brain className="w-6 h-6 text-pink-400" />
              </div>
              <div>
                <p className="font-medium text-white">Crear quiz</p>
                <p className="text-sm text-slate-400">Practica con preguntas</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </motion.div>
  );
}
