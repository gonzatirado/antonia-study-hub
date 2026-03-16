import { NextRequest, NextResponse } from "next/server";
import { generateExamPlan } from "@/lib/ai/gemini";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, examDate, description, tier = "flash" } = body;

    if (!content || !examDate || !description) {
      return NextResponse.json(
        { error: "Content, examDate, and description are required" },
        { status: 400 }
      );
    }

    const plan = await generateExamPlan(content, examDate, description, tier);

    return NextResponse.json({
      ...plan,
      model: tier,
    });
  } catch (error) {
    console.error("Exam prep generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate exam prep plan" },
      { status: 500 }
    );
  }
}
