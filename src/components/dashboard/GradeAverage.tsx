"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { item } from "./utils";

interface GradeAverageProps {
  weightedAverage: number | null;
  gradeCount: number;
}

export function GradeAverage({ weightedAverage, gradeCount }: GradeAverageProps) {
  return (
    <motion.div variants={item}>
      <Card className="bg-slate-900/50 border-slate-800 rounded-xl h-full">
        <CardContent className="p-6 flex flex-col items-center justify-center h-full">
          <p className="text-sm text-slate-400 mb-2">Promedio general</p>
          {weightedAverage !== null ? (
            <>
              <p className="text-5xl font-bold text-white">{weightedAverage.toFixed(1)}</p>
              <div className="flex items-center gap-1 mt-2">
                {weightedAverage >= 4.0 ? (
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-400" />
                )}
                <span
                  className={`text-sm font-medium ${
                    weightedAverage >= 4.0 ? "text-emerald-400" : "text-red-400"
                  }`}
                >
                  {weightedAverage >= 4.0 ? "Aprobando" : "En riesgo"}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Basado en {gradeCount} nota{gradeCount !== 1 ? "s" : ""}
              </p>
            </>
          ) : (
            <div className="text-center">
              <AlertCircle className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <p className="text-slate-500 text-sm">Aún no tienes notas registradas</p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
