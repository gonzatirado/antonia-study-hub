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
      <Button variant="ghost" onClick={onReset} className="text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Nuevo quiz
      </Button>

      <Card className="bg-card/50 border-border">
        <CardContent className="p-12 text-center">
          <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${
            percentage >= 70 ? "bg-success/20" : percentage >= 40 ? "bg-warning/20" : "bg-destructive/20"
          }`}>
            <span className={`text-4xl font-bold ${
              percentage >= 70 ? "text-success" : percentage >= 40 ? "text-warning" : "text-destructive"
            }`}>
              {percentage}%
            </span>
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            {percentage >= 70 ? "Excelente!" : percentage >= 40 ? "Buen intento" : "Sigue practicando"}
          </h2>
          <p className="text-muted-foreground mb-6">
            Acertaste {score} de {questions.length} preguntas
          </p>
          <div className="flex items-center justify-center gap-3">
            <Button onClick={onReset} variant="outline" className="border-border text-foreground/80">
              <RotateCcw className="w-4 h-4 mr-2" />
              Nuevo quiz
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Review answers */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Revision</h3>
        {questions.map((q, i) => {
          const userAnswer = answers[i];
          const isCorrect = userAnswer === q.correctAnswer;
          return (
            <Card key={q.id} className={`bg-card/50 border ${isCorrect ? "border-success/30" : "border-destructive/30"}`}>
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  {isCorrect ? (
                    <CheckCircle2 className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                  )}
                  <div>
                    <p className="text-foreground font-medium">{q.question}</p>
                    {!isCorrect && userAnswer !== null && (
                      <p className="text-destructive text-sm mt-1">Tu respuesta: {q.options[userAnswer]}</p>
                    )}
                    <p className="text-success text-sm mt-1">Correcta: {q.options[q.correctAnswer]}</p>
                    <p className="text-muted-foreground text-sm mt-2">{q.explanation}</p>
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
