"use client";

import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle2, XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { QuizQuestion } from "./types";

interface QuizPlayerProps {
  questions: QuizQuestion[];
  currentQuestion: number;
  selectedAnswer: number | null;
  showResult: boolean;
  onSelectAnswer: (index: number) => void;
  onConfirm: () => void;
  onNext: () => void;
  onReset: () => void;
}

export function QuizPlayer({
  questions,
  currentQuestion,
  selectedAnswer,
  showResult,
  onSelectAnswer,
  onConfirm,
  onNext,
  onReset,
}: QuizPlayerProps) {
  const q = questions[currentQuestion];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onReset} className="text-slate-400 hover:text-white">
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
                  onClick={() => onSelectAnswer(i)}
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
                <span className="font-medium text-white">Explicacion: </span>
                {q.explanation}
              </p>
            </motion.div>
          )}

          <div className="mt-6 flex justify-end">
            {!showResult ? (
              <Button
                onClick={onConfirm}
                disabled={selectedAnswer === null}
                className="bg-gradient-to-r from-purple-600 to-pink-600"
              >
                Confirmar respuesta
              </Button>
            ) : (
              <Button
                onClick={onNext}
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
