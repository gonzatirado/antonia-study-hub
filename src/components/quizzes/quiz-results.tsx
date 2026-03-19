"use client";

import { CheckCircle2, XCircle, ArrowLeft, RotateCcw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { QuizQuestion } from "./types";

interface QuizResultsProps {
  questions: QuizQuestion[];
  answers: (number | null)[];
  score: number;
  onReset: () => void;
}

export function QuizResults({ questions, answers, score, onReset }: QuizResultsProps) {
  const percentage = Math.round((score / questions.length) * 100);

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={onReset} className="text-slate-400 hover:text-white">
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
            <Button onClick={onReset} variant="outline" className="border-slate-700 text-slate-300">
              <RotateCcw className="w-4 h-4 mr-2" />
              Nuevo quiz
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Review answers */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Revision</h3>
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
