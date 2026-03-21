import * as Sentry from "@sentry/nextjs";

const SUPPORTED_TYPES = new Set([
  // PDF
  "application/pdf",
  // Word
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  // Excel
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
  // PowerPoint
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  // Text
  "text/plain",
  "text/csv",
  "text/markdown",
  "application/json",
  // Images
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/gif",
  "image/heic",
]);

const SUPPORTED_EXTENSIONS = new Set([
  "pdf", "docx", "xlsx", "xls", "pptx",
  "txt", "csv", "md", "json",
  "png", "jpg", "jpeg", "webp", "gif", "heic",
]);

export function isFileSupported(file: File): boolean {
  if (SUPPORTED_TYPES.has(file.type)) return true;
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  return SUPPORTED_EXTENSIONS.has(ext);
}

export function getSupportedFormatsLabel(): string {
  return "PDF, Word, Excel, PowerPoint, imágenes y texto";
}

export async function extractTextFromFiles(files: File[]): Promise<string> {
  const texts: string[] = [];

  for (const file of files) {
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";

    // Plain text files can be read directly on client
    if (
      file.type === "text/plain" ||
      file.type === "text/csv" ||
      file.type === "text/markdown" ||
      ext === "txt" || ext === "csv" || ext === "md"
    ) {
      const text = await file.text();
      texts.push(text);
      continue;
    }

    // Everything else goes to the server endpoint
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/extract-text", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        texts.push(data.text);
      } else {
        const err = await res.json().catch(() => ({ error: "Error desconocido" }));
        throw new Error(err.error || `Error ${res.status}`);
      }
    } catch (err) {
      Sentry.captureException(err);
      throw err;
    }
  }

  return texts.join("\n\n---\n\n");
}
