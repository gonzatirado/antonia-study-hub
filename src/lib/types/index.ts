// User types
export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  plan: 'free' | 'pro' | 'premium';
  createdAt: Date;
}

export interface UsageData {
  summaries_used: number;
  summaries_limit: number;
  quizzes_used: number;
  quizzes_limit: number;
  exam_preps_used: number;
  exam_preps_limit: number;
  practice_questions_used: number;
  practice_questions_limit: number;
  tokens_consumed: number;
  period: string; // "2026-03"
}

export const PLAN_LIMITS = {
  free: {
    summaries_limit: 3,
    quizzes_limit: 5,
    exam_preps_limit: 0,
    practice_questions_limit: 0,
    max_files: 10,
    max_storage_mb: 50,
  },
  pro: {
    summaries_limit: 30,
    quizzes_limit: 50,
    exam_preps_limit: 5,
    practice_questions_limit: 200,
    max_files: -1, // unlimited
    max_storage_mb: 2048,
  },
  premium: {
    summaries_limit: 100,
    quizzes_limit: 150,
    exam_preps_limit: 15,
    practice_questions_limit: 600,
    max_files: -1,
    max_storage_mb: 10240,
  },
} as const;

// Subject types
export interface Subject {
  id: string;
  userId: string;
  name: string;
  code: string; // e.g. "MAT101"
  color: string;
  professor?: string;
  schedule?: ScheduleBlock[];
  files: SubjectFile[];
  folders: Folder[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SubjectFile {
  id: string;
  name: string;
  url: string;
  type: 'pdf' | 'doc' | 'image' | 'text' | 'other';
  size: number; // bytes
  folderId: string | null; // null = root level
  uploadedAt: Date;
}

export interface Folder {
  id: string;
  name: string;
  parentId: string | null; // null = root
  createdAt: Date;
}

// Grade types
export type GradeCategory = 'solemne' | 'examen' | 'control' | 'tarea' | 'proyecto' | 'otro';

export const GRADE_CATEGORY_LABELS: Record<GradeCategory, string> = {
  solemne: 'Solemne',
  examen: 'Examen',
  control: 'Control/Quiz',
  tarea: 'Tarea',
  proyecto: 'Proyecto',
  otro: 'Otro',
};

export interface Grade {
  id: string;
  userId: string;
  subjectId: string;
  name: string;
  score: number;
  maxScore: number;
  weight: number; // % sobre el total del ramo
  category: GradeCategory;
  date: Date;
  createdAt: Date;
}

// Pending types
export type PendingType = 'tarea' | 'prueba' | 'entrega' | 'otro';
export type PendingStatus = 'pending' | 'in_progress' | 'completed';

export const PENDING_TYPE_LABELS: Record<PendingType, string> = {
  tarea: 'Tarea',
  prueba: 'Prueba',
  entrega: 'Entrega',
  otro: 'Otro',
};

export interface Pending {
  id: string;
  userId: string;
  subjectId: string;
  title: string;
  description?: string;
  type: PendingType;
  dueDate: Date;
  status: PendingStatus;
  createdAt: Date;
}

// Schedule types
export interface ScheduleBlock {
  id: string;
  subjectId: string;
  day: 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat';
  startTime: string; // "08:30"
  endTime: string;   // "10:00"
  room?: string;
  type: 'class' | 'lab' | 'tutorial';
}

// Summary types
export interface Summary {
  id: string;
  userId: string;
  subjectId: string;
  title: string;
  content: string; // markdown with visuals
  sourceFiles: string[]; // file IDs
  createdAt: Date;
  model: 'flash' | 'pro' | 'claude';
}

// Quiz types
export interface Quiz {
  id: string;
  userId: string;
  subjectId: string;
  title: string;
  questions: QuizQuestion[];
  sourceFiles: string[];
  createdAt: Date;
  attempts: QuizAttempt[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface QuizAttempt {
  id: string;
  answers: number[];
  score: number;
  completedAt: Date;
}

// Exam Prep types
export interface ExamPrep {
  id: string;
  userId: string;
  subjectId: string;
  title: string;
  examDate: Date;
  description: string;
  sourceFiles: string[];
  plan: ExamPrepDay[];
  createdAt: Date;
  status: 'active' | 'completed' | 'expired';
}

export interface ExamPrepDay {
  date: Date;
  tasks: ExamPrepTask[];
  completed: boolean;
}

export interface ExamPrepTask {
  id: string;
  type: 'study' | 'quiz' | 'practice' | 'review';
  title: string;
  description: string;
  content?: string; // markdown
  completed: boolean;
}
