"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload, Loader2, FolderIcon, FolderPlus,
  ChevronRight, MoreVertical, FileText, Image, File,
  LayoutGrid, List, Download, Eye, Move, Trash2,
  CloudUpload, FileSpreadsheet,
} from "lucide-react";
import { useDropzone } from "react-dropzone";
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

const ACCEPT_TYPES = ".pdf,.doc,.docx,.txt,.html,.png,.jpg,.jpeg,.xlsx,.xls";
const VIEW_KEY = "studyhub-files-view";

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(type: string) {
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

function getFileIconColor(type: string): string {
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

function getFileIconBg(type: string): string {
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

function getTypeBadgeLabel(type: string): string {
  switch (type) {
    case "pdf": return "PDF";
    case "doc": return "Documento";
    case "image": return "Imagen";
    case "text": return "Texto";
    default: return "Archivo";
  }
}

function formatDate(date: Date): string {
  const d = date instanceof Date ? date : new Date(date);
  return d.toLocaleDateString("es-CL", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/* ---- Context Menu ---- */
function ContextMenu({
  anchorRef,
  open,
  onClose,
  items,
}: {
  anchorRef: React.RefObject<HTMLButtonElement | null>;
  open: boolean;
  onClose: () => void;
  items: { label: string; icon: React.ReactNode; onClick: () => void; danger?: boolean }[];
}) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (
        menuRef.current && !menuRef.current.contains(e.target as Node) &&
        anchorRef.current && !anchorRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose, anchorRef]);

  if (!open) return null;

  return (
    <div
      ref={menuRef}
      role="menu"
      className="absolute right-0 top-8 z-50 min-w-[180px] bg-card border border-border rounded-lg shadow-xl py-1 animate-in fade-in-0 zoom-in-95"
    >
      {items.map((itm) => (
        <button
          key={itm.label}
          onClick={(e) => { e.stopPropagation(); itm.onClick(); onClose(); }}
          className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors ${
            itm.danger
              ? "text-destructive hover:bg-destructive/10"
              : "text-foreground hover:bg-muted"
          }`}
        >
          {itm.icon}
          {itm.label}
        </button>
      ))}
    </div>
  );
}

/* ---- File Row (Stitch table style) ---- */
function FileRow({
  file, movingFile, onSetMovingFile, onDeleteFile,
}: {
  file: SubjectFile;
  movingFile: SubjectFile | null;
  onSetMovingFile: (f: SubjectFile | null) => void;
  onDeleteFile: (f: SubjectFile) => void;
}) {
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
    <div
      className={`group grid grid-cols-12 gap-4 px-6 py-4 items-center cursor-pointer transition-all duration-200 hover:shadow-[0_0_15px_oklch(from_var(--primary)_l_c_h_/_0.05)] ${
        movingFile?.id === file.id
          ? "bg-primary/5"
          : "hover:bg-muted/50"
      }`}
    >
      {/* Name col */}
      <div className="col-span-5 flex items-center gap-4">
        <div
          className="w-10 h-10 flex items-center justify-center rounded-lg shrink-0"
          style={{
            backgroundColor: getFileIconBg(file.type),
            color: getFileIconColor(file.type),
          }}
        >
          <Icon className="w-5 h-5" />
        </div>
        <span className="font-medium text-sm text-foreground truncate">{file.name}</span>
      </div>

      {/* Type col */}
      <div className="col-span-2">
        <span
          className="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider"
          style={{
            backgroundColor: "var(--muted)",
            color: "var(--muted-foreground)",
          }}
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

/* ---- File Card (Grid mode) ---- */
function FileCardGrid({
  file, movingFile, onSetMovingFile, onDeleteFile,
}: {
  file: SubjectFile;
  movingFile: SubjectFile | null;
  onSetMovingFile: (f: SubjectFile | null) => void;
  onDeleteFile: (f: SubjectFile) => void;
}) {
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

/* ---- Folder Card ---- */
function FolderCard({
  folder, files, allFolders, isGrid, onOpen, onDeleteFolder,
}: {
  folder: Folder;
  files: SubjectFile[];
  allFolders: Folder[];
  isGrid: boolean;
  onOpen: () => void;
  onDeleteFolder: (id: string) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const fileCount = files.filter((f) => f.folderId === folder.id).length;
  const subFolderCount = allFolders.filter((f) => f.parentId === folder.id).length;

  const menuItems = [
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
        onClick={onOpen}
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
        <p className="text-sm text-foreground font-bold truncate group-hover:text-primary transition-colors">
          {folder.name}
        </p>
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
      onClick={onOpen}
    >
      <FolderIcon className="w-6 h-6 text-primary shrink-0" fill="currentColor" strokeWidth={1} />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground font-medium truncate">{folder.name}</p>
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
