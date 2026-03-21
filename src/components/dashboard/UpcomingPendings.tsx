"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import type { Pending, Subject } from "@/lib/types";
import { item, daysUntil, formatDueLabel } from "./utils";

interface UpcomingPendingsProps {
  pendings: Pending[];
  subjectMap: Record<string, Subject>;
}

export function UpcomingPendings({ pendings, subjectMap }: UpcomingPendingsProps) {
  return (
    <motion.div variants={item}>
      <Card className="bg-card/50 border-border rounded-xl h-full">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Próximos pendientes</h2>
            <span className="text-xs text-muted-foreground">7 días</span>
          </div>
          {pendings.length === 0 ? (
            <p className="text-muted-foreground text-sm py-4">No tienes pendientes esta semana</p>
          ) : (
            <ul className="space-y-3">
              {pendings.map((p) => {
                const sub = subjectMap[p.subjectId];
                const overdue = daysUntil(p.dueDate) < 0;
                return (
                  <li key={p.id} className="flex items-center gap-3">
                    <div
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: sub?.color || "#64748b" }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground truncate">{p.title}</p>
                      <p className="text-xs text-muted-foreground">{sub?.name || "Sin asignatura"}</p>
                    </div>
                    <span
                      className={`text-xs font-medium shrink-0 ${
                        overdue ? "text-destructive" : daysUntil(p.dueDate) <= 1 ? "text-warning" : "text-muted-foreground"
                      }`}
                    >
                      {formatDueLabel(p.dueDate)}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
