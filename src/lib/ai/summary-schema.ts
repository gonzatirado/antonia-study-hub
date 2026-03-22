import { z } from "zod";

// ─── Content Block Schema ───
// Each section contains typed blocks. Field usage depends on `type`:
//   text/keypoint/callout/formula → content
//   list → items
//   table → headers + rows
//   diagram → mermaid + diagramType + diagramDescription

const contentBlockSchema = z.object({
  type: z.enum(["text", "keypoint", "list", "table", "diagram", "callout", "formula"]),
  // text, keypoint, callout, formula
  content: z.string().optional(),
  // keypoint emphasis
  highlight: z.boolean().optional(),
  // list
  items: z.array(z.string()).optional(),
  // table
  headers: z.array(z.string()).optional(),
  rows: z.array(z.array(z.string())).optional(),
  // callout variant
  variant: z.enum(["info", "warning", "tip", "example"]).optional(),
  // diagram (mermaid) — dedicated field so frontend knows when to render <MermaidDiagram>
  mermaid: z.string().optional(),
  diagramType: z.string().optional().describe("graph TD | mindmap"),
  diagramDescription: z.string().optional().describe("One-line explanation of what the diagram shows"),
});

export type ContentBlock = z.infer<typeof contentBlockSchema>;

// ─── Exam Question Schema (scenario-based) ───

const examQuestionSchema = z.object({
  context: z.string().describe("Scenario setup: 'Given X situation...'"),
  question: z.string().describe("Application question: 'How would you apply Y?'"),
  expectedApproach: z.string().describe("Reasoning path the student should follow"),
  answer: z.string().describe("Concise correct answer"),
});

export type ExamQuestion = z.infer<typeof examQuestionSchema>;

// ─── Section Schema ───

const sectionSchema = z.object({
  title: z.string(),
  emoji: z.string().describe("Visual emoji for the section"),
  label: z.string().describe("Category tag: [LAB], [GEO], [CALCULO], [TEORIA]"),
  blocks: z.array(contentBlockSchema),
});

export type SummarySection = z.infer<typeof sectionSchema>;

// ─── Full Structured Summary ───

export const structuredSummarySchema = z.object({
  title: z.string(),
  emoji: z.string(),
  overview: z.string().describe("2-3 sentence overview of the entire content"),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]).describe("Content difficulty level"),
  estimatedReadTime: z.number().describe("Estimated read time in minutes"),
  sections: z.array(sectionSchema).describe("3-8 main content sections"),
  keyTakeaways: z.array(z.string()).describe("5-8 bullet points for quick review"),
  examQuestions: z.array(examQuestionSchema).describe("3-8 scenario-based exam questions"),
});

export type StructuredSummary = z.infer<typeof structuredSummarySchema>;
