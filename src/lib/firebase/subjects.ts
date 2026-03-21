import {
  getFirebaseDb,
  doc,
  getDocs,
  addDoc,
  deleteDoc,
  updateDoc,
  collection,
  query,
  orderBy,
  serverTimestamp,
} from './config';
import type { Subject } from '@/lib/types';

function subjectsRef(userId: string) {
  return collection(getFirebaseDb(), 'users', userId, 'subjects');
}

export async function getSubjects(userId: string): Promise<Subject[]> {
  const q = query(subjectsRef(userId), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    // Convert Firestore Timestamps in nested files array
    const files = (data.files || []).map((f: Record<string, unknown>) => ({
      ...f,
      uploadedAt: (f.uploadedAt as { toDate?: () => Date })?.toDate?.() || (f.uploadedAt ? new Date(f.uploadedAt as string) : new Date()),
    }));
    // Convert Firestore Timestamps in nested folders array
    const folders = (data.folders || []).map((f: Record<string, unknown>) => ({
      ...f,
      createdAt: (f.createdAt as { toDate?: () => Date })?.toDate?.() || (f.createdAt ? new Date(f.createdAt as string) : new Date()),
    }));
    return {
      ...data,
      id: d.id,
      files,
      folders,
      createdAt: data.createdAt?.toDate?.() || new Date(),
      updatedAt: data.updatedAt?.toDate?.() || new Date(),
    };
  }) as Subject[];
}

export async function createSubject(
  userId: string,
  data: Omit<Subject, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
): Promise<Subject> {
  const docRef = await addDoc(subjectsRef(userId), {
    ...data,
    userId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return {
    id: docRef.id,
    userId,
    ...data,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export async function deleteSubject(userId: string, subjectId: string): Promise<void> {
  await deleteDoc(doc(getFirebaseDb(), 'users', userId, 'subjects', subjectId));
}

export async function updateSubjectDoc(
  userId: string,
  subjectId: string,
  data: Partial<Subject>
): Promise<void> {
  await updateDoc(doc(getFirebaseDb(), 'users', userId, 'subjects', subjectId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}
