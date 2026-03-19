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
        <Button variant="ghost" onClick={onReset} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Salir
        </Button>
        <Badge variant="outline" className="border-primary/50 text-primary">
          {currentQuestion + 1}/{questions.length}
        </Badge>
      </div>

      <Progress value={((currentQuestion + 1) / questions.length) * 100} className="h-2 bg-muted" />

      <Card className="bg-card/50 border-border">
        <CardContent className="p-8">
          <h2 className="text-xl font-semibold text-foreground mb-6">{q.question}</h2>

          <div className="space-y-3">
            {q.options.map((option, i) => {
              let borderClass = "border-border hover:border-border/80";
              let bgClass = "bg-muted/50";

              if (showResult) {
                if (i === q.correctAnswer) {
                  borderClass = "border-success/50";
                  bgClass = "bg-success/10";
                } else if (i === selectedAnswer && i !== q.correctAnswer) {
                  borderClass = "border-destructive/50";
                  bgClass = "bg-destructive/10";
                }
              } else if (i === selectedAnswer) {
                borderClass = "border-primary/50";
                bgClass = "bg-primary/10";
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
                      i === selectedAnswer ? "border-primary bg-primary/20" : "border-muted-foreground/60"
                    } flex items-center justify-center text-sm font-medium ${
                      showResult && i === q.correctAnswer ? "border-success bg-success/20 text-success" :
                      showResult && i === selectedAnswer ? "border-destructive bg-destructive/20 text-destructive" :
                      i === selectedAnswer ? "text-primary" : "text-muted-foreground"
                    }`}>
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span className="text-foreground/80">{option}</span>
                    {showResult && i === q.correctAnswer && (
                      <CheckCircle2 className="w-5 h-5 text-success ml-auto" />
                    )}
                    {showResult && i === selectedAnswer && i !== q.correctAnswer && (
                      <XCircle className="w-5 h-5 text-destructive ml-auto" />
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
              className="mt-6 p-4 rounded-lg bg-muted/50 border border-border"
            >
              <p className="text-sm text-foreground/80">
                <span className="font-medium text-foreground">Explicacion: </span>
                {q.explanation}
              </p>
            </motion.div>
          )}

          <div className="mt-6 flex justify-end">
            {!showResult ? (
              <Button
                onClick={onConfirm}
                disabled={selectedAnswer === null}
                className="bg-primary"
              >
                Confirmar respuesta
              </Button>
            ) : (
              <Button
                onClick={onNext}
                className="bg-primary"
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
