"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Sparkles, Loader2, AlertCircle, ArrowLeft, Download } from "lucide-react";
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
import dynamic from "next/dynamic";
import { useAppStore } from "@/lib/store";
import { FileDropzone } from "@/components/shared/file-dropzone";
import { extractTextFromFiles } from "@/lib/utils/extract-text";

const MarkdownRenderer = dynamic(
  () => import("@/components/shared/markdown-renderer").then((mod) => ({ default: mod.MarkdownRenderer })),
  { loading: () => <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div> }
);

export default function SummariesPage() {
  const { subjects, usage, user } = useAppStore();
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [generating, setGenerating] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [generatedSummary, setGeneratedSummary] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const summariesUsed = usage?.summaries_used ?? 0;
  const summariesLimit = usage?.summaries_limit ?? 3;
  const canGenerate = summariesUsed < summariesLimit;

  async function handleGenerate() {
    if (!files.length || !selectedSubject) return;

    setGenerating(true);
    setError(null);

    try {
      const text = await extractTextFromFiles(files);

      if (!text.trim()) {
        setError("No se pudo extraer texto de los archivos.");
        return;
      }

      const res = await fetch("/api/ai/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text, tier: "flash", userId: user?.uid }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al generar resumen");
      }

      const data = await res.json();
      setGeneratedSummary(data.summary);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setGenerating(false);
    }
  }

  if (generatedSummary) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => setGeneratedSummary(null)}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          <div className="flex-1" />
          <Badge variant="outline" className="border-info/50 text-info">
            Generado con IA
          </Badge>
        </div>

        <Card className="bg-card/50 border-border">
          <CardContent className="p-8 prose prose-invert prose-blue max-w-none
            prose-headings:text-foreground prose-headings:font-semibold
            prose-p:text-foreground/80 prose-p:leading-relaxed
            prose-strong:text-foreground
            prose-li:text-foreground/80
            prose-a:text-info
            prose-blockquote:border-info/50 prose-blockquote:text-muted-foreground
            prose-code:text-info prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded
            prose-pre:bg-muted/80 prose-pre:border prose-pre:border-border
            prose-table:text-foreground/80
            prose-th:text-foreground prose-th:border-border
            prose-td:border-border
            prose-hr:border-border">
            <MarkdownRenderer content={generatedSummary} />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Resúmenes IA</h1>
          <p className="text-muted-foreground mt-1">Genera resúmenes visuales de tu material de estudio</p>
        </div>
        <Badge variant="outline" className="border-info/50 text-info">
          {summariesUsed}/{summariesLimit} usados
        </Badge>
      </div>

      {/* Usage bar */}
      <Card className="bg-card/50 border-border">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Uso mensual de resúmenes</span>
            <span className="text-sm text-foreground/80">{summariesUsed} de {summariesLimit}</span>
          </div>
          <Progress
            value={summariesLimit > 0 ? (summariesUsed / summariesLimit) * 100 : 0}
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
              <h2 className="text-xl font-semibold text-foreground">Generar nuevo resumen</h2>
              <p className="text-muted-foreground mt-1">Selecciona un ramo y sube archivos para crear tu resumen</p>
            </div>

            <div className="space-y-4">
              <Select value={selectedSubject} onValueChange={(v) => setSelectedSubject(v ?? "")}>
                <SelectTrigger className="bg-muted border-border text-foreground">
                  <SelectValue placeholder="Selecciona un ramo" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {subjects.length === 0 ? (
                    <SelectItem value="general" className="text-foreground">
                      General (sin ramo)
                    </SelectItem>
                  ) : (
                    subjects.map((s) => (
                      <SelectItem key={s.id} value={s.id} className="text-foreground">
                        {s.code} — {s.name}
                      </SelectItem>
                    ))
                  )}
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
                    Llegaste a tu límite mensual. Mejora tu plan para generar más resúmenes.
                  </p>
                </div>
              )}

              <Button
                onClick={handleGenerate}
                disabled={!canGenerate || !selectedSubject || !files.length || generating}
                className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 h-12"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Generando resumen...
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
