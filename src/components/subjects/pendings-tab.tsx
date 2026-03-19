"use client";

import { motion } from "framer-motion";
import {
  Loader2, Plus, ClipboardList, Trash2,
  Calendar, Check, AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PendingDialog } from "@/components/subjects/pending-dialog";
import type { Pending, PendingType, PendingStatus } from "@/lib/types";

export interface PendingsTabProps {
  pendings: Pending[];
  loadingPendings: boolean;
  showPendingDialog: boolean;
  onSetShowPendingDialog: (show: boolean) => void;
  onTogglePendingStatus: (pendingId: string, newStatus: PendingStatus) => void;
  onDeletePending: (pendingId: string) => void;
  onSavePending: (data: {
    title: string;
    description?: string;
    type: PendingType;
    dueDate: Date;
    status: PendingStatus;
  }) => void;
}

const PENDING_LABELS: Record<string, string> = {
  tarea: "Tarea",
  prueba: "Prueba",
  entrega: "Entrega",
  otro: "Otro",
};

export function PendingsTab({
  pendings,
  loadingPendings,
  showPendingDialog,
  onSetShowPendingDialog,
  onTogglePendingStatus,
  onDeletePending,
  onSavePending,
}: PendingsTabProps) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">
          {pendings.filter((p) => p.status !== "completed").length} pendientes activos
        </p>
        <Button
          size="sm"
          onClick={() => onSetShowPendingDialog(true)}
          className="bg-violet-600 hover:bg-violet-700 text-white"
        >
          <Plus className="w-4 h-4 mr-1" /> Nuevo pendiente
        </Button>
      </div>

      {loadingPendings ? (
        <div className="flex justify-center py-10">
          <Loader2 className="w-6 h-6 text-violet-500 animate-spin" />
        </div>
      ) : pendings.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-slate-700 rounded-xl">
          <ClipboardList className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 font-medium">Sin pendientes</p>
          <p className="text-xs text-slate-500 mt-1">Todo al dia</p>
        </div>
      ) : (
        <div className="space-y-2">
          {pendings.map((pending) => {
            const today = new Date();
            today.setHours(23, 59, 59, 999);
            const isOverdue = new Date(pending.dueDate) < today && pending.status !== "completed";
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
                    onTogglePendingStatus(pending.id, newStatus);
                  }}
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                    isCompleted
                      ? "bg-emerald-500 border-emerald-500"
                      : "border-slate-600 hover:border-violet-500"
                  }`}
                >
                  {isCompleted && <Check className="w-3 h-3 text-white" />}
                </button>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${isCompleted ? "line-through text-slate-500" : "text-white"}`}>
                    {pending.title}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
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
                  onClick={() => onDeletePending(pending.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-red-500/20 text-slate-500 hover:text-red-400 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Pending Dialog */}
      <PendingDialog
        open={showPendingDialog}
        onClose={() => onSetShowPendingDialog(false)}
        onSave={onSavePending}
      />
    </motion.div>
  );
}
