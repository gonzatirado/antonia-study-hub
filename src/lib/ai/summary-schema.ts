import { z } from "zod";

// ─── Content Block Schema ───
// Each section contains an array of typed blocks that our premium
// React template knows how to render beautifully.

const contentBlockSchema = z.object({
  type: z.enum(["text", "keypoint", "list", "table", "diagram", "callout", "formula"]),
  // text, keypoint, callout, formula
  content: z.string().optional(),
  // list
  items: z.array(z.string()).optional(),
  // table
  headers: z.array(z.string()).optional(),
  rows: z.array(z.array(z.string())).optional(),
  // diagram (mermaid)
  mermaid: z.string().optional(),
  diagramCaption: z.string().optional(),
  // callout variant
  variant: z.enum(["info", "warning", "tip", "example"]).optional(),
  // keypoint emphasis
  highlight: z.boolean().optional(),
});

export type ContentBlock = z.infer<typeof contentBlockSchema>;

// ─── Section Schema ───

const sectionSchema = z.object({
  title: z.string(),
  emoji: z.string(),
  blocks: z.array(contentBlockSchema),
});

export type SummarySection = z.infer<typeof sectionSchema>;

// ─── Full Structured Summary ───

export const structuredSummarySchema = z.object({
  title: z.string(),
  emoji: z.string(),
  overview: z.string().describe("2-3 sentence overview of the entire content"),
  sections: z.array(sectionSchema).describe("3-8 main content sections"),
  keyTakeaways: z.array(z.string()).describe("5-8 bullet points for quick review"),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]).describe("Content difficulty level"),
  estimatedReadTime: z.number().describe("Estimated read time in minutes"),
});

export type StructuredSummary = z.infer<typeof structuredSummarySchema>;
