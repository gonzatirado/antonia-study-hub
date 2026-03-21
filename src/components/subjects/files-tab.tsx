"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload, Loader2, FolderPlus,
  ChevronRight, LayoutGrid, List, CloudUpload,
} from "lucide-react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { MoveFilePanel } from "@/components/subjects/move-file-panel";
import type { SubjectFile, Folder } from "@/lib/types";
import { formatSize } from "./files-tab-helpers";
import { FileRow } from "./file-row";
import { FileCardGrid } from "./file-card-grid";
import { FolderCard } from "./folder-card";

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

const ACCEPT_TYPES = ".pdf,.doc,.docx,.txt,.html,.png,.jpg,.jpeg,.xlsx,.xls";
const VIEW_KEY = "studyhub-files-view";

/* ======== MAIN COMPONENT ======== */
export function FilesTab({
  files, currentFiles, currentFolders, allFolders, breadcrumb,
  currentFolderId, uploading, showNewFolder, newFolderName, movingFile,
  onSetCurrentFolderId, onSetShowNewFolder, onSetNewFolderName,
  onSetMovingFile, onFileUpload, onCreateFolder, onDeleteFolder,
  onDeleteFile, onMoveFile,
}: FilesTabProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem(VIEW_KEY);
    if (saved === "grid" || saved === "list") setViewMode(saved);
  }, []);

  const toggleView = (mode: "grid" | "list") => {
    setViewMode(mode);
    localStorage.setItem(VIEW_KEY, mode);
  };

  /* Dropzone */
  const onDrop = useCallback((acceptedFiles: globalThis.File[]) => {
    if (!acceptedFiles.length || !fileInputRef.current) return;
    const dt = new DataTransfer();
    acceptedFiles.forEach((f) => dt.items.add(f));
    fileInputRef.current.files = dt.files;
    const evt = new Event("change", { bubbles: true });
    fileInputRef.current.dispatchEvent(evt);
  }, []);

  const { getRootProps, isDragActive } = useDropzone({
    onDrop,
    noClick: true,
    noKeyboard: true,
    accept: {
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "text/plain": [".txt"],
      "text/html": [".html"],
      "image/png": [".png"],
      "image/jpeg": [".jpg", ".jpeg"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "application/vnd.ms-excel": [".xls"],
    },
  });

  const isGrid = viewMode === "grid";
  const totalSize = currentFiles.reduce((sum, f) => sum + f.size, 0);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Header with breadcrumb and actions */}
      <div className="flex justify-between items-end flex-wrap gap-4">
        <div className="space-y-3">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase text-muted-foreground">
            <button
              onClick={() => onSetCurrentFolderId(null)}
              className="hover:text-primary cursor-pointer transition-colors"
            >
              Archivos
            </button>
            {breadcrumb.map((folder) => (
              <span key={folder.id} className="flex items-center gap-2">
                <ChevronRight className="w-3 h-3 text-muted-foreground/40" />
                <button
                  onClick={() => onSetCurrentFolderId(folder.id)}
                  className={`hover:text-primary cursor-pointer transition-colors ${
                    folder.id === currentFolderId ? "text-foreground" : ""
                  }`}
                >
                  {folder.name}
                </button>
              </span>
            ))}
          </nav>

          {/* Title */}
          {breadcrumb.length > 0 && (
            <h2 className="text-3xl font-black tracking-tight text-foreground">
              {breadcrumb[breadcrumb.length - 1].name}
            </h2>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex items-center bg-muted rounded-lg p-0.5">
            <button
              onClick={() => toggleView("grid")}
              aria-label="Vista cuadricula"
              className={`p-1.5 rounded-md transition-colors ${
                isGrid
                  ? "bg-card text-primary shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => toggleView("list")}
              aria-label="Vista lista"
              className={`p-1.5 rounded-md transition-colors ${
                !isGrid
                  ? "bg-card text-primary shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

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
              ref={fileInputRef}
              type="file"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              multiple
              accept={ACCEPT_TYPES}
              onChange={onFileUpload}
              disabled={uploading}
            />
            <Button
              size="sm"
              className="bg-gradient-to-r from-primary to-primary/70 text-primary-foreground font-bold hover:shadow-[0_0_20px_oklch(from_var(--primary)_l_c_h_/_0.3)] transition-all"
            >
              {uploading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-1" />
              ) : (
                <CloudUpload className="w-4 h-4 mr-1" />
              )}
              {uploading ? "Subiendo..." : "Subir Archivo"}
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div
          className="p-4 rounded-xl border-t-2 border-primary/20 transition-colors hover:bg-muted/30"
          style={{ backgroundColor: "var(--card)" }}
        >
          <p className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground mb-1">
            Total Archivos
          </p>
          <p className="text-2xl font-bold text-foreground">{currentFiles.length}</p>
        </div>
        <div
          className="p-4 rounded-xl border-t-2 border-primary/20 transition-colors hover:bg-muted/30"
          style={{ backgroundColor: "var(--card)" }}
        >
          <p className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground mb-1">
            Almacenamiento
          </p>
          <p className="text-2xl font-bold text-foreground">{formatSize(totalSize)}</p>
        </div>
        <div
          className="p-4 rounded-xl border-t-2 border-primary/20 transition-colors hover:bg-muted/30"
          style={{ backgroundColor: "var(--card)" }}
        >
          <p className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground mb-1">
            Carpetas
          </p>
          <p className="text-2xl font-bold text-foreground">{currentFolders.length}</p>
        </div>
        <div
          className="p-4 rounded-xl border-t-2 border-primary/20 transition-colors hover:bg-muted/30"
          style={{ backgroundColor: "var(--card)" }}
        >
          <p className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground mb-1">
            Total Global
          </p>
          <p className="text-2xl font-bold text-foreground">{files.length}</p>
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
            <Button
              size="sm"
              onClick={onCreateFolder}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Crear
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => { onSetShowNewFolder(false); onSetNewFolderName(""); }}
              className="text-muted-foreground"
            >
              Cancelar
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

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

      {/* Drop zone wrapper */}
      <div {...getRootProps()} className="relative">
        {/* Drag overlay */}
        {isDragActive && (
          <div className="absolute inset-0 z-40 flex items-center justify-center border-2 border-dashed border-primary rounded-xl backdrop-blur-sm"
            style={{ backgroundColor: "oklch(from var(--primary) l c h / 0.08)" }}
          >
            <div className="text-center">
              <Upload className="w-10 h-10 text-primary mx-auto mb-2" />
              <p className="text-sm font-medium text-primary">Suelta los archivos aqui</p>
            </div>
          </div>
        )}

        {/* Folders */}
        {currentFolders.length > 0 && (
          <div className={
            isGrid
              ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-6"
              : "space-y-1 mb-6"
          }>
            {currentFolders.map((folder) => (
              <FolderCard
                key={folder.id}
                folder={folder}
                files={files}
                allFolders={allFolders}
                isGrid={isGrid}
                onOpen={() => onSetCurrentFolderId(folder.id)}
                onDeleteFolder={onDeleteFolder}
              />
            ))}
          </div>
        )}

        {/* Files */}
        {currentFiles.length > 0 ? (
          isGrid ? (
            /* Grid view */
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {currentFiles.map((file) => (
                <FileCardGrid
                  key={file.id}
                  file={file}
                  movingFile={movingFile}
                  onSetMovingFile={onSetMovingFile}
                  onDeleteFile={onDeleteFile}
                />
              ))}
            </div>
          ) : (
            /* List / Table view (Stitch design) */
            <div
              className="rounded-2xl overflow-hidden border border-border/30 shadow-lg"
              style={{ backgroundColor: "var(--background)" }}
            >
              {/* Table Header */}
              <div
                className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-border/20"
                style={{ backgroundColor: "var(--card)" }}
              >
                <div className="col-span-5 text-[10px] font-bold tracking-widest uppercase text-muted-foreground">
                  Nombre
                </div>
                <div className="col-span-2 text-[10px] font-bold tracking-widest uppercase text-muted-foreground">
                  Tipo
                </div>
                <div className="col-span-2 text-[10px] font-bold tracking-widest uppercase text-muted-foreground text-right">
                  Tamano
                </div>
                <div className="col-span-3 text-[10px] font-bold tracking-widest uppercase text-muted-foreground text-right">
                  Fecha de subida
                </div>
              </div>

              {/* Table Rows */}
              <div className="divide-y divide-border/10">
                {currentFiles.map((file) => (
                  <FileRow
                    key={file.id}
                    file={file}
                    movingFile={movingFile}
                    onSetMovingFile={onSetMovingFile}
                    onDeleteFile={onDeleteFile}
                  />
                ))}
              </div>
            </div>
          )
        ) : currentFolders.length === 0 && (
          <div
            className="text-center py-16 border border-dashed border-border/30 rounded-xl"
            style={{ backgroundColor: "var(--card)" }}
          >
            <Upload className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-foreground font-medium mb-1">Arrastra archivos o haz click en &quot;Subir Archivo&quot;</p>
            <p className="text-xs text-muted-foreground">PDF, HTML, Excel, TXT, imagenes</p>
          </div>
        )}

        {/* Footer Meta */}
        {currentFiles.length > 0 && (
          <div className="flex justify-between items-center text-muted-foreground text-[10px] font-bold tracking-widest uppercase px-2 mt-4">
            <p>Mostrando {currentFiles.length} de {files.length} archivos</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
