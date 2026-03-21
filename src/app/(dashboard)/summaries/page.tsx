"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Sparkles,
  Loader2,
  AlertCircle,
  ArrowLeft,
  Search,
  Plus,
  LayoutGrid,
  PenLine,
  FolderOpen,
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
  Clock,
  Tag,
  X,
  Eye,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import dynamic from "next/dynamic";
import { useAppStore } from "@/lib/store";
import { FileDropzone } from "@/components/shared/file-dropzone";
import { extractTextFromFiles } from "@/lib/utils/extract-text";
import { getSubjects } from "@/lib/firebase/subjects";
import { InteractiveSummary } from "@/components/shared/interactive-summary";

const MarkdownRenderer = dynamic(
  () =>
    import("@/components/shared/markdown-renderer").then((mod) => ({
      default: mod.MarkdownRenderer,
    })),
  {
    loading: () => (
      <div className="flex justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    ),
  }
);

/* ─── Types ─── */

interface Note {
  id: string;
  title: string;
  content: string;
  subjectId: string;
  subjectName: string;
  createdAt: Date;
  updatedAt: Date;
  starred: boolean;
}

/* ─── Demo Data ─── */

const DEMO_NOTES: Note[] = [
  {
    id: "1",
    title: "Resumen Teoría de Redes",
    content:
      "El estudio de las redes de computadoras se centra en la interconexión de nodos para el intercambio de recursos y datos.\n\n## Conceptos Clave de la Capa de Enlace\n\n- **Direccionamiento MAC:** Identificador único de 48 bits asignado a tarjetas de red (NIC).\n- **Protocolo ARP:** Resolución de direcciones IP a direcciones físicas dentro de una red local.\n- **Encapsulamiento:** Proceso de añadir encabezados (headers) a los datos a medida que descienden por el stack.\n\n## Modelo OSI\n\nEl modelo de interconexión de sistemas abiertos (OSI) es un modelo conceptual que caracteriza y estandariza las funciones de comunicación.\n\n```\ninterface GigabitEthernet0/0\n  ip address 192.168.1.1 255.255.255.0\n  no shutdown\n  description LAN_G0/0\n```\n\nRecordar que para el examen parcial se enfatizará en la diferencia entre *Switching* y *Routing*.",
    subjectId: "redes",
    subjectName: "Redes de Computadoras",
    createdAt: new Date(2023, 9, 14),
    updatedAt: new Date(),
    starred: true,
  },
  {
    id: "2",
    title: "Modelo OSI y TCP/IP",
    content:
      "Comparación entre el modelo OSI de 7 capas y el modelo TCP/IP de 4 capas.\n\n## Capas del Modelo OSI\n\n1. Física\n2. Enlace de datos\n3. Red\n4. Transporte\n5. Sesión\n6. Presentación\n7. Aplicación\n\n## Modelo TCP/IP\n\n1. Acceso a la red\n2. Internet\n3. Transporte\n4. Aplicación",
    subjectId: "redes",
    subjectName: "Redes de Computadoras",
    createdAt: new Date(2023, 9, 13),
    updatedAt: new Date(2023, 9, 13),
    starred: false,
  },
  {
    id: "3",
    title: "Subnetting Avanzado",
    content:
      "Técnicas avanzadas de subnetting y VLSM.\n\n## VLSM\n\nVariable Length Subnet Masking permite usar diferentes máscaras de subred dentro de la misma red.\n\n## Ejemplo práctico\n\nRed: 192.168.1.0/24\n- Subred A: /26 (62 hosts)\n- Subred B: /27 (30 hosts)\n- Subred C: /28 (14 hosts)",
    subjectId: "redes",
    subjectName: "Redes de Computadoras",
    createdAt: new Date(2023, 9, 12),
    updatedAt: new Date(2023, 9, 12),
    starred: false,
  },
  {
    id: "4",
    title: "Resumen Certamen 1",
    content:
      "## Integrales Impropias\n\nLas integrales impropias son una extensión del concepto de la integral definida.\n\n### Conceptos Clave\n\n- **Convergencia:** Si el límite existe y es un número real finito.\n- **Divergencia:** Si el límite no existe o tiende al infinito.\n- **Teorema de Comparación:** Utilizado para determinar convergencia sin calcular la integral exacta.\n\n## Sucesiones y Series\n\nPara las series infinitas, el objetivo principal es determinar si la suma de infinitos términos resulta en un valor finito.\n\n### Serie Geométrica\nConverge si |r| < 1. La suma es a/(1-r).\n\n### Serie p-test\nConverge si p > 1, diverge si p ≤ 1.",
    subjectId: "calculo",
    subjectName: "Cálculo II",
    createdAt: new Date(2023, 9, 24),
    updatedAt: new Date(2023, 9, 24),
    starred: true,
  },
  {
    id: "5",
    title: "Apuntes Clase 05",
    content:
      "## Integrales dobles\n\nLas integrales dobles permiten calcular el volumen bajo una superficie z = f(x, y).\n\n### Método de iteración\n\nSe resuelve la integral interna primero, tratando una variable como constante.",
    subjectId: "calculo",
    subjectName: "Cálculo II",
    createdAt: new Date(2023, 9, 20),
    updatedAt: new Date(2023, 9, 20),
    starred: false,
  },
  {
    id: "6",
    title: "Ética en la Ingeniería",
    content:
      "## Principios fundamentales\n\n- Responsabilidad profesional\n- Integridad y honestidad\n- Competencia técnica\n- Respeto por el medio ambiente\n\n## Casos de estudio\n\nAnálisis de dilemas éticos en la práctica profesional de la ingeniería.",
    subjectId: "etica",
    subjectName: "Ética Profesional",
    createdAt: new Date(2023, 9, 18),
    updatedAt: new Date(2023, 9, 18),
    starred: false,
  },
];

/* ─── Helpers ─── */

function formatRelativeDate(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Ahora";
  if (diffMins < 60) return `Hace ${diffMins} min`;
  if (diffHours < 24) return `Hace ${diffHours}h`;
  if (diffDays === 1) return "Ayer";
  if (diffDays < 7) return `Hace ${diffDays} días`;
  return date.toLocaleDateString("es-CL", {
    day: "numeric",
    month: "short",
    year: diffDays > 365 ? "numeric" : undefined,
  });
}

function getPreview(content: string, maxLength = 120): string {
  return content
    .replace(/#+\s/g, "")
    .replace(/\*\*/g, "")
    .replace(/[*_`~]/g, "")
    .replace(/```[\s\S]*?```/g, "")
    .replace(/\n+/g, " ")
    .trim()
    .slice(0, maxLength);
}

/* ─── View Type ─── */

type ViewMode = "list" | "editor" | "generator";

/* ─── Main Component ─── */

export default function SummariesPage() {
  const { subjects, setSubjects, usage, user } = useAppStore();

  // Load subjects if not in store
  useEffect(() => {
    if (user?.uid && subjects.length === 0) {
      getSubjects(user.uid)
        .then(setSubjects)
        .catch(() => {});
    }
  }, [user?.uid, subjects.length, setSubjects]);

  // View state
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  // Notes state (demo data - would be replaced with Firebase)
  const [notes, setNotes] = useState<Note[]>(DEMO_NOTES);
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
    new Set(["redes"])
  );

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
    if (!editTitle.trim()) return;
    setSaving(true);

    // Simulate save
    await new Promise((r) => setTimeout(r, 500));

    const subjectName =
      subjects.find((s) => s.id === editSubject)?.name ||
      noteSubjects.find(([id]) => id === editSubject)?.[1] ||
      "General";

    if (selectedNote) {
      setNotes((prev) =>
        prev.some((n) => n.id === selectedNote.id)
          ? prev.map((n) =>
              n.id === selectedNote.id
                ? {
                    ...n,
                    title: editTitle,
                    content: editContent,
                    subjectId: editSubject,
                    subjectName,
                    updatedAt: new Date(),
                  }
                : n
            )
          : [
              ...prev,
              {
                ...selectedNote,
                title: editTitle,
                content: editContent,
                subjectId: editSubject,
                subjectName,
                updatedAt: new Date(),
              },
            ]
      );
    }

    setSaving(false);
  }, [editTitle, editContent, editSubject, selectedNote, subjects, noteSubjects]);

  const handleDeleteNote = useCallback(() => {
    if (!selectedNote) return;
    setNotes((prev) => prev.filter((n) => n.id !== selectedNote.id));
    setSelectedNote(null);
    setViewMode("list");
  }, [selectedNote]);

  const toggleStar = useCallback(
    (noteId: string) => {
      setNotes((prev) =>
        prev.map((n) => (n.id === noteId ? { ...n, starred: !n.starred } : n))
      );
      if (selectedNote?.id === noteId) {
        setSelectedNote((prev) =>
          prev ? { ...prev, starred: !prev.starred } : prev
        );
      }
    },
    [selectedNote]
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
      const res = await fetch("/api/ai/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text, userId: user?.uid }),
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
      <div className="flex items-center justify-between">
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

/* ═══════════════════════════════════════════
   LIST VIEW (notas-lista + notas-pro)
   ═══════════════════════════════════════════ */

function NotesListView({
  notes,
  subjectGroups,
  noteSubjects,
  expandedFolders,
  toggleFolder,
  searchQuery,
  setSearchQuery,
  filterSubject,
  setFilterSubject,
  selectedNote,
  openNote,
  toggleStar,
}: {
  notes: Note[];
  subjectGroups: Record<string, { name: string; notes: Note[] }>;
  noteSubjects: [string, string][];
  expandedFolders: Set<string>;
  toggleFolder: (id: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  filterSubject: string;
  setFilterSubject: (s: string) => void;
  selectedNote: Note | null;
  openNote: (n: Note) => void;
  toggleStar: (id: string) => void;
}) {
  return (
    <div className="flex gap-4 min-h-[600px]">
      {/* Sidebar: Folder tree */}
      <Card className="w-72 shrink-0 bg-card/30 backdrop-blur-sm border-border/50 overflow-hidden flex flex-col">
        <CardContent className="p-4 space-y-3 flex-1 flex flex-col">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar notas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 bg-muted/30 border-border/50 text-sm"
            />
          </div>

          {/* Filter */}
          <Select value={filterSubject} onValueChange={(v) => setFilterSubject(v ?? "all")}>
            <SelectTrigger className="h-8 bg-muted/30 border-border/50 text-xs">
              <SelectValue placeholder="Filtrar por asignatura" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              <SelectItem value="all" className="text-foreground text-xs">
                Todas las asignaturas
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
            </SelectContent>
          </Select>

          {/* Folder tree */}
          <div className="flex-1 overflow-y-auto space-y-1 -mx-1 px-1 custom-scrollbar">
            {Object.entries(subjectGroups).map(
              ([subjectId, { name, notes: groupNotes }]) => (
                <div key={subjectId} className="space-y-0.5">
                  {/* Folder header */}
                  <button
                    onClick={() => toggleFolder(subjectId)}
                    className="w-full flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-muted/50 transition-colors group"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {expandedFolders.has(subjectId) ? (
                        <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      )}
                      <FolderOpen className="w-4 h-4 text-primary/70 shrink-0" />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground truncate">
                        {name}
                      </span>
                    </div>
                    <span className="text-[10px] text-muted-foreground/60 font-mono shrink-0">
                      {String(groupNotes.length).padStart(2, "0")}
                    </span>
                  </button>

                  {/* Notes in folder */}
                  <AnimatePresence>
                    {expandedFolders.has(subjectId) && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="overflow-hidden ml-4 border-l border-border/30 space-y-0.5"
                      >
                        {groupNotes.map((note) => (
                          <button
                            key={note.id}
                            onClick={() => openNote(note)}
                            className={`w-full text-left pl-3 pr-2 py-2 transition-colors group ${
                              selectedNote?.id === note.id
                                ? "bg-primary/10 border-r-2 border-primary"
                                : "hover:bg-muted/40"
                            }`}
                          >
                            <h4
                              className={`text-sm font-medium truncate ${
                                selectedNote?.id === note.id
                                  ? "text-foreground"
                                  : "text-muted-foreground group-hover:text-foreground"
                              }`}
                            >
                              {note.title}
                            </h4>
                            <p className="text-[10px] text-muted-foreground/60 mt-0.5">
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

            {Object.keys(subjectGroups).length === 0 && (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No se encontraron notas
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Main content: Note preview / Grid */}
      {selectedNote ? (
        <NotePreview
          note={selectedNote}
          toggleStar={toggleStar}
        />
      ) : (
        <NotesGrid
          subjectGroups={subjectGroups}
          openNote={openNote}
          toggleStar={toggleStar}
        />
      )}
    </div>
  );
}

/* ─── Note Preview Panel (notas-pro right panel) ─── */

function NotePreview({
  note,
  toggleStar,
}: {
  note: Note;
  toggleStar: (id: string) => void;
}) {
  return (
    <Card className="flex-1 bg-card/30 backdrop-blur-sm border-border/50 overflow-hidden flex flex-col">
      <CardContent className="p-0 flex-1 flex flex-col">
        {/* Preview header */}
        <div className="px-8 py-4 border-b border-border/30 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <Badge
              variant="outline"
              className="border-primary/30 text-primary text-[10px] uppercase tracking-wider shrink-0"
            >
              {note.subjectName}
            </Badge>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
              Editado: {formatRelativeDate(note.updatedAt)}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => toggleStar(note.id)}
              className={
                note.starred
                  ? "text-yellow-400 hover:text-yellow-500"
                  : "text-muted-foreground"
              }
            >
              <Star
                className="w-4 h-4"
                fill={note.starred ? "currentColor" : "none"}
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

        {/* Preview content */}
        <div className="flex-1 overflow-y-auto px-8 py-6 lg:px-12">
          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-3xl font-extrabold tracking-tight text-foreground">
              {note.title}
            </h2>
            <div className="w-12 h-0.5 bg-primary/30 rounded-full" />
            <div className="prose prose-invert max-w-none">
              <InteractiveSummary content={note.content} />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/* ─── Notes Grid (when no note selected in list view) ─── */

function NotesGrid({
  subjectGroups,
  openNote,
  toggleStar,
}: {
  subjectGroups: Record<string, { name: string; notes: Note[] }>;
  openNote: (n: Note) => void;
  toggleStar: (id: string) => void;
}) {
  const allNotes = Object.values(subjectGroups).flatMap((g) => g.notes);

  return (
    <div className="flex-1 space-y-4">
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="bg-card/30 backdrop-blur-sm border-border/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {allNotes.length}
              </p>
              <p className="text-xs text-muted-foreground">Total notas</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/30 backdrop-blur-sm border-border/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
              <Star className="w-5 h-5 text-yellow-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {allNotes.filter((n) => n.starred).length}
              </p>
              <p className="text-xs text-muted-foreground">Destacadas</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/30 backdrop-blur-sm border-border/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
              <FolderOpen className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {Object.keys(subjectGroups).length}
              </p>
              <p className="text-xs text-muted-foreground">Asignaturas</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notes grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {allNotes.map((note, i) => (
          <motion.div
            key={note.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03, duration: 0.2 }}
          >
            <Card
              className="bg-card/30 backdrop-blur-sm border-border/50 hover:border-primary/30 hover:bg-card/50 transition-all cursor-pointer group"
              onClick={() => openNote(note)}
            >
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <Badge
                    variant="outline"
                    className="border-primary/20 text-primary/80 text-[9px] uppercase tracking-wider"
                  >
                    {note.subjectName}
                  </Badge>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleStar(note.id);
                    }}
                    className={`p-1 rounded transition-colors ${
                      note.starred
                        ? "text-yellow-400"
                        : "text-muted-foreground/30 opacity-0 group-hover:opacity-100"
                    }`}
                  >
                    <Star
                      className="w-3.5 h-3.5"
                      fill={note.starred ? "currentColor" : "none"}
                    />
                  </button>
                </div>

                <h3 className="text-sm font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                  {note.title}
                </h3>

                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {getPreview(note.content)}
                </p>

                <div className="flex items-center gap-2 pt-1">
                  <Clock className="w-3 h-3 text-muted-foreground/50" />
                  <span className="text-[10px] text-muted-foreground/60">
                    {formatRelativeDate(note.updatedAt)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   EDITOR VIEW (notas-lista + notas-enfoque)
   ═══════════════════════════════════════════ */

function NotesEditorView({
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
  const wordCount = editContent
    .trim()
    .split(/\s+/)
    .filter((w) => w).length;

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
                <ToolbarButton icon={Bold} label="Negrita" />
                <ToolbarButton icon={Italic} label="Cursiva" />
                <ToolbarButton icon={Underline} label="Subrayado" />
                <div className="w-px h-4 bg-border/30 mx-1" />
                <ToolbarButton icon={List} label="Lista" />
                <ToolbarButton icon={ListOrdered} label="Lista numerada" />
                <div className="w-px h-4 bg-border/30 mx-1" />
                <ToolbarButton icon={Image} label="Imagen" />
                <ToolbarButton icon={Link2} label="Enlace" />
                <ToolbarButton icon={Code} label="Código" />
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

/* ─── Toolbar Button ─── */

function ToolbarButton({
  icon: Icon,
  label,
  active,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active?: boolean;
}) {
  return (
    <button
      title={label}
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
   GENERATOR VIEW (original AI generator)
   ═══════════════════════════════════════════ */

function GeneratorView({
  subjects,
  selectedSubject,
  setSelectedSubject,
  files,
  setFiles,
  generating,
  canGenerate,
  error,
  status,
  handleGenerate,
  summariesUsed,
  summariesLimit,
}: {
  subjects: { id: string; name: string; code?: string }[];
  selectedSubject: string;
  setSelectedSubject: (s: string) => void;
  files: File[];
  setFiles: (f: File[]) => void;
  generating: boolean;
  canGenerate: boolean;
  error: string | null;
  status: string;
  handleGenerate: () => void;
  summariesUsed: number;
  summariesLimit: number;
}) {
  return (
    <div className="space-y-6">
      {/* Usage bar */}
      <Card className="bg-card/50 border-border">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">
              Uso mensual de resúmenes IA
            </span>
            <span className="text-sm text-foreground/80">
              {summariesUsed} de {summariesLimit}
            </span>
          </div>
          <Progress
            value={
              summariesLimit > 0 ? (summariesUsed / summariesLimit) * 100 : 0
            }
            className="h-2 bg-muted"
          />
        </CardContent>
      </Card>

      {/* Generator */}
      <Card className="bg-card/50 border-border">
        <CardContent className="p-8">
          <div className="max-w-xl mx-auto space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-foreground" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">
                Generar nuevo resumen
              </h2>
              <p className="text-muted-foreground mt-1">
                Selecciona una asignatura y sube archivos para crear tu resumen
              </p>
            </div>

            <div className="space-y-4">
              <Select
                value={selectedSubject}
                onValueChange={(v) => setSelectedSubject(v ?? "")}
              >
                <SelectTrigger className="bg-muted border-border text-foreground">
                  <SelectValue placeholder="Selecciona una asignatura" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="general" className="text-foreground">
                    General (sin asignatura)
                  </SelectItem>
                  {subjects.map((s) => (
                    <SelectItem
                      key={s.id}
                      value={s.id}
                      className="text-foreground"
                    >
                      {s.name || s.code || s.id.slice(0, 8)}
                      {s.code && s.name ? ` (${s.code})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <FileDropzone
                onFilesSelected={setFiles}
                maxFiles={5}
                maxSizeMB={50}
                color="blue"
              />

              {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                  <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              {!canGenerate && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-warning/10 border border-warning/20">
                  <AlertCircle className="w-5 h-5 text-warning flex-shrink-0" />
                  <p className="text-sm text-warning">
                    Llegaste a tu límite mensual. Mejora tu plan para generar
                    más resúmenes.
                  </p>
                </div>
              )}

              <Button
                onClick={handleGenerate}
                disabled={
                  !canGenerate ||
                  !selectedSubject ||
                  !files.length ||
                  generating
                }
                className="w-full bg-primary hover:bg-primary/90 h-12"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    {status || "Generando resumen..."}
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Generar resumen
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
