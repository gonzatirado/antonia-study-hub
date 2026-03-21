"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { MoreVertical, Move, Eye, Download, Trash2, Pencil } from "lucide-react";
import type { SubjectFile } from "@/lib/types";
import { formatSize, getFileIcon, getFileIconBg, getFileIconColor, getTypeBadgeLabel } from "./files-tab-helpers";
import { ContextMenu } from "./context-menu";

export interface FileCardGridProps {
  file: SubjectFile;
  movingFile: SubjectFile | null;
  onSetMovingFile: (f: SubjectFile | null) => void;
  onDeleteFile: (f: SubjectFile) => void;
  onRenameFile: (fileId: string, newName: string) => void;
  onPreview: (f: SubjectFile) => void;
}

export function FileCardGrid({ file, movingFile, onSetMovingFile, onDeleteFile, onRenameFile, onPreview }: FileCardGridProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [renameName, setRenameName] = useState(file.name);
  const btnRef = useRef<HTMLButtonElement>(null);
  const Icon = getFileIcon(file.type);
  const isImage = file.type === "image";

  function submitRename() {
    if (renameName.trim() && renameName.trim() !== file.name) {
      onRenameFile(file.id, renameName.trim());
    }
    setRenaming(false);
  }

  const menuItems = [
    {
      label: "Vista previa",
      icon: <Eye className="w-4 h-4" />,
      onClick: () => onPreview(file),
    },
    {
      label: "Renombrar",
      icon: <Pencil className="w-4 h-4" />,
      onClick: () => { setRenaming(true); setRenameName(file.name); },
    },
    {
      label: "Mover a...",
      icon: <Move className="w-4 h-4" />,
      onClick: () => onSetMovingFile(movingFile?.id === file.id ? null : file),
    },
    {
      label: "Descargar",
      icon: <Download className="w-4 h-4" />,
      onClick: () => {
        const a = document.createElement("a");
        a.href = file.url;
        a.download = file.name;
        a.click();
      },
    },
    {
      label: "Eliminar",
      icon: <Trash2 className="w-4 h-4" />,
      danger: true,
      onClick: () => {
        if (window.confirm(`Eliminar "${file.name}"?`)) onDeleteFile(file);
      },
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`group relative rounded-xl cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md border ${
        movingFile?.id === file.id
          ? "border-primary bg-primary/5"
          : "border-border/30 hover:border-primary/20"
      }`}
      style={{ backgroundColor: "var(--card)" }}
      onClick={() => onPreview(file)}
    >
      {/* Menu button */}
      <div className="absolute top-2 right-2 z-10">
        <button
          ref={btnRef}
          aria-label="Opciones de archivo"
          onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
          className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors opacity-0 group-hover:opacity-100"
        >
          <MoreVertical className="w-4 h-4" />
        </button>
        <ContextMenu
          anchorRef={btnRef}
          open={menuOpen}
          onClose={() => setMenuOpen(false)}
          items={menuItems}
        />
      </div>

      {/* Thumbnail / Icon */}
      {isImage ? (
        <div className="w-full aspect-[4/3] overflow-hidden rounded-t-xl bg-muted">
          <img src={file.url} alt={file.name} className="w-full h-full object-cover" loading="lazy" />
        </div>
      ) : (
        <div className="flex items-center justify-center pt-6 pb-4 px-4">
          <div
            className="w-12 h-12 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: getFileIconBg(file.type), color: getFileIconColor(file.type) }}
          >
            <Icon className="w-6 h-6" />
          </div>
        </div>
      )}

      {/* Name + Meta */}
      <div className="px-4 pb-4 pt-2">
        {renaming ? (
          <input
            autoFocus
            value={renameName}
            onChange={(e) => setRenameName(e.target.value)}
            onBlur={submitRename}
            onKeyDown={(e) => { if (e.key === "Enter") submitRename(); if (e.key === "Escape") setRenaming(false); }}
            onClick={(e) => e.stopPropagation()}
            className="w-full bg-muted border border-border rounded px-2 py-1 text-sm text-foreground focus:outline-none focus:border-ring mb-1.5"
          />
        ) : (
          <p className="text-sm text-foreground font-medium line-clamp-2 leading-tight mb-1.5" title={file.name}>
            {file.name}
          </p>
        )}
        <div className="flex items-center gap-1.5">
          <span
            className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded"
            style={{ backgroundColor: "var(--muted)", color: "var(--muted-foreground)" }}
          >
            {getTypeBadgeLabel(file.type)}
          </span>
          <span className="text-[11px] text-muted-foreground">{formatSize(file.size)}</span>
        </div>
      </div>
    </motion.div>
  );
}
