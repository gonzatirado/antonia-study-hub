"use client";

import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import type { Subject } from "@/lib/types";

interface SubjectStat {
  subject: Subject;
  gradeAvg: number | null;
  pendingCount: number;
  fileCount: number;
}

interface SubjectGridProps {
  subjectStats: SubjectStat[];
}

export function SubjectGrid({ subjectStats }: SubjectGridProps) {
  if (subjectStats.length === 0) return null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}>
      <h2 className="text-lg font-semibold text-foreground mb-4">Mis asignaturas</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {subjectStats.map(({ subject: s, gradeAvg, pendingCount, fileCount }) => (
          <Link key={s.id} href={`/subjects/${s.id}`}>
            <Card className="bg-card/50 border-border rounded-xl hover:border-muted-foreground/30 transition-all duration-300 cursor-pointer group hover:shadow-lg hover:shadow-primary/5">
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: s.color }}
                  />
                  <p className="font-medium text-foreground truncate group-hover:text-primary transition-colors">
                    {s.name}
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-lg font-semibold text-foreground">
                      {gradeAvg !== null ? gradeAvg.toFixed(1) : "-"}
                    </p>
                    <p className="text-[10px] text-muted-foreground uppercase">Prom.</p>
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-foreground">{fileCount}</p>
                    <p className="text-[10px] text-muted-foreground uppercase">Archivos</p>
                  </div>
                  <div>
                    <p className={`text-lg font-semibold ${pendingCount > 0 ? "text-warning" : "text-foreground"}`}>
                      {pendingCount}
                    </p>
                    <p className="text-[10px] text-muted-foreground uppercase">Pend.</p>
                  </div>
                </div>
                <div className="flex items-center justify-end mt-3">
                  <ChevronRight className="w-4 h-4 text-muted-foreground/60 group-hover:text-muted-foreground transition-colors" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </motion.div>
  );
}
