"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Loader2,
  ChevronLeft,
  ChevronRight,
  CalendarPlus,
  Clock,
  CheckCircle2,
} from "lucide-react";
import {
  format,
  startOfWeek,
  endOfWeek,
  addWeeks,
  subWeeks,
  addMonths,
  subMonths,
  eachDayOfInterval,
  isToday,
  getWeek,
  getDay,
} from "date-fns";
import { es } from "date-fns/locale";
import * as Sentry from "@sentry/nextjs";
import { useAppStore } from "@/lib/store";
import {
  getScheduleBlocks,
  addScheduleBlock,
  deleteScheduleBlock,
} from "@/lib/firebase/schedule";
import { getSubjects } from "@/lib/firebase/subjects";
import type { ScheduleBlock } from "@/lib/types";
import { AddBlockDialog, type NewBlockForm } from "@/components/schedule/AddBlockDialog";
import { ScheduleGrid } from "@/components/schedule/ScheduleGrid";
import { MonthlyCalendar } from "@/components/schedule/MonthlyCalendar";
import { ScheduleEmptyState } from "@/components/schedule/ScheduleEmptyState";
import { Button } from "@/components/ui/button";

type ViewMode = "weekly" | "monthly";

const INITIAL_BLOCK_FORM: NewBlockForm = {
  subjectId: "",
  day: "mon",
  startTime: "08:00",
  endTime: "09:30",
  room: "",
  type: "class",
};

const DAY_KEY_TO_JS: Record<string, number> = {
  mon: 1,
  tue: 2,
  wed: 3,
  thu: 4,
  fri: 5,
  sat: 6,
};

