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
import type { PendingType, PendingStatus } from "@/lib/types";

export interface PendingDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: {
    title: string;
    description?: string;
    type: PendingType;
    dueDate: Date;
    status: PendingStatus;
  }) => void;
}

export function PendingDialog({ open, onClose, onSave }: PendingDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<PendingType>("tarea");
  const [dueDate, setDueDate] = useState(new Date().toISOString().split("T")[0]);

  if (!open) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({
      title: title.trim(),
      description: description.trim() || undefined,
      type,
      dueDate: new Date(dueDate + "T12:00:00"),
      status: "pending",
    });
    setTitle(""); setDescription(""); setType("tarea");
  }

  const types: { value: PendingType; label: string }[] = [
    { value: "tarea", label: "Tarea" },
    { value: "prueba", label: "Prueba" },
    { value: "entrega", label: "Entrega" },
    { value: "otro", label: "Otro" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 py-8" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card border border-border rounded-2xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold text-foreground mb-4">Nuevo pendiente</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Titulo *</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Entregar informe, Estudiar capitulo 3..."
              className="w-full bg-muted border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-ring" />
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Descripcion</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalles opcionales..."
              rows={2}
              className="w-full bg-muted border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-ring resize-none" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Tipo</label>
              <Select value={type} onValueChange={(v) => setType(v as PendingType)}>
                <SelectTrigger className="w-full bg-muted border-border text-foreground">
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {types.map((t) => (
                    <SelectItem key={t.value} value={t.value} className="text-foreground">{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Fecha limite *</label>
              <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-muted border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-ring" />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={onClose} className="text-muted-foreground">Cancelar</Button>
            <Button type="submit" className="bg-primary hover:bg-primary/90 text-foreground">Crear pendiente</Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
