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
import { es } from "date-fns/locale";
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
  0: null, // Sunday
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
}

export function MonthlyCalendar({
  blocks,
  subjects,
  currentDate,
}: MonthlyCalendarProps) {
  const subjectColorMap = useMemo(() => {
    const map = new Map<string, string>();
    subjects.forEach((s) => map.set(s.id, s.color));
    return map;
  }, [subjects]);

  // Build blocks-per-weekday lookup
  const blocksByDay = useMemo(() => {
    const map = new Map<string, ScheduleBlock[]>();
    for (const b of blocks) {
      const existing = map.get(b.day) ?? [];
      existing.push(b);
      map.set(b.day, existing);
    }
    return map;
  }, [blocks]);

  // Generate calendar grid dates (Mon-start weeks)
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    return eachDayOfInterval({ start: gridStart, end: gridEnd });
  }, [currentDate]);

  // Get unique subject dots for a given weekday number
  function getDotsForDate(date: Date): string[] {
    if (!isSameMonth(date, currentDate)) return [];
    const jsDay = getDay(date); // 0=Sun..6=Sat
    const dayKey = DAY_KEY_MAP[jsDay];
    if (!dayKey) return [];
    const dayBlocks = blocksByDay.get(dayKey) ?? [];
    // Unique subjects for that day
    const uniqueSubjectIds = [...new Set(dayBlocks.map((b) => b.subjectId))];
    return uniqueSubjectIds
      .map((id) => subjectColorMap.get(id))
      .filter((c): c is string => !!c);
  }

  return (
    <Card className="bg-card/30 border-border/30 overflow-hidden backdrop-blur-xl shadow-2xl rounded-2xl">
      <CardContent className="p-0">
        {/* Day headers */}
        <div className="grid grid-cols-7 bg-muted/20 border-b border-border/20">
          {DAY_NAMES.map((name) => (
            <div
              key={name}
              className="py-4 text-center text-[10px] font-black uppercase tracking-widest text-muted-foreground"
            >
              {name}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7">
          {calendarDays.map((date, i) => {
            const inMonth = isSameMonth(date, currentDate);
            const today = isToday(date);
            const dots = getDotsForDate(date);

            return (
              <div
                key={i}
                className={`
                  min-h-[70px] p-2 border-b border-r border-border/10 transition-all cursor-pointer group
                  ${!inMonth ? "opacity-30" : "hover:bg-muted/30"}
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
                    {format(date, "dd")}
                  </span>
                  {today && (
                    <span className="text-[8px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded uppercase font-black">
                      Hoy
                    </span>
                  )}
                </div>
                {dots.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {dots.map((color, j) => (
                      <div
                        key={j}
                        className="w-2.5 h-2.5 rounded-full"
                        style={{
                          backgroundColor: color,
                          boxShadow: `0 0 8px ${color}`,
                        }}
                      />
                    ))}
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
