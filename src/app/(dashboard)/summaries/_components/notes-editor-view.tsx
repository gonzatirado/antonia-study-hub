"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Loader2,
  Search,
  PenLine,
  ChevronDown,
  ChevronRight,
  Star,
  Share2,
  MoreHorizontal,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Image,
  Link2,
  Code,
  Zap,
  Save,
  Trash2,
  Tag,
  Eye,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { InteractiveSummary } from "@/components/shared/interactive-summary";
import { type Note, formatRelativeDate } from "./types";

/* ─── Toolbar Button ─── */

function ToolbarButton({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      title={label}
      onClick={onClick}
      className={`p-1.5 rounded-md transition-colors ${
        active
          ? "bg-primary/15 text-primary"
          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
      }`}
    >
      <Icon className="w-4 h-4" />
    </button>
  );
}

/* ═══════════════════════════════════════════
   EDITOR VIEW (notas-lista + notas-enfoque)
   ═══════════════════════════════════════════ */

export function NotesEditorView({
  notes,
  subjectGroups,
  noteSubjects,
  subjects,
  expandedFolders,
  toggleFolder,
  searchQuery,
  setSearchQuery,
  selectedNote,
  openNote,
  editTitle,
  setEditTitle,
  editContent,
  setEditContent,
  editSubject,
  setEditSubject,
  saving,
  handleSaveNote,
  handleDeleteNote,
  toggleStar,
}: {
  notes: Note[];
  subjectGroups: Record<string, { name: string; notes: Note[] }>;
  noteSubjects: [string, string][];
  subjects: { id: string; name: string; code?: string }[];
  expandedFolders: Set<string>;
  toggleFolder: (id: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedNote: Note | null;
  openNote: (n: Note) => void;
  editTitle: string;
  setEditTitle: (t: string) => void;
  editContent: string;
  setEditContent: (c: string) => void;
  editSubject: string;
  setEditSubject: (s: string) => void;
  saving: boolean;
  handleSaveNote: () => void;
  handleDeleteNote: () => void;
  toggleStar: (id: string) => void;
}) {
  const [preview, setPreview] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const wordCount = editContent
    .trim()
    .split(/\s+/)
    .filter((w) => w).length;

  const insertMarkdown = useCallback(
    (prefix: string, suffix: string, placeholder: string) => {
      const ta = textareaRef.current;
      if (!ta) return;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const selected = editContent.substring(start, end);
      let newText: string;
      let cursorStart: number;
      let cursorEnd: number;

      if (selected) {
        newText =
          editContent.substring(0, start) +
          prefix +
          selected +
          suffix +
          editContent.substring(end);
        cursorStart = start + prefix.length;
        cursorEnd = cursorStart + selected.length;
      } else {
        newText =
          editContent.substring(0, start) +
          prefix +
          placeholder +
          suffix +
          editContent.substring(end);
        cursorStart = start + prefix.length;
        cursorEnd = cursorStart + placeholder.length;
      }

      setEditContent(newText);
      requestAnimationFrame(() => {
        ta.focus();
        ta.setSelectionRange(cursorStart, cursorEnd);
      });
    },
    [editContent, setEditContent]
  );

  const insertLinePrefix = useCallback(
    (prefix: string) => {
      const ta = textareaRef.current;
      if (!ta) return;
      const start = ta.selectionStart;
      const lineStart = editContent.lastIndexOf("\n", start - 1) + 1;
      const newText =
        editContent.substring(0, lineStart) +
        prefix +
        editContent.substring(lineStart);
      const newCursor = start + prefix.length;

      setEditContent(newText);
      requestAnimationFrame(() => {
        ta.focus();
        ta.setSelectionRange(newCursor, newCursor);
      });
    },
    [editContent, setEditContent]
  );

  const handleBold = useCallback(
    () => insertMarkdown("**", "**", "texto"),
    [insertMarkdown]
  );
  const handleItalic = useCallback(
    () => insertMarkdown("*", "*", "texto"),
    [insertMarkdown]
  );
  const handleUnderline = useCallback(
    () => insertMarkdown("<u>", "</u>", "texto"),
    [insertMarkdown]
  );
  const handleList = useCallback(
    () => insertLinePrefix("- "),
    [insertLinePrefix]
  );
  const handleListOrdered = useCallback(
    () => insertLinePrefix("1. "),
    [insertLinePrefix]
  );
  const handleImage = useCallback(
    () => insertMarkdown("![", "](url)", "alt"),
    [insertMarkdown]
  );
  const handleLink = useCallback(
    () => insertMarkdown("[", "](url)", "texto"),
    [insertMarkdown]
  );
  const handleCode = useCallback(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    const selected = editContent.substring(
      ta.selectionStart,
      ta.selectionEnd
    );
    if (selected.includes("\n")) {
      insertMarkdown("```\n", "\n```", "codigo");
    } else {
      insertMarkdown("`", "`", "codigo");
    }
  }, [editContent, insertMarkdown]);

  return (
    <div className="flex gap-4 min-h-[600px]">
      {/* Sidebar: Note list */}
      <Card className="w-64 shrink-0 bg-card/30 backdrop-blur-sm border-border/50 overflow-hidden flex flex-col">
        <CardContent className="p-3 space-y-2 flex-1 flex flex-col">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              placeholder="Buscar notas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-8 bg-muted/30 border-border/50 text-xs"
            />
          </div>

          {/* Notes tree */}
          <div className="flex-1 overflow-y-auto space-y-1 -mx-1 px-1">
            {Object.entries(subjectGroups).map(
              ([subjectId, { name, notes: groupNotes }]) => (
                <div key={subjectId} className="space-y-0.5">
                  <button
                    onClick={() => toggleFolder(subjectId)}
                    className="w-full flex items-center justify-between px-2 py-1 rounded-md hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      {expandedFolders.has(subjectId) ? (
                        <ChevronDown className="w-3 h-3 text-muted-foreground shrink-0" />
                      ) : (
                        <ChevronRight className="w-3 h-3 text-muted-foreground shrink-0" />
                      )}
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground truncate">
                        {name}
                      </span>
                    </div>
                    <span className="text-[10px] text-muted-foreground/60 font-mono">
                      {String(groupNotes.length).padStart(2, "0")}
                    </span>
                  </button>

                  <AnimatePresence>
                    {expandedFolders.has(subjectId) && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="overflow-hidden ml-3 border-l border-border/30 space-y-0.5"
                      >
                        {groupNotes.map((note) => (
                          <button
                            key={note.id}
                            onClick={() => openNote(note)}
                            className={`w-full text-left pl-3 pr-2 py-1.5 transition-colors ${
                              selectedNote?.id === note.id
                                ? "bg-primary/10 border-r-2 border-primary"
                                : "hover:bg-muted/40"
                            }`}
                          >
                            <h4
                              className={`text-xs font-medium truncate ${
                                selectedNote?.id === note.id
                                  ? "text-foreground"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {note.title || "Sin título"}
                            </h4>
                            <p className="text-[10px] text-muted-foreground/50 mt-0.5">
                              {formatRelativeDate(note.updatedAt)}
                            </p>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            )}
          </div>
        </CardContent>
      </Card>

      {/* Editor Panel */}
      <Card className="flex-1 bg-card/30 backdrop-blur-sm border-border/50 overflow-hidden flex flex-col">
        <CardContent className="p-0 flex-1 flex flex-col">
          {selectedNote ? (
            <>
              {/* Editor Top Bar */}
              <div className="px-6 py-3 border-b border-border/30 flex items-center justify-between bg-card/20">
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-primary" />
                    <span className="text-foreground font-medium truncate max-w-[200px]">
                      {editTitle || "Sin título"}
                    </span>
                  </div>
                  {selectedNote.updatedAt && (
                    <>
                      <span className="text-border">|</span>
                      <span>
                        Editado {formatRelativeDate(selectedNote.updatedAt)}
                      </span>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => toggleStar(selectedNote.id)}
                    className={
                      selectedNote.starred
                        ? "text-yellow-400"
                        : "text-muted-foreground"
                    }
                  >
                    <Star
                      className="w-4 h-4"
                      fill={selectedNote.starred ? "currentColor" : "none"}
                    />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="text-muted-foreground"
                  >
                    <Share2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="text-muted-foreground"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Toolbar */}
              <div className="px-6 py-2 border-b border-border/20 flex items-center gap-1 bg-card/10">
                <ToolbarButton icon={Bold} label="Negrita" onClick={handleBold} />
                <ToolbarButton icon={Italic} label="Cursiva" onClick={handleItalic} />
                <ToolbarButton icon={Underline} label="Subrayado" onClick={handleUnderline} />
                <div className="w-px h-4 bg-border/30 mx-1" />
                <ToolbarButton icon={List} label="Lista" onClick={handleList} />
                <ToolbarButton icon={ListOrdered} label="Lista numerada" onClick={handleListOrdered} />
                <div className="w-px h-4 bg-border/30 mx-1" />
                <ToolbarButton icon={Image} label="Imagen" onClick={handleImage} />
                <ToolbarButton icon={Link2} label="Enlace" onClick={handleLink} />
                <ToolbarButton icon={Code} label="Código" onClick={handleCode} />
                <div className="w-px h-4 bg-border/30 mx-1" />
                <button
                  onClick={() => setPreview(!preview)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                    preview
                      ? "bg-primary/15 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  Vista previa
                </button>
                <div className="flex-1" />
                <button className="flex items-center gap-1.5 px-2.5 py-1 bg-primary/10 text-primary rounded-md text-xs font-bold uppercase tracking-wider hover:bg-primary/20 transition-all">
                  <Zap className="w-3.5 h-3.5" />
                  IA Assist
                </button>
              </div>

              {/* Editor body */}
              <div className="flex-1 overflow-y-auto">
                <div className="max-w-3xl mx-auto px-8 py-8 space-y-6">
                  {/* Subject tag + title */}
                  <div className="space-y-3">
                    <Select
                      value={editSubject}
                      onValueChange={(v) => setEditSubject(v ?? "general")}
                    >
                      <SelectTrigger className="w-fit h-6 border-primary/20 bg-primary/5 text-primary text-[10px] font-bold uppercase tracking-wider px-2 gap-1">
                        <Tag className="w-3 h-3" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border">
                        <SelectItem
                          value="general"
                          className="text-foreground text-xs"
                        >
                          General
                        </SelectItem>
                        {noteSubjects.map(([id, name]) => (
                          <SelectItem
                            key={id}
                            value={id}
                            className="text-foreground text-xs"
                          >
                            {name}
                          </SelectItem>
                        ))}
                        {subjects.map(
                          (s) =>
                            !noteSubjects.some(([id]) => id === s.id) && (
                              <SelectItem
                                key={s.id}
                                value={s.id}
                                className="text-foreground text-xs"
                              >
                                {s.name}
                                {s.code ? ` (${s.code})` : ""}
                              </SelectItem>
                            )
                        )}
                      </SelectContent>
                    </Select>

                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      placeholder="Título de la nota..."
                      className="w-full text-3xl font-extrabold tracking-tight text-foreground bg-transparent border-none outline-none placeholder:text-muted-foreground/30"
                    />
                  </div>

                  {/* Content area */}
                  {preview ? (
                    <div className="prose prose-invert max-w-none min-h-[300px]">
                      <InteractiveSummary content={editContent} />
                    </div>
                  ) : (
                    <Textarea
                      ref={textareaRef}
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      placeholder="Escribe tu nota aquí... (soporta Markdown)"
                      className="min-h-[400px] bg-transparent border-none text-foreground/90 leading-relaxed text-base resize-none focus-visible:ring-0 focus-visible:border-none p-0"
                    />
                  )}
                </div>
              </div>

              {/* Footer / Status bar */}
              <div className="px-6 py-2 border-t border-border/20 flex items-center justify-between bg-card/20">
                <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  <div className="flex items-center gap-1.5 text-primary">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                    </span>
                    Sincronizado
                  </div>
                  <div className="h-3 w-px bg-border/30" />
                  <span>{wordCount} Palabras</span>
                  <div className="h-3 w-px bg-border/30" />
                  <span>MD compatible</span>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDeleteNote}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 text-xs gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Eliminar
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSaveNote}
                    disabled={saving || !editTitle.trim()}
                    className="gap-1.5"
                  >
                    {saving ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Save className="w-3.5 h-3.5" />
                    )}
                    Guardar
                  </Button>
                </div>
              </div>
            </>
          ) : (
            /* Empty state */
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                  <PenLine className="w-8 h-8 text-primary/50" />
                </div>
                <div>
                  <p className="text-foreground font-medium">
                    Selecciona una nota para editar
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    O crea una nueva desde el panel lateral
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
