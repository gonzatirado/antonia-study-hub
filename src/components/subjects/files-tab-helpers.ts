import { FileText, Image, File, FileSpreadsheet, Sheet } from "lucide-react";

export function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function getFileIcon(type: string) {
  switch (type) {
    case "pdf":
      return FileText;
    case "doc":
      return FileSpreadsheet;
    case "excel":
      return Sheet;
    case "image":
      return Image;
    case "text":
      return FileText;
    default:
      return File;
  }
}

export function getFileIconColor(type: string): string {
  switch (type) {
    case "pdf":
      return "var(--destructive)";
    case "doc":
      return "var(--info)";
    case "excel":
      return "#217346";
    case "image":
      return "var(--warning)";
    case "text":
      return "var(--success)";
    default:
      return "var(--muted-foreground)";
  }
}

export function getFileIconBg(type: string): string {
  switch (type) {
    case "pdf":
      return "oklch(from var(--destructive) l c h / 0.1)";
    case "doc":
      return "oklch(from var(--info) l c h / 0.1)";
    case "excel":
      return "oklch(0.45 0.15 155 / 0.1)";
    case "image":
      return "oklch(from var(--warning) l c h / 0.1)";
    case "text":
      return "oklch(from var(--success) l c h / 0.1)";
    default:
      return "var(--muted)";
  }
}

export function getTypeBadgeLabel(type: string): string {
  switch (type) {
    case "pdf": return "PDF";
    case "doc": return "Documento";
    case "excel": return "Excel";
    case "image": return "Imagen";
    case "text": return "Texto";
    default: return "Archivo";
  }
}

export const FILE_TYPE_OPTIONS = [
  { value: "all", label: "Todos" },
  { value: "pdf", label: "PDF" },
  { value: "doc", label: "Documento" },
  { value: "excel", label: "Excel" },
  { value: "image", label: "Imagen" },
  { value: "text", label: "Texto" },
  { value: "other", label: "Otro" },
] as const;

export type SortField = "name" | "date" | "size" | "type";
export type SortDir = "asc" | "desc";

export function sortFiles(files: readonly { name: string; size: number; type: string; uploadedAt: Date }[], field: SortField, dir: SortDir) {
  const m = dir === "asc" ? 1 : -1;
  return [...files].sort((a, b) => {
    switch (field) {
      case "name": return m * a.name.localeCompare(b.name);
      case "date": return m * (new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime());
      case "size": return m * (a.size - b.size);
      case "type": return m * a.type.localeCompare(b.type);
      default: return 0;
    }
  });
}
