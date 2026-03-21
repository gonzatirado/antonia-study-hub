"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart3,
  Plus,
  Loader2,
  Trash2,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  TrendingDown,
  Minus,
  Award,
  BookOpen,
  Calculator,
  Calendar,
  Weight,
  GraduationCap,
  AlertTriangle,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import * as Sentry from "@sentry/nextjs";
import { useAppStore } from "@/lib/store";
import { getSubjects } from "@/lib/firebase/subjects";
import { getAllGrades, addGrade, deleteGrade } from "@/lib/firebase/grades";
import type { Grade, GradeCategory, Subject } from "@/lib/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const CATEGORY_LABELS: Record<string, string> = {
  solemne: "Solemne",
  examen: "Examen",
  control: "Control/Quiz",
  tarea: "Tarea",
  proyecto: "Proyecto",
  otro: "Otro",
};

/* ── Grade color helpers ── */
function gradeColor(grade: number): string {
  if (grade >= 5.5) return "var(--success)";
  if (grade >= 4.0) return "var(--warning)";
  return "var(--destructive)";
}

function gradeColorClass(grade: number): string {
  if (grade >= 5.5) return "text-[oklch(var(--success))]";
  if (grade >= 4.0) return "text-[oklch(var(--warning))]";
  return "text-destructive";
}

function gradeTextClass(grade: number): string {
  if (grade >= 5.5) return "text-emerald-500";
  if (grade >= 4.0) return "text-amber-500";
  return "text-destructive";
}

function gradeBgClass(grade: number): string {
  if (grade >= 5.5) return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
  if (grade >= 4.0) return "bg-amber-500/10 text-amber-500 border-amber-500/20";
  return "bg-destructive/10 text-destructive border-destructive/20";
}

function gradeStatusLabel(grade: number): string {
  if (grade >= 6.0) return "Sobresaliente";
  if (grade >= 5.0) return "Aprobando";
  if (grade >= 4.0) return "En Riesgo";
  return "Reprobando";
}

function gradeStatusIcon(grade: number) {
  if (grade >= 5.0) return <CheckCircle2 className="w-3 h-3" />;
  if (grade >= 4.0) return <AlertTriangle className="w-3 h-3" />;
  return <XCircle className="w-3 h-3" />;
}

function gradeDotClass(grade: number): string {
  if (grade >= 5.0) return "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]";
  if (grade >= 4.0) return "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]";
  return "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]";
}

function trendIcon(grades: Grade[]) {
  if (grades.length < 2) return <Minus className="w-3.5 h-3.5 text-muted-foreground" />;
  const sorted = [...grades].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const lastScore = sorted[sorted.length - 1].maxScore === 0 ? 0 : (sorted[sorted.length - 1].score / sorted[sorted.length - 1].maxScore) * 7;
  const prevScore = sorted[sorted.length - 2].maxScore === 0 ? 0 : (sorted[sorted.length - 2].score / sorted[sorted.length - 2].maxScore) * 7;
  if (lastScore > prevScore) return <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />;
  if (lastScore < prevScore) return <TrendingDown className="w-3.5 h-3.5 text-destructive" />;
  return <Minus className="w-3.5 h-3.5 text-muted-foreground" />;
}

