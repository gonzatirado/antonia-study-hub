"use client";

import { motion } from "framer-motion";
import { FileText, Brain, GraduationCap, BookOpen, TrendingUp, Clock, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAppStore } from "@/lib/store";
import Link from "next/link";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function DashboardPage() {
  const { user, usage, subjects } = useAppStore();

  const stats = [
    {
      title: "Resúmenes",
      value: usage?.summaries_used ?? 0,
      limit: usage?.summaries_limit ?? 3,
      icon: FileText,
      color: "from-blue-500 to-cyan-500",
      href: "/summaries",
    },
    {
      title: "Quizzes",
      value: usage?.quizzes_used ?? 0,
      limit: usage?.quizzes_limit ?? 5,
      icon: Brain,
      color: "from-purple-500 to-pink-500",
      href: "/quizzes",
    },
    {
      title: "Prep. Pruebas",
      value: usage?.exam_preps_used ?? 0,
      limit: usage?.exam_preps_limit ?? 0,
      icon: GraduationCap,
      color: "from-orange-500 to-red-500",
      href: "/exam-prep",
    },
    {
      title: "Mis Ramos",
      value: subjects.length,
      limit: null,
      icon: BookOpen,
      color: "from-green-500 to-emerald-500",
      href: "/subjects",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-white">
          Hola, {user?.displayName?.split(" ")[0] || "estudiante"} 👋
        </h1>
        <p className="text-slate-400 mt-1">
          Este es tu resumen de actividad este mes
        </p>
      </motion.div>

      {/* Stats cards */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {stats.map((stat) => (
          <motion.div key={stat.title} variants={item}>
            <Link href={stat.href}>
              <Card className="bg-slate-900/50 border-slate-800 hover:border-slate-700 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/5 cursor-pointer group">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <stat.icon className="w-5 h-5 text-white" />
                    </div>
                    {stat.limit !== null && (
                      <span className="text-xs text-slate-500">
                        {stat.value}/{stat.limit}
                      </span>
                    )}
                  </div>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-sm text-slate-400">{stat.title}</p>
                  {stat.limit !== null && stat.limit > 0 && (
                    <Progress
                      value={(stat.value / stat.limit) * 100}
                      className="mt-3 h-1.5 bg-slate-800"
                    />
                  )}
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      {/* Quick actions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="text-lg font-semibold text-white mb-4">Acciones rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/subjects">
            <Card className="bg-slate-900/50 border-slate-800 hover:border-blue-500/30 transition-all duration-300 cursor-pointer group">
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
            <Card className="bg-slate-900/50 border-slate-800 hover:border-purple-500/30 transition-all duration-300 cursor-pointer group">
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
            <Card className="bg-slate-900/50 border-slate-800 hover:border-pink-500/30 transition-all duration-300 cursor-pointer group">
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

      {/* Recent activity placeholder */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <h2 className="text-lg font-semibold text-white mb-4">Actividad reciente</h2>
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-12 text-center">
            <Clock className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">Tu actividad reciente aparecerá aquí</p>
            <p className="text-sm text-slate-500 mt-1">Comienza creando tu primer ramo</p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
