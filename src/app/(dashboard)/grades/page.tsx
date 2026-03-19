"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { BarChart3, Plus, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import * as Sentry from "@sentry/nextjs";
import { useAppStore } from "@/lib/store";
import { getSubjects } from "@/lib/firebase/subjects";
import { getAllGrades, addGrade, deleteGrade } from "@/lib/firebase/grades";
import type { Grade, GradeCategory, Subject } from "@/lib/types";
import { ChevronRight } from "lucide-react";

const CATEGORY_LABELS: Record<string, string> = {
  solemne: "Solemne",
  examen: "Examen",
  control: "Control/Quiz",
  tarea: "Tarea",
  proyecto: "Proyecto",
  otro: "Otro",
};

export default function GradesPage() {
  const { user, subjects, setSubjects } = useAppStore();
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    if (!user?.uid) return;
    Promise.all([
      subjects.length === 0 ? getSubjects(user.uid).then((s) => { setSubjects(s); return s; }) : Promise.resolve(subjects),
      getAllGrades(user.uid),
    ])
      .then(([, g]) => setGrades(g))
      .catch((err) => Sentry.captureException(err))
      .finally(() => setLoading(false));
  }, [user?.uid, subjects.length]);

  // Group grades by subject, then by category
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
    const sum = subjectGrades.reduce((acc, g) => acc + (g.maxScore === 0 ? 0 : (g.score / g.maxScore) * g.weight), 0);
    return (sum / totalWeight) * 7;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Notas</h1>
          <p className="text-sm text-muted-foreground mt-1">Registra y calcula tus promedios</p>
        </div>
        <Button
          onClick={() => setShowDialog(true)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <Plus className="w-4 h-4 mr-1" /> Registrar nota
        </Button>
      </div>

      {grades.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-border rounded-xl">
          <BarChart3 className="w-12 h-12 text-muted-foreground/60 mx-auto mb-3" />
          <p className="text-muted-foreground font-medium">Sin notas registradas</p>
          <p className="text-sm text-muted-foreground mt-1">Empezá registrando una evaluación</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(gradesBySubject).map(([subjectId, subjectGrades]) => {
            const subject = getSubjectById(subjectId);
            const avg = calcWeightedAvg(subjectGrades);
            const totalWeight = subjectGrades.reduce((s, g) => s + g.weight, 0);

            // Group by category
            const byCategory: Record<string, Grade[]> = {};
            subjectGrades.forEach((g) => {
              if (!byCategory[g.category]) byCategory[g.category] = [];
              byCategory[g.category].push(g);
            });

            return (
              <motion.div
                key={subjectId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card/50 border border-border rounded-xl overflow-hidden"
              >
                {/* Subject header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: subject?.color || "#8b5cf6" }}
                    />
                    <h2 className="text-base font-semibold text-foreground">
                      {subject?.name || "Asignatura"}
                    </h2>
                    <span className="text-xs text-muted-foreground">Pond. usada: {totalWeight}%</span>
                  </div>
                  <span className={`text-base font-bold ${avg >= 4 ? "text-success" : "text-destructive"}`}>
                    Promedio: {avg.toFixed(1)}
                  </span>
                </div>

                {/* Categories */}
                {Object.entries(byCategory).map(([category, catGrades]) => {
                  const catWeight = catGrades.reduce((s, g) => s + g.weight, 0);
                  const catAvg = catWeight === 0 ? 0 : catGrades.reduce((s, g) => s + (g.maxScore === 0 ? 0 : (g.score / g.maxScore) * g.weight), 0) / catWeight * 7;

                  return (
                    <div key={category}>
                      <div className="flex items-center justify-between px-5 py-2 bg-muted/20">
                        <span className="text-xs font-medium text-foreground/80">
                          {CATEGORY_LABELS[category] || category}
                          <span className="text-muted-foreground ml-2">({catWeight}%)</span>
                        </span>
                        <span className={`text-xs font-semibold ${catAvg >= 4 ? "text-success" : "text-destructive"}`}>
                          {catAvg.toFixed(1)}
                        </span>
                      </div>
                      <div className="divide-y divide-border/30">
                        {catGrades.map((grade) => (
                          <div key={grade.id} className="group flex items-center justify-between px-5 py-2.5 hover:bg-muted/20 transition-colors">
                            <div>
                              <p className="text-sm text-foreground">{grade.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(grade.date).toLocaleDateString("es-CL", { day: "numeric", month: "short" })}
                                {" · "}{grade.weight}%
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`text-base font-bold ${(grade.maxScore === 0 ? 0 : grade.score / grade.maxScore * 7) >= 4 ? "text-success" : "text-destructive"}`}>
                                {grade.score}
                              </span>
                              <button
                                onClick={() => { if (!user?.uid) return; deleteGrade(user.uid, grade.id).then(() => setGrades(prev => prev.filter((g) => g.id !== grade.id))); }}
                                className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-all"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Dialog */}
      {showDialog && (
        <GradeDialogGlobal
          subjects={subjects}
          onClose={() => setShowDialog(false)}
          onSave={async (data) => {
            if (!user?.uid) return;
            const grade = await addGrade({ ...data, userId: user.uid });
            setGrades(prev => [grade, ...prev]);
            setShowDialog(false);
          }}
        />
      )}
    </div>
  );
}

function GradeDialogGlobal({ subjects, onClose, onSave }: {
  subjects: Subject[];
  onClose: () => void;
  onSave: (data: { subjectId: string; name: string; score: number; maxScore: number; weight: number; category: GradeCategory; date: Date }) => void;
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card border border-border rounded-2xl p-6 w-full max-w-md mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold text-foreground mb-1">Registrar nota</h3>
        <p className="text-sm text-muted-foreground mb-5">Ej: "Control 1" tipo Control/Quiz, 15% del ramo</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Subject selector - always visible from global page */}
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Asignatura *</label>
            <div className="relative">
              <select
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                className="w-full bg-muted border border-border rounded-lg px-3 py-2.5 text-sm text-foreground appearance-none focus:outline-none focus:border-ring cursor-pointer"
              >
                {subjects.map((s) => (
                  <option key={s.id} value={s.id} className="bg-muted">{s.name}</option>
                ))}
              </select>
              <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground rotate-90 pointer-events-none" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Nombre *</label>
              <input value={name} onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Control 1..."
                className="w-full bg-muted border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-ring" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Tipo</label>
              <div className="relative">
                <select value={category} onChange={(e) => setCategory(e.target.value as GradeCategory)}
                  className="w-full bg-muted border border-border rounded-lg px-3 py-2.5 text-sm text-foreground appearance-none focus:outline-none focus:border-ring cursor-pointer">
                  {categories.map((c) => (
                    <option key={c.value} value={c.value} className="bg-muted">{c.label}</option>
                  ))}
                </select>
                <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground rotate-90 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Nota *</label>
              <input type="number" step="0.1" min="1" max="7" value={score}
                onChange={(e) => setScore(e.target.value)} placeholder="4.5"
                className="w-full bg-muted border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-ring [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Nota máx.</label>
              <input type="number" step="0.1" value={maxScore}
                onChange={(e) => setMaxScore(e.target.value)}
                className="w-full bg-muted border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-ring [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Pond. (%) *</label>
              <input type="number" step="1" min="1" max="100" value={weight}
                onChange={(e) => setWeight(e.target.value)} placeholder="30"
                className="w-full bg-muted border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-ring [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none" />
            </div>
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Fecha</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
              className="w-full bg-muted border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-ring" />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={onClose} className="text-muted-foreground">Cancelar</Button>
            <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">Registrar nota</Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
