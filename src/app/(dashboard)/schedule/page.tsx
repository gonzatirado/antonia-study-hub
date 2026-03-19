"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import * as Sentry from "@sentry/nextjs";
import { useAppStore } from "@/lib/store";
import { getScheduleBlocks, addScheduleBlock, deleteScheduleBlock } from "@/lib/firebase/schedule";
import { getSubjects } from "@/lib/firebase/subjects";
import type { ScheduleBlock } from "@/lib/types";
import { AddBlockDialog, type NewBlockForm } from "@/components/schedule/AddBlockDialog";
import { ScheduleGrid } from "@/components/schedule/ScheduleGrid";
import { ScheduleEmptyState } from "@/components/schedule/ScheduleEmptyState";

const INITIAL_BLOCK_FORM: NewBlockForm = {
  subjectId: "",
  day: "mon",
  startTime: "08:00",
  endTime: "09:30",
  room: "",
  type: "class",
};

export default function SchedulePage() {
  const { user, subjects, setSubjects } = useAppStore();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [blocks, setBlocks] = useState<ScheduleBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [newBlock, setNewBlock] = useState<NewBlockForm>(INITIAL_BLOCK_FORM);

  // Load subjects from Firestore if not already loaded
  useEffect(() => {
    if (!user?.uid || subjects.length > 0) return;
    getSubjects(user.uid).then(setSubjects).catch((err) => Sentry.captureException(err));
  }, [user?.uid, subjects.length]);

  // Load blocks from Firestore
  useEffect(() => {
    if (!user?.uid) return;
    setLoading(true);
    getScheduleBlocks(user.uid)
      .then(setBlocks)
      .catch((err) => Sentry.captureException(err))
      .finally(() => setLoading(false));
  }, [user?.uid]);

  async function handleAddBlock() {
    if (!newBlock.subjectId || !user?.uid) return;

    // BUG 14: Validate startTime < endTime
    if (newBlock.startTime >= newBlock.endTime) return;

    // BUG 24: Check for overlapping blocks on the same day
    const dayBlocks = blocks.filter((b) => b.day === newBlock.day);
    const hasOverlap = dayBlocks.some(
      (b) => newBlock.startTime < b.endTime && newBlock.endTime > b.startTime
    );
    if (hasOverlap) return;

    const block: ScheduleBlock = {
      id: crypto.randomUUID(),
      ...newBlock,
    };

    try {
      await addScheduleBlock(user.uid, block);
      setBlocks([...blocks, block]);
      setDialogOpen(false);
      // BUG 13: Reset form after successful add
      setNewBlock(INITIAL_BLOCK_FORM);
    } catch (err) {
      Sentry.captureException(err);
    }
  }

  async function handleDeleteBlock(blockId: string) {
    if (!user?.uid) return;
    try {
      await deleteScheduleBlock(user.uid, blockId);
      setBlocks(blocks.filter((b) => b.id !== blockId));
    } catch (err) {
      Sentry.captureException(err);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Horario</h1>
          <p className="text-slate-400 mt-1">Organiza tu semana academica</p>
        </div>
        <AddBlockDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          subjects={subjects}
          newBlock={newBlock}
          onNewBlockChange={setNewBlock}
          onAddBlock={handleAddBlock}
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        </div>
      ) : (
        <>
          <ScheduleGrid
            blocks={blocks}
            subjects={subjects}
            onDeleteBlock={handleDeleteBlock}
          />
          {blocks.length === 0 && (
            <ScheduleEmptyState hasSubjects={subjects.length > 0} />
          )}
        </>
      )}
    </div>
  );
}
