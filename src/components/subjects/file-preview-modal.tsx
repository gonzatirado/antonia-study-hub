"use client";

import { useState, useEffect } from "react";
import { X, Download, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import type { SubjectFile } from "@/lib/types";

interface FilePreviewModalProps {
  file: SubjectFile;
  onClose: () => void;
}

export function FilePreviewModal({ file, onClose }: FilePreviewModalProps) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const isImage = file.type === "image";
  const isPdf = file.type === "pdf";
  const isText = file.type === "text";
  const isHtml = file.name.endsWith(".html") || file.name.endsWith(".htm");

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-[90vw] max-w-5xl h-[85vh] rounded-2xl overflow-hidden border border-border/30 shadow-2xl flex flex-col"
        style={{ backgroundColor: "var(--background)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-3 border-b border-border/20 shrink-0"
          style={{ backgroundColor: "var(--card)" }}
        >
          <h3 className="text-sm font-bold text-foreground truncate mr-4">{file.name}</h3>
          <div className="flex items-center gap-2">
            <a
              href={file.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              title="Abrir en nueva pestaña"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
            <a
              href={file.url}
              download={file.name}
              className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              title="Descargar"
            >
              <Download className="w-4 h-4" />
            </a>
            <button
              onClick={onClose}
              className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto flex items-center justify-center p-4">
          {isImage && (
            <img
              src={file.url}
              alt={file.name}
              className="max-w-full max-h-full object-contain rounded-lg"
            />
          )}

          {isPdf && (
            <iframe
              src={file.url}
              title={file.name}
              className="w-full h-full rounded-lg border-0"
            />
          )}

          {isHtml && (
            <iframe
              src={file.url}
              title={file.name}
              sandbox="allow-scripts allow-same-origin"
              className="w-full h-full rounded-lg border border-border/20 bg-white"
            />
          )}

          {isText && !isHtml && (
            <TextPreview url={file.url} />
          )}

          {!isImage && !isPdf && !isText && (
            <div className="text-center space-y-3">
              <p className="text-muted-foreground text-sm">
                Vista previa no disponible para este tipo de archivo.
              </p>
              <a
                href={file.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                <ExternalLink className="w-4 h-4" /> Abrir archivo
              </a>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function TextPreview({ url }: { url: string }) {
  const { text, loading, error } = useTextFetch(url);

  if (loading) return <p className="text-muted-foreground text-sm">Cargando...</p>;
  if (error) return <p className="text-destructive text-sm">Error al cargar el archivo.</p>;

  return (
    <pre className="w-full h-full overflow-auto p-6 rounded-lg bg-muted/50 text-sm text-foreground font-mono whitespace-pre-wrap break-words">
      {text}
    </pre>
  );
}

function useTextFetch(url: string) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(false);
    fetch(url)
      .then((r) => r.text())
      .then((t) => setText(t))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [url]);

  return { text, loading, error };
}
