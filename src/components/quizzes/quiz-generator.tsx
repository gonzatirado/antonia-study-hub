"use client";

import { Brain, Sparkles, Loader2, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { FileDropzone } from "@/components/shared/file-dropzone";

interface Subject {
  id: string;
  code: string;
  name: string;
}

interface QuizGeneratorProps {
  subjects: Subject[];
  selectedSubject: string;
  onSubjectChange: (value: string) => void;
  files: File[];
  onFilesSelected: (files: File[]) => void;
  generating: boolean;
  onGenerate: () => void;
  canGenerate: boolean;
  quizzesUsed: number;
  quizzesLimit: number;
  error: string | null;
}

export function QuizGenerator({
  subjects,
  selectedSubject,
  onSubjectChange,
  files,
  onFilesSelected,
  generating,
  onGenerate,
  canGenerate,
  quizzesUsed,
  quizzesLimit,
  error,
}: QuizGeneratorProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Quizzes</h1>
          <p className="text-slate-400 mt-1">Crea cuestionarios de practica con IA</p>
        </div>
        <Badge variant="outline" className="border-purple-500/50 text-purple-400">
          {quizzesUsed}/{quizzesLimit} usados
        </Badge>
      </div>

      <Card className="bg-slate-900/50 border-slate-800">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400">Uso mensual de quizzes</span>
            <span className="text-sm text-slate-300">{quizzesUsed} de {quizzesLimit}</span>
          </div>
          <Progress
            value={quizzesLimit > 0 ? (quizzesUsed / quizzesLimit) * 100 : 0}
            className="h-2 bg-slate-800"
          />
        </CardContent>
      </Card>

      <Card className="bg-slate-900/50 border-slate-800">
        <CardContent className="p-8">
          <div className="max-w-xl mx-auto space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center mx-auto mb-4">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-white">Crear nuevo quiz</h2>
              <p className="text-slate-400 mt-1">Selecciona material y genera preguntas de practica</p>
            </div>

            <div className="space-y-4">
              <Select value={selectedSubject} onValueChange={(v) => onSubjectChange(v ?? "")}>
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                  <SelectValue placeholder="Selecciona un ramo" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-700">
                  {subjects.length === 0 ? (
                    <SelectItem value="general" className="text-white">
                      General (sin ramo)
                    </SelectItem>
                  ) : (
                    subjects.map((s) => (
                      <SelectItem key={s.id} value={s.id} className="text-white">
                        {s.code} — {s.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>

              <FileDropzone
                onFilesSelected={onFilesSelected}
                maxFiles={5}
                maxSizeMB={50}
                color="purple"
              />

              {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                  <p className="text-sm text-red-300">{error}</p>
                </div>
              )}

              {!canGenerate && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0" />
                  <p className="text-sm text-amber-300">
                    Llegaste a tu limite mensual. Mejora tu plan para generar mas quizzes.
                  </p>
                </div>
              )}

              <Button
                onClick={onGenerate}
                disabled={!canGenerate || !selectedSubject || !files.length || generating}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 h-12"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Generando quiz...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Generar quiz (5 preguntas)
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
