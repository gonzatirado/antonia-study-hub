"use client";

import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import * as Sentry from "@sentry/nextjs";
import Link from "next/link";
import {
  Clock,
  Timer,
  CalendarDays,
  FileText,
  FolderOpen,
  Star,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  ArrowRight,
  Flame,
  CloudCheck,
  BarChart3,
  Brain,
  Play,
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { getSubjects } from "@/lib/firebase/subjects";
import { getAllGrades } from "@/lib/firebase/grades";
import { getAllPendings } from "@/lib/firebase/pendings";
import type { Subject, Grade, Pending } from "@/lib/types";
import { DashboardSkeleton } from "@/components/dashboard";
import { container, item, formatDateSpanish, daysUntil, formatDueLabel } from "@/components/dashboard/utils";

export default function DashboardPage() {
  const { user } = useAppStore();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [pendings, setPendings] = useState<Pending[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;
    let cancelled = false;

    async function load() {
      try {
        const [subs, grs, pends] = await Promise.all([
          getSubjects(user!.uid),
          getAllGrades(user!.uid),
          getAllPendings(user!.uid),
        ]);
        if (cancelled) return;
        setSubjects(subs);
        setGrades(grs);
        setPendings(pends);
      } catch (err) {
        Sentry.captureException(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [user?.uid]);

  const upcomingPendings = useMemo(() => {
    const weekLater = new Date();
    weekLater.setDate(weekLater.getDate() + 7);
    return pendings
      .filter((p) => p.status !== "completed")
      .filter((p) => {
        const due = new Date(p.dueDate);
        return due <= weekLater;
      })
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .slice(0, 5);
  }, [pendings]);

  const weightedAverage = useMemo(() => {
    if (grades.length === 0) return null;
    let totalWeight = 0;
    let weightedSum = 0;
    for (const g of grades) {
      const normalized = (g.score / g.maxScore) * 7;
      weightedSum += normalized * g.weight;
      totalWeight += g.weight;
    }
    return totalWeight > 0 ? weightedSum / totalWeight : null;
  }, [grades]);

  const subjectMap = useMemo(() => {
    const map: Record<string, Subject> = {};
    for (const s of subjects) map[s.id] = s;
    return map;
  }, [subjects]);

  const subjectStats = useMemo(() => {
    return subjects.map((s) => {
      const sGrades = grades.filter((g) => g.subjectId === s.id);
      const sPendings = pendings.filter((p) => p.subjectId === s.id && p.status !== "completed");
      let avg: number | null = null;
      if (sGrades.length > 0) {
        let tw = 0, ws = 0;
        for (const g of sGrades) {
          const n = (g.score / g.maxScore) * 7;
          ws += n * g.weight;
          tw += g.weight;
        }
        avg = tw > 0 ? ws / tw : null;
      }
      return { subject: s, gradeAvg: avg, pendingCount: sPendings.length, fileCount: s.files?.length ?? 0 };
    });
  }, [subjects, grades, pendings]);

  const totalFiles = useMemo(() => {
    return subjects.reduce((acc, s) => acc + (s.files?.length ?? 0), 0);
  }, [subjects]);

  const firstName = user?.displayName?.split(" ")[0] || "estudiante";

  if (loading) {
    return <DashboardSkeleton />;
  }

  // Calculate study streak (consecutive days with completed pendings)
  const completedPendings = pendings.filter((p) => p.status === "completed");
  const studyStreak = (() => {
    if (completedPendings.length === 0) return 0;
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      const hasActivity = completedPendings.some((p) => {
        const d = new Date(p.dueDate);
        d.setHours(0, 0, 0, 0);
        return d.getTime() === checkDate.getTime();
      });
      if (hasActivity) streak++;
      else if (i > 0) break;
    }
    return streak;
  })();

  return (
    <div className="space-y-10">
      {/* ── Greeting Header ── */}
      <motion.header initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl font-black tracking-tight text-foreground">
          Hola, {firstName}!
        </h1>
        <div className="flex items-center gap-2 mt-2 text-primary/80 font-medium">
          <CalendarDays className="w-4 h-4" />
          <span className="text-sm uppercase tracking-widest">
            {formatDateSpanish(new Date())}
          </span>
        </div>
      </motion.header>

      {/* ── Bento Grid: Tasks, Pomodoro, Notes ── */}
      <motion.div
        className="grid grid-cols-12 gap-6"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {/* Proximas Tareas */}
        <motion.section
          variants={item}
          className="col-span-12 lg:col-span-5 backdrop-blur-xl bg-card/40 border border-border/50 border-t-primary/10 p-8 rounded-2xl flex flex-col justify-between min-h-[240px] transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5"
        >
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                Proximas Tareas
              </h3>
              <Clock className="w-5 h-5 text-primary" />
            </div>
            {upcomingPendings.length === 0 ? (
              <p className="text-muted-foreground text-sm py-4">
                No tienes pendientes esta semana
              </p>
            ) : (
              <div className="space-y-4">
                {upcomingPendings.map((p) => {
                  const sub = subjectMap[p.subjectId];
                  const overdue = daysUntil(p.dueDate) < 0;
                  const urgent = daysUntil(p.dueDate) <= 1;
                  return (
                    <div key={p.id} className="flex items-center gap-4 group cursor-pointer">
                      <div
                        className="w-1 h-8 rounded-full transition-transform group-hover:scale-y-125"
                        style={{
                          backgroundColor: overdue
                            ? "hsl(var(--destructive))"
                            : urgent
                              ? "hsl(var(--warning))"
                              : sub?.color || "hsl(var(--muted-foreground))",
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-foreground truncate">{p.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {sub?.name || "Sin asignatura"} &middot; {formatDueLabel(p.dueDate)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          <Link
            href="/pendings"
            className="mt-6 text-xs text-primary font-bold flex items-center gap-2 hover:translate-x-1 transition-transform"
          >
            VER TODAS <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.section>

        {/* Pomodoro Rapido */}
        <motion.section
          variants={item}
          className="col-span-12 md:col-span-6 lg:col-span-3 backdrop-blur-xl bg-card/40 border border-border/50 border-l-primary/20 p-8 rounded-2xl flex flex-col items-center justify-center text-center gap-6 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5"
        >
          <div className="relative">
            <svg className="w-32 h-32 -rotate-90" viewBox="0 0 128 128">
              <circle
                className="text-muted/30"
                cx="64"
                cy="64"
                fill="transparent"
                r="60"
                stroke="currentColor"
                strokeWidth="4"
              />
              <circle
                className="text-primary"
                cx="64"
                cy="64"
                fill="transparent"
                r="60"
                stroke="currentColor"
                strokeDasharray="376.8"
                strokeDashoffset="0"
                strokeWidth="4"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-black tracking-tighter text-foreground">25:00</span>
            </div>
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
              Pomodoro Rapido
            </h3>
            <Link href="/pomodoro">
              <button className="bg-primary text-primary-foreground px-6 py-2 rounded-full font-bold text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20 flex items-center gap-2 mx-auto">
                <Play className="w-3 h-3" />
                Iniciar Sesion
              </button>
            </Link>
          </div>
        </motion.section>

        {/* Notas Recientes / Subjects snapshot */}
        <motion.section
          variants={item}
          className="col-span-12 md:col-span-6 lg:col-span-4 backdrop-blur-xl bg-card/40 border border-border/50 p-8 rounded-2xl bg-gradient-to-br from-card/60 to-background/40 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5"
        >
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-6">
            Mis Asignaturas
          </h3>
          {subjectStats.length === 0 ? (
            <p className="text-muted-foreground text-sm py-4">
              No tienes asignaturas registradas
            </p>
          ) : (
            <div className="space-y-4">
              {subjectStats.slice(0, 3).map(({ subject: s, gradeAvg, pendingCount }) => (
                <Link key={s.id} href={`/subjects/${s.id}`}>
                  <div className="p-4 bg-muted/10 rounded-xl border border-border/30 hover:border-primary/30 transition-all duration-300 cursor-pointer hover:-translate-y-0.5 hover:shadow-lg">
                    <div className="flex items-center gap-3 mb-1">
                      <div
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: s.color }}
                      />
                      <p className="text-sm font-bold text-foreground truncate">{s.name}</p>
                    </div>
                    <div className="flex items-center gap-4 pl-5">
                      <span className="text-[10px] text-muted-foreground uppercase">
                        Prom: {gradeAvg !== null ? gradeAvg.toFixed(1) : "-"}
                      </span>
                      {pendingCount > 0 && (
                        <span className="text-[10px] text-warning uppercase">
                          {pendingCount} pend.
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
          {subjectStats.length > 3 && (
            <Link
              href="/subjects"
              className="mt-4 text-xs text-primary font-bold flex items-center gap-2 hover:translate-x-1 transition-transform"
            >
              VER TODAS ({subjectStats.length}) <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </motion.section>
      </motion.div>

      {/* ── Metricas de Rendimiento ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25 }}
      >
        <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground mb-6">
          Metricas de Rendimiento
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Promedio General */}
          <div className="bg-card/30 backdrop-blur-sm border border-border/30 p-6 rounded-2xl flex items-center gap-6">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
              <BarChart3 className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-muted-foreground">
                Promedio general
              </p>
              {weightedAverage !== null ? (
                <div className="flex items-baseline gap-2">
                  <p className="text-xl font-black text-foreground">
                    {weightedAverage.toFixed(1)}
                  </p>
                  <div className="flex items-center gap-1">
                    {weightedAverage >= 4.0 ? (
                      <TrendingUp className="w-3 h-3 text-success" />
                    ) : (
                      <TrendingDown className="w-3 h-3 text-destructive" />
                    )}
                    <span
                      className={`text-[10px] font-bold ${
                        weightedAverage >= 4.0 ? "text-success" : "text-destructive"
                      }`}
                    >
                      {weightedAverage >= 4.0 ? "Aprobando" : "En riesgo"}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Sin notas</p>
              )}
            </div>
          </div>

          {/* Racha */}
          <div className="bg-card/30 backdrop-blur-sm border border-border/30 p-6 rounded-2xl flex items-center gap-6">
            <div className="w-12 h-12 bg-warning/10 rounded-xl flex items-center justify-center shrink-0">
              <Flame className="w-6 h-6 text-warning" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-muted-foreground">Racha actual</p>
              <p className="text-xl font-black text-foreground">
                {studyStreak} dia{studyStreak !== 1 ? "s" : ""} seguido{studyStreak !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          {/* Archivos */}
          <div className="bg-card/30 backdrop-blur-sm border border-border/30 p-6 rounded-2xl flex items-center gap-6">
            <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center shrink-0">
              <CloudCheck className="w-6 h-6 text-accent-foreground" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-muted-foreground">Almacenamiento</p>
              <p className="text-xl font-black text-foreground">
                {totalFiles} archivo{totalFiles !== 1 ? "s" : ""}
                <span className="text-xs font-normal text-muted-foreground ml-2">
                  en {subjects.length} asignatura{subjects.length !== 1 ? "s" : ""}
                </span>
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Herramientas (Tool Shortcuts) ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35 }}
      >
        <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground mb-6">
          Herramientas
        </h3>
        <div className="flex flex-wrap gap-4">
          {[
            { href: "/pomodoro", icon: Timer, label: "Pomodoro" },
            { href: "/schedule", icon: CalendarDays, label: "Horario" },
            { href: "/summaries", icon: FileText, label: "Resumenes" },
            { href: "/subjects", icon: FolderOpen, label: "Archivos" },
            { href: "/grades", icon: Star, label: "Calificaciones" },
            { href: "/quizzes", icon: Brain, label: "Quiz IA" },
          ].map(({ href, icon: Icon, label }) => (
            <Link key={href} href={href} className="flex-1 min-w-[130px]">
              <div className="bg-card/30 backdrop-blur-sm border border-border/30 p-6 rounded-2xl flex flex-col items-center justify-center gap-4 hover:bg-card/60 transition-all cursor-pointer group hover:-translate-y-2 hover:shadow-xl hover:shadow-primary/5 duration-300">
                <Icon className="w-8 h-8 text-primary group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  {label}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
