"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { MapPin, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { ScheduleBlock } from "@/lib/types";

const DAYS = [
  { key: "mon", label: "LUN", fullLabel: "Lunes" },
  { key: "tue", label: "MAR", fullLabel: "Martes" },
  { key: "wed", label: "MIE", fullLabel: "Miercoles" },
  { key: "thu", label: "JUE", fullLabel: "Jueves" },
  { key: "fri", label: "VIE", fullLabel: "Viernes" },
  { key: "sat", label: "SAB", fullLabel: "Sabado" },
] as const;

const HOURS = Array.from({ length: 16 }, (_, i) => {
  const hour = i + 7;
  return `${String(hour).padStart(2, "0")}:00`;
});

const HOUR_HEIGHT = 40; // px per hour slot — compact to avoid scrolling

interface Subject {
  id: string;
  code: string;
  name: string;
  color: string;
}

interface ScheduleGridProps {
  blocks: ScheduleBlock[];
  subjects: Subject[];
  onDeleteBlock: (blockId: string) => void;
  weekDates?: { day: number; isToday: boolean }[];
}

function getHourPosition(time: string) {
  const [h, m] = time.split(":").map(Number);
  return ((h - 7) * 60 + m) / 60;
}

function getBlockHeight(start: string, end: string) {
  return getHourPosition(end) - getHourPosition(start);
}

export function ScheduleGrid({
  blocks,
  subjects,
  onDeleteBlock,
  weekDates,
}: ScheduleGridProps) {
  function getBlocksForDay(day: string) {
    return blocks
      .filter((b) => b.day === day)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }

  function getSubjectForBlock(block: ScheduleBlock) {
    return subjects.find((s) => s.id === block.subjectId);
  }

  const subjectColors = useMemo(() => {
    const colorMap = new Map<string, string>();
    subjects.forEach((s) => {
      colorMap.set(s.id, s.color);
    });
    return colorMap;
  }, [subjects]);

  return (
    <Card className="bg-card/80 border-border overflow-hidden backdrop-blur-xl shadow-2xl rounded-2xl">
      <CardContent className="p-0">
        <div className="grid grid-cols-[80px_repeat(5,1fr)_0.4fr] min-h-[600px]">
          {/* Header row */}
          <div className="p-4 bg-muted/30 border-b border-border/30" />
          {DAYS.slice(0, 5).map((day, i) => {
            const dateInfo = weekDates?.[i];
            const isToday = dateInfo?.isToday ?? false;
            return (
              <div
                key={day.key}
                className={`p-4 text-center border-l border-b border-border/30 relative ${
                  isToday ? "bg-primary/5" : "bg-muted/30"
                }`}
              >
                {isToday && (
                  <div className="absolute top-0 left-0 w-full h-[3px] bg-primary" />
                )}
                <p
                  className={`text-[10px] font-bold uppercase tracking-widest ${
                    isToday ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {isToday ? "Hoy" : "Dia"}
                </p>
                <p className="text-xl font-black text-foreground">
                  {day.label} {dateInfo?.day ?? ""}
                </p>
              </div>
            );
          })}
          {/* Weekend column (collapsed) */}
          <div className="p-4 text-center border-l border-b border-border/30 bg-muted/30 opacity-30">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              S/D
            </p>
            <p className="text-lg font-black text-foreground">
              {weekDates?.[5]?.day ?? ""}
            </p>
          </div>

          {/* Time column */}
          <div className="bg-muted/20">
            {HOURS.map((hour) => (
              <div
                key={hour}
                className="flex items-start justify-center pt-2 border-b border-border/30"
                style={{ height: HOUR_HEIGHT }}
              >
                <span className="text-[10px] font-bold text-muted-foreground">
                  {hour}
                </span>
              </div>
            ))}
          </div>

          {/* Day columns with blocks */}
          {DAYS.slice(0, 5).map((day, i) => {
            const isToday = weekDates?.[i]?.isToday ?? false;
            return (
              <div
                key={day.key}
                className={`relative border-l border-border/30 ${
                  isToday ? "bg-primary/[0.02]" : ""
                }`}
              >
                {HOURS.map((hour) => (
                  <div
                    key={hour}
                    className="border-b border-border/30"
                    style={{ height: HOUR_HEIGHT }}
                  />
                ))}
                {getBlocksForDay(day.key).map((block) => {
                  const subject = getSubjectForBlock(block);
                  const top = getHourPosition(block.startTime) * HOUR_HEIGHT;
                  const height =
                    getBlockHeight(block.startTime, block.endTime) * HOUR_HEIGHT;
                  const color = subject?.color || "hsl(var(--primary))";
                  return (
                    <motion.div
                      key={block.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2 }}
                      className="absolute left-1 right-1 rounded-lg p-3 flex flex-col justify-between cursor-pointer group transition-transform hover:scale-[1.02] shadow-lg"
                      style={{
                        top: `${top}px`,
                        height: `${height}px`,
                        background: "hsl(var(--card) / 0.6)",
                        backdropFilter: "blur(12px)",
                        WebkitBackdropFilter: "blur(12px)",
                        borderLeft: `4px solid ${color}`,
                      }}
                    >
                      <div>
                        <h3 className="font-bold text-sm text-foreground truncate">
                          {subject?.name || subject?.code || "Sin materia"}
                        </h3>
                        <p className="text-[10px] text-muted-foreground font-medium">
                          {block.startTime} - {block.endTime}
                        </p>
                      </div>
                      {block.room && (
                        <div
                          className="flex items-center gap-1.5"
                          style={{ color }}
                        >
                          <MapPin className="w-3 h-3" />
                          <span className="text-[10px] font-bold tracking-tight">
                            {block.room}
                          </span>
                        </div>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteBlock(block.id);
                        }}
                        className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-background/50 backdrop-blur rounded p-1"
                      >
                        <Trash2 className="w-3 h-3 text-foreground" />
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            );
          })}

          {/* Weekend placeholder column */}
          <div className="border-l border-border/30 opacity-10">
            {HOURS.slice(0, 8).map((hour) => (
              <div
                key={hour}
                className="border-b border-border/10"
                style={{ height: HOUR_HEIGHT }}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
