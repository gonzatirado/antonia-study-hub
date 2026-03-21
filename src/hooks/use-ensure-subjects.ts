import { useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { getSubjects } from '@/lib/firebase/subjects';

export function useEnsureSubjects() {
  const { user, subjects, setSubjects } = useAppStore();

  useEffect(() => {
    if (!user?.uid || subjects.length > 0) return;
    getSubjects(user.uid).then(setSubjects).catch(() => {});
  }, [user?.uid, subjects.length, setSubjects]);

  return subjects;
}
