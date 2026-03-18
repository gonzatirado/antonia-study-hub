import { NextRequest, NextResponse } from "next/server";
import { generateQuiz } from "@/lib/ai/gemini";
import { checkUsageLimit, incrementUsage } from "@/lib/firebase/usage";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, numQuestions = 5, tier = "flash", userId } = body;

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

    const quiz = await generateQuiz(content, numQuestions, tier);

    // Increment usage after successful generation
    if (userId) {
      await incrementUsage(userId, "quizzes", Math.ceil(content.length / 4));
      // Also track individual practice questions (default 5)
      for (let i = 0; i < numQuestions; i++) {
        await incrementUsage(userId, "practice_questions");
      }
    }

    return NextResponse.json({
      ...quiz,
      model: tier,
    });
  } catch (error) {
    console.error("Quiz generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate quiz" },
      { status: 500 }
    );
  }
}
