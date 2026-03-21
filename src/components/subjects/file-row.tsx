"use client";

import { useState, useRef } from "react";
import { MoreVertical, Move, Eye, Download, Trash2, Pencil } from "lucide-react";
import { formatDate } from "@/lib/utils/date-helpers";
import type { SubjectFile } from "@/lib/types";
import { formatSize, getFileIcon, getFileIconBg, getFileIconColor, getTypeBadgeLabel } from "./files-tab-helpers";
import { ContextMenu } from "./context-menu";

export interface FileRowProps {
  file: SubjectFile;
  movingFile: SubjectFile | null;
  onSetMovingFile: (f: SubjectFile | null) => void;
  onDeleteFile: (f: SubjectFile) => void;
  onRenameFile: (fileId: string, newName: string) => void;
  onPreview: (f: SubjectFile) => void;
}

export function FileRow({ file, movingFile, onSetMovingFile, onDeleteFile, onRenameFile, onPreview }: FileRowProps) {
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
    <div
      className={`group grid grid-cols-12 gap-4 px-6 py-4 items-center cursor-pointer transition-all duration-200 hover:shadow-[0_0_15px_oklch(from_var(--primary)_l_c_h_/_0.05)] ${
        movingFile?.id === file.id
          ? "bg-primary/5"
          : "hover:bg-muted/50"
      }`}
      onClick={() => onPreview(file)}
    >
      {/* Name col */}
      <div className="col-span-5 flex items-center gap-4">
        {isImage ? (
          <div className="w-10 h-10 rounded-lg shrink-0 overflow-hidden bg-muted">
            <img src={file.url} alt={file.name} className="w-full h-full object-cover" loading="lazy" />
          </div>
        ) : (
          <div
            className="w-10 h-10 flex items-center justify-center rounded-lg shrink-0"
            style={{ backgroundColor: getFileIconBg(file.type), color: getFileIconColor(file.type) }}
          >
            <Icon className="w-5 h-5" />
          </div>
        )}
        {renaming ? (
          <input
            autoFocus
            value={renameName}
            onChange={(e) => setRenameName(e.target.value)}
            onBlur={submitRename}
            onKeyDown={(e) => { if (e.key === "Enter") submitRename(); if (e.key === "Escape") setRenaming(false); }}
            onClick={(e) => e.stopPropagation()}
            className="flex-1 bg-muted border border-border rounded px-2 py-1 text-sm text-foreground focus:outline-none focus:border-ring"
          />
        ) : (
          <span className="font-medium text-sm text-foreground truncate">{file.name}</span>
        )}
      </div>

      {/* Type col */}
      <div className="col-span-2">
        <span
          className="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider"
          style={{ backgroundColor: "var(--muted)", color: "var(--muted-foreground)" }}
        >
          {getTypeBadgeLabel(file.type)}
        </span>
      </div>

      {/* Size col */}
      <div className="col-span-2 text-right text-sm text-muted-foreground">
        {formatSize(file.size)}
      </div>

      {/* Date + actions col */}
      <div className="col-span-3 text-right text-sm text-muted-foreground flex items-center justify-end gap-3">
        <span>{formatDate(file.uploadedAt)}</span>
        <div className="relative">
          <button
            ref={btnRef}
            aria-label="Opciones de archivo"
            onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
            className="p-1 rounded-md text-muted-foreground hover:text-primary transition-colors"
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
      </div>
    </div>
  );
}
