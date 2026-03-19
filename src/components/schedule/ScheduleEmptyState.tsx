"use client";

import { motion } from "framer-motion";
import { Clock } from "lucide-react";

interface ScheduleEmptyStateProps {
  hasSubjects: boolean;
}

export function ScheduleEmptyState({ hasSubjects }: ScheduleEmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-center py-8"
    >
      <Clock className="w-12 h-12 text-muted-foreground/60 mx-auto mb-4" />
      <p className="text-muted-foreground">
        {!hasSubjects
          ? "Primero crea un ramo para poder agregar bloques horarios"
          : "Agrega bloques a tu horario para visualizar tu semana"
        }
      </p>
    </motion.div>
  );
}
