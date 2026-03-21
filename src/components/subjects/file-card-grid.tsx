"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { MoreVertical, Move, Eye, Download, Trash2 } from "lucide-react";
import type { SubjectFile } from "@/lib/types";
import { formatSize, getFileIcon, getFileIconBg, getFileIconColor, getTypeBadgeLabel } from "./files-tab-helpers";
import { ContextMenu } from "./context-menu";

export interface FileCardGridProps {
  file: SubjectFile;
  movingFile: SubjectFile | null;
  onSetMovingFile: (f: SubjectFile | null) => void;
  onDeleteFile: (f: SubjectFile) => void;
}

export function FileCardGrid({ file, movingFile, onSetMovingFile, onDeleteFile }: FileCardGridProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const Icon = getFileIcon(file.type);

  const menuItems = [
    {
      label: "Mover a...",
      icon: <Move className="w-4 h-4" />,
      onClick: () => onSetMovingFile(movingFile?.id === file.id ? null : file),
    },
    {
      label: "Ver archivo",
      icon: <Eye className="w-4 h-4" />,
      onClick: () => window.open(file.url, "_blank"),
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
      className={`group relative rounded-xl p-4 cursor-default transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md border ${
        movingFile?.id === file.id
          ? "border-primary bg-primary/5"
          : "border-border/30 hover:border-primary/20"
      }`}
      style={{ backgroundColor: "var(--card)" }}
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

      {/* Icon */}
      <div className="flex items-center justify-center pt-2 pb-3">
        <div
          className="w-12 h-12 rounded-lg flex items-center justify-center"
          style={{
            backgroundColor: getFileIconBg(file.type),
            color: getFileIconColor(file.type),
          }}
        >
          <Icon className="w-6 h-6" />
        </div>
      </div>

      {/* Name */}
      <p className="text-sm text-foreground font-medium line-clamp-2 leading-tight mb-1.5" title={file.name}>
        {file.name}
      </p>

      {/* Meta */}
      <div className="flex items-center gap-1.5">
        <span
          className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded"
          style={{
            backgroundColor: "var(--muted)",
            color: "var(--muted-foreground)",
          }}
        >
          {getTypeBadgeLabel(file.type)}
        </span>
        <span className="text-[11px] text-muted-foreground">{formatSize(file.size)}</span>
      </div>
    </motion.div>
  );
}
