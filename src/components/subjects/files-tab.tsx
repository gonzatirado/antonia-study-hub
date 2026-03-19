"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Upload, Trash2, Loader2, FolderIcon, FolderPlus,
  ChevronRight, Download, Eye, ArrowRightLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MoveFilePanel } from "@/components/subjects/move-file-panel";
import type { SubjectFile, Folder } from "@/lib/types";

export interface FilesTabProps {
  files: SubjectFile[];
  currentFiles: SubjectFile[];
  currentFolders: Folder[];
  allFolders: Folder[];
  breadcrumb: Folder[];
  currentFolderId: string | null;
  uploading: boolean;
  showNewFolder: boolean;
  newFolderName: string;
  movingFile: SubjectFile | null;
  onSetCurrentFolderId: (id: string | null) => void;
  onSetShowNewFolder: (show: boolean) => void;
  onSetNewFolderName: (name: string) => void;
  onSetMovingFile: (file: SubjectFile | null) => void;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCreateFolder: () => void;
  onDeleteFolder: (folderId: string) => void;
  onDeleteFile: (file: SubjectFile) => void;
  onMoveFile: (file: SubjectFile, targetFolderId: string | null) => void;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(type: string) {
  switch (type) {
    case "pdf": return "📄";
    case "doc": return "📝";
    case "image": return "🖼️";
    case "text": return "📃";
    default: return "📎";
  }
}

export function FilesTab({
  files,
  currentFiles,
  currentFolders,
  allFolders,
  breadcrumb,
  currentFolderId,
  uploading,
  showNewFolder,
  newFolderName,
  movingFile,
  onSetCurrentFolderId,
  onSetShowNewFolder,
  onSetNewFolderName,
  onSetMovingFile,
  onFileUpload,
  onCreateFolder,
  onDeleteFolder,
  onDeleteFile,
  onMoveFile,
}: FilesTabProps) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1 text-sm">
          <button
            onClick={() => onSetCurrentFolderId(null)}
            className={`hover:text-foreground transition-colors ${currentFolderId ? "text-muted-foreground" : "text-foreground font-medium"}`}
          >
            Archivos
          </button>
          {breadcrumb.map((folder) => (
            <span key={folder.id} className="flex items-center gap-1">
              <ChevronRight className="w-3 h-3 text-muted-foreground/60" />
              <button
                onClick={() => onSetCurrentFolderId(folder.id)}
                className={`hover:text-foreground transition-colors ${
                  folder.id === currentFolderId ? "text-foreground font-medium" : "text-muted-foreground"
                }`}
              >
                {folder.name}
              </button>
            </span>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSetShowNewFolder(true)}
            className="text-muted-foreground hover:text-foreground"
          >
            <FolderPlus className="w-4 h-4 mr-1" /> Carpeta
          </Button>
          <div className="relative">
            <input
              type="file"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              multiple
              accept=".pdf,.doc,.docx,.txt,.html,.png,.jpg,.jpeg,.xlsx,.xls"
              onChange={onFileUpload}
              disabled={uploading}
            />
            <Button size="sm" className="bg-primary hover:bg-primary/90 text-foreground">
              {uploading ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Upload className="w-4 h-4 mr-1" />}
              {uploading ? "Subiendo..." : "Subir"}
            </Button>
          </div>
        </div>
      </div>

      {/* New folder input */}
      <AnimatePresence>
        {showNewFolder && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex gap-2"
          >
            <input
              autoFocus
              value={newFolderName}
              onChange={(e) => onSetNewFolderName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onCreateFolder()}
              placeholder="Nombre de la carpeta..."
              className="flex-1 bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-ring"
            />
            <Button size="sm" onClick={onCreateFolder} className="bg-primary hover:bg-primary/90 text-foreground">
              Crear
            </Button>
            <Button size="sm" variant="ghost" onClick={() => { onSetShowNewFolder(false); onSetNewFolderName(""); }}
              className="text-muted-foreground">
              Cancelar
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Folders grid */}
      {currentFolders.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {currentFolders.map((folder) => (
            <motion.div
              key={folder.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="group relative bg-card/80 border border-border rounded-xl p-4 cursor-pointer hover:border-primary/30 hover:bg-muted/50 transition-all"
              onClick={() => onSetCurrentFolderId(folder.id)}
            >
              <div className="flex items-center gap-3">
                <FolderIcon className="w-8 h-8 text-warning" />
                <span className="text-sm text-foreground font-medium truncate">{folder.name}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {files.filter((f) => f.folderId === folder.id).length} archivos
                {" · "}{allFolders.filter((f) => f.parentId === folder.id).length} carpetas
              </p>
              <button
                onClick={(e) => { e.stopPropagation(); onDeleteFolder(folder.id); }}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {/* Move file panel */}
      <AnimatePresence>
        {movingFile && (
          <MoveFilePanel
            movingFile={movingFile}
            folders={allFolders}
            currentFolderId={currentFolderId}
            onMove={onMoveFile}
            onClose={() => onSetMovingFile(null)}
          />
        )}
      </AnimatePresence>

      {/* Files list */}
      {currentFiles.length > 0 ? (
        <div className="space-y-1">
          {currentFiles.map((file) => (
            <div
              key={file.id}
              className={`group flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                movingFile?.id === file.id ? "bg-primary/10 border border-primary/30" : "hover:bg-muted/50"
              }`}
            >
              <span className="text-lg">{getFileIcon(file.type)}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatSize(file.size)} · {file.type.toUpperCase()}
                </p>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => onSetMovingFile(movingFile?.id === file.id ? null : file)}
                  className={`p-1.5 rounded-md transition-colors ${
                    movingFile?.id === file.id
                      ? "bg-primary/20 text-primary"
                      : "hover:bg-secondary text-muted-foreground hover:text-foreground"
                  }`}
                  title="Mover a carpeta"
                >
                  <ArrowRightLeft className="w-4 h-4" />
                </button>
                <a
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Eye className="w-4 h-4" />
                </a>
                <a
                  href={file.url}
                  download
                  className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Download className="w-4 h-4" />
                </a>
                <button
                  onClick={() => onDeleteFile(file)}
                  className="p-1.5 rounded-md hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : currentFolders.length === 0 && (
        <div className="text-center py-16 border border-dashed border-border rounded-xl">
          <Upload className="w-10 h-10 text-muted-foreground/60 mx-auto mb-3" />
          <p className="text-muted-foreground font-medium">Arrastra archivos o haz click en &quot;Subir&quot;</p>
          <p className="text-xs text-muted-foreground mt-1">PDF, HTML, Excel, TXT, imagenes</p>
        </div>
      )}
    </motion.div>
  );
}
