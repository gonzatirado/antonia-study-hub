import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { streamSummary } from "@/lib/ai/gemini";
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
    const { content: rawContent } = body;

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

    // Check usage limit (fail-open if Firebase unreachable)
    try {
      const { allowed, used, limit } = await checkUsageLimit(userId, "summaries");
      if (!allowed) {
        return NextResponse.json(
          { error: `Límite alcanzado: ${used}/${limit} resúmenes usados este mes.` },
          { status: 429 }
        );
      }
    } catch (usageErr) {
      console.warn("[summary] Usage check failed, proceeding anyway:", usageErr);
    }

    const result = streamSummary(content);

    // Increment usage after starting generation
    const tokensEstimated = Math.ceil(content.length / 4);
    incrementUsage(userId, "summaries", tokensEstimated).catch((err) =>
      Sentry.captureException(err)
    );

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("[summary] Error:", error);
    Sentry.captureException(error);
    return NextResponse.json(
      { error: "Error al generar el resumen. Intenta de nuevo." },
      { status: 500 }
    );
  }
}
