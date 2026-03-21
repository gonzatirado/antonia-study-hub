"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { FolderIcon, MoreVertical, Trash2, Pencil } from "lucide-react";
import type { SubjectFile, Folder } from "@/lib/types";
import { ContextMenu } from "./context-menu";

export interface FolderCardProps {
  folder: Folder;
  files: SubjectFile[];
  allFolders: Folder[];
  isGrid: boolean;
  onOpen: () => void;
  onDeleteFolder: (id: string) => void;
  onRenameFolder: (folderId: string, newName: string) => void;
}

export function FolderCard({ folder, files, allFolders, isGrid, onOpen, onDeleteFolder, onRenameFolder }: FolderCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [renameName, setRenameName] = useState(folder.name);
  const btnRef = useRef<HTMLButtonElement>(null);
  const fileCount = files.filter((f) => f.folderId === folder.id).length;
  const subFolderCount = allFolders.filter((f) => f.parentId === folder.id).length;

  function submitRename() {
    if (renameName.trim() && renameName.trim() !== folder.name) {
      onRenameFolder(folder.id, renameName.trim());
    }
    setRenaming(false);
  }

  const menuItems = [
    {
      label: "Renombrar",
      icon: <Pencil className="w-4 h-4" />,
      onClick: () => { setRenaming(true); setRenameName(folder.name); },
    },
    {
      label: "Eliminar carpeta",
      icon: <Trash2 className="w-4 h-4" />,
      danger: true,
      onClick: () => {
        if (window.confirm(`Eliminar carpeta "${folder.name}" y mover sus archivos al nivel actual?`))
          onDeleteFolder(folder.id);
      },
    },
  ];

  if (isGrid) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        whileTap={{ scale: 0.98 }}
        className="group relative rounded-xl p-5 cursor-pointer border border-border/30 hover:border-primary/20 hover:-translate-y-1 hover:shadow-md transition-all duration-300"
        style={{ backgroundColor: "var(--card)" }}
        onClick={renaming ? undefined : onOpen}
      >
        <div className="absolute top-2 right-2 z-10">
          <button
            ref={btnRef}
            aria-label="Opciones de carpeta"
            onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors opacity-0 group-hover:opacity-100"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
          <ContextMenu anchorRef={btnRef} open={menuOpen} onClose={() => setMenuOpen(false)} items={menuItems} />
        </div>
        <div className="flex items-center justify-center pt-1 pb-3">
          <FolderIcon className="w-12 h-12 text-primary" fill="currentColor" strokeWidth={1} />
        </div>
        {renaming ? (
          <input
            autoFocus
            value={renameName}
            onChange={(e) => setRenameName(e.target.value)}
            onBlur={submitRename}
            onKeyDown={(e) => { if (e.key === "Enter") submitRename(); if (e.key === "Escape") setRenaming(false); }}
            onClick={(e) => e.stopPropagation()}
            className="w-full bg-muted border border-border rounded px-2 py-1 text-sm text-foreground focus:outline-none focus:border-ring"
          />
        ) : (
          <p className="text-sm text-foreground font-bold truncate group-hover:text-primary transition-colors">
            {folder.name}
          </p>
        )}
        <p className="text-xs text-muted-foreground mt-1">
          {fileCount} archivos{subFolderCount > 0 && ` · ${subFolderCount} carpetas`}
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      whileTap={{ scale: 0.98 }}
      className="group relative flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
      onClick={renaming ? undefined : onOpen}
    >
      <FolderIcon className="w-6 h-6 text-primary shrink-0" fill="currentColor" strokeWidth={1} />
      <div className="flex-1 min-w-0">
        {renaming ? (
          <input
            autoFocus
            value={renameName}
            onChange={(e) => setRenameName(e.target.value)}
            onBlur={submitRename}
            onKeyDown={(e) => { if (e.key === "Enter") submitRename(); if (e.key === "Escape") setRenaming(false); }}
            onClick={(e) => e.stopPropagation()}
            className="w-full bg-muted border border-border rounded px-2 py-1 text-sm text-foreground focus:outline-none focus:border-ring"
          />
        ) : (
          <p className="text-sm text-foreground font-medium truncate">{folder.name}</p>
        )}
        <p className="text-xs text-muted-foreground">
          {fileCount} archivos{subFolderCount > 0 && ` · ${subFolderCount} carpetas`}
        </p>
      </div>
      <div className="relative">
        <button
          ref={btnRef}
          aria-label="Opciones de carpeta"
          onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
          className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <MoreVertical className="w-4 h-4" />
        </button>
        <ContextMenu anchorRef={btnRef} open={menuOpen} onClose={() => setMenuOpen(false)} items={menuItems} />
      </div>
    </motion.div>
  );
}
