"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  ClipboardList, Plus, Loader2, Trash2, Check, Calendar,
  AlertCircle, ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAppStore } from "@/lib/store";
import { getSubjects } from "@/lib/firebase/subjects";
import { getAllPendings, addPending, updatePending, deletePending } from "@/lib/firebase/pendings";
import type { Pending, PendingType, PendingStatus, Subject } from "@/lib/types";

const PENDING_LABELS: Record<string, string> = {
  tarea: "Tarea", prueba: "Prueba", entrega: "Entrega", otro: "Otro",
};

export default function PendingsPage() {
  const { user, subjects, setSubjects } = useAppStore();
  const [pendings, setPendings] = useState<Pending[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [filter, setFilter] = useState<"all" | "active" | "completed">("active");

  useEffect(() => {
    if (!user?.uid) return;
    Promise.all([
      subjects.length === 0 ? getSubjects(user.uid).then((s) => { setSubjects(s); return s; }) : Promise.resolve(subjects),
      getAllPendings(user.uid),
    ])
      .then(([, p]) => setPendings(p))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user?.uid]);

  const filtered = useMemo(() => {
    if (filter === "active") return pendings.filter((p) => p.status !== "completed");
    if (filter === "completed") return pendings.filter((p) => p.status === "completed");
    return pendings;
  }, [pendings, filter]);

  // Group by subject
  const groupedBySubject = useMemo(() => {
    const map: Record<string, Pending[]> = {};
    filtered.forEach((p) => {
      if (!map[p.subjectId]) map[p.subjectId] = [];
      map[p.subjectId].push(p);
    });
    return map;
  }, [filtered]);

  function getSubject(id: string): Subject | undefined {
    return subjects.find((s) => s.id === id);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Pendientes</h1>
          <p className="text-sm text-slate-400 mt-1">Tareas, pruebas y entregas</p>
        </div>
        <Button
          onClick={() => setShowDialog(true)}
          className="bg-violet-600 hover:bg-violet-700 text-white"
        >
          <Plus className="w-4 h-4 mr-1" /> Nuevo pendiente
        </Button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 bg-slate-900/50 p-1 rounded-lg border border-slate-800 w-fit">
        {(["active", "all", "completed"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              filter === f ? "bg-violet-600 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            {f === "active" ? "Activos" : f === "all" ? "Todos" : "Completados"}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-slate-700 rounded-xl">
          <ClipboardList className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 font-medium">
            {filter === "completed" ? "Sin pendientes completados" : "Sin pendientes activos"}
          </p>
          <p className="text-sm text-slate-500 mt-1">Todo al día</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedBySubject).map(([subjectId, subjectPendings]) => {
            const subject = getSubject(subjectId);
            return (
              <motion.div
                key={subjectId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: subject?.color || "#8b5cf6" }}
                  />
                  <h2 className="text-sm font-semibold text-white">{subject?.name || "Asignatura"}</h2>
                </div>
                <div className="space-y-2">
                  {subjectPendings.map((pending) => {
                    const isOverdue = new Date(pending.dueDate) < new Date() && pending.status !== "completed";
                    const isCompleted = pending.status === "completed";
                    return (
                      <div
                        key={pending.id}
                        className={`group flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
                          isCompleted
                            ? "bg-slate-900/30 border-slate-800/50 opacity-60"
                            : isOverdue
                            ? "bg-red-950/20 border-red-500/20"
                            : "bg-slate-900/50 border-slate-800 hover:border-slate-700"
                        }`}
                      >
                        <button
                          onClick={() => {
                            const newStatus: PendingStatus = isCompleted ? "pending" : "completed";
                            updatePending(pending.id, { status: newStatus }).then(() => {
                              setPendings(pendings.map((p) => p.id === pending.id ? { ...p, status: newStatus } : p));
                            });
                          }}
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                            isCompleted ? "bg-emerald-500 border-emerald-500" : "border-slate-600 hover:border-violet-500"
                          }`}
                        >
                          {isCompleted && <Check className="w-3 h-3 text-white" />}
                        </button>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium ${isCompleted ? "line-through text-slate-500" : "text-white"}`}>
                            {pending.title}
                          </p>
                          {pending.description && (
                            <p className="text-xs text-slate-500 truncate">{pending.description}</p>
                          )}
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-slate-700 text-slate-400">
                              {PENDING_LABELS[pending.type] || pending.type}
                            </Badge>
                            <span className={`text-xs flex items-center gap-1 ${isOverdue ? "text-red-400" : "text-slate-500"}`}>
                              {isOverdue ? <AlertCircle className="w-3 h-3" /> : <Calendar className="w-3 h-3" />}
                              {new Date(pending.dueDate).toLocaleDateString("es-CL", { day: "numeric", month: "short" })}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => deletePending(pending.id).then(() => setPendings(pendings.filter((p) => p.id !== pending.id)))}
                          className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-red-500/20 text-slate-500 hover:text-red-400 transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Dialog */}
      {showDialog && (
        <PendingDialogGlobal
          subjects={subjects}
          onClose={() => setShowDialog(false)}
          onSave={async (data) => {
            if (!user?.uid) return;
            const pending = await addPending({ ...data, userId: user.uid });
            setPendings([...pendings, pending]);
            setShowDialog(false);
          }}
        />
      )}
    </div>
  );
}

function PendingDialogGlobal({ subjects, onClose, onSave }: {
  subjects: Subject[];
  onClose: () => void;
  onSave: (data: { subjectId: string; title: string; description?: string; type: PendingType; dueDate: Date; status: PendingStatus }) => void;
}) {
  const [subjectId, setSubjectId] = useState(subjects[0]?.id || "");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<PendingType>("tarea");
  const [dueDate, setDueDate] = useState(new Date().toISOString().split("T")[0]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !subjectId) return;
    onSave({
      subjectId,
      title: title.trim(),
      description: description.trim() || undefined,
      type,
      dueDate: new Date(dueDate),
      status: "pending",
    });
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
            <label className="text-xs text-slate-400 mb-1 block">Asignatura *</label>
            <div className="relative">
              <select value={subjectId} onChange={(e) => setSubjectId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white appearance-none focus:outline-none focus:border-violet-500 cursor-pointer">
                {subjects.map((s) => (
                  <option key={s.id} value={s.id} className="bg-slate-800">{s.name}</option>
                ))}
              </select>
              <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 rotate-90 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 mb-1 block">Título *</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Entregar informe, Estudiar capítulo 3..."
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500" />
          </div>

          <div>
            <label className="text-xs text-slate-400 mb-1 block">Descripción</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalles opcionales..." rows={2}
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
              <label className="text-xs text-slate-400 mb-1 block">Fecha límite *</label>
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
