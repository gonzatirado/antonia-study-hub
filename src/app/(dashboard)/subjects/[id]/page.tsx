"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSubjectData } from "@/hooks/use-subject-data";
import { SubjectHeader } from "@/components/subjects/subject-header";
import { SubjectTabs } from "@/components/subjects/subject-tabs";
import { FilesTab } from "@/components/subjects/files-tab";
import { GradesTab } from "@/components/subjects/grades-tab";
import { PendingsTab } from "@/components/subjects/pendings-tab";

export default function SubjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const subjectId = params.id as string;

  const {
    subject, loading, activeTab, setActiveTab,
    // File explorer
    currentFolderId, setCurrentFolderId,
    uploading, showNewFolder, setShowNewFolder,
    newFolderName, setNewFolderName,
    movingFile, setMovingFile,
    breadcrumb, currentFolders, currentFiles,
    handleFileUpload, handleDeleteFile,
    handleCreateFolder, handleDeleteFolder, handleMoveFile,
    // Grades
    grades, loadingGrades,
    showGradeDialog, setShowGradeDialog,
    gradesByCategory, totalWeightUsed, weightedAverage,
    handleSaveGrade, handleDeleteGrade,
    // Pendings
    pendings, loadingPendings,
    showPendingDialog, setShowPendingDialog,
    handleSavePending, handleTogglePendingStatus, handleDeletePending,
  } = useSubjectData(subjectId);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!subject) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.push("/subjects")} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4 mr-2" /> Asignaturas
        </Button>
        <div className="text-center py-20">
          <p className="text-muted-foreground">Asignatura no encontrada.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SubjectHeader
        subject={subject}
        weightedAverage={weightedAverage}
        onBack={() => router.push("/subjects")}
      />

      <SubjectTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        filesCount={subject.files.length}
        gradesCount={grades.length}
        pendingActiveCount={pendings.filter(p => p.status !== "completed").length}
      />

      {activeTab === "files" && (
        <FilesTab
          files={subject.files}
          currentFiles={currentFiles}
          currentFolders={currentFolders}
          allFolders={subject.folders}
          breadcrumb={breadcrumb}
          currentFolderId={currentFolderId}
          uploading={uploading}
          showNewFolder={showNewFolder}
          newFolderName={newFolderName}
          movingFile={movingFile}
          onSetCurrentFolderId={setCurrentFolderId}
          onSetShowNewFolder={setShowNewFolder}
          onSetNewFolderName={setNewFolderName}
          onSetMovingFile={setMovingFile}
          onFileUpload={handleFileUpload}
          onCreateFolder={handleCreateFolder}
          onDeleteFolder={handleDeleteFolder}
          onDeleteFile={handleDeleteFile}
          onMoveFile={handleMoveFile}
        />
      )}

      {activeTab === "grades" && (
        <GradesTab
          grades={grades}
          gradesByCategory={gradesByCategory}
          totalWeightUsed={totalWeightUsed}
          weightedAverage={weightedAverage}
          loadingGrades={loadingGrades}
          showGradeDialog={showGradeDialog}
          onSetShowGradeDialog={setShowGradeDialog}
          onDeleteGrade={handleDeleteGrade}
          onSaveGrade={handleSaveGrade}
        />
      )}

      {activeTab === "pendings" && (
        <PendingsTab
          pendings={pendings}
          loadingPendings={loadingPendings}
          showPendingDialog={showPendingDialog}
          onSetShowPendingDialog={setShowPendingDialog}
          onTogglePendingStatus={handleTogglePendingStatus}
          onDeletePending={handleDeletePending}
          onSavePending={handleSavePending}
        />
      )}
    </div>
  );
}
