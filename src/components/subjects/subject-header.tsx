"use client";

import { ArrowLeft, FolderIcon } from "lucide-react";
import type { Subject } from "@/lib/types";

interface SubjectHeaderProps {
  subject: Subject;
  weightedAverage: number;
  onBack: () => void;
}

export function SubjectHeader({ subject, weightedAverage, onBack }: SubjectHeaderProps) {
  return (
    <>
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Asignaturas
      </button>

      <div className="flex items-center gap-4">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-xl"
          style={{ backgroundColor: subject.color + "20" }}
        >
          <FolderIcon className="w-6 h-6" style={{ color: subject.color }} />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">{subject.name}</h1>
          <p className="text-sm text-muted-foreground">
            {subject.code} {subject.professor && `· ${subject.professor}`}
            {weightedAverage > 0 && (
              <span className={`ml-2 font-semibold ${weightedAverage >= 4 ? "text-success" : "text-destructive"}`}>
                · Promedio: {weightedAverage.toFixed(1)}
              </span>
            )}
          </p>
        </div>
      </div>
    </>
  );
}