export default function SchedulePage() {
  const { user, subjects, setSubjects } = useAppStore();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [blocks, setBlocks] = useState<ScheduleBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [newBlock, setNewBlock] = useState<NewBlockForm>(INITIAL_BLOCK_FORM);
  const [viewMode, setViewMode] = useState<ViewMode>("weekly");
  const [currentDate, setCurrentDate] = useState(() => new Date());

  // Load subjects from Firestore if not already loaded
  useEffect(() => {
    if (!user?.uid || subjects.length > 0) return;
    getSubjects(user.uid)
      .then(setSubjects)
      .catch((err) => Sentry.captureException(err));
  }, [user?.uid, subjects.length]);

  // Load blocks from Firestore
  useEffect(() => {
    if (!user?.uid) return;
    setLoading(true);
    getScheduleBlocks(user.uid)
      .then(setBlocks)
      .catch((err) => Sentry.captureException(err))
      .finally(() => setLoading(false));
  }, [user?.uid]);

  // Week dates for header
  const weekDates = useMemo(() => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
    return days.slice(0, 6).map((d) => ({
      day: d.getDate(),
      isToday: isToday(d),
    }));
  }, [currentDate]);

  // Navigation
  const navigatePrev = useCallback(() => {
    setCurrentDate((d) =>
      viewMode === "weekly" ? subWeeks(d, 1) : subMonths(d, 1)
    );
  }, [viewMode]);

  const navigateNext = useCallback(() => {
    setCurrentDate((d) =>
      viewMode === "weekly" ? addWeeks(d, 1) : addMonths(d, 1)
    );
  }, [viewMode]);

  const goToToday = useCallback(() => {
    setCurrentDate(new Date());
  }, []);

  // Stats
  const totalWeeklyHours = useMemo(() => {
    return blocks.reduce((acc, b) => {
      const [sh, sm] = b.startTime.split(":").map(Number);
      const [eh, em] = b.endTime.split(":").map(Number);
      return acc + (eh * 60 + em - (sh * 60 + sm)) / 60;
    }, 0);
  }, [blocks]);

  // Next class
  const nextClass = useMemo(() => {
    const now = new Date();
    const currentJsDay = getDay(now); // 0=Sun..6=Sat
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    // Find the day key for today
    const dayKeyEntry = Object.entries(DAY_KEY_TO_JS).find(
      ([, v]) => v === currentJsDay
    );
    if (!dayKeyEntry) return null;

    const todayBlocks = blocks
      .filter((b) => b.day === dayKeyEntry[0])
      .sort((a, b) => a.startTime.localeCompare(b.startTime));

    for (const block of todayBlocks) {
      const [h, m] = block.startTime.split(":").map(Number);
      const blockMinutes = h * 60 + m;
      if (blockMinutes > currentMinutes) {
        const subject = subjects.find((s) => s.id === block.subjectId);
        const minsUntil = blockMinutes - currentMinutes;
        return { block, subject, minsUntil };
      }
    }
    return null;
  }, [blocks, subjects]);

  // Subject legend (unique subjects with blocks)
  const legend = useMemo(() => {
    const subjectIds = [...new Set(blocks.map((b) => b.subjectId))];
    return subjectIds
      .map((id) => subjects.find((s) => s.id === id))
      .filter((s): s is (typeof subjects)[number] => !!s);
  }, [blocks, subjects]);

  async function handleAddBlock() {
    if (!newBlock.subjectId || !user?.uid) return;

    // Validate startTime < endTime
    if (newBlock.startTime >= newBlock.endTime) return;

    // Check for overlapping blocks on the same day
    const dayBlocks = blocks.filter((b) => b.day === newBlock.day);
    const hasOverlap = dayBlocks.some(
      (b) => newBlock.startTime < b.endTime && newBlock.endTime > b.startTime
    );
    if (hasOverlap) return;

    const block: ScheduleBlock = {
      id: crypto.randomUUID(),
      ...newBlock,
    };

    try {
      await addScheduleBlock(user.uid, block);
      setBlocks([...blocks, block]);
      setDialogOpen(false);
      setNewBlock(INITIAL_BLOCK_FORM);
    } catch (err) {
      Sentry.captureException(err);
      alert("Error al agregar el bloque. Intentalo de nuevo.");
    }
  }

  async function handleDeleteBlock(blockId: string) {
    if (!user?.uid) return;
    try {
      await deleteScheduleBlock(user.uid, blockId);
      setBlocks(blocks.filter((b) => b.id !== blockId));
    } catch (err) {
      Sentry.captureException(err);
      alert("Error al eliminar el bloque. Intentalo de nuevo.");
    }
  }

  // Header subtitle
  const subtitle =
    viewMode === "weekly"
      ? `Semana ${getWeek(currentDate, { weekStartsOn: 1 })} • ${format(
          currentDate,
          "MMMM yyyy",
          { locale: es }
        )}`
      : format(currentDate, "MMMM yyyy", { locale: es });

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <header className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
            {viewMode === "weekly" ? "Horario Semanal" : "Calendario Mensual"}
          </h1>
          <div className="flex items-center gap-4 mt-2">
            <button
              onClick={navigatePrev}
              className="p-1 text-muted-foreground hover:text-primary transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={goToToday}
              className="text-muted-foreground/70 text-xs font-bold uppercase tracking-widest hover:text-foreground transition-colors"
            >
              {subtitle}
            </button>
            <button
              onClick={navigateNext}
              className="p-1 text-muted-foreground hover:text-primary transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* View toggle */}
          <div className="flex bg-muted/50 rounded-lg p-1 border border-border/30">
            <button
              onClick={() => setViewMode("weekly")}
              className={`px-4 py-1.5 text-xs font-bold uppercase tracking-widest rounded-md transition-all ${
                viewMode === "weekly"
                  ? "text-primary bg-card/80 shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Semana
            </button>
            <button
              onClick={() => setViewMode("monthly")}
              className={`px-4 py-1.5 text-xs font-bold uppercase tracking-widest rounded-md transition-all ${
                viewMode === "monthly"
                  ? "text-primary bg-card/80 shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Mes
            </button>
          </div>

          {/* Add class button */}
          <AddBlockDialog
            open={dialogOpen}
            onOpenChange={setDialogOpen}
            subjects={subjects}
            newBlock={newBlock}
            onNewBlockChange={setNewBlock}
            onAddBlock={handleAddBlock}
          />
        </div>
      </header>

      {/* Main content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : (
        <>
          {viewMode === "weekly" ? (
            <ScheduleGrid
              blocks={blocks}
              subjects={subjects}
              onDeleteBlock={handleDeleteBlock}
              weekDates={weekDates}
            />
          ) : (
            <MonthlyCalendar
              blocks={blocks}
              subjects={subjects}
              currentDate={currentDate}
            />
          )}

          {blocks.length === 0 && (
            <ScheduleEmptyState hasSubjects={subjects.length > 0} />
          )}

          {/* Subject legend */}
          {legend.length > 0 && (
            <div className="flex items-center gap-6 justify-center py-4">
              {legend.map((s) => (
                <div key={s.id} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{
                      backgroundColor: s.color,
                      boxShadow: `0 0 8px ${s.color}`,
                    }}
                  />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    {s.code}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Stats bento grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Next class */}
            <div className="col-span-1 md:col-span-2 bg-card/30 backdrop-blur-xl p-6 rounded-2xl border border-border/20 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2">
                  Proxima Clase
                </p>
                {nextClass ? (
                  <>
                    <h4 className="text-xl font-black text-foreground">
                      {nextClass.subject?.name ?? nextClass.subject?.code ?? "—"}
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Empieza en {nextClass.minsUntil} minutos
                      {nextClass.block.room && ` • ${nextClass.block.room}`}
                    </p>
                  </>
                ) : (
                  <h4 className="text-lg font-bold text-muted-foreground">
                    Sin clases proximas hoy
                  </h4>
                )}
              </div>
              {nextClass && (
                <div className="w-16 h-16 rounded-full border-4 border-primary border-t-transparent flex items-center justify-center animate-spin-slow">
                  <span className="text-xs font-bold text-primary">
                    {nextClass.minsUntil}m
                  </span>
                </div>
              )}
            </div>

            {/* Weekly hours */}
            <div className="bg-card/30 backdrop-blur-xl p-6 rounded-2xl border border-border/20">
              <p className="text-[10px] font-bold uppercase tracking-widest text-amber-400 mb-2">
                Horas Semanales
              </p>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-black text-foreground">
                  {Math.round(totalWeeklyHours)}
                </span>
                <span className="text-xs text-muted-foreground mb-1">
                  Horas Totales
                </span>
              </div>
              <div className="mt-4 w-full bg-border/30 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-amber-400 h-full rounded-full transition-all"
                  style={{
                    width: `${Math.min(
                      (totalWeeklyHours / 40) * 100,
                      100
                    )}%`,
                  }}
                />
              </div>
            </div>

            {/* Total blocks */}
            <div className="bg-card/30 backdrop-blur-xl p-6 rounded-2xl border border-border/20">
              <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 mb-2">
                Bloques Activos
              </p>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-black text-foreground">
                  {blocks.length}
                </span>
                <span className="text-xs text-muted-foreground mb-1">
                  Clases
                </span>
              </div>
              <div className="mt-4 flex gap-1">
                {Array.from({ length: Math.min(blocks.length, 5) }).map(
                  (_, i) => (
                    <div
                      key={i}
                      className="h-1 flex-1 bg-emerald-400 rounded-full"
                    />
                  )
                )}
                {Array.from({ length: Math.max(5 - blocks.length, 0) }).map(
                  (_, i) => (
                    <div
                      key={`empty-${i}`}
                      className="h-1 flex-1 bg-border/30 rounded-full"
                    />
                  )
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
