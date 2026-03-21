"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  ClipboardList, Plus, Loader2, Trash2, Check, Calendar,
  AlertCircle,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAppStore } from "@/lib/store";
import { useEnsureSubjects } from "@/hooks/use-ensure-subjects";
import { getAllPendings, addPending, updatePending, deletePending } from "@/lib/firebase/pendings";
import * as Sentry from "@sentry/nextjs";
import type { Pending, PendingType, PendingStatus, Subject } from "@/lib/types";

const PENDING_LABELS: Record<string, string> = {
  tarea: "Tarea", prueba: "Prueba", entrega: "Entrega", otro: "Otro",
};

export default function PendingsPage() {
  const { user } = useAppStore();
  const subjects = useEnsureSubjects();
  const [pendings, setPendings] = useState<Pending[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [filter, setFilter] = useState<"all" | "active" | "completed">("active");

  useEffect(() => {
    if (!user?.uid) return;
    getAllPendings(user.uid)
      .then((p) => setPendings(p))
      .catch((err) => Sentry.captureException(err))
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
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between page-header">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pendientes</h1>
          <p className="text-sm text-muted-foreground mt-1">Tareas, pruebas y entregas</p>
        </div>
        <Button
          onClick={() => setShowDialog(true)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <Plus className="w-4 h-4 mr-1" /> Nuevo pendiente
        </Button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 bg-card/50 p-1 rounded-lg border border-border w-fit">
        {(["active", "all", "completed"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              filter === f ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {f === "active" ? "Activos" : f === "all" ? "Todos" : "Completados"}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-border/40 rounded-xl">
          <ClipboardList className="w-12 h-12 text-muted-foreground/60 mx-auto mb-3" />
          <p className="text-muted-foreground font-medium">
            {filter === "completed" ? "Sin pendientes completados" : "Sin pendientes activos"}
          </p>
          <p className="text-sm text-muted-foreground mt-1">Todo al día</p>
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
                  <h2 className="text-sm font-semibold text-foreground">{subject?.name || "Asignatura"}</h2>
                </div>
                <div className="space-y-2">
                  {subjectPendings.map((pending) => {
                    const today = new Date();
                    today.setHours(23, 59, 59, 999);
                    const isOverdue = new Date(pending.dueDate) < today && pending.status !== "completed";
                    const isCompleted = pending.status === "completed";
                    return (
                      <div
                        key={pending.id}
                        className={`group flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
                          isCompleted
                            ? "bg-card/30 border-border opacity-60"
                            : isOverdue
                            ? "bg-destructive/20 border-destructive/30"
                            : "bg-card/50 border-border hover:border-muted-foreground/50"
                        }`}
                      >
                        <button
                          onClick={() => {
                            if (!user?.uid) return;
                            const newStatus: PendingStatus = isCompleted ? "pending" : "completed";
                            updatePending(user.uid, pending.id, { status: newStatus }).then(() => {
                              setPendings(prev => prev.map((p) => p.id === pending.id ? { ...p, status: newStatus } : p));
                            });
                          }}
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                            isCompleted ? "bg-success border-success" : "border-muted-foreground/60 hover:border-primary"
                          }`}
                        >
                          {isCompleted && <Check className="w-3 h-3 text-foreground" />}
                        </button>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium ${isCompleted ? "line-through text-muted-foreground" : "text-foreground"}`}>
                            {pending.title}
                          </p>
                          {pending.description && (
                            <p className="text-xs text-muted-foreground truncate">{pending.description}</p>
                          )}
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-border text-muted-foreground">
                              {PENDING_LABELS[pending.type] || pending.type}
                            </Badge>
                            <span className={`text-xs flex items-center gap-1 ${isOverdue ? "text-destructive" : "text-muted-foreground"}`}>
                              {isOverdue ? <AlertCircle className="w-3 h-3" /> : <Calendar className="w-3 h-3" />}
                              {new Date(pending.dueDate).toLocaleDateString("es-CL", { day: "numeric", month: "short" })}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => { if (!user?.uid) return; deletePending(user.uid, pending.id).then(() => setPendings(prev => prev.filter((p) => p.id !== pending.id))); }}
                          className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-all"
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
            setPendings(prev => [...prev, pending]);
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
  const [subjectId, setSubjectId] = useState("");
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
      dueDate: new Date(dueDate + "T12:00:00"),
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md py-8" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card border border-border rounded-2xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold text-foreground mb-4">Nuevo pendiente</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Asignatura *</label>
            <Select value={subjectId} onValueChange={(v) => setSubjectId(v as string)}>
              <SelectTrigger className="w-full bg-muted border-border text-foreground">
                <SelectValue placeholder="Seleccionar asignatura" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                {subjects.map((s) => (
                  <SelectItem key={s.id} value={s.id} className="text-foreground">{s.code} — {s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Título *</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Entregar informe, Estudiar capítulo 3..."
              className="w-full bg-muted border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-ring" />
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Descripción</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalles opcionales..." rows={2}
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
              <label className="text-xs text-muted-foreground mb-1 block">Fecha límite *</label>
              <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-muted border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-ring" />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={onClose} className="text-muted-foreground">Cancelar</Button>
            <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">Crear pendiente</Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
