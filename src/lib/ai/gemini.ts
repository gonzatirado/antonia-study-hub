import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export function getModel(tier: "flash" | "pro" = "flash") {
  const modelName = tier === "pro" ? "gemini-2.5-pro-preview-06-05" : "gemini-2.5-flash-preview-05-20";
  return genAI.getGenerativeModel({ model: modelName });
}

export async function generateSummary(
  content: string,
  tier: "flash" | "pro" = "flash"
): Promise<string> {
  const model = getModel(tier);

  const prompt = `Eres un asistente educativo experto en crear resúmenes de estudio visualmente atractivos y completos.

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
  - Diagramas en formato Mermaid cuando ayude a visualizar relaciones o procesos
  - Notas importantes en blockquotes (> )
  - Separadores (---) entre secciones principales
- El resumen debe ser de 2-4 páginas de extensión
- Usa un tono académico pero accesible
- Incluye una sección final de "Conceptos Clave" como bullet points rápidos para repasar

CONTENIDO A RESUMIR:
${content}`;

  const result = await model.generateContent(prompt);
  return result.response.text();
}

export async function generateQuiz(
  content: string,
  numQuestions: number = 5,
  tier: "flash" | "pro" = "flash"
): Promise<{
  questions: Array<{
    id: string;
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
  }>;
}> {
  const model = getModel(tier);

  const prompt = `Eres un profesor experto en crear evaluaciones de selección múltiple.

INSTRUCCIONES:
- Crea exactamente ${numQuestions} preguntas de selección múltiple basadas en el contenido proporcionado
- Cada pregunta debe tener exactamente 4 opciones (A, B, C, D)
- Las preguntas deben cubrir diferentes niveles de dificultad (fácil, medio, difícil)
- Incluye una explicación breve de por qué la respuesta correcta es correcta
- Responde ÚNICAMENTE con un JSON válido, sin markdown ni texto adicional

FORMATO DE RESPUESTA (JSON):
{
  "questions": [
    {
      "id": "q1",
      "question": "Texto de la pregunta",
      "options": ["Opción A", "Opción B", "Opción C", "Opción D"],
      "correctAnswer": 0,
      "explanation": "Explicación de por qué es correcta"
    }
  ]
}

CONTENIDO:
${content}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  // Clean potential markdown code blocks from response
  const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  return JSON.parse(cleaned);
}

export async function generateExamPlan(
  content: string,
  examDate: string,
  description: string,
  tier: "flash" | "pro" = "flash"
): Promise<{
  plan: Array<{
    date: string;
    tasks: Array<{
      id: string;
      type: "study" | "quiz" | "practice" | "review";
      title: string;
      description: string;
      content: string;
    }>;
  }>;
}> {
  const model = getModel(tier);

  const today = new Date().toISOString().split("T")[0];

  const prompt = `Eres un tutor experto en planificación de estudio para exámenes universitarios.

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
- Incluye contenido real y útil en cada tarea basado en el material proporcionado
- Responde ÚNICAMENTE con JSON válido

FORMATO DE RESPUESTA (JSON):
{
  "plan": [
    {
      "date": "2026-03-16",
      "tasks": [
        {
          "id": "d1t1",
          "type": "study",
          "title": "Introducción al tema X",
          "description": "Estudiar los conceptos fundamentales",
          "content": "## Contenido en markdown..."
        }
      ]
    }
  ]
}

MATERIAL DE ESTUDIO:
${content}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  return JSON.parse(cleaned);
}
