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
import type { Note } from '@/app/(dashboard)/summaries/_components/types';

function notesRef() {
  return collection(getFirebaseDb(), 'notes');
}

export async function getAllNotes(userId: string): Promise<Note[]> {
  const q = query(
    notesRef(),
    where('userId', '==', userId),
    orderBy('updatedAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      title: data.title || '',
      content: data.content || '',
      subjectId: data.subjectId || 'general',
      subjectName: data.subjectName || 'General',
      starred: data.starred || false,
      createdAt: data.createdAt?.toDate?.() || new Date(),
      updatedAt: data.updatedAt?.toDate?.() || new Date(),
    } as Note;
  });
}

export async function addNote(
  userId: string,
  data: { title: string; content: string; subjectId: string; subjectName: string; starred?: boolean }
): Promise<Note> {
  const docRef = await addDoc(notesRef(), {
    userId,
    title: data.title,
    content: data.content,
    subjectId: data.subjectId,
    subjectName: data.subjectName,
    starred: data.starred || false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return {
    id: docRef.id,
    title: data.title,
    content: data.content,
    subjectId: data.subjectId,
    subjectName: data.subjectName,
    starred: data.starred || false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export async function updateNote(
  noteId: string,
  data: Partial<Pick<Note, 'title' | 'content' | 'subjectId' | 'subjectName' | 'starred'>>
): Promise<void> {
  const noteDoc = doc(getFirebaseDb(), 'notes', noteId);
  await updateDoc(noteDoc, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteNote(noteId: string): Promise<void> {
  const noteDoc = doc(getFirebaseDb(), 'notes', noteId);
  await deleteDoc(noteDoc);
}
