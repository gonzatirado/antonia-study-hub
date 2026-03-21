import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { generateQuiz } from "@/lib/ai/gemini";
import { checkUsageLimit, incrementUsage } from "@/lib/firebase/usage";
import { verifyAuthToken } from "@/lib/firebase/admin";
import { sanitizeAIContent } from "@/lib/utils/sanitize-content";
import { validateOrigin } from "@/lib/utils/csrf";

export async function POST(request: NextRequest) {
  try {
    // Verify authentication server-side
    const authResult = await verifyAuthToken(request);
    if (!authResult.authenticated) {
      return NextResponse.json(
        { error: "No autorizado. Inicia sesión para continuar." },
        { status: 401 }
      );
    }
    const userId = authResult.uid;

    if (!validateOrigin(request)) {
      return NextResponse.json(
        { error: "Invalid request origin" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { content: rawContent, numQuestions: rawNumQuestions = 5 } = body;
    const numQuestions = Math.min(Math.max(1, Number(rawNumQuestions) || 5), 20);

    if (!rawContent || typeof rawContent !== "string") {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    if (rawContent.length > 500000) {
      return NextResponse.json(
        { error: "Content too long. Maximum 500,000 characters." },
        { status: 400 }
      );
    }

    const content = sanitizeAIContent(rawContent);

    // Check usage limit
    const { allowed, used, limit } = await checkUsageLimit(userId, "quizzes");
    if (!allowed) {
      return NextResponse.json(
        { error: `Limite alcanzado: ${used}/${limit} quizzes usados este mes.` },
        { status: 429 }
      );
    }

    const quiz = await generateQuiz(content, numQuestions);

    // Increment usage after successful generation
    await incrementUsage(userId, "quizzes", Math.ceil(content.length / 4));
    for (let i = 0; i < numQuestions; i++) {
      await incrementUsage(userId, "practice_questions");
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
