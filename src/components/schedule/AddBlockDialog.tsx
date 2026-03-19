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
      <DialogTrigger render={<Button className="bg-primary" />}>
        <Plus className="w-4 h-4 mr-2" />
        Agregar bloque
      </DialogTrigger>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Agregar bloque horario</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Agrega una clase a tu horario semanal
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label className="text-foreground/80">Ramo</Label>
            <Select
              value={newBlock.subjectId}
              onValueChange={(v) => onNewBlockChange({ ...newBlock, subjectId: v ?? "" })}
            >
              <SelectTrigger className="bg-muted border-border text-foreground">
                <SelectValue placeholder="Selecciona un ramo" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                {subjects.map((s) => (
                  <SelectItem key={s.id} value={s.id} className="text-foreground">
                    {s.code} - {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-foreground/80">Dia</Label>
              <Select
                value={newBlock.day}
                onValueChange={(v) => v && onNewBlockChange({ ...newBlock, day: v as ScheduleBlock["day"] })}
              >
                <SelectTrigger className="bg-muted border-border text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {DAYS.map((d) => (
                    <SelectItem key={d.key} value={d.key} className="text-foreground">
                      {d.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-foreground/80">Tipo</Label>
              <Select
                value={newBlock.type}
                onValueChange={(v) => v && onNewBlockChange({ ...newBlock, type: v as ScheduleBlock["type"] })}
              >
                <SelectTrigger className="bg-muted border-border text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="class" className="text-foreground">Clase</SelectItem>
                  <SelectItem value="lab" className="text-foreground">Laboratorio</SelectItem>
                  <SelectItem value="tutorial" className="text-foreground">Ayudantia</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-foreground/80">Inicio</Label>
              <Input
                type="time"
                min="07:00"
                max="21:00"
                value={newBlock.startTime}
                onChange={(e) => onNewBlockChange({ ...newBlock, startTime: e.target.value })}
                className="bg-muted border-border text-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground/80">Fin</Label>
              <Input
                type="time"
                min="07:00"
                max="21:00"
                value={newBlock.endTime}
                onChange={(e) => onNewBlockChange({ ...newBlock, endTime: e.target.value })}
                className="bg-muted border-border text-foreground"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-foreground/80">Sala (opcional)</Label>
            <Input
              placeholder="Ej: A-201"
              value={newBlock.room}
              onChange={(e) => onNewBlockChange({ ...newBlock, room: e.target.value })}
              className="bg-muted border-border text-foreground"
            />
          </div>
          <Button onClick={onAddBlock} className="w-full bg-primary">
            Agregar bloque
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export type { NewBlockForm };
