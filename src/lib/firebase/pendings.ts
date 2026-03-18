import {
  getFirebaseDb,
  doc,
  getDocs,
  addDoc,
  deleteDoc,
  updateDoc,
  collection,
  query,
  where,
  orderBy,
  serverTimestamp,
} from './config';
import type { Pending } from '@/lib/types';

function pendingsRef() {
  return collection(getFirebaseDb(), 'pendings');
}

export async function getPendingsBySubject(userId: string, subjectId: string): Promise<Pending[]> {
  const q = query(
    pendingsRef(),
    where('userId', '==', userId),
    where('subjectId', '==', subjectId),
    orderBy('dueDate', 'asc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({
    ...d.data(),
    id: d.id,
    dueDate: d.data().dueDate?.toDate?.() || new Date(),
    createdAt: d.data().createdAt?.toDate?.() || new Date(),
  })) as Pending[];
}

export async function getAllPendings(userId: string): Promise<Pending[]> {
  const q = query(
    pendingsRef(),
    where('userId', '==', userId),
    orderBy('dueDate', 'asc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({
    ...d.data(),
    id: d.id,
    dueDate: d.data().dueDate?.toDate?.() || new Date(),
    createdAt: d.data().createdAt?.toDate?.() || new Date(),
  })) as Pending[];
}

export async function addPending(
  data: Omit<Pending, 'id' | 'createdAt'>
): Promise<Pending> {
  const docRef = await addDoc(pendingsRef(), {
    ...data,
    dueDate: data.dueDate,
    createdAt: serverTimestamp(),
  });
  return {
    ...data,
    id: docRef.id,
    createdAt: new Date(),
  };
}

export async function updatePending(
  pendingId: string,
  data: Partial<Pending>
): Promise<void> {
  await updateDoc(doc(getFirebaseDb(), 'pendings', pendingId), data);
}

export async function deletePending(pendingId: string): Promise<void> {
  await deleteDoc(doc(getFirebaseDb(), 'pendings', pendingId));
}
