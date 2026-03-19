import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { generateSummary } from "@/lib/ai/gemini";
import { checkUsageLimit, incrementUsage } from "@/lib/firebase/usage";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, tier = "flash", userId } = body;

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

    // Check usage limit if userId provided
    if (userId) {
      const { allowed, used, limit } = await checkUsageLimit(userId, "summaries");
      if (!allowed) {
        return NextResponse.json(
          { error: `Limite alcanzado: ${used}/${limit} resumenes usados este mes.` },
          { status: 429 }
        );
      }
    }

    const summary = await generateSummary(content, tier);
    const tokensEstimated = Math.ceil(content.length / 4) + Math.ceil(summary.length / 4);

    // Increment usage after successful generation
    if (userId) {
      await incrementUsage(userId, "summaries", tokensEstimated);
    }

    return NextResponse.json({
      summary,
      model: tier,
      tokens_estimated: tokensEstimated,
    });
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json(
      { error: "Failed to generate summary" },
      { status: 500 }
    );
  }
}
