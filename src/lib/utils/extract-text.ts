import * as Sentry from "@sentry/nextjs";

export async function extractTextFromFiles(files: File[]): Promise<string> {
  const texts: string[] = [];

  for (const file of files) {
    if (file.type === "text/plain") {
      const text = await file.text();
      texts.push(text);
    } else if (file.type === "application/pdf") {
      // For PDF, we send to a server endpoint that uses pdf-parse
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
        }
      } catch (err) {
        Sentry.captureException(err);
      }
    } else {
      // For other file types, try reading as text
      try {
        const text = await file.text();
        texts.push(text);
      } catch {
        Sentry.captureMessage(`Cannot read file: ${file.name}`, "warning");
      }
    }
  }

  return texts.join("\n\n---\n\n");
}
