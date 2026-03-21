"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Grade, GradeCategory } from "@/lib/types";

export interface GradeDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: {
    name: string;
    score: number;
    maxScore: number;
    weight: number;
    category: GradeCategory;
    date: Date;
  }) => void;
  editingGrade?: Grade | null;
}

export function GradeDialog({ open, onClose, onSave, editingGrade }: GradeDialogProps) {
  const [name, setName] = useState("");
  const [score, setScore] = useState("");
  const [maxScore, setMaxScore] = useState("7.0");
  const [weight, setWeight] = useState("");
  const [category, setCategory] = useState<GradeCategory>("control");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  useEffect(() => {
    if (open) {
      if (editingGrade) {
        setName(editingGrade.name);
        setScore(String(editingGrade.score));
        setMaxScore(String(editingGrade.maxScore));
        setWeight(String(editingGrade.weight));
        setCategory(editingGrade.category);
        const d = new Date(editingGrade.date);
        setDate(d.toISOString().split("T")[0]);
      } else {
        setName("");
        setScore("");
        setMaxScore("7.0");
        setWeight("");
        setCategory("control");
        setDate(new Date().toISOString().split("T")[0]);
      }
    }
  }, [open, editingGrade]);

  if (!open) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !score || !weight) return;
    onSave({
      name: name.trim(),
      score: parseFloat(score),
      maxScore: parseFloat(maxScore),
      weight: parseFloat(weight),
      category,
      date: new Date(date + "T12:00:00"),
    });
    setName(""); setScore(""); setWeight(""); setCategory("control");
  }

  const categories: { value: GradeCategory; label: string }[] = [
    { value: "solemne", label: "Solemne" },
    { value: "examen", label: "Examen" },
    { value: "control", label: "Control/Quiz" },
    { value: "tarea", label: "Tarea" },
    { value: "proyecto", label: "Proyecto" },
    { value: "otro", label: "Otro" },
  ];

  const isEditing = !!editingGrade;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm overflow-y-auto py-8" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card border border-border rounded-2xl p-6 w-full max-w-md mx-4 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold text-foreground mb-1">
          {isEditing ? "Editar nota" : "Registrar nota"}
        </h3>
        <p className="text-sm text-muted-foreground mb-5">
          {isEditing ? "Modifica los datos de la evaluación" : 'Ej: "Control 1" tipo Control/Quiz, 15% de la asignatura'}
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 sm:col-span-1">
              <label className="text-xs text-muted-foreground mb-1 block">Nombre *</label>
              <input value={name} onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Control 1, Solemne 2..."
                className="w-full bg-muted border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-ring" />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="text-xs text-muted-foreground mb-1 block">Tipo</label>
              <Select value={category} onValueChange={(v) => setCategory(v as GradeCategory)}>
                <SelectTrigger className="w-full bg-muted border-border text-foreground">
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {categories.map((c) => (
                    <SelectItem key={c.value} value={c.value} className="text-foreground">{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Nota *</label>
              <input type="number" step="0.1" min="1" max="7" value={score}
                onChange={(e) => setScore(e.target.value)}
                placeholder="4.5"
                className="w-full bg-muted border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-ring [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Nota max.</label>
              <input type="number" step="0.1" value={maxScore}
                onChange={(e) => setMaxScore(e.target.value)}
                className="w-full bg-muted border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-ring [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Pond. (%) *</label>
              <input type="number" step="1" min="1" max="100" value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="30"
                className="w-full bg-muted border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-ring [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none" />
              <p className="text-[10px] text-muted-foreground mt-1">% sobre el total de la asignatura</p>
            </div>
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Fecha</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
              className="w-full bg-muted border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-ring" />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={onClose} className="text-muted-foreground">Cancelar</Button>
            <Button type="submit" className="bg-primary hover:bg-primary/90 text-foreground">
              {isEditing ? "Guardar cambios" : "Registrar nota"}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
