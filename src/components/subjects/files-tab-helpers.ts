import { FileText, Image, File, FileSpreadsheet } from "lucide-react";

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
    case "image": return "Imagen";
    case "text": return "Texto";
    default: return "Archivo";
  }
}
