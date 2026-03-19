"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload, Trash2, Loader2, FolderIcon, FolderPlus,
  ChevronRight, Download, Eye, ArrowRightLeft,
  MoreVertical, FileText, Image, FileSpreadsheet, File,
  LayoutGrid, List,
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
    case "doc":
    case "text":
      return FileText;
    case "image":
      return Image;
    default:
      return File;
  }
}

function getTypeBadge(type: string) {
  const colors: Record<string, string> = {
    pdf: "bg-red-500/15 text-red-400",
    doc: "bg-blue-500/15 text-blue-400",
    image: "bg-emerald-500/15 text-emerald-400",
    text: "bg-amber-500/15 text-amber-400",
    other: "bg-muted text-muted-foreground",
  };
  return colors[type] || colors.other;
}

/* ── Context Menu ───────────────────────────────────────── */
function ContextMenu({
  anchorRef,
  open,
  onClose,
  items,
}: {
  anchorRef: React.RefObject<HTMLButtonElement | null>;
  open: boolean;
  onClose: () => void;
  items: { label: string; icon: string; onClick: () => void; danger?: boolean }[];
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
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open, onClose, anchorRef]);

  if (!open) return null;

  return (
    <div
      ref={menuRef}
      className="absolute right-0 top-8 z-50 min-w-[160px] bg-card border border-border rounded-lg shadow-lg py-1 animate-in fade-in-0 zoom-in-95"
    >
      {items.map((item) => (
        <button
          key={item.label}
          onClick={(e) => { e.stopPropagation(); item.onClick(); onClose(); }}
          className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors ${
            item.danger
              ? "text-destructive hover:bg-destructive/10"
              : "text-foreground hover:bg-muted"
          }`}
        >
          <span className="text-base leading-none">{item.icon}</span>
          {item.label}
        </button>
      ))}
    </div>
  );
}

/* ── File Card (Grid) ───────────────────────────────────── */
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
    { label: "Mover a...", icon: "\uD83D\uDCC2", onClick: () => onSetMovingFile(movingFile?.id === file.id ? null : file) },
    { label: "Ver archivo", icon: "\uD83D\uDC41", onClick: () => window.open(file.url, "_blank") },
    { label: "Descargar", icon: "\u2B07", onClick: () => { const a = document.createElement("a"); a.href = file.url; a.download = file.name; a.click(); } },
    { label: "Eliminar", icon: "\uD83D\uDDD1", danger: true, onClick: () => { if (window.confirm(`Eliminar "${file.name}"?`)) onDeleteFile(file); } },
  ];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`group relative bg-card border rounded-xl p-3 cursor-default transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
        movingFile?.id === file.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
      }`}
    >
      {/* Menu button */}
      <div className="absolute top-2 right-2 z-10">
        <button
          ref={btnRef}
          onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
          className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <MoreVertical className="w-4 h-4" />
        </button>
        <ContextMenu anchorRef={btnRef} open={menuOpen} onClose={() => setMenuOpen(false)} items={menuItems} />
      </div>

      {/* Icon */}
      <div className="flex items-center justify-center pt-2 pb-3">
        <Icon className="w-10 h-10 text-muted-foreground/70" strokeWidth={1.5} />
      </div>

      {/* Name */}
      <p className="text-sm text-foreground font-medium line-clamp-2 leading-tight mb-1.5" title={file.name}>
        {file.name}
      </p>

      {/* Meta */}
      <div className="flex items-center gap-1.5">
        <span className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded ${getTypeBadge(file.type)}`}>
          {file.type}
        </span>
        <span className="text-[11px] text-muted-foreground">{formatSize(file.size)}</span>
      </div>
    </motion.div>
  );
}

/* ── File Row (List) ────────────────────────────────────── */
function FileRowList({
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
    { label: "Mover a...", icon: "\uD83D\uDCC2", onClick: () => onSetMovingFile(movingFile?.id === file.id ? null : file) },
    { label: "Ver archivo", icon: "\uD83D\uDC41", onClick: () => window.open(file.url, "_blank") },
    { label: "Descargar", icon: "\u2B07", onClick: () => { const a = document.createElement("a"); a.href = file.url; a.download = file.name; a.click(); } },
    { label: "Eliminar", icon: "\uD83D\uDDD1", danger: true, onClick: () => { if (window.confirm(`Eliminar "${file.name}"?`)) onDeleteFile(file); } },
  ];

  return (
    <div
      className={`group relative flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
        movingFile?.id === file.id ? "bg-primary/10 border border-primary/30" : "hover:bg-muted/50"
      }`}
    >
      <Icon className="w-5 h-5 text-muted-foreground/70 shrink-0" strokeWidth={1.5} />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground truncate">{file.name}</p>
        <p className="text-xs text-muted-foreground">{formatSize(file.size)} · {file.type.toUpperCase()}</p>
      </div>
      <div className="relative">
        <button
          ref={btnRef}
          onClick={() => setMenuOpen(!menuOpen)}
          className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <MoreVertical className="w-4 h-4" />
        </button>
        <ContextMenu anchorRef={btnRef} open={menuOpen} onClose={() => setMenuOpen(false)} items={menuItems} />
      </div>
    </div>
  );
}

