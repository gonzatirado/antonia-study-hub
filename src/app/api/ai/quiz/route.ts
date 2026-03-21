import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { generateQuiz } from "@/lib/ai/gemini";
import { checkUsageLimit, incrementUsage } from "@/lib/firebase/usage";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, numQuestions = 5, userId } = body;

    if (!content || typeof content !== "string") {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    // Check usage limit if userId provided
    if (userId) {
      const { allowed, used, limit } = await checkUsageLimit(userId, "quizzes");
      if (!allowed) {
        return NextResponse.json(
          { error: `Limite alcanzado: ${used}/${limit} quizzes usados este mes.` },
          { status: 429 }
        );
      }
    }

    const quiz = await generateQuiz(content, numQuestions);

    // Increment usage after successful generation
    if (userId) {
      await incrementUsage(userId, "quizzes", Math.ceil(content.length / 4));
      for (let i = 0; i < numQuestions; i++) {
        await incrementUsage(userId, "practice_questions");
      }
    }

    return NextResponse.json({
      ...quiz,
      model: "gemini-2.5-flash",
    });
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json(
      { error: "Failed to generate quiz" },
      { status: 500 }
    );
  }
}
