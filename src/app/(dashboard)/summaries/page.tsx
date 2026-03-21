"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Loader2,
  ArrowLeft,
  LayoutGrid,
  PenLine,
  Plus,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAppStore } from "@/lib/store";
import { extractTextFromFiles } from "@/lib/utils/extract-text";
import { getAuthHeaders } from "@/lib/firebase/get-auth-token";
import { useEnsureSubjects } from "@/hooks/use-ensure-subjects";
import { InteractiveSummary } from "@/components/shared/interactive-summary";
import { getAllNotes, addNote, updateNote, deleteNote } from "@/lib/firebase/notes";
import * as Sentry from "@sentry/nextjs";

import type { Note, ViewMode } from "./_components/types";
import { NotesListView } from "./_components/notes-list-view";
import { NotesEditorView } from "./_components/notes-editor-view";
import { GeneratorView } from "./_components/generator-view";

/* ─── Main Component ─── */

export default function SummariesPage() {
  const { usage, user } = useAppStore();
  const subjects = useEnsureSubjects();

  // View state
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  // Notes state — loaded from Firebase
  const [notes, setNotes] = useState<Note[]>([]);
  const [notesLoading, setNotesLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSubject, setFilterSubject] = useState<string>("all");

  // Editor state
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editSubject, setEditSubject] = useState("general");
  const [saving, setSaving] = useState(false);

  // AI Generator state
  const [selectedSubject, setSelectedSubject] = useState<string>("general");
  const [generating, setGenerating] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [generatedSummary, setGeneratedSummary] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("");

  // Sidebar folder state
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set()
  );

  // Load notes from Firebase
  useEffect(() => {
    if (!user?.uid) return;
    getAllNotes(user.uid)
      .then((loaded) => {
        setNotes(loaded);
        // Auto-expand first subject folder
        if (loaded.length > 0) {
          setExpandedFolders(new Set([loaded[0].subjectId]));
        }
      })
      .catch((err) => Sentry.captureException(err, { extra: { context: "load notes" } }))
      .finally(() => setNotesLoading(false));
  }, [user?.uid]);

  const summariesUsed = usage?.summaries_used ?? 0;
  const summariesLimit = usage?.summaries_limit ?? 3;
  const canGenerate = summariesUsed < summariesLimit;

  // Group notes by subject
  const subjectGroups = useMemo(() => {
    const groups: Record<string, { name: string; notes: Note[] }> = {};
    const filtered = notes.filter((n) => {
      const matchesSearch =
        !searchQuery ||
        n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.content.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSubject =
        filterSubject === "all" || n.subjectId === filterSubject;
      return matchesSearch && matchesSubject;
    });

    filtered.forEach((note) => {
      if (!groups[note.subjectId]) {
        groups[note.subjectId] = { name: note.subjectName, notes: [] };
      }
      groups[note.subjectId].notes.push(note);
    });

    return groups;
  }, [notes, searchQuery, filterSubject]);

  // Unique subjects from notes
  const noteSubjects = useMemo(() => {
    const unique = new Map<string, string>();
    notes.forEach((n) => unique.set(n.subjectId, n.subjectName));
    return Array.from(unique.entries());
  }, [notes]);

  const toggleFolder = useCallback((subjectId: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(subjectId)) next.delete(subjectId);
      else next.add(subjectId);
      return next;
    });
  }, []);

  const openNote = useCallback((note: Note) => {
    setSelectedNote(note);
    setEditTitle(note.title);
    setEditContent(note.content);
    setEditSubject(note.subjectId);
    setViewMode("editor");
  }, []);

  const createNewNote = useCallback(() => {
    const newNote: Note = {
      id: `new-${Date.now()}`,
      title: "",
      content: "",
      subjectId: "general",
      subjectName: "General",
      createdAt: new Date(),
      updatedAt: new Date(),
      starred: false,
    };
    setSelectedNote(newNote);
    setEditTitle("");
    setEditContent("");
    setEditSubject("general");
    setViewMode("editor");
  }, []);

  const handleSaveNote = useCallback(async () => {
    if (!editTitle.trim() || !user?.uid) return;
    setSaving(true);

    const subjectName =
      subjects.find((s) => s.id === editSubject)?.name ||
      noteSubjects.find(([id]) => id === editSubject)?.[1] ||
      "General";

    try {
      if (selectedNote) {
        const isNew = selectedNote.id.startsWith("new-");

        if (isNew) {
          // Create new note in Firebase
          const created = await addNote(user.uid, {
            title: editTitle,
            content: editContent,
            subjectId: editSubject,
            subjectName,
          });
          setNotes((prev) => [created, ...prev]);
          setSelectedNote(created);
        } else {
          // Update existing note in Firebase
          await updateNote(selectedNote.id, {
            title: editTitle,
            content: editContent,
            subjectId: editSubject,
            subjectName,
          });
          const updated = {
            ...selectedNote,
            title: editTitle,
            content: editContent,
            subjectId: editSubject,
            subjectName,
            updatedAt: new Date(),
          };
          setNotes((prev) =>
            prev.map((n) => (n.id === selectedNote.id ? updated : n))
          );
          setSelectedNote(updated);
        }
      }
    } catch (err) {
      Sentry.captureException(err, { extra: { context: "save note" } });
    }

    setSaving(false);
  }, [editTitle, editContent, editSubject, selectedNote, subjects, noteSubjects, user?.uid]);

  const handleDeleteNote = useCallback(async () => {
    if (!selectedNote) return;

    try {
      if (!selectedNote.id.startsWith("new-")) {
        await deleteNote(selectedNote.id);
      }
      setNotes((prev) => prev.filter((n) => n.id !== selectedNote.id));
    } catch (err) {
      Sentry.captureException(err, { extra: { context: "delete note" } });
    }

    setSelectedNote(null);
    setViewMode("list");
  }, [selectedNote]);

  const toggleStar = useCallback(
    async (noteId: string) => {
      const note = notes.find((n) => n.id === noteId);
      if (!note) return;

      const newStarred = !note.starred;

      // Optimistic update
      setNotes((prev) =>
        prev.map((n) => (n.id === noteId ? { ...n, starred: newStarred } : n))
      );
      if (selectedNote?.id === noteId) {
        setSelectedNote((prev) =>
          prev ? { ...prev, starred: newStarred } : prev
        );
      }

      // Persist to Firebase
      try {
        if (!noteId.startsWith("new-")) {
          await updateNote(noteId, { starred: newStarred });
        }
      } catch (err) {
        // Revert on error
        setNotes((prev) =>
          prev.map((n) => (n.id === noteId ? { ...n, starred: !newStarred } : n))
        );
        Sentry.captureException(err, { extra: { context: "toggle star" } });
      }
    },
    [notes, selectedNote]
  );

  /* ─── AI Generator handler ─── */

  async function handleGenerate() {
    if (!files.length || !selectedSubject) return;

    setGenerating(true);
    setError(null);
    setStatus("Leyendo archivos...");

    try {
      setStatus("Extrayendo texto del documento...");
      const text = await extractTextFromFiles(files);

      if (!text.trim()) {
        setError(
          "No se pudo extraer texto de los archivos. Intenta con otro formato."
        );
        return;
      }

      setStatus("Generando resumen con IA...");
      const authHeaders = await getAuthHeaders();
      const res = await fetch("/api/ai/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify({ content: text }),
      });

      if (!res.ok) {
        const data = await res
          .json()
          .catch(() => ({ error: "Error del servidor" }));
        throw new Error(data.error || "Error al generar resumen");
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No se pudo iniciar el streaming");

      setStatus("Escribiendo resumen...");
      const decoder = new TextDecoder();
      let fullText = "";
      setGeneratedSummary("");

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        fullText += decoder.decode(value, { stream: true });
        setGeneratedSummary(fullText);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setGenerating(false);
      setStatus("");
    }
  }

  /* ─── Loading State ─── */

  if (notesLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  /* ─── Generated Summary Result View ─── */

  if (generatedSummary !== null) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => setGeneratedSummary(null)}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          <div className="flex-1" />
          <Badge variant="outline" className="border-info/50 text-info">
            Generado con IA
          </Badge>
        </div>

        <Card className="bg-card/50 border-border">
          <CardContent className="p-8">
            <InteractiveSummary
              content={generatedSummary}
              streaming={generating}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  /* ─── Render ─── */

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between page-header">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Notas y Resúmenes
          </h1>
          <p className="text-muted-foreground mt-1">
            Organiza, edita y genera resúmenes de tu material de estudio
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-info/50 text-info">
            {summariesUsed}/{summariesLimit} IA usados
          </Badge>
        </div>
      </div>

      {/* View Toggle + Actions Bar */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* View Toggle */}
        <div className="flex items-center bg-muted/50 rounded-lg p-1 border border-border/50">
          <button
            onClick={() => {
              setViewMode("list");
              setSelectedNote(null);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              viewMode === "list"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            Mis Notas
          </button>
          <button
            onClick={() => {
              if (!selectedNote && notes.length > 0) openNote(notes[0]);
              else setViewMode("editor");
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              viewMode === "editor"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <PenLine className="w-3.5 h-3.5" />
            Editor
          </button>
          <button
            onClick={() => setViewMode("generator")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              viewMode === "generator"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Generar IA
          </button>
        </div>

        <div className="flex-1" />

        {/* Actions */}
        <Button
          variant="default"
          size="sm"
          onClick={createNewNote}
          className="gap-1.5"
        >
          <Plus className="w-4 h-4" />
          Nueva Nota
        </Button>
      </div>

      {/* ─── LIST VIEW ─── */}
      <AnimatePresence mode="wait">
        {viewMode === "list" && (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <NotesListView
              notes={notes}
              subjectGroups={subjectGroups}
              noteSubjects={noteSubjects}
              expandedFolders={expandedFolders}
              toggleFolder={toggleFolder}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              filterSubject={filterSubject}
              setFilterSubject={setFilterSubject}
              selectedNote={selectedNote}
              openNote={openNote}
              toggleStar={toggleStar}
            />
          </motion.div>
        )}

        {/* ─── EDITOR VIEW ─── */}
        {viewMode === "editor" && (
          <motion.div
            key="editor"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <NotesEditorView
              notes={notes}
              subjectGroups={subjectGroups}
              noteSubjects={noteSubjects}
              subjects={subjects}
              expandedFolders={expandedFolders}
              toggleFolder={toggleFolder}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedNote={selectedNote}
              openNote={openNote}
              editTitle={editTitle}
              setEditTitle={setEditTitle}
              editContent={editContent}
              setEditContent={setEditContent}
              editSubject={editSubject}
              setEditSubject={setEditSubject}
              saving={saving}
              handleSaveNote={handleSaveNote}
              handleDeleteNote={handleDeleteNote}
              toggleStar={toggleStar}
            />
          </motion.div>
        )}

        {/* ─── GENERATOR VIEW ─── */}
        {viewMode === "generator" && (
          <motion.div
            key="generator"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <GeneratorView
              subjects={subjects}
              selectedSubject={selectedSubject}
              setSelectedSubject={setSelectedSubject}
              files={files}
              setFiles={setFiles}
              generating={generating}
              canGenerate={canGenerate}
              error={error}
              status={status}
              handleGenerate={handleGenerate}
              summariesUsed={summariesUsed}
              summariesLimit={summariesLimit}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
