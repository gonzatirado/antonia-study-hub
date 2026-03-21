"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Search,
  FolderOpen,
  ChevronDown,
  ChevronRight,
  Star,
  Share2,
  MoreHorizontal,
  Clock,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { InteractiveSummary } from "@/components/shared/interactive-summary";
import { type Note, formatRelativeDate, getPreview } from "./types";

/* ═══════════════════════════════════════════
   LIST VIEW (notas-lista + notas-pro)
   ═══════════════════════════════════════════ */

export function NotesListView({
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
