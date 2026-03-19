"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, BookOpen, FileText, MoreVertical, Trash2, Edit, Upload, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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

export default function SubjectsPage() {
  const { user, subjects, setSubjects, addSubject, removeSubject } = useAppStore();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [creating, setCreating] = useState(false);
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
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Mis Ramos</h1>
          <p className="text-muted-foreground mt-1">Organiza tus asignaturas y material de estudio</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger render={<Button className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90" />}>
              <Plus className="w-4 h-4 mr-2" />
              Nuevo ramo
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle className="text-foreground">Crear nuevo ramo</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Agrega una asignatura para organizar tu material
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label className="text-foreground/80">Nombre del ramo</Label>
                <Input
                  placeholder="Ej: Cálculo Integral"
                  value={newSubject.name}
                  onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
                  className="bg-muted border-border text-foreground"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground/80">Código</Label>
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
                  placeholder="Ej: Dr. García"
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
                        newSubject.color === color ? "ring-2 ring-foreground ring-offset-2 ring-offset-card scale-110" : "hover:scale-110"
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
              <Button onClick={handleCreate} disabled={creating} className="w-full bg-gradient-to-r from-primary to-accent">
                {creating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {creating ? "Creando..." : "Crear ramo"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loadingSubjects ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : subjects.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Card className="bg-card/50 border-border">
            <CardContent className="p-16 text-center">
              <BookOpen className="w-16 h-16 text-muted-foreground/60 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No tienes ramos aún</h3>
              <p className="text-muted-foreground mb-6">Crea tu primer ramo para empezar a organizar tu material</p>
              <Button onClick={() => setDialogOpen(true)} className="bg-gradient-to-r from-primary to-accent">
                <Plus className="w-4 h-4 mr-2" />
                Crear primer ramo
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          variants={container}
          initial="hidden"
          animate="show"
        >
          <AnimatePresence>
            {subjects.map((subject) => (
              <motion.div key={subject.id} variants={item} layout exit="exit">
                <Link href={`/subjects/${subject.id}`}>
                  <Card className="bg-card/50 border-border hover:border-border/80 transition-all duration-300 cursor-pointer group overflow-hidden">
                    <div className="h-2" style={{ backgroundColor: subject.color }} />
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <Badge
                            variant="outline"
                            className="mb-2 text-xs"
                            style={{ borderColor: subject.color, color: subject.color }}
                          >
                            {subject.code}
                          </Badge>
                          <h3 className="text-lg font-semibold text-foreground group-hover:text-info transition-colors">
                            {subject.name}
                          </h3>
                          {subject.professor && (
                            <p className="text-sm text-muted-foreground mt-1">{subject.professor}</p>
                          )}
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            render={<Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-foreground"
                              onClick={(e) => e.preventDefault()}
                            />}
                          >
                              <MoreVertical className="w-4 h-4" />
                          </DropdownMenuTrigger>
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
                      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border">
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <FileText className="w-4 h-4" />
                          {subject.files.length} archivos
                        </div>
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <Upload className="w-4 h-4" />
                          Subir
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
