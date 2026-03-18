"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Clock, MapPin, Trash2, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppStore } from "@/lib/store";
import { getScheduleBlocks, addScheduleBlock, deleteScheduleBlock } from "@/lib/firebase/schedule";
import type { ScheduleBlock } from "@/lib/types";

const DAYS = [
  { key: "mon", label: "Lunes" },
  { key: "tue", label: "Martes" },
  { key: "wed", label: "Miercoles" },
  { key: "thu", label: "Jueves" },
  { key: "fri", label: "Viernes" },
  { key: "sat", label: "Sabado" },
] as const;

const HOURS = Array.from({ length: 15 }, (_, i) => {
  const hour = i + 7;
  return `${String(hour).padStart(2, "0")}:00`;
});

export default function SchedulePage() {
  const { user, subjects } = useAppStore();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [blocks, setBlocks] = useState<ScheduleBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [newBlock, setNewBlock] = useState({
    subjectId: "",
    day: "mon" as ScheduleBlock["day"],
    startTime: "08:00",
    endTime: "09:30",
    room: "",
    type: "class" as ScheduleBlock["type"],
  });

  // Load blocks from Firestore
  useEffect(() => {
    if (!user?.uid) return;
    setLoading(true);
    getScheduleBlocks(user.uid)
      .then(setBlocks)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user?.uid]);

  async function handleAddBlock() {
    if (!newBlock.subjectId || !user?.uid) return;

    const block: ScheduleBlock = {
      id: crypto.randomUUID(),
      ...newBlock,
    };

    try {
      await addScheduleBlock(user.uid, block);
      setBlocks([...blocks, block]);
      setDialogOpen(false);
    } catch (err) {
      console.error("Error adding block:", err);
    }
  }

  async function handleDeleteBlock(blockId: string) {
    if (!user?.uid) return;
    try {
      await deleteScheduleBlock(user.uid, blockId);
      setBlocks(blocks.filter((b) => b.id !== blockId));
    } catch (err) {
      console.error("Error deleting block:", err);
    }
  }

  function getBlocksForDay(day: string) {
    return blocks
      .filter((b) => b.day === day)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }

  function getSubjectForBlock(block: ScheduleBlock) {
    return subjects.find((s) => s.id === block.subjectId);
  }

  function getHourPosition(time: string) {
    const [h, m] = time.split(":").map(Number);
    return ((h - 7) * 60 + m) / 60;
  }

  function getBlockHeight(start: string, end: string) {
    return getHourPosition(end) - getHourPosition(start);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Horario</h1>
          <p className="text-slate-400 mt-1">Organiza tu semana academica</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger render={<Button className="bg-gradient-to-r from-blue-600 to-purple-600" />}>
              <Plus className="w-4 h-4 mr-2" />
              Agregar bloque
          </DialogTrigger>
          <DialogContent className="bg-slate-900 border-slate-700">
            <DialogHeader>
              <DialogTitle className="text-white">Agregar bloque horario</DialogTitle>
              <DialogDescription className="text-slate-400">
                Agrega una clase a tu horario semanal
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label className="text-slate-300">Ramo</Label>
                <Select
                  value={newBlock.subjectId}
                  onValueChange={(v) => setNewBlock({ ...newBlock, subjectId: v ?? "" })}
                >
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                    <SelectValue placeholder="Selecciona un ramo" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-700">
                    {subjects.map((s) => (
                      <SelectItem key={s.id} value={s.id} className="text-white">
                        {s.code} - {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-300">Dia</Label>
                  <Select
                    value={newBlock.day}
                    onValueChange={(v) => v && setNewBlock({ ...newBlock, day: v as ScheduleBlock["day"] })}
                  >
                    <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-700">
                      {DAYS.map((d) => (
                        <SelectItem key={d.key} value={d.key} className="text-white">
                          {d.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300">Tipo</Label>
                  <Select
                    value={newBlock.type}
                    onValueChange={(v) => v && setNewBlock({ ...newBlock, type: v as ScheduleBlock["type"] })}
                  >
                    <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-700">
                      <SelectItem value="class" className="text-white">Clase</SelectItem>
                      <SelectItem value="lab" className="text-white">Laboratorio</SelectItem>
                      <SelectItem value="tutorial" className="text-white">Ayudantia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-300">Inicio</Label>
                  <Input
                    type="time"
                    value={newBlock.startTime}
                    onChange={(e) => setNewBlock({ ...newBlock, startTime: e.target.value })}
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300">Fin</Label>
                  <Input
                    type="time"
                    value={newBlock.endTime}
                    onChange={(e) => setNewBlock({ ...newBlock, endTime: e.target.value })}
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Sala (opcional)</Label>
                <Input
                  placeholder="Ej: A-201"
                  value={newBlock.room}
                  onChange={(e) => setNewBlock({ ...newBlock, room: e.target.value })}
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
              <Button onClick={handleAddBlock} className="w-full bg-gradient-to-r from-blue-600 to-purple-600">
                Agregar bloque
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        </div>
      ) : (
        <>
          {/* Schedule grid */}
          <Card className="bg-slate-900/50 border-slate-800 overflow-hidden">
            <CardContent className="p-0">
              <div className="grid grid-cols-[60px_repeat(6,1fr)] min-h-[600px]">
                {/* Time column */}
                <div className="border-r border-slate-800">
                  <div className="h-12 border-b border-slate-800" />
                  {HOURS.map((hour) => (
                    <div
                      key={hour}
                      className="h-16 border-b border-slate-800/50 px-2 flex items-start justify-end pt-1"
                    >
                      <span className="text-xs text-slate-500">{hour}</span>
                    </div>
                  ))}
                </div>

                {/* Day columns */}
                {DAYS.map((day) => (
                  <div key={day.key} className="border-r border-slate-800/50 last:border-r-0">
                    <div className="h-12 border-b border-slate-800 flex items-center justify-center">
                      <span className="text-sm font-medium text-slate-300">{day.label}</span>
                    </div>
                    <div className="relative">
                      {HOURS.map((hour) => (
                        <div key={hour} className="h-16 border-b border-slate-800/30" />
                      ))}
                      {getBlocksForDay(day.key).map((block) => {
                        const subject = getSubjectForBlock(block);
                        const top = getHourPosition(block.startTime) * 64;
                        const height = getBlockHeight(block.startTime, block.endTime) * 64;
                        return (
                          <motion.div
                            key={block.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="absolute left-1 right-1 rounded-lg p-2 overflow-hidden cursor-pointer hover:brightness-110 transition-all group"
                            style={{
                              top: `${top}px`,
                              height: `${height}px`,
                              backgroundColor: subject?.color || "#3B82F6",
                              opacity: 0.9,
                            }}
                          >
                            <p className="text-xs font-semibold text-white truncate">
                              {subject?.code}
                            </p>
                            <p className="text-[10px] text-white/80 truncate">
                              {block.startTime} - {block.endTime}
                            </p>
                            {block.room && (
                              <p className="text-[10px] text-white/70 flex items-center gap-0.5 mt-0.5">
                                <MapPin className="w-2.5 h-2.5" />
                                {block.room}
                              </p>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteBlock(block.id);
                              }}
                              className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-black/30 rounded p-0.5"
                            >
                              <Trash2 className="w-3 h-3 text-white" />
                            </button>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {blocks.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8"
            >
              <Clock className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">
                {subjects.length === 0
                  ? "Primero crea un ramo para poder agregar bloques horarios"
                  : "Agrega bloques a tu horario para visualizar tu semana"
                }
              </p>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
}
