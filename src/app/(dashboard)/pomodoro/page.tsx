"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, RotateCcw, Timer, Coffee, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store";
import { getSubjects } from "@/lib/firebase/subjects";

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

const THEME: Record<PomodoroState, { ring: string; bg: string; text: string; btn: string }> = {
  work: { ring: "stroke-primary", bg: "from-primary/10 to-primary/5", text: "text-primary", btn: "bg-primary hover:bg-primary/90" },
  shortBreak: { ring: "stroke-success", bg: "from-success/10 to-success/5", text: "text-success", btn: "bg-success hover:bg-success/90" },
  longBreak: { ring: "stroke-info", bg: "from-info/10 to-info/5", text: "text-info", btn: "bg-info hover:bg-info/90" },
};

const MESSAGES: Record<PomodoroState, string> = {
  work: "A estudiar!",
  shortBreak: "Toma un descanso",
  longBreak: "Descanso largo merecido",
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
  const { user, subjects, setSubjects } = useAppStore();
  const [state, setState] = useState<PomodoroState>("work");
  const [timeLeft, setTimeLeft] = useState(DURATIONS.work);
  const [running, setRunning] = useState(false);
  const [session, setSession] = useState(1);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [history, setHistory] = useState<CompletedSession[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load subjects if needed
  useEffect(() => {
    if (user && subjects.length === 0) {
      getSubjects(user.uid).then(setSubjects);
    }
  }, [user, subjects.length, setSubjects]);

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

  const theme = THEME[state];
  const total = DURATIONS[state];
  const progress = timeLeft / total;
  const minutes = Math.floor(timeLeft / 60).toString().padStart(2, "0");
  const seconds = (timeLeft % 60).toString().padStart(2, "0");

  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);
  const workSessions = history.filter((h) => h.type === "work").length;

  return (
    <div className="min-h-screen bg-card p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center justify-center gap-2">
            <Timer className="w-7 h-7 text-primary" />
            Pomodoro
          </h1>
          <AnimatePresence mode="wait">
            <motion.p
              key={state}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`text-lg font-medium ${theme.text}`}
            >
              {MESSAGES[state]}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Timer Circle */}
        <motion.div
          layout
          className={`relative flex items-center justify-center mx-auto w-72 h-72 md:w-80 md:h-80 rounded-full bg-gradient-to-br ${theme.bg} border border-border`}
        >
          <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 280 280">
            <circle cx="140" cy="140" r={radius} fill="none" stroke="currentColor" strokeWidth="6" className="text-muted" />
            <motion.circle
              cx="140" cy="140" r={radius} fill="none" strokeWidth="6" strokeLinecap="round"
              className={theme.ring}
              strokeDasharray={circumference}
              animate={{ strokeDashoffset }}
              transition={{ duration: 0.5, ease: "linear" }}
            />
          </svg>
          <div className="text-center z-10">
            <p className="text-6xl md:text-7xl font-mono font-bold text-foreground tracking-wider">
              {minutes}:{seconds}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              {state === "work" ? `Sesion ${session} de 4` : state === "shortBreak" ? "Descanso corto" : "Descanso largo"}
            </p>
          </div>
        </motion.div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-3">
          <Button variant="outline" size="icon" onClick={reset} className="border-border text-muted-foreground hover:text-foreground bg-muted/50">
            <RotateCcw className="w-5 h-5" />
          </Button>
          <Button
            size="lg"
            onClick={() => setRunning(!running)}
            className={`${theme.btn} text-foreground px-8 text-lg`}
          >
            {running ? <Pause className="w-5 h-5 mr-2" /> : <Play className="w-5 h-5 mr-2" />}
            {running ? "Pausar" : "Iniciar"}
          </Button>
          <Button variant="outline" size="icon" onClick={fullReset} className="border-border text-muted-foreground hover:text-foreground bg-muted/50" title="Reiniciar todo">
            <Sparkles className="w-5 h-5" />
          </Button>
        </div>

        {/* Subject Selector */}
        <div className="flex justify-center">
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="bg-muted border border-border rounded-lg px-4 py-2 text-sm text-foreground/80 focus:outline-none focus:ring-2 focus:ring-ring/50 max-w-xs w-full"
          >
            <option value="">Sin asignatura</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        {/* Today's History */}
        {history.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-muted/50 border border-border rounded-xl p-4 space-y-3"
          >
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Sesiones completadas hoy: {workSessions}
            </h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {history.map((h, i) => (
                <div key={i} className="flex items-center justify-between text-sm px-2 py-1.5 rounded-lg bg-card/50">
                  <div className="flex items-center gap-2">
                    {h.type === "work" ? (
                      <Timer className="w-4 h-4 text-primary" />
                    ) : (
                      <Coffee className="w-4 h-4 text-success" />
                    )}
                    <span className="text-foreground/80">
                      {h.type === "work" ? "Estudio" : h.type === "shortBreak" ? "Descanso" : "Descanso largo"}
                    </span>
                    {h.subjectName && (
                      <span className="text-xs text-muted-foreground">- {h.subjectName}</span>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {h.completedAt.toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
