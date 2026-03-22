import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { generateFlashcards } from "@/lib/ai/gemini";
import { checkUsageLimit, incrementUsage } from "@/lib/firebase/usage";
import { verifyAuthToken } from "@/lib/firebase/admin";
import { sanitizeAIContent } from "@/lib/utils/sanitize-content";
import { validateOrigin } from "@/lib/utils/csrf";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyAuthToken(request);
    if (!authResult.authenticated) {
      return NextResponse.json(
        { error: "No autorizado. Inicia sesion para continuar." },
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
    const { content: rawContent, numCards = 15 } = body;

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
    try {
      const { allowed, used, limit } = await checkUsageLimit(userId, "summaries");
      if (!allowed) {
        return NextResponse.json(
          { error: `Limite alcanzado: ${used}/${limit} generaciones usadas este mes.` },
          { status: 429 }
        );
      }
    } catch (usageErr) {
      console.warn("[flashcards] Usage check failed, proceeding:", usageErr);
    }

    const clampedNum = Math.min(Math.max(numCards, 5), 30);
    const result = await generateFlashcards(content, clampedNum);

    // Increment usage
    const tokensEstimated = Math.ceil(content.length / 4);
    incrementUsage(userId, "summaries", tokensEstimated).catch((err) =>
      Sentry.captureException(err)
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("[flashcards] Error:", error);
    Sentry.captureException(error);
    return NextResponse.json(
      { error: "Error al generar flashcards. Intenta de nuevo." },
      { status: 500 }
    );
  }
}
