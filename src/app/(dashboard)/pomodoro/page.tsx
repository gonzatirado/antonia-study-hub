"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Timer,
  Coffee,
  Sparkles,
  History,
  Zap,
  ChevronDown,
  CheckCircle2,
  Circle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppStore } from "@/lib/store";
import { useEnsureSubjects } from "@/hooks/use-ensure-subjects";

type PomodoroState = "work" | "shortBreak" | "longBreak";

interface CompletedSession {
  type: PomodoroState;
  subjectName: string | null;
  completedAt: Date;
}

const DURATIONS: Record<PomodoroState, number> = {
  work: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
};

const MESSAGES: Record<PomodoroState, string> = {
  work: "Deep Work State",
  shortBreak: "Descanso activo",
  longBreak: "Descanso profundo",
};

function playBeep() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 800;
    gain.gain.value = 0.3;
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    osc.stop(ctx.currentTime + 0.5);
  } catch {
    // Web Audio not available
  }
}

export default function PomodoroPage() {
  const { user } = useAppStore();
  const subjects = useEnsureSubjects();
  const [state, setState] = useState<PomodoroState>("work");
  const [timeLeft, setTimeLeft] = useState(DURATIONS.work);
  const [running, setRunning] = useState(false);
  const [session, setSession] = useState(1);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [history, setHistory] = useState<CompletedSession[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const switchState = useCallback((currentState: PomodoroState, currentSession: number) => {
    playBeep();
    const subjectName = subjects.find((s) => s.id === selectedSubject)?.name ?? null;
    setHistory((prev) => [...prev, { type: currentState, subjectName, completedAt: new Date() }]);

    if (currentState === "work") {
      if (currentSession % 4 === 0) {
        setState("longBreak");
        setTimeLeft(DURATIONS.longBreak);
      } else {
        setState("shortBreak");
        setTimeLeft(DURATIONS.shortBreak);
      }
    } else {
      const nextSession = currentState === "longBreak" ? 1 : currentSession + 1;
      setSession(nextSession);
      setState("work");
      setTimeLeft(DURATIONS.work);
    }
    setRunning(false);
  }, [subjects, selectedSubject]);

  useEffect(() => {
    if (!running) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running]);

  // Handle timer reaching 0
  useEffect(() => {
    if (timeLeft === 0 && !running) {
      switchState(state, session);
    }
  }, [timeLeft, running, state, session, switchState]);

  function reset() {
    setRunning(false);
    setTimeLeft(DURATIONS[state]);
  }

  function fullReset() {
    setRunning(false);
    setState("work");
    setTimeLeft(DURATIONS.work);
    setSession(1);
  }

  function selectMode(mode: PomodoroState) {
    setRunning(false);
    setState(mode);
    setTimeLeft(DURATIONS[mode]);
  }

  const total = DURATIONS[state];
  const progress = timeLeft / total;
  const minutes = Math.floor(timeLeft / 60).toString().padStart(2, "0");
  const seconds = (timeLeft % 60).toString().padStart(2, "0");

  const radius = 255;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);
  const workSessions = history.filter((h) => h.type === "work").length;
  const totalStudyMinutes = workSessions * 25;
  const dailyGoal = 8;
  const goalProgress = Math.min(workSessions / dailyGoal, 1);

  const selectedSubjectName = subjects.find((s) => s.id === selectedSubject)?.name ?? "Sin asignatura";

  return (
    <div className="h-full flex flex-col relative overflow-hidden">
      {/* Header */}
      <header className="flex justify-between items-center mb-4 z-10 shrink-0">
        <div>
          <h2 className="text-2xl font-black tracking-tighter text-foreground/50 uppercase">
            Temporizador
          </h2>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-3 px-4 py-2 rounded-full glass-card">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
              Sesiones:
            </span>
            <span className="text-primary font-black text-sm tracking-tighter">
              {String(session).padStart(2, "0")} / {String(dailyGoal).padStart(2, "0")}
            </span>
          </div>
          <div className="flex items-center gap-3 px-4 py-2 rounded-full glass-card">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
              Tiempo:
            </span>
            <span className="text-foreground font-black text-sm tracking-tighter">
              {totalStudyMinutes}m
            </span>
          </div>
        </div>
      </header>

      {/* Main content area with sidebars */}
      <div className="flex-grow flex items-center justify-center relative min-h-0">
        {/* LEFT SIDEBAR */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-72 flex-col gap-6 z-10 hidden xl:flex">
          {/* Subject selector */}
          <section className="glass-card p-4 rounded-3xl">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-3">
              MATERIA ACTUAL
            </h3>
            <Select
              value={selectedSubject || "none"}
              onValueChange={(v) => setSelectedSubject(v === "none" ? "" : v as string)}
            >
              <SelectTrigger className="w-full bg-background border-border/30 text-[11px] text-foreground rounded-xl py-3">
                <SelectValue placeholder="Sin asignatura" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="none" className="text-foreground text-[11px]">
                  Sin asignatura
                </SelectItem>
                {subjects.map((s) => (
                  <SelectItem key={s.id} value={s.id} className="text-foreground text-[11px]">
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </section>

          {/* History */}
          <section className="glass-card p-4 rounded-3xl">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-4 flex justify-between items-center">
              <span>HISTORIAL</span>
              <History className="w-3 h-3" />
            </h3>
            <div className="space-y-3 max-h-40 overflow-y-auto">
              {history.length === 0 && (
                <p className="text-[10px] text-muted-foreground/60">Sin sesiones aun</p>
              )}
              {history.slice(-5).reverse().map((h, i) => (
                <div key={i} className="flex items-center gap-3 group">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary/40 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold text-foreground/80 truncate">
                      {h.type === "work"
                        ? `Pomodoro ${DURATIONS.work / 60}m`
                        : h.type === "shortBreak"
                        ? `Descanso ${DURATIONS.shortBreak / 60}m`
                        : `Descanso largo ${DURATIONS.longBreak / 60}m`}
                    </p>
                    <p className="text-[8px] text-muted-foreground font-medium truncate">
                      {h.completedAt.toLocaleTimeString("es-CL", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                      {h.subjectName ? ` - ${h.subjectName}` : ""}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* CENTER: PROTAGONIST TIMER */}
        <div className="flex flex-col items-center justify-center gap-8 md:gap-10 max-w-4xl w-full z-20">
          {/* Mode Selector Chips */}
          <div className="flex bg-muted rounded-full p-1.5 border border-border/50 shadow-inner">
            <button
              onClick={() => selectMode("work")}
              className={`px-5 md:px-8 py-2.5 rounded-full text-[10px] md:text-[11px] font-black uppercase tracking-widest transition-all ${
                state === "work"
                  ? "bg-primary text-primary-foreground shadow-lg"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              POMODORO
            </button>
            <button
              onClick={() => selectMode("shortBreak")}
              className={`px-5 md:px-8 py-2.5 rounded-full text-[10px] md:text-[11px] font-bold uppercase tracking-widest transition-colors ${
                state === "shortBreak"
                  ? "bg-success text-foreground shadow-lg"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              DESCANSO CORTO
            </button>
            <button
              onClick={() => selectMode("longBreak")}
              className={`px-5 md:px-8 py-2.5 rounded-full text-[10px] md:text-[11px] font-bold uppercase tracking-widest transition-colors ${
                state === "longBreak"
                  ? "bg-info text-foreground shadow-lg"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              DESCANSO LARGO
            </button>
          </div>

          {/* Giant Timer Circle */}
          <div className="relative flex items-center justify-center">
            {/* Outer glow */}
            <div
              className="absolute w-[380px] h-[380px] md:w-[520px] md:h-[520px] lg:w-[580px] lg:h-[580px] rounded-full blur-[100px] pointer-events-none"
              style={{ backgroundColor: "var(--primary)", opacity: 0.1 }}
            />

            <div className="relative w-[300px] h-[300px] md:w-[420px] md:h-[420px] lg:w-[480px] lg:h-[480px]">
              {/* SVG Progress Ring */}
              <svg
                className="w-full h-full -rotate-90"
                viewBox="0 0 540 540"
                style={{
                  filter: running
                    ? "drop-shadow(0 0 25px color-mix(in oklch, var(--primary) 30%, transparent))"
                    : "none",
                }}
              >
                {/* Background ring */}
                <circle
                  cx="270"
                  cy="270"
                  r={radius}
                  fill="transparent"
                  stroke="currentColor"
                  strokeWidth="6"
                  className="text-border/30"
                />
                {/* Progress ring */}
                <motion.circle
                  cx="270"
                  cy="270"
                  r={radius}
                  fill="transparent"
                  strokeWidth="12"
                  strokeLinecap="round"
                  stroke="var(--primary)"
                  strokeDasharray={circumference}
                  animate={{ strokeDashoffset }}
                  transition={{ duration: 0.5, ease: "linear" }}
                  style={{
                    filter: state === "shortBreak"
                      ? "hue-rotate(-60deg)"
                      : state === "longBreak"
                      ? "hue-rotate(-30deg)"
                      : "none",
                  }}
                />
              </svg>

              {/* Time display inside circle */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={`${minutes}:${seconds}`}
                    initial={{ opacity: 0.8 }}
                    animate={{ opacity: 1 }}
                    className="text-[80px] md:text-[120px] lg:text-[140px] font-black tracking-tighter text-foreground leading-none select-none tabular-nums"
                    style={{
                      textShadow: "0 0 20px color-mix(in oklch, var(--foreground) 10%, transparent)",
                    }}
                  >
                    {minutes}:{seconds}
                  </motion.span>
                </AnimatePresence>

                <div className="flex items-center gap-3 mt-3 md:mt-4 px-4 md:px-6 py-1.5 md:py-2 glass-card rounded-full">
                  <Sparkles className="w-3 h-3 text-primary" />
                  <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground">
                    {MESSAGES[state]}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4 md:gap-6">
            {/* Reset */}
            <button
              onClick={reset}
              className="w-11 h-11 md:w-12 md:h-12 rounded-xl bg-muted/60 backdrop-blur-sm border border-border/30 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
              title="Reiniciar temporizador"
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            {/* Primary start/pause */}
            <button
              onClick={() => setRunning(!running)}
              className="px-10 md:px-16 py-4 md:py-5 rounded-2xl font-bold text-base md:text-lg uppercase tracking-widest flex items-center gap-3 transition-all hover:brightness-110 active:scale-95 text-primary-foreground"
              style={{
                background: "var(--primary)",
              }}
            >
              {running ? (
                <Pause className="w-6 h-6 md:w-7 md:h-7" fill="currentColor" />
              ) : (
                <Play className="w-6 h-6 md:w-7 md:h-7" fill="currentColor" />
              )}
              {running ? "PAUSAR" : "INICIAR"}
            </button>

            {/* Skip */}
            <button
              onClick={fullReset}
              className="w-11 h-11 md:w-12 md:h-12 rounded-xl bg-muted/60 backdrop-blur-sm border border-border/30 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
              title="Reiniciar todo"
            >
              <SkipForward className="w-5 h-5" />
            </button>
          </div>

          {/* Mobile-only subject selector */}
          <div className="flex xl:hidden justify-center w-full max-w-xs">
            <Select
              value={selectedSubject || "none"}
              onValueChange={(v) => setSelectedSubject(v === "none" ? "" : v as string)}
            >
              <SelectTrigger className="w-full bg-muted border-border/30 text-[11px] text-foreground rounded-xl">
                <SelectValue placeholder="Sin asignatura" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="none" className="text-foreground text-[11px]">
                  Sin asignatura
                </SelectItem>
                {subjects.map((s) => (
                  <SelectItem key={s.id} value={s.id} className="text-foreground text-[11px]">
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-72 flex-col gap-6 z-10 hidden xl:flex">
          {/* Daily goal */}
          <section className="glass-card p-4 rounded-3xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                OBJETIVO DEL DIA
              </h3>
              <span className="text-primary font-black text-xs">
                {workSessions}/{dailyGoal}
              </span>
            </div>
            <div className="h-1.5 w-full bg-border/30 rounded-full overflow-hidden mb-5">
              <motion.div
                className="h-full bg-primary rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${goalProgress * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <div className="space-y-2">
              {Array.from({ length: Math.min(dailyGoal, 4) }).map((_, i) => {
                const completed = i < workSessions;
                return (
                  <div
                    key={i}
                    className={`p-3 rounded-xl border flex items-center justify-between ${
                      completed
                        ? "bg-primary/10 border-primary/20"
                        : "bg-border/10 border-border/20 opacity-50"
                    }`}
                  >
                    <span
                      className={`text-[9px] font-black uppercase ${
                        completed ? "text-primary" : "text-muted-foreground"
                      }`}
                    >
                      {completed ? "Sesion enfoque" : "Pendiente"}
                    </span>
                    {completed ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                    ) : (
                      <Circle className="w-3.5 h-3.5 text-muted-foreground" />
                    )}
                  </div>
                );
              })}
            </div>
          </section>

        </div>
      </div>

      {/* Mobile history (below timer on smaller screens) */}
      {history.length > 0 && (
        <div className="xl:hidden mt-6 shrink-0">
          <div className="glass-card rounded-2xl p-4 space-y-3">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground flex justify-between items-center">
              <span>HISTORIAL — {workSessions} sesiones</span>
              <History className="w-3 h-3" />
            </h3>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {history.slice(-5).reverse().map((h, i) => (
                <div key={i} className="flex items-center justify-between text-[10px] px-2 py-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary/40 shrink-0" />
                    <span className="font-bold text-foreground/80">
                      {h.type === "work" ? "Pomodoro" : h.type === "shortBreak" ? "Descanso" : "Descanso largo"}
                    </span>
                    {h.subjectName && (
                      <span className="text-muted-foreground">- {h.subjectName}</span>
                    )}
                  </div>
                  <span className="text-muted-foreground">
                    {h.completedAt.toLocaleTimeString("es-CL", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Glass card styles via inline style tag */}
      <style jsx>{`
        .glass-card {
          background: color-mix(in oklch, var(--card) 60%, transparent);
          backdrop-filter: blur(20px);
          border: 1px solid color-mix(in oklch, var(--foreground) 5%, transparent);
        }
        .tabular-nums {
          font-variant-numeric: tabular-nums;
        }
      `}</style>
    </div>
  );
}
