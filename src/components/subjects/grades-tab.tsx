"use client";

import { motion } from "framer-motion";
import { Loader2, Plus, BarChart3, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GradeDialog } from "@/components/subjects/grade-dialog";
import type { Grade, GradeCategory } from "@/lib/types";

export interface GradesTabProps {
  grades: Grade[];
  gradesByCategory: Record<string, Grade[]>;
  totalWeightUsed: number;
  weightedAverage: number;
  loadingGrades: boolean;
  showGradeDialog: boolean;
  onSetShowGradeDialog: (show: boolean) => void;
  onDeleteGrade: (gradeId: string) => void;
  onSaveGrade: (data: {
    name: string;
    score: number;
    maxScore: number;
    weight: number;
    category: GradeCategory;
    date: Date;
  }) => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  solemne: "Solemne",
  examen: "Examen",
  control: "Control/Quiz",
  tarea: "Tarea",
  proyecto: "Proyecto",
  otro: "Otro",
};

export function GradesTab({
  grades,
  gradesByCategory,
  totalWeightUsed,
  weightedAverage,
  loadingGrades,
  showGradeDialog,
  onSetShowGradeDialog,
  onDeleteGrade,
  onSaveGrade,
}: GradesTabProps) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <p className="text-sm text-slate-400">
            Pond. usada: <span className={totalWeightUsed > 100 ? "text-red-400" : "text-white"}>{totalWeightUsed}%</span>
          </p>
          {weightedAverage > 0 && (
            <p className="text-sm">
              Promedio: <span className={`font-bold ${weightedAverage >= 4 ? "text-emerald-400" : "text-red-400"}`}>
                {weightedAverage.toFixed(1)}
              </span>
            </p>
          )}
        </div>
        <Button
          size="sm"
          onClick={() => onSetShowGradeDialog(true)}
          className="bg-violet-600 hover:bg-violet-700 text-white"
        >
          <Plus className="w-4 h-4 mr-1" /> Registrar nota
        </Button>
      </div>

      {loadingGrades ? (
        <div className="flex justify-center py-10">
          <Loader2 className="w-6 h-6 text-violet-500 animate-spin" />
        </div>
      ) : grades.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-slate-700 rounded-xl">
          <BarChart3 className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 font-medium">Sin notas registradas</p>
          <p className="text-xs text-slate-500 mt-1">Registra una evaluacion para comenzar</p>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(gradesByCategory).map(([category, categoryGrades]) => {
            const categoryWeight = categoryGrades.reduce((s, g) => s + g.weight, 0);
            const categoryAvg = categoryWeight === 0 ? 0 : categoryGrades.reduce((s, g) => s + (g.maxScore === 0 ? 0 : (g.score / g.maxScore) * g.weight), 0) / categoryWeight * 7;
            return (
              <div key={category} className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 bg-slate-800/30">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-white">
                      {CATEGORY_LABELS[category] || category}
                    </span>
                    <span className="text-xs text-slate-400">({categoryWeight}% del ramo)</span>
                  </div>
                  <span className={`text-sm font-bold ${categoryAvg >= 4 ? "text-emerald-400" : "text-red-400"}`}>
                    {categoryAvg.toFixed(1)}
                  </span>
                </div>
                <div className="divide-y divide-slate-800/50">
                  {categoryGrades.map((grade) => (
                    <div key={grade.id} className="group flex items-center justify-between px-4 py-3 hover:bg-slate-800/30 transition-colors">
                      <div>
                        <p className="text-sm text-white font-medium">{grade.name}</p>
                        <p className="text-xs text-slate-500">
                          {new Date(grade.date).toLocaleDateString("es-CL", { day: "numeric", month: "short", year: "numeric" })}
                          {" · "}{grade.weight}%
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-lg font-bold ${(grade.maxScore === 0 ? 0 : grade.score / grade.maxScore * 7) >= 4 ? "text-emerald-400" : "text-red-400"}`}>
                          {grade.score}
                        </span>
                        <button
                          onClick={() => onDeleteGrade(grade.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-red-500/20 text-slate-500 hover:text-red-400 transition-all"
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
        </div>
      )}

      {/* Grade Dialog */}
      <GradeDialog
        open={showGradeDialog}
        onClose={() => onSetShowGradeDialog(false)}
        onSave={onSaveGrade}
      />
    </motion.div>
  );
}
