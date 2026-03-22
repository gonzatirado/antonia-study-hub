import { google } from "@ai-sdk/google";
import { generateText, streamText, Output } from "ai";
import { z } from "zod";
import { structuredSummarySchema } from "./summary-schema";

const model = google("gemini-2.5-flash");

// ─── Summary (streaming, adaptive) ───

export type SummaryMode = "standard" | "extenso";

type SummaryTier = "compact" | "standard" | "extended";

function getSummaryTier(contentLength: number): SummaryTier {
  if (contentLength < 3000) return "compact";
  if (contentLength < 20000) return "standard";
  return "extended";
}

function getTargetWords(contentLength: number): number {
  const inputWords = Math.round(contentLength / 5.5); // avg chars per spanish word
  return Math.max(100, Math.round(inputWords * 0.45)); // 45% compression
}

function buildStandardPrompt(contentLength: number): string {
  const tier = getSummaryTier(contentLength);
  const target = getTargetWords(contentLength);

  const tierBlock: Record<SummaryTier, string> = {
    compact: `Maximo ${target} palabras. SIN markmap. SIN mermaid.
METODO: Extrae los 5-8 datos mas importantes, escribe cada uno como 1 bullet.
- 3 preguntas de examen al final`,

    standard: `Maximo ${target} palabras de texto.
- UN markmap al inicio como overview (no cuenta en el limite de palabras)
- 3-5 secciones con headers (##) para organizar los bullets por tema
- SIN diagramas Mermaid
- 5 preguntas de examen al final`,

    extended: `Maximo ${target} palabras de texto.
- UN markmap al inicio como overview
- 5-8 secciones con headers (##) organizadas por tema
- SIN diagramas Mermaid
- 1 tabla comparativa si aplica
- 8 preguntas de examen al final`,
  };

  return `Eres un asistente de estudio. COMPRIME material academico para examen. Be concise.

REGLAS:
1. Tu texto DEBE tener MENOS palabras que el original. Ratio: 40-50%.
2. Solo bullets de 1 linea. Sin parrafos.
3. Solo lo preguntable: definiciones, datos duros, formulas, diferencias.
4. Sin introducciones, conclusiones, transiciones ni meta-comentarios.
5. **Negrita** solo para terminos clave.
6. Espanol.

METODO:
PASO 1: Identifica los conceptos mas importantes del material.
PASO 2: Organiza en secciones con headers (## Seccion) — NO una lista plana.
PASO 3: Dentro de cada seccion, bullets concisos (max 15 palabras por bullet).
PASO 4: Agrega preguntas de examen al final.

FORMATO MARKMAP (cuando aplique):
\`\`\`markmap
# Tema
## Concepto
### Detalle
\`\`\`

${tierBlock[tier]}

SECCION FINAL: ## 🧠 Para el examen
Preguntas directas sin respuesta.`;
}

function buildExtensoPrompt(contentLength: number): string {
  return `Eres un asistente de estudio. Crea un resumen EXTENSO y profundo para preparar examenes.

INCLUYE TODO:
- UN markmap completo al inicio con todos los conceptos y relaciones
- Secciones detalladas por tema con explicaciones claras
- Tablas comparativas cuando haya conceptos comparables
- 1-2 diagramas Mermaid para procesos (sin HTML en nodos, texto plano corto)
- Ejemplos concretos del material
- Conexiones entre conceptos
- Trucos mnemonicos cuando aplique

FORMATO:
- **Negrita** para terminos clave
- Bullets concisos
- Blockquotes (> ) para formulas o datos clave
- Espanol

FORMATO MARKMAP:
\`\`\`markmap
# Tema
## Concepto
### Detalle
\`\`\`

SECCION FINAL: ## 🧠 Para el examen
- 10-15 preguntas con respuestas breves (1-2 oraciones)
- Agrupadas por subtema`;
}

/** Exported for tests / external use */
export const summarySystemPrompt = buildStandardPrompt(5000);

export function streamSummary(content: string, mode: SummaryMode = "standard") {
  const wordCount = content.split(/\s+/).length;
  const system = mode === "extenso"
    ? buildExtensoPrompt(content.length)
    : buildStandardPrompt(content.length);
  const targetWords = mode === "extenso" ? null : Math.round(wordCount * 0.5);
  const wordHint = targetWords ? ` (${wordCount} palabras — tu resumen debe tener menos de ${targetWords})` : "";

  return streamText({
    model,
    system,
    prompt: `CONTENIDO A RESUMIR${wordHint}:\n${content}`,
    ...(mode === "standard" ? { maxTokens: Math.max(800, Math.round(wordCount * 2)) } : {}),
  });
}

// Non-streaming version for backwards compatibility
export async function generateSummary(
  content: string,
  mode: SummaryMode = "standard",
): Promise<string> {
  const wordCount = content.split(/\s+/).length;
  const system = mode === "extenso"
    ? buildExtensoPrompt(content.length)
    : buildStandardPrompt(content.length);
  const targetWords = mode === "extenso" ? null : Math.round(wordCount * 0.5);
  const wordHint = targetWords ? ` (${wordCount} palabras — tu resumen debe tener menos de ${targetWords})` : "";

  const { text } = await generateText({
    model,
    system,
    prompt: `CONTENIDO A RESUMIR${wordHint}:\n${content}`,
    ...(mode === "standard" ? { maxTokens: Math.max(800, Math.round(wordCount * 2)) } : {}),
  });
  return text;
}

