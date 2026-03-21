"use client";

import { useMemo } from "react";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  getDay,
  format,
} from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import type { ScheduleBlock } from "@/lib/types";

const DAY_NAMES = [
  "Lunes",
  "Martes",
  "Miercoles",
  "Jueves",
  "Viernes",
  "Sabado",
  "Domingo",
] as const;

const DAY_KEY_MAP: Record<number, ScheduleBlock["day"] | null> = {
  1: "mon",
  2: "tue",
  3: "wed",
  4: "thu",
  5: "fri",
  6: "sat",
  0: null,
};

interface Subject {
  id: string;
  code: string;
  name: string;
  color: string;
}

interface MonthlyCalendarProps {
  blocks: ScheduleBlock[];
  subjects: Subject[];
  currentDate: Date;
  onDayClick?: (date: Date, dayBlocks: ScheduleBlock[]) => void;
}

export function MonthlyCalendar({
  blocks,
  subjects,
  currentDate,
  onDayClick,
}: MonthlyCalendarProps) {
  const subjectMap = useMemo(() => {
    const map = new Map<string, Subject>();
    subjects.forEach((s) => map.set(s.id, s));
    return map;
  }, [subjects]);

  const blocksByDay = useMemo(() => {
    const map = new Map<string, ScheduleBlock[]>();
    for (const b of blocks) {
      const existing = map.get(b.day) ?? [];
      existing.push(b);
      map.set(b.day, existing);
    }
    return map;
  }, [blocks]);

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    return eachDayOfInterval({ start: gridStart, end: gridEnd });
  }, [currentDate]);

  function getBlocksForDate(date: Date): ScheduleBlock[] {
    const jsDay = getDay(date);
    const dayKey = DAY_KEY_MAP[jsDay];
    if (!dayKey) return [];
    return (blocksByDay.get(dayKey) ?? []).sort((a, b) =>
      a.startTime.localeCompare(b.startTime)
    );
  }

  return (
    <Card className="bg-card/80 border-border overflow-hidden backdrop-blur-xl shadow-2xl rounded-2xl">
      <CardContent className="p-0">
        <div className="grid grid-cols-7 bg-muted/30 border-b border-border/30">
          {DAY_NAMES.map((name) => (
            <div
              key={name}
              className="py-4 text-center text-[10px] font-black uppercase tracking-widest text-muted-foreground"
            >
              {name}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {calendarDays.map((date, i) => {
            const inMonth = isSameMonth(date, currentDate);
            const today = isToday(date);
            const dayBlocks = inMonth ? getBlocksForDate(date) : [];
            const hasClasses = dayBlocks.length > 0;

            return (
              <div
                key={i}
                onClick={() => {
                  if (inMonth && onDayClick) onDayClick(date, dayBlocks);
                }}
                className={`
                  min-h-[80px] p-2 border-b border-r border-border/30 transition-all cursor-pointer group
                  ${!inMonth ? "opacity-30 cursor-default" : "hover:bg-primary/5"}
                  ${today ? "bg-muted/40 ring-1 ring-inset ring-primary/20" : ""}
                `}
              >
                <div className="flex justify-between items-start">
                  <span
                    className={`text-sm font-bold ${
                      today
                        ? "text-primary"
                        : inMonth
                        ? "text-muted-foreground group-hover:text-primary"
                        : "text-muted-foreground/50"
                    }`}
                  >
                    {format(date, "d")}
                  </span>
                  {today && (
                    <span className="text-[8px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded uppercase font-black">
                      Hoy
                    </span>
                  )}
                </div>
                {/* Show compact class indicators */}
                {hasClasses && inMonth && (
                  <div className="mt-1 space-y-0.5">
                    {dayBlocks.slice(0, 2).map((block) => {
                      const subject = subjectMap.get(block.subjectId);
                      return (
                        <div
                          key={block.id}
                          className="flex items-center gap-1 truncate"
                        >
                          <div
                            className="w-1.5 h-1.5 rounded-full shrink-0"
                            style={{ backgroundColor: subject?.color || "#8b5cf6" }}
                          />
                          <span className="text-[9px] text-muted-foreground truncate">
                            {block.startTime} {subject?.code || ""}
                          </span>
                        </div>
                      );
                    })}
                    {dayBlocks.length > 2 && (
                      <span className="text-[9px] text-muted-foreground">
                        +{dayBlocks.length - 2} más
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
