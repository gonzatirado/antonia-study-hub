"use client";

import { Plus } from "lucide-react";
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
import type { ScheduleBlock } from "@/lib/types";

const DAYS = [
  { key: "mon", label: "Lunes" },
  { key: "tue", label: "Martes" },
  { key: "wed", label: "Miercoles" },
  { key: "thu", label: "Jueves" },
  { key: "fri", label: "Viernes" },
  { key: "sat", label: "Sabado" },
] as const;

interface Subject {
  id: string;
  code: string;
  name: string;
}

interface NewBlockForm {
  subjectId: string;
  day: ScheduleBlock["day"];
  startTime: string;
  endTime: string;
  room: string;
  type: ScheduleBlock["type"];
}

interface AddBlockDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subjects: Subject[];
  newBlock: NewBlockForm;
  onNewBlockChange: (block: NewBlockForm) => void;
  onAddBlock: () => void;
}

export function AddBlockDialog({
  open,
  onOpenChange,
  subjects,
  newBlock,
  onNewBlockChange,
  onAddBlock,
}: AddBlockDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
              onValueChange={(v) => onNewBlockChange({ ...newBlock, subjectId: v ?? "" })}
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
                onValueChange={(v) => v && onNewBlockChange({ ...newBlock, day: v as ScheduleBlock["day"] })}
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
                onValueChange={(v) => v && onNewBlockChange({ ...newBlock, type: v as ScheduleBlock["type"] })}
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
                min="07:00"
                max="21:00"
                value={newBlock.startTime}
                onChange={(e) => onNewBlockChange({ ...newBlock, startTime: e.target.value })}
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Fin</Label>
              <Input
                type="time"
                min="07:00"
                max="21:00"
                value={newBlock.endTime}
                onChange={(e) => onNewBlockChange({ ...newBlock, endTime: e.target.value })}
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-slate-300">Sala (opcional)</Label>
            <Input
              placeholder="Ej: A-201"
              value={newBlock.room}
              onChange={(e) => onNewBlockChange({ ...newBlock, room: e.target.value })}
              className="bg-slate-800 border-slate-700 text-white"
            />
          </div>
          <Button onClick={onAddBlock} className="w-full bg-gradient-to-r from-blue-600 to-purple-600">
            Agregar bloque
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export type { NewBlockForm };