// ─── Structured Summary (premium template — Architectural Prompt v2) ───
// Co-designed with Gemini 2.5 Flash for optimal structured output.

const structuredSummaryPrompt = `# ROLE: SENIOR ACADEMIC ARCHITECT (STEM SPECIALIST)
Tu mision es deconstruir material academico complejo y reconstruirlo en un objeto JSON de alta fidelidad para la app StudyHub.

# LOGICA OPERATIVA:
1. DENSIDAD DINAMICA: Evalua el tamano del input. Si es breve, genera 2-3 secciones. Si es extenso (50+ paginas), expande a 5-8 secciones con tablas y diagramas profundos.
2. ATOMICIDAD: Cada valor en el JSON debe ser una unidad de informacion autosuficiente. Prefiere la sintesis tecnica sobre la narrativa.
3. ETIQUETADO: Usa el campo 'label' para categorizar cada seccion: [LAB], [GEO], [CALCULO], [TEORIA], [CONCEPTO], [APLICACION].
4. ESTRATIFICACION: Organiza secciones en capas: Conceptos Fundamentales -> Desarrollo Tecnico -> Aplicacion Practica.

# REGLAS DE BLOQUES (STRICT — cada type usa campos exclusivos):
- type "formula": Usa el campo 'content' con delimitadores LaTeX estandar. $$ para bloques dedicados, $ para formulas inline. Ejemplo: content: "$$a^2 + b^2 = c^2$$"
- type "diagram": Escribe el codigo exclusivamente en el campo 'mermaid'. Usa graph TD o mindmap. PROHIBIDO usar etiquetas HTML, comillas o caracteres especiales dentro de los nodos. Usa 'diagramDescription' para explicar en una linea que muestra el diagrama.
- type "list": Usa exclusivamente el campo 'items'.
- type "table": Usa exclusivamente 'headers' y 'rows'. Usala para comparaciones tecnicas.
- type "text"/"keypoint"/"callout": Usa el campo 'content'.
- type "callout": Usa variant "tip" para tips de examen, "warning" para errores comunes, "info" para datos clave, "example" para ejemplos.
- type "keypoint": Usa highlight: true para los conceptos mas criticos (minimo 3 por resumen).

# EXAM QUESTIONS:
Crea preguntas de escenario de aplicacion real. NO preguntas de si/no.
Formato: "Dado [contexto X], como aplicaria [ley/concepto Y]?"
Explica el razonamiento esperado en 'expectedApproach'.
Genera entre 3-8 preguntas segun la extension del material.

# RESTRICCIONES:
- Idioma: Espanol tecnico (Chile/Latinoamerica).
- Concision: 60% mas corto que el original, manteniendo precision del 100%.
- Sin meta-comentarios. Ve directo al JSON.
- Tono: Directo, academico, sin adornos.`;

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

// ─── Flashcards (structured output) ───

const flashcardSchema = z.object({
  cards: z.array(
    z.object({
      id: z.string(),
      front: z.string().describe("Pregunta, concepto o termino a estudiar"),
      back: z.string().describe("Respuesta, definicion o explicacion completa"),
      difficulty: z.enum(["easy", "medium", "hard"]).describe("Dificultad estimada del concepto"),
      tags: z.array(z.string()).optional().describe("1-3 tags tematicos"),
    })
  ),
});

export type FlashcardResult = z.infer<typeof flashcardSchema>;

export async function generateFlashcards(
  content: string,
  numCards: number = 15,
): Promise<FlashcardResult> {
  const { output } = await generateText({
    model,
    output: Output.object({ schema: flashcardSchema }),
    system: `Eres un profesor experto en crear flashcards de estudio efectivas.

INSTRUCCIONES:
- Crea exactamente ${numCards} flashcards basadas en el contenido proporcionado
- Cada flashcard tiene un FRONT (pregunta/concepto) y un BACK (respuesta/explicacion)
- El FRONT debe ser conciso: una pregunta directa, un termino, o un concepto clave
- El BACK debe ser completo pero no excesivo: 1-3 oraciones que respondan claramente
- Varia los tipos de preguntas:
  - Definiciones ("Que es X?")
  - Comparaciones ("Cual es la diferencia entre X e Y?")
  - Aplicacion ("Cuando se usa X?")
  - Relaciones ("Como se relaciona X con Y?")
  - Ejemplos ("Da un ejemplo de X")
- Distribuye dificultades: ~30% easy, ~50% medium, ~20% hard
- Asigna 1-3 tags tematicos por card
- IDs deben ser unicos (usa formato "fc-1", "fc-2", etc.)
- Todo en espanol`,
    prompt: `CONTENIDO A CONVERTIR EN FLASHCARDS:\n${content}`,
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
