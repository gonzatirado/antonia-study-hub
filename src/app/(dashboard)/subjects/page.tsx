"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, BookOpen, MoreVertical, Trash2, Edit,
  Upload, Loader2, FolderIcon, LayoutGrid, List, Search,
  FolderPlus, ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import * as Sentry from "@sentry/nextjs";
import { useAppStore } from "@/lib/store";
import { getSubjects, createSubject, deleteSubject } from "@/lib/firebase/subjects";
import Link from "next/link";

const COLORS = [
  "#3B82F6", "#8B5CF6", "#EC4899", "#F59E0B",
  "#10B981", "#EF4444", "#06B6D4", "#F97316",
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const item = {
  hidden: { opacity: 0, scale: 0.95 },
  show: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
};

function formatStorageSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export default function SubjectsPage() {
  const { user, subjects, setSubjects, addSubject, removeSubject } = useAppStore();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [creating, setCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [newSubject, setNewSubject] = useState({
    name: "",
    code: "",
    professor: "",
    color: COLORS[0],
  });

  // Load subjects from Firestore
  useEffect(() => {
    if (!user?.uid) return;
    setLoadingSubjects(true);
    getSubjects(user.uid)
      .then((data) => setSubjects(data))
      .catch((err) => Sentry.captureException(err))
      .finally(() => setLoadingSubjects(false));
  }, [user?.uid, setSubjects]);

  async function handleCreate() {
    if (!newSubject.name || !newSubject.code || !user?.uid) return;
    setCreating(true);

    try {
      const subject = await createSubject(user.uid, {
        name: newSubject.name,
        code: newSubject.code,
        color: newSubject.color,
        professor: newSubject.professor,
        files: [],
        folders: [],
      });
      addSubject(subject);
      setNewSubject({ name: "", code: "", professor: "", color: COLORS[0] });
      setDialogOpen(false);
    } catch (err) {
      Sentry.captureException(err);
      alert("Error al crear la asignatura. Verifica tu conexion e intentalo de nuevo.");
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(subjectId: string) {
    if (!user?.uid) return;
    try {
      await deleteSubject(user.uid, subjectId);
      removeSubject(subjectId);
    } catch (err) {
      Sentry.captureException(err);
      alert("Error al eliminar la asignatura. Intentalo de nuevo.");
    }
  }

  // Compute global stats
  const totalFiles = subjects.reduce((sum, s) => sum + s.files.length, 0);
  const totalStorage = subjects.reduce(
    (sum, s) => sum + s.files.reduce((fSum, f) => fSum + f.size, 0), 0
  );

  // Filtered subjects
  const filteredSubjects = searchQuery
    ? subjects.filter((s) =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.code.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : subjects;

  return (
    <div className="px-6 md:px-12 py-10">
      {/* Breadcrumbs & View Toggle */}
      <div className="flex items-center justify-between mb-12">
        <nav className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground hover:text-primary cursor-pointer transition-colors">
            Inicio
          </span>
          <ChevronRight className="w-3 h-3 text-muted-foreground/60" />
          <span className="text-foreground font-bold tracking-tight">Mis Archivos</span>
        </nav>
        <div className="flex items-center bg-muted/50 rounded-lg p-1">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded transition-all ${
              viewMode === "grid"
                ? "bg-card text-primary shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 rounded transition-all ${
              viewMode === "list"
                ? "bg-card text-primary shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Bento Layout Header */}
      <div className="grid grid-cols-12 gap-6 mb-12">
        {/* Dropzone Section */}
        <div
          onClick={() => setDialogOpen(true)}
          className="col-span-12 lg:col-span-4 bg-card/40 backdrop-blur-xl border border-dashed border-primary/20 rounded-xl p-8 flex flex-col items-center justify-center text-center group hover:border-primary/50 transition-all cursor-pointer"
        >
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Upload className="w-7 h-7 text-primary" />
          </div>
          <h3 className="font-bold text-lg mb-1 text-foreground">Subir Archivo</h3>
          <p className="text-xs text-muted-foreground max-w-[200px]">
            Arrastra y suelta tus documentos o haz clic para explorar
          </p>
        </div>

        {/* Stats/Highlights Card */}
        <div className="col-span-12 lg:col-span-8 bg-card/40 backdrop-blur-xl rounded-xl p-8 flex flex-col justify-between border border-border/50 relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-3xl font-black tracking-tight mb-2 text-foreground">
              Almacenamiento <span className="text-primary">Academico</span>
            </h2>
            <p className="text-muted-foreground text-sm max-w-md">
              Organiza tus notas, lecturas y proyectos por materia para un acceso
              rapido durante tus sesiones de estudio.
            </p>
          </div>
          <div className="mt-6 flex items-end justify-between relative z-10">
            <div className="flex gap-10">
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">
                  Total de Archivos
                </p>
                <p className="text-2xl font-black text-foreground">{totalFiles}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">
                  Espacio Usado
                </p>
                <p className="text-2xl font-black text-foreground">
                  {formatStorageSize(totalStorage)}
                </p>
              </div>
            </div>
            <div className="h-1 bg-muted w-full max-w-[200px] rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{
                  width: `${Math.min((totalStorage / (50 * 1024 * 1024)) * 100, 100)}%`,
                }}
              />
            </div>
          </div>
          {/* Abstract geometric decor */}
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-primary/5 rounded-full blur-3xl" />
        </div>
      </div>

      {/* Section Label + Search */}
      <div className="flex items-center justify-between mb-6">
        <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1">
          Materias Actuales
        </h4>
        {subjects.length > 0 && (
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-card/40 backdrop-blur-xl border border-border/50 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 text-foreground placeholder:text-muted-foreground"
              placeholder="Buscar archivos por materia..."
              type="text"
            />
          </div>
        )}
      </div>

      {/* Folders Grid */}
      {loadingSubjects ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : filteredSubjects.length === 0 && subjects.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="bg-card/40 backdrop-blur-xl border border-border/50 rounded-xl p-16 text-center">
            <BookOpen className="w-16 h-16 text-muted-foreground/60 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No tienes asignaturas aun
            </h3>
            <p className="text-muted-foreground mb-6">
              Crea tu primera asignatura para empezar a organizar tu material
            </p>
            <Button onClick={() => setDialogOpen(true)} className="bg-primary">
              <Plus className="w-4 h-4 mr-2" />
              Crear primera asignatura
            </Button>
          </div>
        </motion.div>
      ) : filteredSubjects.length === 0 ? (
        <div className="text-center py-12">
          <Search className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground">
            No se encontraron materias con &quot;{searchQuery}&quot;
          </p>
        </div>
      ) : (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={container}
          initial="hidden"
          animate="show"
        >
          <AnimatePresence>
            {filteredSubjects.map((subject) => (
              <motion.div key={subject.id} variants={item} layout exit="exit">
                <Link href={`/subjects/${subject.id}`}>
                  <div className="group relative bg-card/40 backdrop-blur-xl p-6 rounded-xl border border-border/50 transition-all duration-300 cursor-pointer hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/20">
                    <div className="flex justify-between items-start mb-6">
                      <FolderIcon
                        className="w-10 h-10"
                        style={{ color: subject.color }}
                        fill={subject.color}
                        strokeWidth={0.5}
                      />
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <button
                              className="p-1 rounded text-muted-foreground/60 hover:text-foreground opacity-0 group-hover:opacity-100 transition-all hover:bg-muted/50"
                              onClick={(e) => e.preventDefault()}
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          }
                        />
                        <DropdownMenuContent className="bg-card border-border">
                          <DropdownMenuItem className="text-foreground/80">
                            <Edit className="w-4 h-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={(e) => {
                              e.preventDefault();
                              handleDelete(subject.id);
                            }}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <h5 className="font-bold text-sm mb-1 text-foreground group-hover:text-primary transition-colors">
                      {subject.name}
                    </h5>
                    <p className="text-xs text-muted-foreground">
                      {subject.files.length} elementos
                    </p>
                    {subject.professor && (
                      <p className="text-[10px] text-muted-foreground/70 mt-1 truncate">
                        {subject.professor}
                      </p>
                    )}
                  </div>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Add New Subject Folder Button */}
          <motion.div variants={item}>
            <div
              onClick={() => setDialogOpen(true)}
              className="group bg-card/20 backdrop-blur-xl p-6 rounded-xl border border-dashed border-border/30 flex flex-col items-center justify-center transition-all duration-300 cursor-pointer hover:bg-card/40 hover:border-primary/30 min-h-[160px]"
            >
              <FolderPlus className="w-8 h-8 text-muted-foreground/60 mb-2 group-hover:text-primary transition-colors" />
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                Nueva Materia
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* FAB */}
      <div className="fixed bottom-8 right-8 z-50">
        <button
          onClick={() => setDialogOpen(true)}
          className="w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/20 flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      {/* Create Subject Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Crear nueva asignatura</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Agrega una asignatura para organizar tu material
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label className="text-foreground/80">Nombre de la asignatura</Label>
              <Input
                placeholder="Ej: Calculo Integral"
                value={newSubject.name}
                onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
                className="bg-muted border-border text-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground/80">Codigo</Label>
              <Input
                placeholder="Ej: MAT201"
                value={newSubject.code}
                onChange={(e) => setNewSubject({ ...newSubject, code: e.target.value })}
                className="bg-muted border-border text-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground/80">Profesor (opcional)</Label>
              <Input
                placeholder="Ej: Dr. Garcia"
                value={newSubject.professor}
                onChange={(e) => setNewSubject({ ...newSubject, professor: e.target.value })}
                className="bg-muted border-border text-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground/80">Color</Label>
              <div className="flex gap-2">
                {COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => setNewSubject({ ...newSubject, color })}
                    className={`w-8 h-8 rounded-full transition-all ${
                      newSubject.color === color
                        ? "ring-2 ring-foreground ring-offset-2 ring-offset-card scale-110"
                        : "hover:scale-110"
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
            <Button onClick={handleCreate} disabled={creating} className="w-full bg-primary">
              {creating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {creating ? "Creando..." : "Crear asignatura"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
