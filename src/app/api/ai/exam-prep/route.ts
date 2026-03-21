import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { generateExamPlan } from "@/lib/ai/gemini";
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
    const { content: rawContent, examDate, description } = body;

    if (!rawContent || !examDate || !description) {
      return NextResponse.json(
        { error: "Content, examDate, and description are required" },
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
    const { allowed, used, limit } = await checkUsageLimit(userId, "exam_preps");
    if (!allowed) {
      return NextResponse.json(
        { error: `Limite alcanzado: ${used}/${limit} preparaciones usadas este mes.` },
        { status: 429 }
      );
    }

    const plan = await generateExamPlan(content, examDate, description);

    // Increment usage after successful generation
    await incrementUsage(userId, "exam_preps", Math.ceil(content.length / 4));

    return NextResponse.json({
      ...plan,
      model: "gemini-2.5-flash",
    });
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json(
      { error: "Failed to generate exam prep plan" },
      { status: 500 }
    );
  }
}
