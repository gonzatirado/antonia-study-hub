"use client";

import { motion } from "framer-motion";
import { MapPin, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
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

interface Subject {
  id: string;
  code: string;
  color: string;
}

interface ScheduleGridProps {
  blocks: ScheduleBlock[];
  subjects: Subject[];
  onDeleteBlock: (blockId: string) => void;
}

function getHourPosition(time: string) {
  const [h, m] = time.split(":").map(Number);
  return ((h - 7) * 60 + m) / 60;
}

function getBlockHeight(start: string, end: string) {
  return getHourPosition(end) - getHourPosition(start);
}

export function ScheduleGrid({ blocks, subjects, onDeleteBlock }: ScheduleGridProps) {
  function getBlocksForDay(day: string) {
    return blocks
      .filter((b) => b.day === day)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }

  function getSubjectForBlock(block: ScheduleBlock) {
    return subjects.find((s) => s.id === block.subjectId);
  }

  return (
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
                          onDeleteBlock(block.id);
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
  );
}
