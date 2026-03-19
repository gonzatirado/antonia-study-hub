"use client";

import { motion } from "framer-motion";
import { FolderIcon, X } from "lucide-react";
import type { SubjectFile, Folder } from "@/lib/types";

export interface MoveFilePanelProps {
  movingFile: SubjectFile;
  folders: Folder[];
  currentFolderId: string | null;
  onMove: (file: SubjectFile, targetFolderId: string | null) => void;
  onClose: () => void;
}

export function MoveFilePanel({
  movingFile,
  folders,
  currentFolderId,
  onMove,
  onClose,
}: MoveFilePanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="bg-primary/10 border border-primary/30 rounded-xl p-4"
    >
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-foreground">
          Mover <span className="font-semibold text-primary">{movingFile.name}</span> a:
        </p>
        <button onClick={onClose} className="p-1 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground">
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {/* Root option */}
        {currentFolderId !== null && (
          <button
            onClick={() => onMove(movingFile, null)}
            className="flex items-center gap-2 px-3 py-2 bg-muted border border-border rounded-lg text-sm text-foreground hover:border-primary hover:bg-secondary transition-all"
          >
            <FolderIcon className="w-4 h-4 text-muted-foreground" />
            Raiz
          </button>
        )}
        {/* All folders except current location */}
        {folders
          .filter((f) => f.id !== (movingFile.folderId || "___none___"))
          .map((folder) => (
            <button
              key={folder.id}
              onClick={() => onMove(movingFile, folder.id)}
              className="flex items-center gap-2 px-3 py-2 bg-muted border border-border rounded-lg text-sm text-foreground hover:border-primary hover:bg-secondary transition-all"
            >
              <FolderIcon className="w-4 h-4 text-warning" />
              {folder.name}
            </button>
          ))
        }
      </div>
    </motion.div>
  );
}
