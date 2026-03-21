"use client";

import { motion } from "framer-motion";
import {
  ChevronLeft,
  BookOpen,
  Calculator,
  Weight,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
} from "lucide-react";
import { CATEGORY_LABELS } from "@/lib/utils/grade-helpers";
import type { Grade, GradeCategory, Subject } from "@/lib/types";
import { deleteGrade } from "@/lib/firebase/grades";
import {
  gradeTextClass,
  gradeDotClass,
  gradeStatusLabel,
} from "./grade-helpers";

function gradeStatusIcon(grade: number) {
  if (grade >= 5.0) return <CheckCircle2 className="w-3 h-3" />;
  if (grade >= 4.0) return <AlertTriangle className="w-3 h-3" />;
  return <XCircle className="w-3 h-3" />;
}

export interface GradeDetailViewProps {
  subject: Subject | undefined;
  subjectGrades: Grade[];
  avg: number;
  totalWeight: number;
  byCategory: Record<string, Grade[]>;
  neededGrade: number | null;
  remainingWeight: number;
  userId: string | undefined;
  onBack: () => void;
  setGrades: React.Dispatch<React.SetStateAction<Grade[]>>;
}

export function GradeDetailView({
  subject,
  subjectGrades,
  avg,
  totalWeight,
  byCategory,
  neededGrade,
  remainingWeight,
  userId,
  onBack,
  setGrades,
}: GradeDetailViewProps) {
  return (
    <div className="space-y-8 max-w-5xl">
      {/* Detail Header */}
      <header>
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={onBack}
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
                        {CATEGORY_LABELS[category as GradeCategory] || category}
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
                                if (!userId) return;
                                deleteGrade(userId, grade.id).then(() =>
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
                        {CATEGORY_LABELS[category as GradeCategory] || category}
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