/* ── Main Page ── */
export default function GradesPage() {
  const { user, subjects, setSubjects } = useAppStore();
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.uid) return;
    Promise.all([
      subjects.length === 0
        ? getSubjects(user.uid).then((s) => { setSubjects(s); return s; })
        : Promise.resolve(subjects),
      getAllGrades(user.uid),
    ])
      .then(([, g]) => setGrades(g))
      .catch((err) => Sentry.captureException(err))
      .finally(() => setLoading(false));
  }, [user?.uid, subjects.length]);

  const gradesBySubject = useMemo(() => {
    const map: Record<string, Grade[]> = {};
    grades.forEach((g) => {
      if (!map[g.subjectId]) map[g.subjectId] = [];
      map[g.subjectId].push(g);
    });
    return map;
  }, [grades]);

  function getSubjectById(id: string): Subject | undefined {
    return subjects.find((s) => s.id === id);
  }

  function calcWeightedAvg(subjectGrades: Grade[]): number {
    const totalWeight = subjectGrades.reduce((s, g) => s + g.weight, 0);
    if (totalWeight === 0) return 0;
    const sum = subjectGrades.reduce(
      (acc, g) => acc + (g.maxScore === 0 ? 0 : (g.score / g.maxScore) * g.weight),
      0
    );
    return (sum / totalWeight) * 7;
  }

  function calcGlobalAvg(): number {
    const subjectIds = Object.keys(gradesBySubject);
    if (subjectIds.length === 0) return 0;
    const avgs = subjectIds.map((id) => calcWeightedAvg(gradesBySubject[id]));
    return avgs.reduce((a, b) => a + b, 0) / avgs.length;
  }

  function countApproved(): { approved: number; total: number } {
    const subjectIds = Object.keys(gradesBySubject);
    let approved = 0;
    subjectIds.forEach((id) => {
      if (calcWeightedAvg(gradesBySubject[id]) >= 4.0) approved++;
    });
    return { approved, total: subjectIds.length };
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  // Detail view for a selected subject
  if (selectedSubjectId) {
    const subject = getSubjectById(selectedSubjectId);
    const subjectGrades = gradesBySubject[selectedSubjectId] || [];
    const avg = calcWeightedAvg(subjectGrades);
    const totalWeight = subjectGrades.reduce((s, g) => s + g.weight, 0);

    const byCategory: Record<string, Grade[]> = {};
    subjectGrades.forEach((g) => {
      if (!byCategory[g.category]) byCategory[g.category] = [];
      byCategory[g.category].push(g);
    });

    // Calculate what grade is needed on remaining weight to reach 4.0
    const remainingWeight = 100 - totalWeight;
    let neededGrade: number | null = null;
    if (remainingWeight > 0 && totalWeight > 0) {
      const currentWeightedSum = subjectGrades.reduce(
        (acc, g) => acc + (g.maxScore === 0 ? 0 : (g.score / g.maxScore) * g.weight),
        0
      );
      // target: (currentWeightedSum + neededScore * remainingWeight) / 100 * 7 >= 4.0
      // neededScore = ((4.0 / 7 * 100) - currentWeightedSum) / remainingWeight
      const needed = ((4.0 / 7) * 100 - currentWeightedSum) / remainingWeight;
      neededGrade = needed * 7; // Convert back to 1-7 scale
    }

    return (
      <div className="space-y-8 max-w-5xl">
        {/* Detail Header */}
        <header>
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => setSelectedSubjectId(null)}
              className="flex items-center gap-1 text-primary hover:text-primary/80 transition-colors text-sm font-medium"
            >
              <ChevronLeft className="w-4 h-4" />
              Volver
            </button>
            <span className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
              {subject?.code || ""}
            </span>
          </div>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight text-foreground mb-2">
                {subject?.name || "Asignatura"}
              </h1>
              <p className="text-muted-foreground max-w-lg">
                Seguimiento detallado de rendimiento. Sistema chileno (1.0 - 7.0).
              </p>
            </div>

            <div className="glass-card bg-card/60 backdrop-blur-xl border border-border/50 rounded-xl p-6 flex flex-col items-end border-t border-t-primary/10">
              <span className="text-[10px] uppercase tracking-widest text-primary mb-1 font-semibold">
                Promedio Actual
              </span>
              <span className={`text-5xl font-black ${gradeTextClass(avg)}`}>
                {avg.toFixed(1)}
              </span>
              <div className="flex items-center gap-1.5 mt-2">
                <div className={`w-2 h-2 rounded-full ${gradeDotClass(avg)}`} />
                <span className={`text-[10px] font-bold uppercase tracking-widest ${gradeTextClass(avg)}`}>
                  {gradeStatusLabel(avg)}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Detail Grid */}
        <div className="grid grid-cols-12 gap-8">
          {/* Evaluaciones Table */}
          <section className="col-span-12 lg:col-span-8 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card/60 backdrop-blur-xl border border-border/50 rounded-xl overflow-hidden border-t border-t-primary/10"
            >
              <div className="flex justify-between items-end px-6 py-5">
                <div className="flex items-center gap-3">
                  <BookOpen className="w-5 h-5 text-primary" />
                  <h2 className="text-xl font-bold text-foreground">Evaluaciones</h2>
                </div>
                <span className="text-[10px] text-muted-foreground uppercase tracking-widest">
                  Pond. usada: {totalWeight}%
                </span>
              </div>

              {/* Table Header */}
              <div className="grid grid-cols-4 px-6 py-2 text-[10px] text-muted-foreground uppercase tracking-widest font-semibold border-b border-border/30">
                <div className="col-span-2">Concepto</div>
                <div className="text-center">Peso (%)</div>
                <div className="text-right">Calificación</div>
              </div>

              {/* Grade Rows by Category */}
              <div className="divide-y divide-border/20">
                {Object.entries(byCategory).map(([category, catGrades]) => {
                  const catWeight = catGrades.reduce((s, g) => s + g.weight, 0);
                  const catAvg =
                    catWeight === 0
                      ? 0
                      : (catGrades.reduce(
                          (s, g) =>
                            s + (g.maxScore === 0 ? 0 : (g.score / g.maxScore) * g.weight),
                          0
                        ) /
                          catWeight) *
                        7;

                  return (
                    <div key={category}>
                      {/* Category sub-header */}
                      <div className="flex items-center justify-between px-6 py-2 bg-muted/30">
                        <span className="text-xs font-semibold text-foreground/80">
                          {CATEGORY_LABELS[category] || category}
                          <span className="text-muted-foreground ml-2">({catWeight}%)</span>
                        </span>
                        <span className={`text-xs font-bold ${gradeTextClass(catAvg)}`}>
                          {catAvg.toFixed(1)}
                        </span>
                      </div>

                      {catGrades.map((grade) => {
                        const gradeValue =
                          grade.maxScore === 0 ? 0 : (grade.score / grade.maxScore) * 7;
                        return (
                          <div
                            key={grade.id}
                            className="group grid grid-cols-4 items-center px-6 py-4 hover:bg-muted/20 transition-colors"
                          >
                            <div className="col-span-2 flex items-center gap-3">
                              <div
                                className="w-2 h-2 rounded-full shrink-0"
                                style={{
                                  backgroundColor: subject?.color || "var(--primary)",
                                }}
                              />
                              <div>
                                <span className="font-semibold text-foreground text-sm">
                                  {grade.name}
                                </span>
                                <p className="text-[11px] text-muted-foreground">
                                  {new Date(grade.date).toLocaleDateString("es-CL", {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                  })}
                                </p>
                              </div>
                            </div>
                            <div className="text-center font-mono text-sm text-muted-foreground">
                              {grade.weight}%
                            </div>
                            <div className="flex items-center justify-end gap-2">
                              <span
                                className={`text-lg font-bold ${gradeTextClass(gradeValue)}`}
                              >
                                {grade.score}
                              </span>
                              <button
                                onClick={() => {
                                  if (!user?.uid) return;
                                  deleteGrade(user.uid, grade.id).then(() =>
                                    setGrades((prev) =>
                                      prev.filter((g) => g.id !== grade.id)
                                    )
                                  );
                                }}
                                className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-all"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}

                {subjectGrades.length === 0 && (
                  <div className="px-6 py-10 text-center text-muted-foreground">
                    <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="text-sm">Sin evaluaciones registradas</p>
                  </div>
                )}
              </div>
            </motion.div>
          </section>

          {/* Sidebar */}
          <aside className="col-span-12 lg:col-span-4 space-y-6">
            {/* Simulator */}
            {neededGrade !== null && remainingWeight > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-card/60 backdrop-blur-xl border border-border/50 rounded-xl p-6 border-l-2 border-l-primary/30 border-t border-t-primary/10"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Calculator className="w-5 h-5 text-amber-500" />
                  <h3 className="text-base font-bold text-foreground">Simulador de Nota</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-5">
                  Con el <span className="text-foreground font-semibold">{remainingWeight}%</span> restante
                  de ponderación:
                </p>
                <div className="bg-primary/5 p-5 rounded-lg text-center border border-primary/10">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-widest block mb-2">
                    Necesitas para aprobar (4.0)
                  </span>
                  <div className={`text-4xl font-black ${neededGrade > 7 ? "text-destructive" : neededGrade <= 0 ? "text-emerald-500" : "text-primary"}`}>
                    {neededGrade <= 0 ? "Ya apruebas" : neededGrade > 7 ? "Imposible" : neededGrade.toFixed(1)}
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-2">
                    Basado en promedio ponderado actual
                  </p>
                </div>
              </motion.div>
            )}

            {/* Weight Distribution */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-card/60 backdrop-blur-xl border border-border/50 rounded-xl p-6 border-t border-t-primary/10"
            >
              <div className="flex items-center gap-2 mb-4">
                <Weight className="w-5 h-5 text-primary" />
                <h3 className="text-base font-bold text-foreground">Ponderación</h3>
              </div>
              <div className="space-y-3">
                {Object.entries(byCategory).map(([category, catGrades]) => {
                  const catWeight = catGrades.reduce((s, g) => s + g.weight, 0);
                  return (
                    <div key={category}>
                      <div className="flex justify-between mb-1">
                        <span className="text-xs text-muted-foreground">
                          {CATEGORY_LABELS[category] || category}
                        </span>
                        <span className="text-xs font-mono text-foreground">{catWeight}%</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all bg-primary"
                          style={{ width: `${catWeight}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
                {100 - totalWeight > 0 && (
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-xs text-muted-foreground">Sin evaluar</span>
                      <span className="text-xs font-mono text-muted-foreground">
                        {100 - totalWeight}%
                      </span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-muted-foreground/20"
                        style={{ width: `${100 - totalWeight}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </aside>
        </div>
      </div>
    );
  }

  // ── Overview ──
  const globalAvg = calcGlobalAvg();
  const { approved, total } = countApproved();

  return (
    <div className="space-y-10 max-w-5xl">
      {/* Header */}
      <header>
        <p className="text-[10px] uppercase tracking-[0.2em] text-primary mb-2 font-semibold">
          Resumen Académico
        </p>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground mb-2">
              Calificaciones
            </h1>
            <p className="text-muted-foreground max-w-lg">
              Visualización detallada de tu rendimiento académico actual.
            </p>
          </div>
          <Button
            onClick={() => setShowDialog(true)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Plus className="w-4 h-4 mr-1" /> Registrar nota
          </Button>
        </div>
      </header>

      {/* Stats Bento */}
      {grades.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {/* Promedio General */}
          <div className="bg-card/60 backdrop-blur-xl border border-border/50 rounded-xl p-6 border-t border-t-primary/10">
            <div className="flex items-center gap-2 mb-1">
              <GraduationCap className="w-4 h-4 text-primary" />
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
                Promedio General
              </p>
            </div>
            <p className={`text-4xl font-bold ${gradeTextClass(globalAvg)}`}>
              {globalAvg.toFixed(1)}
            </p>
          </div>

          {/* Materias Aprobadas */}
          <div className="bg-card/60 backdrop-blur-xl border border-border/50 rounded-xl p-6 border-t border-t-primary/10">
            <div className="flex items-center gap-2 mb-1">
              <Award className="w-4 h-4 text-primary" />
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
                Materias Aprobando
              </p>
            </div>
            <p className="text-4xl font-bold text-foreground">
              {approved} <span className="text-lg text-muted-foreground">/ {total}</span>
            </p>
          </div>

          {/* Evaluaciones Registradas */}
          <div className="bg-card/60 backdrop-blur-xl border border-border/50 rounded-xl p-6 border-t border-t-primary/10">
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 className="w-4 h-4 text-primary" />
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
                Evaluaciones
              </p>
            </div>
            <p className="text-4xl font-bold text-foreground">{grades.length}</p>
          </div>
        </motion.div>
      )}

      {/* Subject Table / Empty State */}
      {grades.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-border rounded-xl">
          <BarChart3 className="w-12 h-12 text-muted-foreground/60 mx-auto mb-3" />
          <p className="text-muted-foreground font-medium">Sin notas registradas</p>
          <p className="text-sm text-muted-foreground mt-1">
            Empezá registrando una evaluación
          </p>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-card/60 backdrop-blur-xl border border-border/50 rounded-xl overflow-hidden border-t border-t-primary/10"
        >
          {/* Table Header */}
          <div className="grid grid-cols-12 px-6 py-4 border-b border-border/30 text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground">
            <div className="col-span-4">Materia</div>
            <div className="col-span-3 text-center">Notas Parciales</div>
            <div className="col-span-1 text-center">Promedio</div>
            <div className="col-span-2 text-center">Tendencia</div>
            <div className="col-span-2 text-right">Estado</div>
          </div>

          {/* Subject Rows */}
          {Object.entries(gradesBySubject).map(([subjectId, subjectGrades], idx) => {
            const subject = getSubjectById(subjectId);
            const avg = calcWeightedAvg(subjectGrades);
            const totalWeight = subjectGrades.reduce((s, g) => s + g.weight, 0);
            // Take last 3 grades for partial display
            const recentGrades = [...subjectGrades]
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .slice(0, 3);

            return (
              <motion.div
                key={subjectId}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 + idx * 0.03 }}
                className="grid grid-cols-12 px-6 py-6 items-center border-b border-border/10 hover:bg-muted/10 transition-all duration-300 cursor-pointer group"
                onClick={() => setSelectedSubjectId(subjectId)}
              >
                {/* Subject Name */}
                <div className="col-span-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: subject?.color || "#8b5cf6" }}
                    />
                    <div>
                      <p className="text-base font-bold text-foreground group-hover:text-primary transition-colors">
                        {subject?.name || "Asignatura"}
                      </p>
                      <p className="text-[10px] text-muted-foreground tracking-wider uppercase">
                        {subject?.code || ""} {totalWeight < 100 && `· ${totalWeight}% evaluado`}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Partial Grades */}
                <div className="col-span-3 flex justify-center gap-2">
                  {recentGrades.map((g) => (
                    <span
                      key={g.id}
                      className="bg-muted/60 px-2.5 py-1 rounded text-sm text-muted-foreground font-mono"
                    >
                      {g.score}
                    </span>
                  ))}
                  {subjectGrades.length > 3 && (
                    <span className="text-xs text-muted-foreground self-center">
                      +{subjectGrades.length - 3}
                    </span>
                  )}
                </div>

                {/* Average */}
                <div className="col-span-1 text-center">
                  <span className={`text-xl font-bold ${gradeTextClass(avg)}`}>
                    {avg.toFixed(1)}
                  </span>
                </div>

                {/* Trend */}
                <div className="col-span-2 flex justify-center items-center gap-1.5">
                  {trendIcon(subjectGrades)}
                </div>

                {/* Status */}
                <div className="col-span-2 flex items-center justify-end gap-2">
                  <div className={`w-2 h-2 rounded-full ${gradeDotClass(avg)}`} />
                  <span
                    className={`text-[10px] font-bold uppercase tracking-widest ${gradeTextClass(avg)}`}
                  >
                    {gradeStatusLabel(avg)}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Dialog */}
      {showDialog && (
        <GradeDialogGlobal
          subjects={subjects}
          onClose={() => setShowDialog(false)}
          onSave={async (data) => {
            if (!user?.uid) return;
            const grade = await addGrade({ ...data, userId: user.uid });
            setGrades((prev) => [grade, ...prev]);
            setShowDialog(false);
          }}
        />
      )}
    </div>
  );
}

/* ── Grade Dialog ── */
function GradeDialogGlobal({
  subjects,
  onClose,
  onSave,
}: {
  subjects: Subject[];
  onClose: () => void;
  onSave: (data: {
    subjectId: string;
    name: string;
    score: number;
    maxScore: number;
    weight: number;
    category: GradeCategory;
    date: Date;
  }) => void;
}) {
  const [subjectId, setSubjectId] = useState(subjects[0]?.id || "");
  const [name, setName] = useState("");
  const [score, setScore] = useState("");
  const [maxScore, setMaxScore] = useState("7.0");
  const [weight, setWeight] = useState("");
  const [category, setCategory] = useState<GradeCategory>("control");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !score || !weight || !subjectId) return;
    onSave({
      subjectId,
      name: name.trim(),
      score: parseFloat(score),
      maxScore: parseFloat(maxScore),
      weight: parseFloat(weight),
      category,
      date: new Date(date + "T12:00:00"),
    });
  }

  const categories: { value: GradeCategory; label: string }[] = [
    { value: "solemne", label: "Solemne" },
    { value: "examen", label: "Examen" },
    { value: "control", label: "Control/Quiz" },
    { value: "tarea", label: "Tarea" },
    { value: "proyecto", label: "Proyecto" },
    { value: "otro", label: "Otro" },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card border border-border rounded-2xl p-6 w-full max-w-md mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold text-foreground mb-1">Registrar nota</h3>
        <p className="text-sm text-muted-foreground mb-5">
          Ej: &quot;Control 1&quot; tipo Control/Quiz, 15% de la asignatura
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Asignatura *</label>
            <Select value={subjectId} onValueChange={(v) => setSubjectId(v as string)}>
              <SelectTrigger className="w-full bg-muted border-border text-foreground">
                <SelectValue placeholder="Seleccionar asignatura" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                {subjects.map((s) => (
                  <SelectItem key={s.id} value={s.id} className="text-foreground">
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Nombre *</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Control 1..."
                className="w-full bg-muted border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-ring"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Tipo</label>
              <Select value={category} onValueChange={(v) => setCategory(v as GradeCategory)}>
                <SelectTrigger className="w-full bg-muted border-border text-foreground">
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {categories.map((c) => (
                    <SelectItem key={c.value} value={c.value} className="text-foreground">
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Nota *</label>
              <input
                type="number"
                step="0.1"
                min="1"
                max="7"
                value={score}
                onChange={(e) => setScore(e.target.value)}
                placeholder="4.5"
                className="w-full bg-muted border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-ring [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Nota máx.</label>
              <input
                type="number"
                step="0.1"
                value={maxScore}
                onChange={(e) => setMaxScore(e.target.value)}
                className="w-full bg-muted border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-ring [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Pond. (%) *</label>
              <input
                type="number"
                step="1"
                min="1"
                max="100"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="30"
                className="w-full bg-muted border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-ring [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Fecha</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-muted border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-ring"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={onClose} className="text-muted-foreground">
              Cancelar
            </Button>
            <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">
              Registrar nota
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
