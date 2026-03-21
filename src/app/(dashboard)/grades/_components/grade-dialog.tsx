"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { GradeCategory, Subject } from "@/lib/types";

export interface GradeDialogGlobalProps {
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
}

export function GradeDialogGlobal({
  subjects,
  onClose,
  onSave,
}: GradeDialogGlobalProps) {
  const [subjectId, setSubjectId] = useState(subjects[0]?.id || "");
  const [name, setName] = useState("");
  const [score, setScore] = useState("");
  const [maxScore, setMaxScore] = useState("7.0");
  const [weight, setWeight] = useState("");
  const [category, setCategory] = useState<GradeCategory>("control");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [errors, setErrors] = useState<{ score?: string; maxScore?: string; weight?: string }>({});

  function validate(): boolean {
    const newErrors: typeof errors = {};
    const s = parseFloat(score);
    const m = parseFloat(maxScore);
    const w = parseFloat(weight);

    if (isNaN(s) || s < 1.0 || s > 7.0) {
      newErrors.score = "La nota debe estar entre 1.0 y 7.0";
    }
    if (isNaN(m) || m < 1.0 || m > 7.0) {
      newErrors.maxScore = "La nota máxima debe estar entre 1.0 y 7.0";
    }
    if (isNaN(w) || w < 1 || w > 100) {
      newErrors.weight = "La ponderación debe estar entre 1 y 100";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !score || !weight || !subjectId) return;
    if (!validate()) return;
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
                onChange={(e) => { setScore(e.target.value); setErrors((prev) => ({ ...prev, score: undefined })); }}
                placeholder="4.5"
                className="w-full bg-muted border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-ring [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
              {errors.score && <p className="text-xs text-destructive mt-1">{errors.score}</p>}
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Nota máx.</label>
              <input
                type="number"
                step="0.1"
                min="1"
                max="7"
                value={maxScore}
                onChange={(e) => { setMaxScore(e.target.value); setErrors((prev) => ({ ...prev, maxScore: undefined })); }}
                className="w-full bg-muted border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-ring [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
              {errors.maxScore && <p className="text-xs text-destructive mt-1">{errors.maxScore}</p>}
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Pond. (%) *</label>
              <input
                type="number"
                step="1"
                min="1"
                max="100"
                value={weight}
                onChange={(e) => { setWeight(e.target.value); setErrors((prev) => ({ ...prev, weight: undefined })); }}
                placeholder="30"
                className="w-full bg-muted border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-ring [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
              {errors.weight && <p className="text-xs text-destructive mt-1">{errors.weight}</p>}
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
