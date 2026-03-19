"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold text-white mb-4">Nuevo pendiente</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Titulo *</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Entregar informe, Estudiar capitulo 3..."
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500" />
          </div>

          <div>
            <label className="text-xs text-slate-400 mb-1 block">Descripcion</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalles opcionales..."
              rows={2}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 resize-none" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Tipo</label>
              <div className="relative">
                <select value={type} onChange={(e) => setType(e.target.value as PendingType)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white appearance-none focus:outline-none focus:border-violet-500 cursor-pointer">
                  {types.map((t) => (
                    <option key={t.value} value={t.value} className="bg-slate-800">{t.label}</option>
                  ))}
                </select>
                <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 rotate-90 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Fecha limite *</label>
              <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500" />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={onClose} className="text-slate-400">Cancelar</Button>
            <Button type="submit" className="bg-violet-600 hover:bg-violet-700 text-white">Crear pendiente</Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
