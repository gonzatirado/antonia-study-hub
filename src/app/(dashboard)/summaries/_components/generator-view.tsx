"use client";

import {
  Sparkles,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { FileDropzone } from "@/components/shared/file-dropzone";

/* ═══════════════════════════════════════════
   GENERATOR VIEW (original AI generator)
   ═══════════════════════════════════════════ */

export function GeneratorView({
  subjects,
  selectedSubject,
  setSelectedSubject,
  files,
  setFiles,
  generating,
  canGenerate,
  error,
  status,
  handleGenerate,
  summariesUsed,
  summariesLimit,
}: {
  subjects: { id: string; name: string; code?: string }[];
  selectedSubject: string;
  setSelectedSubject: (s: string) => void;
  files: File[];
  setFiles: (f: File[]) => void;
  generating: boolean;
  canGenerate: boolean;
  error: string | null;
  status: string;
  handleGenerate: () => void;
  summariesUsed: number;
  summariesLimit: number;
}) {
  return (
    <div className="space-y-6">
      {/* Usage bar */}
      <Card className="bg-card/50 border-border">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">
              Uso mensual de resúmenes IA
            </span>
            <span className="text-sm text-foreground/80">
              {summariesUsed} de {summariesLimit}
            </span>
          </div>
          <Progress
            value={
              summariesLimit > 0 ? (summariesUsed / summariesLimit) * 100 : 0
            }
            className="h-2 bg-muted"
          />
        </CardContent>
      </Card>

      {/* Generator */}
      <Card className="bg-card/50 border-border">
        <CardContent className="p-8">
          <div className="max-w-xl mx-auto space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-foreground" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">
                Generar nuevo resumen
              </h2>
              <p className="text-muted-foreground mt-1">
                Selecciona una asignatura y sube archivos para crear tu resumen
              </p>
            </div>

            <div className="space-y-4">
              <Select
                value={selectedSubject}
                onValueChange={(v) => setSelectedSubject(v ?? "")}
              >
                <SelectTrigger className="bg-muted border-border text-foreground">
                  <SelectValue placeholder="Selecciona una asignatura" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="general" className="text-foreground">
                    General (sin asignatura)
                  </SelectItem>
                  {subjects.map((s) => (
                    <SelectItem
                      key={s.id}
                      value={s.id}
                      className="text-foreground"
                    >
                      {s.name || s.code || s.id.slice(0, 8)}
                      {s.code && s.name ? ` (${s.code})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <FileDropzone
                onFilesSelected={setFiles}
                maxFiles={5}
                maxSizeMB={50}
                color="blue"
              />

              {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                  <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              {!canGenerate && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-warning/10 border border-warning/20">
                  <AlertCircle className="w-5 h-5 text-warning flex-shrink-0" />
                  <p className="text-sm text-warning">
                    Llegaste a tu límite mensual. Mejora tu plan para generar
                    más resúmenes.
                  </p>
                </div>
              )}

              <Button
                onClick={handleGenerate}
                disabled={
                  !canGenerate ||
                  !selectedSubject ||
                  !files.length ||
                  generating
                }
                className="w-full bg-primary hover:bg-primary/90 h-12"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    {status || "Generando resumen..."}
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Generar resumen
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
