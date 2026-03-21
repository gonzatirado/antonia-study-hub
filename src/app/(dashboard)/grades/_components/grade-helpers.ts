import type { Grade } from "@/lib/types";

/* ── Grade color helpers ── */
export function gradeColor(grade: number): string {
  if (grade >= 5.5) return "var(--success)";
  if (grade >= 4.0) return "var(--warning)";
  return "var(--destructive)";
}

export function gradeColorClass(grade: number): string {
  if (grade >= 5.5) return "text-[oklch(var(--success))]";
  if (grade >= 4.0) return "text-[oklch(var(--warning))]";
  return "text-destructive";
}

export function gradeTextClass(grade: number): string {
  if (grade >= 5.5) return "text-emerald-500";
  if (grade >= 4.0) return "text-amber-500";
  return "text-destructive";
}

export function gradeBgClass(grade: number): string {
  if (grade >= 5.5) return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
  if (grade >= 4.0) return "bg-amber-500/10 text-amber-500 border-amber-500/20";
  return "bg-destructive/10 text-destructive border-destructive/20";
}

export function gradeStatusLabel(grade: number): string {
  if (grade >= 6.0) return "Sobresaliente";
  if (grade >= 5.0) return "Aprobando";
  if (grade >= 4.0) return "En Riesgo";
  return "Reprobando";
}

export function gradeDotClass(grade: number): string {
  if (grade >= 5.0) return "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]";
  if (grade >= 4.0) return "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]";
  return "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]";
}

export function calcWeightedAvg(subjectGrades: Grade[]): number {
  const totalWeight = subjectGrades.reduce((s, g) => s + g.weight, 0);
  if (totalWeight === 0) return 0;
  const sum = subjectGrades.reduce(
    (acc, g) => acc + (g.maxScore === 0 ? 0 : (g.score / g.maxScore) * g.weight),
    0
  );
  return (sum / totalWeight) * 7;
}
