"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import * as Sentry from "@sentry/nextjs";
import { toast } from "sonner";
import { useAppStore } from "@/lib/store";
import { getSubjects, updateSubjectDoc } from "@/lib/firebase/subjects";
import { getFirebaseStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "@/lib/firebase/config";
import { getGradesBySubject, addGrade, updateGrade, deleteGrade } from "@/lib/firebase/grades";
import { getPendingsBySubject, addPending, updatePending, deletePending } from "@/lib/firebase/pendings";
import type {
  Subject, SubjectFile, Folder, Grade, GradeCategory,
  Pending, PendingType, PendingStatus,
} from "@/lib/types";
import { PLAN_LIMITS } from "@/lib/types";

type Tab = "files" | "grades" | "pendings";

function detectFileType(mimeType: string, fileName: string): SubjectFile["type"] {
  // MIME-based detection
  if (mimeType === "application/pdf") return "pdf";
  if (
    mimeType === "application/vnd.ms-excel" ||
    mimeType === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  ) return "excel";
  if (
    mimeType === "application/msword" ||
    mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) return "doc";
  if (mimeType === "text/html" || mimeType === "text/plain") return "text";
  if (mimeType.startsWith("image/")) return "image";

  // Extension-based fallback
  const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
  if (ext === "pdf") return "pdf";
  if (["xls", "xlsx", "csv"].includes(ext)) return "excel";
  if (["doc", "docx", "ppt", "pptx"].includes(ext)) return "doc";
  if (["txt", "html", "htm", "md"].includes(ext)) return "text";
  if (["png", "jpg", "jpeg", "gif", "webp", "svg", "bmp"].includes(ext)) return "image";

  return "other";
}

function getDescendantIds(folders: Folder[], parentId: string): string[] {
  const children = folders.filter((f) => f.parentId === parentId);
  return children.flatMap((c) => [c.id, ...getDescendantIds(folders, c.id)]);
}

export function useSubjectData(subjectId: string) {
  const { user, subjects, setSubjects } = useAppStore();
  const [subject, setSubject] = useState<Subject | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("files");

  // File explorer state
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [movingFile, setMovingFile] = useState<SubjectFile | null>(null);

  // Grades state
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loadingGrades, setLoadingGrades] = useState(false);
  const [showGradeDialog, setShowGradeDialog] = useState(false);

  // Pendings state
  const [pendings, setPendings] = useState<Pending[]>([]);
  const [loadingPendings, setLoadingPendings] = useState(false);
  const [showPendingDialog, setShowPendingDialog] = useState(false);

  const gradesLoaded = useRef(false);
  const pendingsLoaded = useRef(false);

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
      .catch((err) => Sentry.captureException(err))
      .finally(() => setLoading(false));
  }, [subjectId, user?.uid, subjects.length, setSubjects]);

  // Load grades when tab switches
  useEffect(() => {
    if (activeTab === "grades" && user?.uid && !gradesLoaded.current) {
      gradesLoaded.current = true;
      setLoadingGrades(true);
      getGradesBySubject(user.uid, subjectId)
        .then(setGrades)
        .catch((err) => Sentry.captureException(err))
        .finally(() => setLoadingGrades(false));
    }
  }, [activeTab, user?.uid, subjectId]);

  // Load pendings when tab switches
  useEffect(() => {
    if (activeTab === "pendings" && user?.uid && !pendingsLoaded.current) {
      pendingsLoaded.current = true;
      setLoadingPendings(true);
      getPendingsBySubject(user.uid, subjectId)
        .then(setPendings)
        .catch((err) => Sentry.captureException(err))
        .finally(() => setLoadingPendings(false));
    }
  }, [activeTab, user?.uid, subjectId]);

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
    const sum = grades.reduce((acc, g) => acc + (g.maxScore === 0 ? 0 : (g.score / g.maxScore) * g.weight), 0);
    return (sum / totalWeightUsed) * 7;
  }, [grades, totalWeightUsed]);

  // === FILE OPERATIONS ===
  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const fileList = e.target.files;
    if (!fileList || !user?.uid || !subject) return;

    // Enforce plan limits
    const planLimits = PLAN_LIMITS[user.plan ?? "free"];
    const totalFiles = subjects.reduce((sum, s) => sum + s.files.length, 0);
    const totalStorageBytes = subjects.reduce(
      (sum, s) => sum + s.files.reduce((fSum, f) => fSum + f.size, 0), 0
    );
    const newFilesSize = Array.from(fileList).reduce((sum, f) => sum + f.size, 0);

    if (planLimits.max_files !== -1 && totalFiles + fileList.length > planLimits.max_files) {
      toast.error(`Has alcanzado el límite de archivos de tu plan (${planLimits.max_files}). Mejora tu plan para subir más.`);
      e.target.value = "";
      return;
    }
    if (totalStorageBytes + newFilesSize > planLimits.max_storage_mb * 1024 * 1024) {
      toast.error(`Has alcanzado el límite de almacenamiento de tu plan (${planLimits.max_storage_mb} MB). Mejora tu plan para más espacio.`);
      e.target.value = "";
      return;
    }

    setUploading(true);
    try {
      const storage = getFirebaseStorage();
      const newFiles: SubjectFile[] = [];
      for (const file of Array.from(fileList)) {
        const fileId = crypto.randomUUID();
        const storageRef = ref(storage, `users/${user.uid}/subjects/${subjectId}/${fileId}_${file.name}`);
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
        const fileType = detectFileType(file.type, file.name);
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
      toast.success(
        newFiles.length === 1
          ? `"${newFiles[0].name}" subido correctamente`
          : `${newFiles.length} archivos subidos correctamente`
      );
    } catch (err) {
      Sentry.captureException(err);
      toast.error("Error al subir archivos. Verifica tu conexión e inténtalo de nuevo.");
    } finally { setUploading(false); e.target.value = ""; }
  }

  async function handleDeleteFile(file: SubjectFile) {
    if (!user?.uid || !subject) return;
    try {
      const storage = getFirebaseStorage();
      const storageRef = ref(storage, `users/${user.uid}/subjects/${subjectId}/${file.id}_${file.name}`);
      try { await deleteObject(storageRef); } catch { /* Storage object may already be deleted */ }
      const updatedFiles = subject.files.filter((f) => f.id !== file.id);
      await updateSubjectDoc(user.uid, subjectId, { files: updatedFiles });
      const updated = { ...subject, files: updatedFiles };
      setSubject(updated);
      setSubjects(subjects.map((s) => s.id === subjectId ? updated : s));
    } catch (err) {
      Sentry.captureException(err);
      toast.error("Error al eliminar el archivo. Inténtalo de nuevo.");
    }
  }

  async function handleCreateFolder() {
    if (!newFolderName.trim() || !user?.uid || !subject) return;
    try {
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
    } catch (err) {
      Sentry.captureException(err);
      toast.error("Error al crear la carpeta. Inténtalo de nuevo.");
    }
  }

  async function handleDeleteFolder(folderId: string) {
    if (!user?.uid || !subject) return;
    try {
      const toDelete = [folderId, ...getDescendantIds(subject.folders, folderId)];
      const updatedFolders = subject.folders.filter((f) => !toDelete.includes(f.id));
      const updatedFiles = subject.files.map((f) =>
        f.folderId && toDelete.includes(f.folderId)
          ? { ...f, folderId: currentFolderId }
          : f
      );
      await updateSubjectDoc(user.uid, subjectId, { folders: updatedFolders, files: updatedFiles });
      const updated = { ...subject, folders: updatedFolders, files: updatedFiles };
      setSubject(updated);
      setSubjects(subjects.map((s) => s.id === subjectId ? updated : s));
    } catch (err) {
      Sentry.captureException(err);
      toast.error("Error al eliminar la carpeta. Inténtalo de nuevo.");
    }
  }

  async function handleMoveFile(file: SubjectFile, targetFolderId: string | null) {
    if (!user?.uid || !subject) return;
    try {
      const updatedFiles = subject.files.map((f) =>
        f.id === file.id ? { ...f, folderId: targetFolderId } : f
      );
      await updateSubjectDoc(user.uid, subjectId, { files: updatedFiles });
      const updated = { ...subject, files: updatedFiles };
      setSubject(updated);
      setSubjects(subjects.map((s) => s.id === subjectId ? updated : s));
      setMovingFile(null);
    } catch (err) {
      Sentry.captureException(err);
      toast.error("Error al mover el archivo. Inténtalo de nuevo.");
    }
  }

  async function moveFileToFolder(fileId: string, targetFolderId: string | null) {
    if (!user?.uid || !subject) return;
    try {
      const updatedFiles = subject.files.map((f) =>
        f.id === fileId ? { ...f, folderId: targetFolderId } : f
      );
      await updateSubjectDoc(user.uid, subjectId, { files: updatedFiles });
      const updated = { ...subject, files: updatedFiles };
      setSubject(updated);
      setSubjects(subjects.map((s) => s.id === subjectId ? updated : s));
    } catch (err) {
      Sentry.captureException(err);
      toast.error("Error al mover el archivo. Inténtalo de nuevo.");
    }
  }

  async function moveFolderToFolder(folderId: string, targetFolderId: string | null) {
    if (!user?.uid || !subject) return;
    // Prevent moving into itself
    if (folderId === targetFolderId) return;
    // Prevent circular reference: target cannot be a descendant of the folder being moved
    const descendants = getDescendantIds(subject.folders, folderId);
    if (targetFolderId !== null && descendants.includes(targetFolderId)) return;

    try {
      const updatedFolders = subject.folders.map((f) =>
        f.id === folderId ? { ...f, parentId: targetFolderId } : f
      );
      await updateSubjectDoc(user.uid, subjectId, { folders: updatedFolders });
      const updated = { ...subject, folders: updatedFolders };
      setSubject(updated);
      setSubjects(subjects.map((s) => s.id === subjectId ? updated : s));
    } catch (err) {
      Sentry.captureException(err);
      toast.error("Error al mover la carpeta. Inténtalo de nuevo.");
    }
  }

  // === RENAME OPERATIONS ===
  async function handleRenameFile(fileId: string, newName: string) {
    if (!newName.trim() || !user?.uid || !subject) return;
    try {
      const updatedFiles = subject.files.map((f) =>
        f.id === fileId ? { ...f, name: newName.trim() } : f
      );
      await updateSubjectDoc(user.uid, subjectId, { files: updatedFiles });
      const updated = { ...subject, files: updatedFiles };
      setSubject(updated);
      setSubjects(subjects.map((s) => s.id === subjectId ? updated : s));
      toast.success("Archivo renombrado");
    } catch (err) {
      Sentry.captureException(err);
      toast.error("Error al renombrar el archivo.");
    }
  }

  async function handleRenameFolder(folderId: string, newName: string) {
    if (!newName.trim() || !user?.uid || !subject) return;
    try {
      const updatedFolders = subject.folders.map((f) =>
        f.id === folderId ? { ...f, name: newName.trim() } : f
      );
      await updateSubjectDoc(user.uid, subjectId, { folders: updatedFolders });
      const updated = { ...subject, folders: updatedFolders };
      setSubject(updated);
      setSubjects(subjects.map((s) => s.id === subjectId ? updated : s));
      toast.success("Carpeta renombrada");
    } catch (err) {
      Sentry.captureException(err);
      toast.error("Error al renombrar la carpeta.");
    }
  }

  // === GRADE OPERATIONS ===
  async function handleSaveGrade(data: {
    name: string; score: number; maxScore: number;
    weight: number; category: GradeCategory; date: Date;
  }) {
    if (!user?.uid) return;
    try {
      const grade = await addGrade({ ...data, userId: user.uid, subjectId });
      setGrades(prev => [grade, ...prev]);
      setShowGradeDialog(false);
    } catch (err) {
      Sentry.captureException(err);
      toast.error("Error al guardar la nota. Inténtalo de nuevo.");
    }
  }

  async function handleEditGrade(gradeId: string, data: {
    name: string; score: number; maxScore: number;
    weight: number; category: GradeCategory; date: Date;
  }) {
    if (!user?.uid) return;
    try {
      await updateGrade(user.uid, gradeId, data);
      setGrades(prev => prev.map((g) => g.id === gradeId ? { ...g, ...data } : g));
      toast.success("Nota actualizada");
    } catch (err) {
      Sentry.captureException(err);
      toast.error("Error al editar la nota. Inténtalo de nuevo.");
    }
  }

  async function handleDeleteGrade(gradeId: string) {
    if (!user?.uid) return;
    try {
      await deleteGrade(user.uid, gradeId);
      setGrades(prev => prev.filter((g) => g.id !== gradeId));
    } catch (err) {
      Sentry.captureException(err);
      toast.error("Error al eliminar la nota. Inténtalo de nuevo.");
    }
  }

  // === PENDING OPERATIONS ===
  async function handleSavePending(data: {
    title: string; description?: string;
    type: PendingType; dueDate: Date; status: PendingStatus;
  }) {
    if (!user?.uid) return;
    try {
      const pending = await addPending({ ...data, userId: user.uid, subjectId });
      setPendings(prev => [...prev, pending]);
      setShowPendingDialog(false);
    } catch (err) {
      Sentry.captureException(err);
      toast.error("Error al guardar el pendiente. Inténtalo de nuevo.");
    }
  }

  async function handleTogglePendingStatus(pendingId: string, newStatus: PendingStatus) {
    if (!user?.uid) return;
    try {
      await updatePending(user.uid, pendingId, { status: newStatus });
      setPendings(prev => prev.map((p) => p.id === pendingId ? { ...p, status: newStatus } : p));
    } catch (err) {
      Sentry.captureException(err);
      toast.error("Error al actualizar el estado. Inténtalo de nuevo.");
    }
  }

  async function handleDeletePending(pendingId: string) {
    if (!user?.uid) return;
    try {
      await deletePending(user.uid, pendingId);
      setPendings(prev => prev.filter((p) => p.id !== pendingId));
    } catch (err) {
      Sentry.captureException(err);
      toast.error("Error al eliminar el pendiente. Inténtalo de nuevo.");
    }
  }

  return {
    // Core state
    subject, loading, activeTab, setActiveTab,
    // File explorer state
    currentFolderId, setCurrentFolderId,
    uploading, showNewFolder, setShowNewFolder,
    newFolderName, setNewFolderName,
    movingFile, setMovingFile,
    // File derived data
    breadcrumb, currentFolders, currentFiles,
    // File operations
    handleFileUpload, handleDeleteFile,
    handleCreateFolder, handleDeleteFolder, handleMoveFile,
    handleRenameFile, handleRenameFolder,
    moveFileToFolder, moveFolderToFolder,
    // Grades state
    grades, loadingGrades,
    showGradeDialog, setShowGradeDialog,
    // Grade derived data
    gradesByCategory, totalWeightUsed, weightedAverage,
    // Grade operations
    handleSaveGrade, handleEditGrade, handleDeleteGrade,
    // Pendings state
    pendings, loadingPendings,
    showPendingDialog, setShowPendingDialog,
    // Pending operations
    handleSavePending, handleTogglePendingStatus, handleDeletePending,
  };
}
