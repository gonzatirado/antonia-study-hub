"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  Plus,
  Loader2,
  TrendingUp,
  TrendingDown,
  Minus,
  Award,
  GraduationCap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import * as Sentry from "@sentry/nextjs";
import { useAppStore } from "@/lib/store";
import { useEnsureSubjects } from "@/hooks/use-ensure-subjects";
import { getAllGrades, addGrade } from "@/lib/firebase/grades";
import type { Grade, Subject } from "@/lib/types";

import {
  gradeTextClass,
  gradeDotClass,
  gradeStatusLabel,
  calcWeightedAvg,
} from "./_components/grade-helpers";
import { GradeDetailView } from "./_components/grade-detail-view";
import { GradeDialogGlobal } from "./_components/grade-dialog";

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
  const { user } = useAppStore();
  const subjects = useEnsureSubjects();
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.uid) return;
    getAllGrades(user.uid)
      .then((g) => setGrades(g))
      .catch((err) => Sentry.captureException(err))
      .finally(() => setLoading(false));
  }, [user?.uid]);

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
      const needed = ((4.0 / 7) * 100 - currentWeightedSum) / remainingWeight;
      neededGrade = needed * 7;
    }

    return (
      <GradeDetailView
        subject={subject}
        subjectGrades={subjectGrades}
        avg={avg}
        totalWeight={totalWeight}
        byCategory={byCategory}
        neededGrade={neededGrade}
        remainingWeight={remainingWeight}
        userId={user?.uid}
        onBack={() => setSelectedSubjectId(null)}
        setGrades={setGrades}
      />
    );
  }

  // ── Overview ──
  const globalAvg = calcGlobalAvg();
  const { approved, total } = countApproved();

  return (
    <div className="space-y-10">
      {/* Header */}
      <header className="page-header">
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
        <div className="text-center py-20 border border-dashed border-border/40 rounded-xl">
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
            <div className="col-span-3">Materia</div>
            <div className="col-span-3 text-center">Notas Parciales</div>
            <div className="col-span-2 text-center">Promedio</div>
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
                className="grid grid-cols-12 px-6 py-6 items-center border-b border-border/30 hover:bg-muted/10 transition-all duration-300 cursor-pointer group"
                onClick={() => setSelectedSubjectId(subjectId)}
              >
                {/* Subject Name */}
                <div className="col-span-3">
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
                <div className="col-span-2 text-center">
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
