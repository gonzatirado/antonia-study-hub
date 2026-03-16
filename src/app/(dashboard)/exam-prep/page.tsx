"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { GraduationCap, Calendar, Upload, Sparkles, Loader2, AlertCircle, Lock } from "lucide-react";
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

export default function ExamPrepPage() {
  const { subjects, usage, user } = useAppStore();
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [examDate, setExamDate] = useState("");
  const [description, setDescription] = useState("");
  const [generating, setGenerating] = useState(false);

  const prepsUsed = usage?.exam_preps_used ?? 0;
  const prepsLimit = usage?.exam_preps_limit ?? 0;
  const isPro = user?.plan === "pro" || user?.plan === "premium";
  const canGenerate = isPro && prepsUsed < prepsLimit;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Preparación de Pruebas</h1>
          <p className="text-slate-400 mt-1">Crea un plan de estudio personalizado hasta tu examen</p>
        </div>
        {isPro ? (
          <Badge variant="outline" className="border-orange-500/50 text-orange-400">
            {prepsUsed}/{prepsLimit} usados
          </Badge>
        ) : (
          <Badge variant="outline" className="border-amber-500/50 text-amber-400">
            <Lock className="w-3 h-3 mr-1" />
            Solo Pro
          </Badge>
        )}
      </div>

      {!isPro ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Card className="bg-gradient-to-br from-amber-950/30 to-slate-900 border-amber-500/20">
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center mx-auto mb-6">
                <Lock className="w-10 h-10 text-amber-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">Función exclusiva Pro</h2>
              <p className="text-slate-400 max-w-md mx-auto mb-6">
                Prepara tus pruebas con un plan de estudio personalizado día a día.
                La IA analiza tu material y crea contenido, preguntas y repasos adaptados a ti.
              </p>
              <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600">
                Mejorar a Pro — $4.990/mes
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-8">
            <div className="max-w-xl mx-auto space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center mx-auto mb-4">
                  <GraduationCap className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-white">Crear plan de preparación</h2>
                <p className="text-slate-400 mt-1">Ingresa los datos de tu prueba y sube el material relevante</p>
              </div>

              <div className="space-y-4">
                <Select value={selectedSubject} onValueChange={(v) => setSelectedSubject(v ?? "")}>
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                    <SelectValue placeholder="Selecciona un ramo" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-700">
                    {subjects.map((s) => (
                      <SelectItem key={s.id} value={s.id} className="text-white">
                        {s.code} — {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="space-y-2">
                  <Label className="text-slate-300">Fecha de la prueba</Label>
                  <Input
                    type="date"
                    value={examDate}
                    onChange={(e) => setExamDate(e.target.value)}
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-300">Descripción del contenido</Label>
                  <Textarea
                    placeholder="Describe el contenido de la prueba: temas, capítulos, unidades..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="bg-slate-800 border-slate-700 text-white min-h-[100px]"
                  />
                </div>

                <div className="border-2 border-dashed border-slate-700 rounded-xl p-8 text-center hover:border-orange-500/50 transition-colors cursor-pointer">
                  <Upload className="w-10 h-10 text-slate-500 mx-auto mb-3" />
                  <p className="text-slate-300 font-medium">Adjunta material</p>
                  <p className="text-sm text-slate-500 mt-1">Materia, ayudantías, pautas, controles anteriores</p>
                </div>

                <Button
                  disabled={!canGenerate || !selectedSubject || !examDate || generating}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 h-12"
                >
                  {generating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      Creando plan de estudio...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Crear plan de preparación
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
