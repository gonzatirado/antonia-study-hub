"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { GraduationCap, Calendar, Sparkles, Loader2, Lock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppStore } from "@/lib/store";
import { FileDropzone } from "@/components/shared/file-dropzone";
import { extractTextFromFiles } from "@/lib/utils/extract-text";

interface StudyDay {
  date: string;
  tasks: { id: string; type: string; title: string; description: string; completed: boolean }[];
}

export default function ExamPrepPage() {
  const { subjects, usage, user } = useAppStore();
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [examDate, setExamDate] = useState("");
  const [description, setDescription] = useState("");
  const [generating, setGenerating] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [plan, setPlan] = useState<StudyDay[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const prepsUsed = usage?.exam_preps_used ?? 0;
  const prepsLimit = usage?.exam_preps_limit ?? 0;
  const isPro = user?.plan === "pro" || user?.plan === "premium";
  const canGenerate = isPro && prepsUsed < prepsLimit;

  async function handleGenerate() {
    if (!selectedSubject || !examDate || !description) return;

    setGenerating(true);
    setError(null);

    try {
      let content = description;

      if (files.length > 0) {
        const fileText = await extractTextFromFiles(files);
        if (fileText.trim()) {
          content = `${description}\n\nMaterial de estudio:\n${fileText}`;
        }
      }

      const res = await fetch("/api/ai/exam-prep", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          examDate,
          description,
          tier: "flash",
          userId: user?.uid,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al generar plan");
      }

      const data = await res.json();
      setPlan(data.plan);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setGenerating(false);
    }
  }

  if (plan) {
    const subject = subjects.find((s) => s.id === selectedSubject);
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Plan de Estudio</h1>
            <p className="text-muted-foreground mt-1">
              {subject?.name} - Prueba: {examDate}
            </p>
          </div>
          <Button
            variant="outline"
            className="border-border text-foreground/80"
            onClick={() => setPlan(null)}
          >
            Crear nuevo plan
          </Button>
        </div>

        <div className="space-y-4">
          {plan.map((day, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="bg-card/50 border-border">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <Calendar className="w-5 h-5 text-warning" />
                    <h3 className="font-semibold text-foreground">{day.date}</h3>
                  </div>
                  <div className="space-y-2 pl-8">
                    {day.tasks.map((task, j) => (
                      <div
                        key={j}
                        className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
                      >
                        <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                          task.type === "study" ? "bg-info" :
                          task.type === "quiz" ? "bg-primary" :
                          task.type === "practice" ? "bg-success" :
                          "bg-warning"
                        }`} />
                        <div>
                          <p className="text-sm font-medium text-foreground">{task.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{task.description}</p>
                        </div>
                        <Badge variant="outline" className="ml-auto text-xs shrink-0 border-border text-muted-foreground">
                          {task.type === "study" ? "Estudio" :
                           task.type === "quiz" ? "Quiz" :
                           task.type === "practice" ? "Practica" :
                           "Repaso"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Preparacion de Pruebas</h1>
          <p className="text-muted-foreground mt-1">Crea un plan de estudio personalizado hasta tu examen</p>
        </div>
        {isPro ? (
          <Badge variant="outline" className="border-warning/50 text-warning">
            {prepsUsed}/{prepsLimit} usados
          </Badge>
        ) : (
          <Badge variant="outline" className="border-warning/50 text-warning">
            <Lock className="w-3 h-3 mr-1" />
            Solo Pro
          </Badge>
        )}
      </div>

      {!isPro ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Card className="bg-gradient-to-br from-warning/10 to-card border-warning/20">
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-warning/20 to-destructive/20 flex items-center justify-center mx-auto mb-6">
                <Lock className="w-10 h-10 text-warning" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-3">Funcion exclusiva Pro</h2>
              <p className="text-muted-foreground max-w-md mx-auto mb-6">
                Prepara tus pruebas con un plan de estudio personalizado dia a dia.
                La IA analiza tu material y crea contenido, preguntas y repasos adaptados a ti.
              </p>
              <Button className="bg-gradient-to-r from-warning to-destructive hover:from-warning/90 hover:to-destructive/90">
                Mejorar a Pro - $4.990/mes
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-8">
            <div className="max-w-xl mx-auto space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-warning to-destructive flex items-center justify-center mx-auto mb-4">
                  <GraduationCap className="w-8 h-8 text-foreground" />
                </div>
                <h2 className="text-xl font-semibold text-foreground">Crear plan de preparacion</h2>
                <p className="text-muted-foreground mt-1">Ingresa los datos de tu prueba y sube el material relevante</p>
              </div>

              <div className="space-y-4">
                <Select value={selectedSubject} onValueChange={(v) => setSelectedSubject(v ?? "")}>
                  <SelectTrigger className="bg-muted border-border text-foreground">
                    <SelectValue placeholder="Selecciona un ramo" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {subjects.map((s) => (
                      <SelectItem key={s.id} value={s.id} className="text-foreground">
                        {s.code} - {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="space-y-2">
                  <Label className="text-foreground/80">Fecha de la prueba</Label>
                  <Input
                    type="date"
                    value={examDate}
                    onChange={(e) => setExamDate(e.target.value)}
                    className="bg-muted border-border text-foreground"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-foreground/80">Descripcion del contenido</Label>
                  <Textarea
                    placeholder="Describe el contenido de la prueba: temas, capitulos, unidades..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="bg-muted border-border text-foreground min-h-[100px]"
                  />
                </div>

                <FileDropzone
                  onFilesSelected={setFiles}
                  maxFiles={5}
                  maxSizeMB={50}
                  color="orange"
                />

                {error && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                    <Sparkles className="w-5 h-5 text-destructive flex-shrink-0" />
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                )}

                <Button
                  onClick={handleGenerate}
                  disabled={!canGenerate || !selectedSubject || !examDate || !description || generating}
                  className="w-full bg-gradient-to-r from-warning to-destructive hover:from-warning/90 hover:to-destructive/90 h-12"
                >
                  {generating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      Creando plan de estudio...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Crear plan de preparacion
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
