"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, FileText, Upload, Trash2, Loader2, FolderIcon,
  FolderPlus, ChevronRight, MoreVertical, Plus, BarChart3,
  ClipboardList, Download, Eye, Calendar, Check, Clock,
  AlertCircle, GraduationCap,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAppStore } from "@/lib/store";
import { getSubjects, updateSubjectDoc } from "@/lib/firebase/subjects";
import { getFirebaseStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "@/lib/firebase/config";
import { getGradesBySubject, addGrade, deleteGrade } from "@/lib/firebase/grades";
import { getPendingsBySubject, addPending, updatePending, deletePending } from "@/lib/firebase/pendings";
import type {
  Subject, SubjectFile, Folder, Grade, GradeCategory,
  Pending, PendingType, PendingStatus,
  GRADE_CATEGORY_LABELS, PENDING_TYPE_LABELS,
} from "@/lib/types";

type Tab = "files" | "grades" | "pendings";

export default function SubjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, subjects, setSubjects } = useAppStore();
  const [subject, setSubject] = useState<Subject | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("files");

  // File explorer state
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  // Grades state
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loadingGrades, setLoadingGrades] = useState(false);
  const [showGradeDialog, setShowGradeDialog] = useState(false);

  // Pendings state
  const [pendings, setPendings] = useState<Pending[]>([]);
  const [loadingPendings, setLoadingPendings] = useState(false);
  const [showPendingDialog, setShowPendingDialog] = useState(false);

  const subjectId = params.id as string;

  // Load subject
  useEffect(() => {
    const found = subjects.find((s) => s.id === subjectId);
    if (found) {
      setSubject({ ...found, folders: found.folders || [] });
      setLoading(false);
      return;
    }
    if (!user?.uid) return;
    getSubjects(user.uid)
      .then((data) => {
        setSubjects(data);
        const s = data.find((s) => s.id === subjectId);
        setSubject(s ? { ...s, folders: s.folders || [] } : null);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [subjectId, user?.uid, subjects, setSubjects]);

  // Load grades when tab switches
  useEffect(() => {
    if (activeTab === "grades" && user?.uid && grades.length === 0) {
      setLoadingGrades(true);
      getGradesBySubject(user.uid, subjectId)
        .then(setGrades)
        .catch(console.error)
        .finally(() => setLoadingGrades(false));
    }
  }, [activeTab, user?.uid, subjectId, grades.length]);

  // Load pendings when tab switches
  useEffect(() => {
    if (activeTab === "pendings" && user?.uid && pendings.length === 0) {
      setLoadingPendings(true);
      getPendingsBySubject(user.uid, subjectId)
        .then(setPendings)
        .catch(console.error)
        .finally(() => setLoadingPendings(false));
    }
  }, [activeTab, user?.uid, subjectId, pendings.length]);

  // Breadcrumb path
  const breadcrumb = useMemo(() => {
    if (!subject) return [];
    const path: Folder[] = [];
    let current = currentFolderId;
    while (current) {
      const folder = subject.folders.find((f) => f.id === current);
      if (folder) {
        path.unshift(folder);
        current = folder.parentId;
      } else break;
    }
    return path;
  }, [currentFolderId, subject]);

  // Current folder contents
  const currentFolders = useMemo(() => {
    if (!subject) return [];
    return subject.folders.filter((f) => f.parentId === currentFolderId);
  }, [subject, currentFolderId]);

  const currentFiles = useMemo(() => {
    if (!subject) return [];
    return subject.files.filter((f) => (f.folderId || null) === currentFolderId);
  }, [subject, currentFolderId]);

  // Grades grouped by category
  const gradesByCategory = useMemo(() => {
    const groups: Record<string, Grade[]> = {};
    grades.forEach((g) => {
      if (!groups[g.category]) groups[g.category] = [];
      groups[g.category].push(g);
    });
    return groups;
  }, [grades]);

  const totalWeightUsed = useMemo(() => {
    return grades.reduce((sum, g) => sum + g.weight, 0);
  }, [grades]);

  const weightedAverage = useMemo(() => {
    if (grades.length === 0 || totalWeightUsed === 0) return 0;
    const sum = grades.reduce((acc, g) => acc + (g.score / g.maxScore) * g.weight, 0);
    return (sum / totalWeightUsed) * 7;
  }, [grades, totalWeightUsed]);

  // === FILE OPERATIONS ===
  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const fileList = e.target.files;
    if (!fileList || !user?.uid || !subject) return;
    setUploading(true);
    try {
      const storage = getFirebaseStorage();
      const newFiles: SubjectFile[] = [];
      for (const file of Array.from(fileList)) {
        const fileId = crypto.randomUUID();
        const storageRef = ref(storage, `users/${user.uid}/subjects/${subjectId}/${fileId}_${file.name}`);
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
        const fileType = file.type.includes("pdf") ? "pdf"
          : file.type.includes("html") ? "text"
          : file.type.includes("text") ? "text"
          : file.type.includes("image") ? "image"
          : "other";
        newFiles.push({
          id: fileId, name: file.name, url,
          type: fileType as SubjectFile["type"],
          size: file.size, folderId: currentFolderId, uploadedAt: new Date(),
        });
      }
      const updatedFiles = [...subject.files, ...newFiles];
      await updateSubjectDoc(user.uid, subjectId, { files: updatedFiles });
      const updated = { ...subject, files: updatedFiles };
      setSubject(updated);
      setSubjects(subjects.map((s) => s.id === subjectId ? updated : s));
    } catch (err) { console.error("Upload error:", err); }
    finally { setUploading(false); }
  }

  async function handleDeleteFile(file: SubjectFile) {
    if (!user?.uid || !subject) return;
    try {
      const storage = getFirebaseStorage();
      const storageRef = ref(storage, `users/${user.uid}/subjects/${subjectId}/${file.id}_${file.name}`);
      try { await deleteObject(storageRef); } catch {}
      const updatedFiles = subject.files.filter((f) => f.id !== file.id);
      await updateSubjectDoc(user.uid, subjectId, { files: updatedFiles });
      const updated = { ...subject, files: updatedFiles };
      setSubject(updated);
      setSubjects(subjects.map((s) => s.id === subjectId ? updated : s));
    } catch (err) { console.error("Delete error:", err); }
  }

  async function handleCreateFolder() {
    if (!newFolderName.trim() || !user?.uid || !subject) return;
    const folder: Folder = {
      id: crypto.randomUUID(),
      name: newFolderName.trim(),
      parentId: currentFolderId,
      createdAt: new Date(),
    };
    const updatedFolders = [...subject.folders, folder];
    await updateSubjectDoc(user.uid, subjectId, { folders: updatedFolders });
    const updated = { ...subject, folders: updatedFolders };
    setSubject(updated);
    setSubjects(subjects.map((s) => s.id === subjectId ? updated : s));
    setNewFolderName("");
    setShowNewFolder(false);
  }

  async function handleDeleteFolder(folderId: string) {
    if (!user?.uid || !subject) return;
    // Get all descendant folder IDs recursively
    function getDescendantIds(parentId: string): string[] {
      const children = subject!.folders.filter((f) => f.parentId === parentId);
      return children.flatMap((c) => [c.id, ...getDescendantIds(c.id)]);
    }
    const toDelete = [folderId, ...getDescendantIds(folderId)];
    const updatedFolders = subject.folders.filter((f) => !toDelete.includes(f.id));
    // Move files from deleted folders to parent
    const updatedFiles = subject.files.map((f) =>
      f.folderId && toDelete.includes(f.folderId)
        ? { ...f, folderId: currentFolderId }
        : f
    );
    await updateSubjectDoc(user.uid, subjectId, { folders: updatedFolders, files: updatedFiles });
    const updated = { ...subject, folders: updatedFolders, files: updatedFiles };
    setSubject(updated);
    setSubjects(subjects.map((s) => s.id === subjectId ? updated : s));
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
      </div>
    );
  }

  if (!subject) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.push("/subjects")} className="text-slate-400 hover:text-white">
          <ArrowLeft className="w-4 h-4 mr-2" /> Asignaturas
        </Button>
        <div className="text-center py-20">
          <p className="text-slate-400">Asignatura no encontrada.</p>
        </div>
      </div>
    );
  }

  const CATEGORY_LABELS: Record<string, string> = {
    solemne: 'Solemne', examen: 'Examen', control: 'Control/Quiz',
    tarea: 'Tarea', proyecto: 'Proyecto', otro: 'Otro',
  };

  const PENDING_LABELS: Record<string, string> = {
    tarea: 'Tarea', prueba: 'Prueba', entrega: 'Entrega', otro: 'Otro',
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Back + Header */}
      <button
        onClick={() => router.push("/subjects")}
        className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Asignaturas
      </button>

      <div className="flex items-center gap-4">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-xl"
          style={{ backgroundColor: subject.color + "20" }}
        >
          <FolderIcon className="w-6 h-6" style={{ color: subject.color }} />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-white">{subject.name}</h1>
          <p className="text-sm text-slate-400">
            {subject.code} {subject.professor && `· ${subject.professor}`}
            {weightedAverage > 0 && (
              <span className={`ml-2 font-semibold ${weightedAverage >= 4 ? "text-emerald-400" : "text-red-400"}`}>
                · Promedio: {weightedAverage.toFixed(1)}
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-900/50 p-1 rounded-xl border border-slate-800">
        {([
          { key: "files" as Tab, icon: FileText, label: "Archivos", count: subject.files.length },
          { key: "grades" as Tab, icon: BarChart3, label: "Notas", count: grades.length },
          { key: "pendings" as Tab, icon: ClipboardList, label: "Pendientes", count: pendings.filter(p => p.status !== "completed").length },
        ]).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.key
                ? "bg-violet-600 text-white shadow-lg shadow-violet-600/20"
                : "text-slate-400 hover:text-white hover:bg-slate-800/50"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
            {tab.count > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                activeTab === tab.key ? "bg-white/20" : "bg-slate-700"
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* === FILES TAB === */}
      {activeTab === "files" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          {/* Toolbar */}
          <div className="flex items-center justify-between">
            {/* Breadcrumb */}
            <div className="flex items-center gap-1 text-sm">
              <button
                onClick={() => setCurrentFolderId(null)}
                className={`hover:text-white transition-colors ${currentFolderId ? "text-slate-400" : "text-white font-medium"}`}
              >
                Archivos
              </button>
              {breadcrumb.map((folder) => (
                <span key={folder.id} className="flex items-center gap-1">
                  <ChevronRight className="w-3 h-3 text-slate-600" />
                  <button
                    onClick={() => setCurrentFolderId(folder.id)}
                    className={`hover:text-white transition-colors ${
                      folder.id === currentFolderId ? "text-white font-medium" : "text-slate-400"
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
                onClick={() => setShowNewFolder(true)}
                className="text-slate-400 hover:text-white"
              >
                <FolderPlus className="w-4 h-4 mr-1" /> Carpeta
              </Button>
              <div className="relative">
                <input
                  type="file"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  multiple
                  accept=".pdf,.doc,.docx,.txt,.html,.png,.jpg,.jpeg,.xlsx,.xls"
                  onChange={handleFileUpload}
                  disabled={uploading}
                />
                <Button size="sm" className="bg-violet-600 hover:bg-violet-700 text-white">
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
                  onChange={(e) => setNewFolderName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreateFolder()}
                  placeholder="Nombre de la carpeta..."
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
                />
                <Button size="sm" onClick={handleCreateFolder} className="bg-violet-600 hover:bg-violet-700 text-white">
                  Crear
                </Button>
                <Button size="sm" variant="ghost" onClick={() => { setShowNewFolder(false); setNewFolderName(""); }}
                  className="text-slate-400">
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
                  className="group relative bg-slate-900/80 border border-slate-800 rounded-xl p-4 cursor-pointer hover:border-violet-500/30 hover:bg-slate-800/50 transition-all"
                  onClick={() => setCurrentFolderId(folder.id)}
                >
                  <div className="flex items-center gap-3">
                    <FolderIcon className="w-8 h-8 text-amber-400" />
                    <span className="text-sm text-white font-medium truncate">{folder.name}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    {subject.files.filter((f) => f.folderId === folder.id).length} archivos
                    · {subject.folders.filter((f) => f.parentId === folder.id).length} carpetas
                  </p>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDeleteFolder(folder.id); }}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-red-500/20 text-slate-500 hover:text-red-400 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              ))}
            </div>
          )}

          {/* Files list */}
          {currentFiles.length > 0 ? (
            <div className="space-y-1">
              {currentFiles.map((file) => (
                <div
                  key={file.id}
                  className="group flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800/50 transition-colors"
                >
                  <span className="text-lg">{getFileIcon(file.type)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{file.name}</p>
                    <p className="text-xs text-slate-500">
                      {formatSize(file.size)} · {file.type.toUpperCase()}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-md hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </a>
                    <a
                      href={file.url}
                      download
                      className="p-1.5 rounded-md hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                    <button
                      onClick={() => handleDeleteFile(file)}
                      className="p-1.5 rounded-md hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : currentFolders.length === 0 && (
            <div className="text-center py-16 border border-dashed border-slate-700 rounded-xl">
              <Upload className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 font-medium">Arrastrá archivos o hacé click en "Subir"</p>
              <p className="text-xs text-slate-500 mt-1">PDF, HTML, Excel, TXT, imágenes</p>
            </div>
          )}
        </motion.div>
      )}

      {/* === GRADES TAB === */}
      {activeTab === "grades" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <p className="text-sm text-slate-400">
                Pond. usada: <span className={totalWeightUsed > 100 ? "text-red-400" : "text-white"}>{totalWeightUsed}%</span>
              </p>
              {weightedAverage > 0 && (
                <p className="text-sm">
                  Promedio: <span className={`font-bold ${weightedAverage >= 4 ? "text-emerald-400" : "text-red-400"}`}>
                    {weightedAverage.toFixed(1)}
                  </span>
                </p>
              )}
            </div>
            <Button
              size="sm"
              onClick={() => setShowGradeDialog(true)}
              className="bg-violet-600 hover:bg-violet-700 text-white"
            >
              <Plus className="w-4 h-4 mr-1" /> Registrar nota
            </Button>
          </div>

          {loadingGrades ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-6 h-6 text-violet-500 animate-spin" />
            </div>
          ) : grades.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-slate-700 rounded-xl">
              <BarChart3 className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 font-medium">Sin notas registradas</p>
              <p className="text-xs text-slate-500 mt-1">Registrá una evaluación para comenzar</p>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(gradesByCategory).map(([category, categoryGrades]) => {
                const categoryWeight = categoryGrades.reduce((s, g) => s + g.weight, 0);
                const categoryAvg = categoryGrades.reduce((s, g) => s + (g.score / g.maxScore) * g.weight, 0) / categoryWeight * 7;
                return (
                  <div key={category} className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 bg-slate-800/30">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white">
                          {CATEGORY_LABELS[category] || category}
                        </span>
                        <span className="text-xs text-slate-400">({categoryWeight}% del ramo)</span>
                      </div>
                      <span className={`text-sm font-bold ${categoryAvg >= 4 ? "text-emerald-400" : "text-red-400"}`}>
                        {categoryAvg.toFixed(1)}
                      </span>
                    </div>
                    <div className="divide-y divide-slate-800/50">
                      {categoryGrades.map((grade) => (
                        <div key={grade.id} className="group flex items-center justify-between px-4 py-3 hover:bg-slate-800/30 transition-colors">
                          <div>
                            <p className="text-sm text-white font-medium">{grade.name}</p>
                            <p className="text-xs text-slate-500">
                              {new Date(grade.date).toLocaleDateString("es-CL", { day: "numeric", month: "short", year: "numeric" })}
                              {" · "}{grade.weight}%
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`text-lg font-bold ${(grade.score / grade.maxScore * 7) >= 4 ? "text-emerald-400" : "text-red-400"}`}>
                              {grade.score}
                            </span>
                            <button
                              onClick={() => {
                                deleteGrade(grade.id).then(() => setGrades(grades.filter((g) => g.id !== grade.id)));
                              }}
                              className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-red-500/20 text-slate-500 hover:text-red-400 transition-all"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Grade Dialog */}
          <GradeDialog
            open={showGradeDialog}
            onClose={() => setShowGradeDialog(false)}
            onSave={async (data) => {
              if (!user?.uid) return;
              const grade = await addGrade({ ...data, userId: user.uid, subjectId });
              setGrades([grade, ...grades]);
              setShowGradeDialog(false);
            }}
          />
        </motion.div>
      )}

      {/* === PENDINGS TAB === */}
      {activeTab === "pendings" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-400">
              {pendings.filter((p) => p.status !== "completed").length} pendientes activos
            </p>
            <Button
              size="sm"
              onClick={() => setShowPendingDialog(true)}
              className="bg-violet-600 hover:bg-violet-700 text-white"
            >
              <Plus className="w-4 h-4 mr-1" /> Nuevo pendiente
            </Button>
          </div>

          {loadingPendings ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-6 h-6 text-violet-500 animate-spin" />
            </div>
          ) : pendings.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-slate-700 rounded-xl">
              <ClipboardList className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 font-medium">Sin pendientes</p>
              <p className="text-xs text-slate-500 mt-1">Todo al día</p>
            </div>
          ) : (
            <div className="space-y-2">
              {pendings.map((pending) => {
                const isOverdue = new Date(pending.dueDate) < new Date() && pending.status !== "completed";
                const isPending = pending.status === "pending";
                const isCompleted = pending.status === "completed";
                return (
                  <div
                    key={pending.id}
                    className={`group flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
                      isCompleted
                        ? "bg-slate-900/30 border-slate-800/50 opacity-60"
                        : isOverdue
                        ? "bg-red-950/20 border-red-500/20"
                        : "bg-slate-900/50 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <button
                      onClick={() => {
                        const newStatus: PendingStatus = isCompleted ? "pending" : "completed";
                        updatePending(pending.id, { status: newStatus }).then(() => {
                          setPendings(pendings.map((p) => p.id === pending.id ? { ...p, status: newStatus } : p));
                        });
                      }}
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                        isCompleted
                          ? "bg-emerald-500 border-emerald-500"
                          : "border-slate-600 hover:border-violet-500"
                      }`}
                    >
                      {isCompleted && <Check className="w-3 h-3 text-white" />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${isCompleted ? "line-through text-slate-500" : "text-white"}`}>
                        {pending.title}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-slate-700 text-slate-400">
                          {PENDING_LABELS[pending.type] || pending.type}
                        </Badge>
                        <span className={`text-xs flex items-center gap-1 ${isOverdue ? "text-red-400" : "text-slate-500"}`}>
                          {isOverdue ? <AlertCircle className="w-3 h-3" /> : <Calendar className="w-3 h-3" />}
                          {new Date(pending.dueDate).toLocaleDateString("es-CL", { day: "numeric", month: "short" })}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        deletePending(pending.id).then(() => setPendings(pendings.filter((p) => p.id !== pending.id)));
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-red-500/20 text-slate-500 hover:text-red-400 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pending Dialog */}
          <PendingDialog
            open={showPendingDialog}
            onClose={() => setShowPendingDialog(false)}
            onSave={async (data) => {
              if (!user?.uid) return;
              const pending = await addPending({ ...data, userId: user.uid, subjectId });
              setPendings([...pendings, pending]);
              setShowPendingDialog(false);
            }}
          />
        </motion.div>
      )}
    </div>
  );
}

// === GRADE DIALOG ===
function GradeDialog({ open, onClose, onSave }: {
  open: boolean;
  onClose: () => void;
  onSave: (data: { name: string; score: number; maxScore: number; weight: number; category: GradeCategory; date: Date }) => void;
}) {
  const [name, setName] = useState("");
  const [score, setScore] = useState("");
  const [maxScore, setMaxScore] = useState("7.0");
  const [weight, setWeight] = useState("");
  const [category, setCategory] = useState<GradeCategory>("control");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  if (!open) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !score || !weight) return;
    onSave({
      name: name.trim(),
      score: parseFloat(score),
      maxScore: parseFloat(maxScore),
      weight: parseFloat(weight),
      category,
      date: new Date(date),
    });
    setName(""); setScore(""); setWeight(""); setCategory("control");
  }

  const categories: { value: GradeCategory; label: string }[] = [
    { value: "solemne", label: "Solemne" },
    { value: "examen", label: "Examen" },
    { value: "control", label: "Control/Quiz" },
    { value: "tarea", label: "Tarea" },
    { value: "proyecto", label: "Proyecto" },
    { value: "otro", label: "Otro" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold text-white mb-1">Registrar nota</h3>
        <p className="text-sm text-slate-400 mb-5">Ej: "Control 1" tipo Control/Quiz, 15% del ramo</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 sm:col-span-1">
              <label className="text-xs text-slate-400 mb-1 block">Nombre *</label>
              <input value={name} onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Control 1, Solemne 2..."
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500" />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="text-xs text-slate-400 mb-1 block">Tipo</label>
              <div className="relative">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as GradeCategory)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white appearance-none focus:outline-none focus:border-violet-500 cursor-pointer"
                >
                  {categories.map((c) => (
                    <option key={c.value} value={c.value} className="bg-slate-800">{c.label}</option>
                  ))}
                </select>
                <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 rotate-90 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Nota *</label>
              <input type="number" step="0.1" min="1" max="7" value={score}
                onChange={(e) => setScore(e.target.value)}
                placeholder="4.5"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none" />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Nota máx.</label>
              <input type="number" step="0.1" value={maxScore}
                onChange={(e) => setMaxScore(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none" />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Pond. (%) *</label>
              <input type="number" step="1" min="1" max="100" value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="30"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none" />
              <p className="text-[10px] text-slate-500 mt-1">% sobre el total del ramo</p>
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 mb-1 block">Fecha</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500" />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={onClose} className="text-slate-400">Cancelar</Button>
            <Button type="submit" className="bg-violet-600 hover:bg-violet-700 text-white">Registrar nota</Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// === PENDING DIALOG ===
function PendingDialog({ open, onClose, onSave }: {
  open: boolean;
  onClose: () => void;
  onSave: (data: { title: string; description?: string; type: PendingType; dueDate: Date; status: PendingStatus }) => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<PendingType>("tarea");
  const [dueDate, setDueDate] = useState(new Date().toISOString().split("T")[0]);

  if (!open) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({
      title: title.trim(),
      description: description.trim() || undefined,
      type,
      dueDate: new Date(dueDate),
      status: "pending",
    });
    setTitle(""); setDescription(""); setType("tarea");
  }

  const types: { value: PendingType; label: string }[] = [
    { value: "tarea", label: "Tarea" },
    { value: "prueba", label: "Prueba" },
    { value: "entrega", label: "Entrega" },
    { value: "otro", label: "Otro" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold text-white mb-4">Nuevo pendiente</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Título *</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Entregar informe, Estudiar capítulo 3..."
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500" />
          </div>

          <div>
            <label className="text-xs text-slate-400 mb-1 block">Descripción</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalles opcionales..."
              rows={2}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 resize-none" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Tipo</label>
              <div className="relative">
                <select value={type} onChange={(e) => setType(e.target.value as PendingType)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white appearance-none focus:outline-none focus:border-violet-500 cursor-pointer">
                  {types.map((t) => (
                    <option key={t.value} value={t.value} className="bg-slate-800">{t.label}</option>
                  ))}
                </select>
                <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 rotate-90 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Fecha límite *</label>
              <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500" />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={onClose} className="text-slate-400">Cancelar</Button>
            <Button type="submit" className="bg-violet-600 hover:bg-violet-700 text-white">Crear pendiente</Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
