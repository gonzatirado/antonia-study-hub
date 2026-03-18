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
import { useAppStore } from "@/lib/store";
import { FileDropzone } from "@/components/shared/file-dropzone";
import { extractTextFromFiles } from "@/lib/utils/extract-text";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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
            className="text-slate-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          <div className="flex-1" />
          <Badge variant="outline" className="border-blue-500/50 text-blue-400">
            Generado con IA
          </Badge>
        </div>

        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-8 prose prose-invert prose-blue max-w-none
            prose-headings:text-white prose-headings:font-semibold
            prose-p:text-slate-300 prose-p:leading-relaxed
            prose-strong:text-white
            prose-li:text-slate-300
            prose-a:text-blue-400
            prose-blockquote:border-blue-500/50 prose-blockquote:text-slate-400
            prose-code:text-blue-300 prose-code:bg-slate-800 prose-code:px-1 prose-code:py-0.5 prose-code:rounded
            prose-pre:bg-slate-800/80 prose-pre:border prose-pre:border-slate-700
            prose-table:text-slate-300
            prose-th:text-white prose-th:border-slate-700
            prose-td:border-slate-700
            prose-hr:border-slate-700">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {generatedSummary}
            </ReactMarkdown>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Resúmenes IA</h1>
          <p className="text-slate-400 mt-1">Genera resúmenes visuales de tu material de estudio</p>
        </div>
        <Badge variant="outline" className="border-blue-500/50 text-blue-400">
          {summariesUsed}/{summariesLimit} usados
        </Badge>
      </div>

      {/* Usage bar */}
      <Card className="bg-slate-900/50 border-slate-800">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400">Uso mensual de resúmenes</span>
            <span className="text-sm text-slate-300">{summariesUsed} de {summariesLimit}</span>
          </div>
          <Progress
            value={summariesLimit > 0 ? (summariesUsed / summariesLimit) * 100 : 0}
            className="h-2 bg-slate-800"
          />
        </CardContent>
      </Card>

      {/* Generator */}
      <Card className="bg-slate-900/50 border-slate-800">
        <CardContent className="p-8">
          <div className="max-w-xl mx-auto space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-white">Generar nuevo resumen</h2>
              <p className="text-slate-400 mt-1">Selecciona un ramo y sube archivos para crear tu resumen</p>
            </div>

            <div className="space-y-4">
              <Select value={selectedSubject} onValueChange={(v) => setSelectedSubject(v ?? "")}>
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
                onFilesSelected={setFiles}
                maxFiles={5}
                maxSizeMB={50}
                color="blue"
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
                    Llegaste a tu límite mensual. Mejora tu plan para generar más resúmenes.
                  </p>
                </div>
              )}

              <Button
                onClick={handleGenerate}
                disabled={!canGenerate || !selectedSubject || !files.length || generating}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 h-12"
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
