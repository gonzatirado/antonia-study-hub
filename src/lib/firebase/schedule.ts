import {
  getFirebaseDb,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  collection,
  serverTimestamp,
} from './config';
import type { ScheduleBlock } from '@/lib/types';

function scheduleRef(userId: string) {
  return collection(getFirebaseDb(), 'users', userId, 'schedule');
}

export async function getScheduleBlocks(userId: string): Promise<ScheduleBlock[]> {
  const snap = await getDocs(scheduleRef(userId));
  return snap.docs.map((d) => ({
    ...d.data(),
    id: d.id,
  })) as ScheduleBlock[];
}

export async function addScheduleBlock(
  userId: string,
  block: ScheduleBlock
): Promise<void> {
  await setDoc(doc(getFirebaseDb(), 'users', userId, 'schedule', block.id), {
    ...block,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteScheduleBlock(
  userId: string,
  blockId: string
): Promise<void> {
  await deleteDoc(doc(getFirebaseDb(), 'users', userId, 'schedule', blockId));
}
