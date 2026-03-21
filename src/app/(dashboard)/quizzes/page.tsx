"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { extractTextFromFiles } from "@/lib/utils/extract-text";
import { getAuthHeaders } from "@/lib/firebase/get-auth-token";
import { QuizGenerator } from "@/components/quizzes/quiz-generator";
import { QuizPlayer } from "@/components/quizzes/quiz-player";
import { QuizResults } from "@/components/quizzes/quiz-results";
import type { QuizQuestion } from "@/components/quizzes/types";

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

      const authHeaders = await getAuthHeaders();
      const res = await fetch("/api/ai/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify({ content: text, numQuestions: 5 }),
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

  if (finished && questions) {
    return (
      <QuizResults
        questions={questions}
        answers={answers}
        score={score}
        onReset={handleReset}
      />
    );
  }

  if (questions && !finished) {
    return (
      <QuizPlayer
        questions={questions}
        currentQuestion={currentQuestion}
        selectedAnswer={selectedAnswer}
        showResult={showResult}
        onSelectAnswer={handleSelectAnswer}
        onConfirm={handleConfirm}
        onNext={handleNext}
        onReset={handleReset}
      />
    );
  }

  return (
    <QuizGenerator
      subjects={subjects}
      selectedSubject={selectedSubject}
      onSubjectChange={setSelectedSubject}
      files={files}
      onFilesSelected={setFiles}
      generating={generating}
      onGenerate={handleGenerate}
      canGenerate={canGenerate}
      quizzesUsed={quizzesUsed}
      quizzesLimit={quizzesLimit}
      error={error}
    />
  );
}
