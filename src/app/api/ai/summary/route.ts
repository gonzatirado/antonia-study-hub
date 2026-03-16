import { NextRequest, NextResponse } from "next/server";
import { generateSummary } from "@/lib/ai/gemini";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, tier = "flash" } = body;

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

    const summary = await generateSummary(content, tier);

    return NextResponse.json({
      summary,
      model: tier,
      tokens_estimated: Math.ceil(content.length / 4) + Math.ceil(summary.length / 4),
    });
  } catch (error) {
    console.error("Summary generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate summary" },
      { status: 500 }
    );
  }
}
