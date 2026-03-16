import { create } from 'zustand';
import type { User, UsageData, Subject } from '@/lib/types';

interface AppState {
  // Auth
  user: User | null;
  setUser: (user: User | null) => void;

  // Usage
  usage: UsageData | null;
  setUsage: (usage: UsageData | null) => void;

  // Subjects
  subjects: Subject[];
  setSubjects: (subjects: Subject[]) => void;
  addSubject: (subject: Subject) => void;
  updateSubject: (id: string, data: Partial<Subject>) => void;
  removeSubject: (id: string) => void;

  // UI
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;

  // Loading states
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Auth
  user: null,
  setUser: (user) => set({ user }),

  // Usage
  usage: null,
  setUsage: (usage) => set({ usage }),

  // Subjects
  subjects: [],
  setSubjects: (subjects) => set({ subjects }),
  addSubject: (subject) => set((state) => ({ subjects: [...state.subjects, subject] })),
  updateSubject: (id, data) => set((state) => ({
    subjects: state.subjects.map((s) => (s.id === id ? { ...s, ...data } : s)),
  })),
  removeSubject: (id) => set((state) => ({
    subjects: state.subjects.filter((s) => s.id !== id),
  })),

  // UI
  sidebarOpen: true,
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),

  // Loading
  loading: false,
  setLoading: (loading) => set({ loading }),
}));
