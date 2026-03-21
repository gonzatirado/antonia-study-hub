import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { streamSummary } from "@/lib/ai/gemini";
import { checkUsageLimit, incrementUsage } from "@/lib/firebase/usage";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, userId } = body;

    if (!content || typeof content !== "string") {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    if (content.length > 500000) {
      return NextResponse.json(
        { error: "Content too long. Maximum 500,000 characters." },
        { status: 400 }
      );
    }

    // Check usage limit if userId provided (fail-open: don't block if Firebase is unreachable)
    if (userId) {
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
    }

    const result = streamSummary(content);

    // Increment usage after starting generation
    if (userId) {
      const tokensEstimated = Math.ceil(content.length / 4);
      incrementUsage(userId, "summaries", tokensEstimated).catch((err) =>
        Sentry.captureException(err)
      );
    }

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("[summary] Error:", error);
    Sentry.captureException(error);
    const message = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json(
      { error: `Error al generar el resumen: ${message}` },
      { status: 500 }
    );
  }
}