/* ── Folder Card ────────────────────────────────────────── */
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
      label: "Eliminar carpeta", icon: "\uD83D\uDDD1", danger: true,
      onClick: () => { if (window.confirm(`Eliminar carpeta "${folder.name}" y mover sus archivos al nivel actual?`)) onDeleteFolder(folder.id); },
    },
  ];

  if (isGrid) {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        whileTap={{ scale: 0.98 }}
        className="group relative bg-card/80 border border-border rounded-xl p-4 cursor-pointer hover:border-primary/30 hover:bg-muted/50 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200"
        onClick={onOpen}
      >
        <div className="absolute top-2 right-2 z-10">
          <button
            ref={btnRef}
            onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
          <ContextMenu anchorRef={btnRef} open={menuOpen} onClose={() => setMenuOpen(false)} items={menuItems} />
        </div>
        <div className="flex items-center justify-center pt-1 pb-2">
          <FolderIcon className="w-12 h-12 text-warning" strokeWidth={1.5} />
        </div>
        <p className="text-sm text-foreground font-medium truncate">{folder.name}</p>
        <p className="text-xs text-muted-foreground mt-1 font-medium">
          {fileCount} archivos · {subFolderCount} carpetas
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      whileTap={{ scale: 0.98 }}
      className="group relative flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
      onClick={onOpen}
    >
      <FolderIcon className="w-6 h-6 text-warning shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground font-medium truncate">{folder.name}</p>
        <p className="text-xs text-muted-foreground">{fileCount} archivos · {subFolderCount} carpetas</p>
      </div>
      <div className="relative">
        <button
          ref={btnRef}
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

/* ── Main Component ─────────────────────────────────────── */
export function FilesTab({
  files, currentFiles, currentFolders, allFolders, breadcrumb,
  currentFolderId, uploading, showNewFolder, newFolderName, movingFile,
  onSetCurrentFolderId, onSetShowNewFolder, onSetNewFolderName,
  onSetMovingFile, onFileUpload, onCreateFolder, onDeleteFolder,
  onDeleteFile, onMoveFile,
}: FilesTabProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem(VIEW_KEY);
    if (saved === "grid" || saved === "list") setViewMode(saved);
  }, []);

  const toggleView = (mode: "grid" | "list") => {
    setViewMode(mode);
    localStorage.setItem(VIEW_KEY, mode);
  };

  /* Dropzone — trigger the hidden input's onChange with a synthetic-ish event */
  const onDrop = useCallback((acceptedFiles: globalThis.File[]) => {
    if (!acceptedFiles.length || !fileInputRef.current) return;
    const dt = new DataTransfer();
    acceptedFiles.forEach((f) => dt.items.add(f));
    fileInputRef.current.files = dt.files;
    const evt = new Event("change", { bubbles: true });
    fileInputRef.current.dispatchEvent(evt);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
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

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1 text-sm flex-1 min-w-0">
          <button
            onClick={() => onSetCurrentFolderId(null)}
            className={`hover:text-foreground transition-colors shrink-0 ${currentFolderId ? "text-muted-foreground" : "text-foreground font-medium"}`}
          >
            Archivos
          </button>
          {breadcrumb.map((folder) => (
            <span key={folder.id} className="flex items-center gap-1 min-w-0">
              <ChevronRight className="w-3 h-3 text-muted-foreground/60 shrink-0" />
              <button
                onClick={() => onSetCurrentFolderId(folder.id)}
                className={`hover:text-foreground transition-colors truncate ${
                  folder.id === currentFolderId ? "text-foreground font-medium" : "text-muted-foreground"
                }`}
              >
                {folder.name}
              </button>
            </span>
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          {/* View toggle */}
          <div className="flex items-center bg-muted rounded-lg p-0.5">
            <button
              onClick={() => toggleView("grid")}
              className={`p-1.5 rounded-md transition-colors ${isGrid ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              title="Vista grilla"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => toggleView("list")}
              className={`p-1.5 rounded-md transition-colors ${!isGrid ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              title="Vista lista"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <Button variant="ghost" size="sm" onClick={() => onSetShowNewFolder(true)} className="text-muted-foreground hover:text-foreground">
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
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="flex gap-2">
            <input
              autoFocus
              value={newFolderName}
              onChange={(e) => onSetNewFolderName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onCreateFolder()}
              placeholder="Nombre de la carpeta..."
              className="flex-1 bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-ring"
            />
            <Button size="sm" onClick={onCreateFolder} className="bg-primary hover:bg-primary/90 text-foreground">Crear</Button>
            <Button size="sm" variant="ghost" onClick={() => { onSetShowNewFolder(false); onSetNewFolderName(""); }} className="text-muted-foreground">Cancelar</Button>
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
        <input {...getInputProps()} />

        {/* Drag overlay */}
        {isDragActive && (
          <div className="absolute inset-0 z-40 flex items-center justify-center bg-primary/10 border-2 border-dashed border-primary rounded-xl backdrop-blur-sm">
            <div className="text-center">
              <Upload className="w-10 h-10 text-primary mx-auto mb-2" />
              <p className="text-sm font-medium text-primary">Suelta los archivos aqui</p>
            </div>
          </div>
        )}

        {/* Folders */}
        {currentFolders.length > 0 && (
          <div className={isGrid ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-4" : "space-y-1 mb-4"}>
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
          <div className={isGrid ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3" : "space-y-1"}>
            {currentFiles.map((file) =>
              isGrid ? (
                <FileCardGrid key={file.id} file={file} movingFile={movingFile} onSetMovingFile={onSetMovingFile} onDeleteFile={onDeleteFile} />
              ) : (
                <FileRowList key={file.id} file={file} movingFile={movingFile} onSetMovingFile={onSetMovingFile} onDeleteFile={onDeleteFile} />
              )
            )}
          </div>
        ) : currentFolders.length === 0 && (
          <div className="text-center py-16 border border-dashed border-border rounded-xl">
            <Upload className="w-10 h-10 text-muted-foreground/60 mx-auto mb-3" />
            <p className="text-muted-foreground font-medium">Arrastra archivos o haz click en &quot;Subir&quot;</p>
            <p className="text-xs text-muted-foreground mt-1">PDF, HTML, Excel, TXT, imagenes</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
