import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { generateExamPlan } from "@/lib/ai/gemini";
import { checkUsageLimit, incrementUsage } from "@/lib/firebase/usage";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, examDate, description, tier = "flash", userId } = body;

    if (!content || !examDate || !description) {
      return NextResponse.json(
        { error: "Content, examDate, and description are required" },
        { status: 400 }
      );
    }

    // Check usage limit if userId provided
    if (userId) {
      const { allowed, used, limit } = await checkUsageLimit(userId, "exam_preps");
      if (!allowed) {
        return NextResponse.json(
          { error: `Limite alcanzado: ${used}/${limit} preparaciones usadas este mes.` },
          { status: 429 }
        );
      }
    }

    const plan = await generateExamPlan(content, examDate, description, tier);

    // Increment usage after successful generation
    if (userId) {
      await incrementUsage(userId, "exam_preps", Math.ceil(content.length / 4));
    }

    return NextResponse.json({
      ...plan,
      model: tier,
    });
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json(
      { error: "Failed to generate exam prep plan" },
      { status: 500 }
    );
  }
}
