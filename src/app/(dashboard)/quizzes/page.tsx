"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Sparkles, Upload, Loader2, AlertCircle, CheckCircle2, XCircle, ArrowLeft, RotateCcw } from "lucide-react";
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

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export default function QuizzesPage() {
  const { subjects, usage, user } = useAppStore();
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [generating, setGenerating] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [questions, setQuestions] = useState<QuizQuestion[] | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [finished, setFinished] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const quizzesUsed = usage?.quizzes_used ?? 0;
  const quizzesLimit = usage?.quizzes_limit ?? 5;
  const canGenerate = quizzesUsed < quizzesLimit;

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

      const res = await fetch("/api/ai/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text, numQuestions: 5, tier: "flash", userId: user?.uid }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al generar quiz");
      }

      const data = await res.json();
      setQuestions(data.questions);
      setCurrentQuestion(0);
      setSelectedAnswer(null);
      setShowResult(false);
      setScore(0);
      setAnswers(new Array(data.questions.length).fill(null));
      setFinished(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setGenerating(false);
    }
  }

  function handleSelectAnswer(index: number) {
    if (showResult) return;
    setSelectedAnswer(index);
  }

  function handleConfirm() {
    if (selectedAnswer === null || !questions) return;

    const isCorrect = selectedAnswer === questions[currentQuestion].correctAnswer;
    if (isCorrect) setScore((s) => s + 1);

    const newAnswers = [...answers];
    newAnswers[currentQuestion] = selectedAnswer;
    setAnswers(newAnswers);
    setShowResult(true);
  }

  function handleNext() {
    if (!questions) return;

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((c) => c + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      setFinished(true);
    }
  }

  function handleReset() {
    setQuestions(null);
    setFiles([]);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setFinished(false);
  }

  // Quiz finished screen
  if (finished && questions) {
    const percentage = Math.round((score / questions.length) * 100);
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={handleReset} className="text-slate-400 hover:text-white">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Nuevo quiz
        </Button>

        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-12 text-center">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${
              percentage >= 70 ? "bg-green-500/20" : percentage >= 40 ? "bg-amber-500/20" : "bg-red-500/20"
            }`}>
              <span className={`text-4xl font-bold ${
                percentage >= 70 ? "text-green-400" : percentage >= 40 ? "text-amber-400" : "text-red-400"
              }`}>
                {percentage}%
              </span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              {percentage >= 70 ? "Excelente!" : percentage >= 40 ? "Buen intento" : "Sigue practicando"}
            </h2>
            <p className="text-slate-400 mb-6">
              Acertaste {score} de {questions.length} preguntas
            </p>
            <div className="flex items-center justify-center gap-3">
              <Button onClick={handleReset} variant="outline" className="border-slate-700 text-slate-300">
                <RotateCcw className="w-4 h-4 mr-2" />
                Nuevo quiz
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Review answers */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Revisión</h3>
          {questions.map((q, i) => {
            const userAnswer = answers[i];
            const isCorrect = userAnswer === q.correctAnswer;
            return (
              <Card key={q.id} className={`bg-slate-900/50 border ${isCorrect ? "border-green-500/30" : "border-red-500/30"}`}>
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    {isCorrect ? (
                      <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                    )}
                    <div>
                      <p className="text-white font-medium">{q.question}</p>
                      {!isCorrect && userAnswer !== null && (
                        <p className="text-red-400 text-sm mt-1">Tu respuesta: {q.options[userAnswer]}</p>
                      )}
                      <p className="text-green-400 text-sm mt-1">Correcta: {q.options[q.correctAnswer]}</p>
                      <p className="text-slate-400 text-sm mt-2">{q.explanation}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  // Quiz in progress
  if (questions && !finished) {
    const q = questions[currentQuestion];
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={handleReset} className="text-slate-400 hover:text-white">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Salir
          </Button>
          <Badge variant="outline" className="border-purple-500/50 text-purple-400">
            {currentQuestion + 1}/{questions.length}
          </Badge>
        </div>

        <Progress value={((currentQuestion + 1) / questions.length) * 100} className="h-2 bg-slate-800" />

        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-8">
            <h2 className="text-xl font-semibold text-white mb-6">{q.question}</h2>

            <div className="space-y-3">
              {q.options.map((option, i) => {
                let borderClass = "border-slate-700 hover:border-slate-600";
                let bgClass = "bg-slate-800/50";

                if (showResult) {
                  if (i === q.correctAnswer) {
                    borderClass = "border-green-500/50";
                    bgClass = "bg-green-500/10";
                  } else if (i === selectedAnswer && i !== q.correctAnswer) {
                    borderClass = "border-red-500/50";
                    bgClass = "bg-red-500/10";
                  }
                } else if (i === selectedAnswer) {
                  borderClass = "border-purple-500/50";
                  bgClass = "bg-purple-500/10";
                }

                return (
                  <motion.button
                    key={i}
                    whileHover={!showResult ? { scale: 1.01 } : {}}
                    whileTap={!showResult ? { scale: 0.99 } : {}}
                    onClick={() => handleSelectAnswer(i)}
                    className={`w-full text-left p-4 rounded-xl border ${borderClass} ${bgClass} transition-all`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-8 h-8 rounded-full border ${
                        i === selectedAnswer ? "border-purple-500 bg-purple-500/20" : "border-slate-600"
                      } flex items-center justify-center text-sm font-medium ${
                        showResult && i === q.correctAnswer ? "border-green-500 bg-green-500/20 text-green-400" :
                        showResult && i === selectedAnswer ? "border-red-500 bg-red-500/20 text-red-400" :
                        i === selectedAnswer ? "text-purple-400" : "text-slate-400"
                      }`}>
                        {String.fromCharCode(65 + i)}
                      </span>
                      <span className="text-slate-200">{option}</span>
                      {showResult && i === q.correctAnswer && (
                        <CheckCircle2 className="w-5 h-5 text-green-400 ml-auto" />
                      )}
                      {showResult && i === selectedAnswer && i !== q.correctAnswer && (
                        <XCircle className="w-5 h-5 text-red-400 ml-auto" />
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {showResult && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-4 rounded-lg bg-slate-800/50 border border-slate-700"
              >
                <p className="text-sm text-slate-300">
                  <span className="font-medium text-white">Explicación: </span>
                  {q.explanation}
                </p>
              </motion.div>
            )}

            <div className="mt-6 flex justify-end">
              {!showResult ? (
                <Button
                  onClick={handleConfirm}
                  disabled={selectedAnswer === null}
                  className="bg-gradient-to-r from-purple-600 to-pink-600"
                >
                  Confirmar respuesta
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  className="bg-gradient-to-r from-purple-600 to-pink-600"
                >
                  {currentQuestion < questions.length - 1 ? "Siguiente pregunta" : "Ver resultados"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Generator view
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Quizzes</h1>
          <p className="text-slate-400 mt-1">Crea cuestionarios de práctica con IA</p>
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
              <p className="text-slate-400 mt-1">Selecciona material y genera preguntas de práctica</p>
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
                    Llegaste a tu límite mensual. Mejora tu plan para generar más quizzes.
                  </p>
                </div>
              )}

              <Button
                onClick={handleGenerate}
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
