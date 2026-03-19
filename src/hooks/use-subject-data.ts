"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import * as Sentry from "@sentry/nextjs";
import { useAppStore } from "@/lib/store";
import { getSubjects, updateSubjectDoc } from "@/lib/firebase/subjects";
import { getFirebaseStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "@/lib/firebase/config";
import { getGradesBySubject, addGrade, deleteGrade } from "@/lib/firebase/grades";
import { getPendingsBySubject, addPending, updatePending, deletePending } from "@/lib/firebase/pendings";
import type {
  Subject, SubjectFile, Folder, Grade, GradeCategory,
  Pending, PendingType, PendingStatus,
} from "@/lib/types";

type Tab = "files" | "grades" | "pendings";

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
    } catch (err) { Sentry.captureException(err); }
    finally { setUploading(false); e.target.value = ""; }
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
    } catch (err) { Sentry.captureException(err); }
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
    function getDescendantIds(parentId: string): string[] {
      const children = subject!.folders.filter((f) => f.parentId === parentId);
      return children.flatMap((c) => [c.id, ...getDescendantIds(c.id)]);
    }
    const toDelete = [folderId, ...getDescendantIds(folderId)];
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
  }

  async function handleMoveFile(file: SubjectFile, targetFolderId: string | null) {
    if (!user?.uid || !subject) return;
    const updatedFiles = subject.files.map((f) =>
      f.id === file.id ? { ...f, folderId: targetFolderId } : f
    );
    await updateSubjectDoc(user.uid, subjectId, { files: updatedFiles });
    const updated = { ...subject, files: updatedFiles };
    setSubject(updated);
    setSubjects(subjects.map((s) => s.id === subjectId ? updated : s));
    setMovingFile(null);
  }

  // === GRADE OPERATIONS ===
  async function handleSaveGrade(data: {
    name: string; score: number; maxScore: number;
    weight: number; category: GradeCategory; date: Date;
  }) {
    if (!user?.uid) return;
    const grade = await addGrade({ ...data, userId: user.uid, subjectId });
    setGrades(prev => [grade, ...prev]);
    setShowGradeDialog(false);
  }

  async function handleDeleteGrade(gradeId: string) {
    if (!user?.uid) return;
    await deleteGrade(user.uid, gradeId);
    setGrades(prev => prev.filter((g) => g.id !== gradeId));
  }

  // === PENDING OPERATIONS ===
  async function handleSavePending(data: {
    title: string; description?: string;
    type: PendingType; dueDate: Date; status: PendingStatus;
  }) {
    if (!user?.uid) return;
    const pending = await addPending({ ...data, userId: user.uid, subjectId });
    setPendings(prev => [...prev, pending]);
    setShowPendingDialog(false);
  }

  async function handleTogglePendingStatus(pendingId: string, newStatus: PendingStatus) {
    if (!user?.uid) return;
    await updatePending(user.uid, pendingId, { status: newStatus });
    setPendings(prev => prev.map((p) => p.id === pendingId ? { ...p, status: newStatus } : p));
  }

  async function handleDeletePending(pendingId: string) {
    if (!user?.uid) return;
    await deletePending(user.uid, pendingId);
    setPendings(prev => prev.filter((p) => p.id !== pendingId));
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
    // Grades state
    grades, loadingGrades,
    showGradeDialog, setShowGradeDialog,
    // Grade derived data
    gradesByCategory, totalWeightUsed, weightedAverage,
    // Grade operations
    handleSaveGrade, handleDeleteGrade,
    // Pendings state
    pendings, loadingPendings,
    showPendingDialog, setShowPendingDialog,
    // Pending operations
    handleSavePending, handleTogglePendingStatus, handleDeletePending,
  };
}
