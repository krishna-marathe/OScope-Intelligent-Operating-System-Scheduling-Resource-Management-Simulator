import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AcademyState {
  completedLessons: string[];
  completedModules: string[];
  quizScores: Record<string, number>;
  attempts: Record<string, number>;
  currentLesson: string | null;
  currentModule: string | null;
  learningStreak: number;
  lastActivity: string | null;
  bookmarkedLessons: string[];
  markCompleted: (lessonId: string) => void;
}

export const useAcademyStore = create<AcademyState>()(
  persist(
    (set) => ({
      completedLessons: [],
      completedModules: [],
      quizScores: {},
      attempts: {},
      currentLesson: null,
      currentModule: null,
      learningStreak: 0,
      lastActivity: null,
      bookmarkedLessons: [],
      markCompleted: (id) => set((state) => ({ completedLessons: [...new Set([...state.completedLessons, id])] }))
    }),
    { name: 'oscope-academy-storage' }
  )
);