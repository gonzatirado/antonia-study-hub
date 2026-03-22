import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { verifyAuthToken } from "@/lib/firebase/admin";
import { validateOrigin } from "@/lib/utils/csrf";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

// Gemini PDF extraction can take 15-30s for large files
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    // Verify authentication server-side
    const authResult = await verifyAuthToken(request);
    if (!authResult.authenticated) {
      return NextResponse.json(
        { error: "No autorizado. Inicia sesión para continuar." },
        { status: 401 }
      );
    }

    if (!validateOrigin(request)) {
      return NextResponse.json(
        { error: "Invalid request origin" },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `Archivo demasiado grande. Máximo ${MAX_FILE_SIZE / (1024 * 1024)} MB.` },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    const mime = file.type;

    let text = "";

    // ── PDF — Gemini reads PDFs natively ──
    if (mime === "application/pdf" || ext === "pdf") {
      const base64 = buffer.toString("base64");
      const { text: pdfText } = await generateText({
        model: google("gemini-2.5-flash"),
        messages: [{
          role: "user",
          content: [
            { type: "text", text: "Extrae TODO el texto de este documento PDF. Transcribe el contenido completo manteniendo la estructura original (títulos, párrafos, listas, tablas). Si hay diagramas o figuras, descríbelos brevemente. Responde SOLO con el texto extraído, sin comentarios." },
            { type: "file", data: base64, mediaType: "application/pdf" },
          ],
        }],
      });
      text = pdfText;
    }

    // ── Word (.docx) ──
    else if (
      mime === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      ext === "docx"
    ) {
      const mammoth = await import("mammoth");
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;
    }

    // ── Excel (.xlsx, .xls) ──
    else if (
      mime === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      mime === "application/vnd.ms-excel" ||
      ext === "xlsx" || ext === "xls"
    ) {
      const XLSX = await import("xlsx");
      const workbook = XLSX.read(buffer, { type: "buffer" });
      const sheets: string[] = [];
      for (const sheetName of workbook.SheetNames) {
        const sheet = workbook.Sheets[sheetName];
        const csv = XLSX.utils.sheet_to_csv(sheet);
        sheets.push(`## ${sheetName}\n${csv}`);
      }
      text = sheets.join("\n\n---\n\n");
    }

    // ── PowerPoint (.pptx) ──
    else if (
      mime === "application/vnd.openxmlformats-officedocument.presentationml.presentation" ||
      ext === "pptx"
    ) {
      // Extract text from PPTX using xlsx's zip reader (PPTX is a ZIP)
      const JSZip = await import("jszip");
      let zip;
      try {
        zip = await JSZip.loadAsync(buffer);
      } catch {
        text = "[No se pudo leer el archivo PowerPoint]";
      }
      if (zip) {
        const slideTexts: string[] = [];
        const slideFiles = Object.keys(zip.files)
          .filter((name) => name.match(/^ppt\/slides\/slide\d+\.xml$/))
          .sort();
        for (const slidePath of slideFiles) {
          const xml = await zip.files[slidePath].async("text");
          // Extract text content from XML tags
          const textContent = xml.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
          if (textContent) {
            const slideNum = slidePath.match(/slide(\d+)/)?.[1];
            slideTexts.push(`## Slide ${slideNum}\n${textContent}`);
          }
        }
        text = slideTexts.join("\n\n");
      }
    }

    // ── Images (fotos de apuntes) — Gemini Vision ──
    else if (mime.startsWith("image/")) {
      const base64 = buffer.toString("base64");
      const { text: extractedText } = await generateText({
        model: google("gemini-2.5-flash"),
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Extrae TODO el texto visible en esta imagen. Si es una foto de apuntes, pizarra, libro o documento, transcribe el contenido completo. Mantén la estructura (títulos, listas, párrafos). Si hay diagramas o fórmulas, descríbelos. Responde SOLO con el texto extraído, sin comentarios adicionales.",
              },
              {
                type: "image",
                image: `data:${mime};base64,${base64}`,
              },
            ],
          },
        ],
      });
      text = extractedText;
    }

    // ── Plain text, CSV, markdown ──
    else if (
      mime.startsWith("text/") ||
      ext === "txt" || ext === "csv" || ext === "md" || ext === "json"
    ) {
      text = buffer.toString("utf-8");
    }

    // ── Unsupported ──
    else {
      return NextResponse.json(
        { error: `Formato no soportado: ${ext || mime}. Soportamos: PDF, Word, Excel, PowerPoint, imágenes y texto.` },
        { status: 400 }
      );
    }

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: "No se pudo extraer texto del archivo. El archivo puede estar vacío o protegido." },
        { status: 422 }
      );
    }

    return NextResponse.json({
      text: text.trim(),
      format: ext,
      chars: text.trim().length,
    });
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    const errName = error instanceof Error ? error.name : "UnknownError";
    console.error("[extract-text] Error:", errName, errMsg, error);
    Sentry.captureException(error);

    // Return specific error info so we can debug
    const userMessage = errMsg.includes("quota")
      ? "Límite de API alcanzado. Intenta en unos minutos."
      : errMsg.includes("timeout") || errMsg.includes("DEADLINE")
        ? "El archivo tardó demasiado en procesarse. Intenta con uno más pequeño."
        : errMsg.includes("too large") || errMsg.includes("size")
          ? "Archivo demasiado grande para procesar."
          : `Error al procesar el archivo: ${errMsg.slice(0, 150)}`;

    return NextResponse.json(
      { error: userMessage },
      { status: 500 }
    );
  }
}
