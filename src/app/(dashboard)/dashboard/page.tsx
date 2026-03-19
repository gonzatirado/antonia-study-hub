"use client";

import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import * as Sentry from "@sentry/nextjs";
import { useAppStore } from "@/lib/store";
import { getSubjects } from "@/lib/firebase/subjects";
import { getAllGrades } from "@/lib/firebase/grades";
import { getAllPendings } from "@/lib/firebase/pendings";
import type { Subject, Grade, Pending } from "@/lib/types";
import {
  DashboardSkeleton,
  UpcomingPendings,
  GradeAverage,
  SubjectGrid,
  QuickActions,
} from "@/components/dashboard";
import { container, formatDateSpanish } from "@/components/dashboard/utils";

export default function DashboardPage() {
  const { user } = useAppStore();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [pendings, setPendings] = useState<Pending[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;
    let cancelled = false;

    async function load() {
      try {
        const [subs, grs, pends] = await Promise.all([
          getSubjects(user!.uid),
          getAllGrades(user!.uid),
          getAllPendings(user!.uid),
        ]);
        if (cancelled) return;
        setSubjects(subs);
        setGrades(grs);
        setPendings(pends);
      } catch (err) {
        Sentry.captureException(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [user?.uid]);

  const upcomingPendings = useMemo(() => {
    const now = new Date();
    const weekLater = new Date();
    weekLater.setDate(weekLater.getDate() + 7);
    return pendings
      .filter((p) => p.status !== "completed")
      .filter((p) => {
        const due = new Date(p.dueDate);
        return due <= weekLater;
      })
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .slice(0, 5);
  }, [pendings]);

  const weightedAverage = useMemo(() => {
    if (grades.length === 0) return null;
    let totalWeight = 0;
    let weightedSum = 0;
    for (const g of grades) {
      const normalized = (g.score / g.maxScore) * 7;
      weightedSum += normalized * g.weight;
      totalWeight += g.weight;
    }
    return totalWeight > 0 ? weightedSum / totalWeight : null;
  }, [grades]);

  const subjectMap = useMemo(() => {
    const map: Record<string, Subject> = {};
    for (const s of subjects) map[s.id] = s;
    return map;
  }, [subjects]);

  const subjectStats = useMemo(() => {
    return subjects.map((s) => {
      const sGrades = grades.filter((g) => g.subjectId === s.id);
      const sPendings = pendings.filter((p) => p.subjectId === s.id && p.status !== "completed");
      let avg: number | null = null;
      if (sGrades.length > 0) {
        let tw = 0, ws = 0;
        for (const g of sGrades) {
          const n = (g.score / g.maxScore) * 7;
          ws += n * g.weight;
          tw += g.weight;
        }
        avg = tw > 0 ? ws / tw : null;
      }
      return { subject: s, gradeAvg: avg, pendingCount: sPendings.length, fileCount: s.files?.length ?? 0 };
    });
  }, [subjects, grades, pendings]);

  const firstName = user?.displayName?.split(" ")[0] || "estudiante";

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-8">
      {/* Greeting */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-foreground">Hola, {firstName}</h1>
        <p className="text-muted-foreground mt-1">{formatDateSpanish(new Date())}</p>
      </motion.div>

      {/* Pendings + Average row */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
        variants={container}
        initial="hidden"
        animate="show"
      >
        <UpcomingPendings pendings={upcomingPendings} subjectMap={subjectMap} />
        <GradeAverage weightedAverage={weightedAverage} gradeCount={grades.length} />
      </motion.div>

      {/* Subjects summary */}
      <SubjectGrid subjectStats={subjectStats} />

      {/* Quick actions */}
      <QuickActions />
    </div>
  );
}
