import { NextRequest, NextResponse } from "next/server";
import { generateQuiz } from "@/lib/ai/gemini";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, numQuestions = 5, tier = "flash" } = body;

    if (!content || typeof content !== "string") {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    const quiz = await generateQuiz(content, numQuestions, tier);

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
