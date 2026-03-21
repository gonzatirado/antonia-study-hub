import { google } from "@ai-sdk/google";
import { generateText, streamText, Output } from "ai";
import { z } from "zod";
import { structuredSummarySchema } from "./summary-schema";

const model = google("gemini-2.5-flash");

// ─── Summary (streaming) ───

export const summarySystemPrompt = `Eres un asistente educativo experto en crear resúmenes de estudio visualmente atractivos y completos.

INSTRUCCIONES:
- Crea un resumen detallado del siguiente contenido académico
- Usa formato Markdown con buena estructura visual
- Incluye:
  - Título principal con emoji relevante
  - Secciones claras con headers (##, ###)
  - Puntos clave resaltados en **negrita**
  - Listas con viñetas para conceptos importantes
  - Tablas comparativas cuando sea útil
  - Bloques de código si hay fórmulas o ejemplos técnicos
  - Notas importantes en blockquotes (> )
  - Separadores (---) entre secciones principales
- OBLIGATORIO: Incluye al menos 2-3 diagramas Mermaid donde ayuden a visualizar:
  - Procesos paso a paso → usa flowchart (graph TD)
  - Líneas temporales → usa timeline
  - Relaciones entre conceptos → usa mindmap
  - Jerarquías → usa graph TD con nodos
  - Comparaciones → usa tablas markdown
  - Ciclos o secuencias → usa sequenceDiagram
- Cada diagrama Mermaid debe ir en un bloque de código con \`\`\`mermaid
- El resumen debe ser de 2-4 páginas de extensión
- Usa un tono académico pero accesible
- Incluye una sección final de "Conceptos Clave" como bullet points rápidos para repasar`;

export function streamSummary(content: string) {
  return streamText({
    model,
    system: summarySystemPrompt,
    prompt: `CONTENIDO A RESUMIR:\n${content}`,
  });
}

// Non-streaming version for backwards compatibility
export async function generateSummary(
  content: string,
): Promise<string> {
  const { text } = await generateText({
    model,
    system: summarySystemPrompt,
    prompt: `CONTENIDO A RESUMIR:\n${content}`,
  });
  return text;
}

// ─── Structured Summary (premium template) ───

const structuredSummaryPrompt = `Eres un asistente educativo experto en crear resúmenes de estudio estructurados y visualmente ricos.

INSTRUCCIONES OBLIGATORIAS:
- Analiza el contenido y genera un resumen estructurado en JSON
- El título debe ser descriptivo y conciso
- El overview debe ser 2-3 oraciones que capturen la esencia del contenido
- Crea entre 3-8 secciones principales, cada una con un emoji relevante
- Cada sección contiene "blocks" que pueden ser:
  - "text": párrafo explicativo claro y detallado
  - "keypoint": punto clave importante (usa highlight: true para los más críticos)
  - "list": lista de items relacionados
  - "table": tabla comparativa con headers y rows
  - "diagram": diagrama Mermaid (usa graph TD para flujos, mindmap para relaciones, timeline para secuencias, sequenceDiagram para interacciones)
  - "callout": nota especial (variant: "info" para datos, "warning" para precauciones, "tip" para consejos, "example" para ejemplos)
  - "formula": fórmulas o expresiones técnicas importantes
- OBLIGATORIO: incluye al menos 2 diagramas Mermaid distribuidos en las secciones
- OBLIGATORIO: incluye al menos 1 tabla comparativa
- OBLIGATORIO: incluye al menos 3 keypoints con highlight: true
- Los keyTakeaways deben ser 5-8 puntos de repaso rápido
- Evalúa la dificultad del contenido (beginner/intermediate/advanced)
- Estima el tiempo de lectura en minutos
- Usa un tono académico pero accesible
- Todo el contenido debe estar en español`;

export async function generateStructuredSummary(content: string) {
  const { output } = await generateText({
    model,
    output: Output.object({ schema: structuredSummarySchema }),
    system: structuredSummaryPrompt,
    prompt: `CONTENIDO A RESUMIR:\n${content}`,
  });
  return output!;
}

// ─── Quiz (structured output) ───

const quizSchema = z.object({
  questions: z.array(
    z.object({
      id: z.string(),
      question: z.string(),
      options: z.array(z.string()).length(4),
      correctAnswer: z.number().min(0).max(3),
      explanation: z.string(),
    })
  ),
});

export type QuizResult = z.infer<typeof quizSchema>;

export async function generateQuiz(
  content: string,
  numQuestions: number = 5,
): Promise<QuizResult> {
  const { output } = await generateText({
    model,
    output: Output.object({ schema: quizSchema }),
    system: `Eres un profesor experto en crear evaluaciones de selección múltiple.
Crea exactamente ${numQuestions} preguntas de selección múltiple basadas en el contenido proporcionado.
Cada pregunta debe tener exactamente 4 opciones (A, B, C, D).
Las preguntas deben cubrir diferentes niveles de dificultad (fácil, medio, difícil).
Incluye una explicación breve de por qué la respuesta correcta es correcta.`,
    prompt: `CONTENIDO:\n${content}`,
  });
  return output!;
}

// ─── Exam Prep (structured output) ───

const examPlanSchema = z.object({
  plan: z.array(
    z.object({
      date: z.string(),
      tasks: z.array(
        z.object({
          id: z.string(),
          type: z.enum(["study", "quiz", "practice", "review"]),
          title: z.string(),
          description: z.string(),
          content: z.string(),
        })
      ),
    })
  ),
});

export type ExamPlanResult = z.infer<typeof examPlanSchema>;

export async function generateExamPlan(
  content: string,
  examDate: string,
  description: string,
): Promise<ExamPlanResult> {
  const today = new Date().toISOString().split("T")[0];

  const { output } = await generateText({
    model,
    output: Output.object({ schema: examPlanSchema }),
    system: `Eres un tutor experto en planificación de estudio para exámenes universitarios.

CONTEXTO:
- Fecha actual: ${today}
- Fecha del examen: ${examDate}
- Descripción del examen: ${description}

INSTRUCCIONES:
- Crea un plan de estudio día a día desde hoy hasta el día del examen
- Cada día debe tener entre 2-4 tareas variadas
- Tipos de tareas:
  - "study": Lectura y estudio de material (incluir contenido resumido en markdown)
  - "quiz": Preguntas de práctica (incluir 3-5 preguntas con respuestas)
  - "practice": Ejercicios prácticos (problemas para resolver)
  - "review": Repaso de temas anteriores
- Distribuye el contenido de manera progresiva (de lo básico a lo complejo)
- Los últimos 1-2 días deben ser de repaso general
- Incluye contenido real y útil en cada tarea basado en el material proporcionado`,
    prompt: `MATERIAL DE ESTUDIO:\n${content}`,
  });
  return output!;
}
