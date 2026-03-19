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
import type { Grade } from '@/lib/types';

function gradesRef() {
  return collection(getFirebaseDb(), 'grades');
}

export async function getGradesBySubject(userId: string, subjectId: string): Promise<Grade[]> {
  const q = query(
    gradesRef(),
    where('userId', '==', userId),
    where('subjectId', '==', subjectId),
    orderBy('date', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({
    ...d.data(),
    id: d.id,
    date: d.data().date?.toDate?.() || new Date(),
    createdAt: d.data().createdAt?.toDate?.() || new Date(),
  })) as Grade[];
}

export async function getAllGrades(userId: string): Promise<Grade[]> {
  const q = query(
    gradesRef(),
    where('userId', '==', userId),
    orderBy('date', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({
    ...d.data(),
    id: d.id,
    date: d.data().date?.toDate?.() || new Date(),
    createdAt: d.data().createdAt?.toDate?.() || new Date(),
  })) as Grade[];
}

export async function addGrade(
  data: Omit<Grade, 'id' | 'createdAt'>
): Promise<Grade> {
  const docRef = await addDoc(gradesRef(), {
    ...data,
    date: data.date,
    createdAt: serverTimestamp(),
  });
  return {
    ...data,
    id: docRef.id,
    createdAt: new Date(),
  };
}

export async function updateGrade(
  userId: string,
  gradeId: string,
  data: Partial<Grade>
): Promise<void> {
  const gradeDoc = doc(getFirebaseDb(), 'grades', gradeId);
  await updateDoc(gradeDoc, { ...data, userId });
}

export async function deleteGrade(userId: string, gradeId: string): Promise<void> {
  const gradeDoc = doc(getFirebaseDb(), 'grades', gradeId);
  await deleteDoc(gradeDoc);
}
