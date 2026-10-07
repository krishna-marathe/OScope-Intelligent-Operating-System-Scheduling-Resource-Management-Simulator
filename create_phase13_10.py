import os

WORKSPACE_DIR = r"c:\Users\marat\Downloads\3 rd Year\OS_LAB\Operating_system_CP"
FRONTEND_DIR = os.path.join(WORKSPACE_DIR, "oscope", "frontend")

# Frontend Dirs
ACADEMY_DIR = os.path.join(FRONTEND_DIR, "src", "features", "academy")
DIRS = [
    os.path.join(ACADEMY_DIR, "types"),
    os.path.join(ACADEMY_DIR, "data", "cpu"),
    os.path.join(ACADEMY_DIR, "data", "memory"),
    os.path.join(ACADEMY_DIR, "data", "disk"),
    os.path.join(ACADEMY_DIR, "data", "deadlock"),
    os.path.join(ACADEMY_DIR, "components"),
    os.path.join(ACADEMY_DIR, "store"),
    os.path.join(ACADEMY_DIR, "analytics"),
    os.path.join(ACADEMY_DIR, "adapters")
]
for d in DIRS:
    os.makedirs(d, exist_ok=True)

# Frontend Types
with open(os.path.join(ACADEMY_DIR, "types", "lesson.ts"), "w", encoding="utf-8") as f:
    f.write("""
export type Domain = 'CPU' | 'Memory' | 'Disk' | 'Deadlock';
export type SectionType = 'TEXT' | 'CONCEPT' | 'ALGORITHM' | 'FORMULA' | 'EXAMPLE' | 'INTERACTIVE' | 'SIMULATION' | 'VISUALIZATION' | 'METRICS' | 'WARNING' | 'KNOWLEDGE_CHECK' | 'EXPERIMENT';

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  relatedConcept: string;
}

export interface Section {
  type: SectionType;
  content: string;
  payload?: any;
}

export interface Lesson {
  id: string;
  title: string;
  domain: Domain;
  moduleId: string;
  order: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedMinutes: number;
  objectives: string[];
  prerequisites: string[];
  sections: Section[];
  interactiveExamples: any[];
  simulationLaunchers: any[];
  knowledgeChecks: QuizQuestion[];
  experimentSuggestions: any[];
  completionCriteria: string[];
}
""".strip())

# Frontend Store
with open(os.path.join(ACADEMY_DIR, "store", "useAcademyStore.ts"), "w", encoding="utf-8") as f:
    f.write("""
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
""".strip())

# Frontend Components
with open(os.path.join(ACADEMY_DIR, "components", "AcademyHome.tsx"), "w", encoding="utf-8") as f:
    f.write("""
import React from 'react';
import { useAcademyStore } from '../store/useAcademyStore';

export const AcademyHome: React.FC = () => {
  const { completedLessons } = useAcademyStore();

  return (
    <div className="academy-home">
      <h2>OS Academy</h2>
      <p>Your interactive OS learning laboratory.</p>
      
      <div className="learning-path">
        <h3>Learning Path</h3>
        <div className="domains">
          <div className="domain-card">CPU Scheduling</div>
          <div className="domain-card">Memory Management</div>
          <div className="domain-card">Disk Scheduling</div>
          <div className="domain-card">Deadlock</div>
        </div>
      </div>
      
      <div className="progress">
        <h3>Your Progress</h3>
        <p>Completed Lessons: {completedLessons.length}</p>
      </div>
    </div>
  );
};
""".strip())

with open(os.path.join(ACADEMY_DIR, "components", "LessonViewer.tsx"), "w", encoding="utf-8") as f:
    f.write("""
import React from 'react';
import { Lesson } from '../types/lesson';
import { useAcademyStore } from '../store/useAcademyStore';

export const LessonViewer: React.FC<{ lesson: Lesson }> = ({ lesson }) => {
  const { markCompleted } = useAcademyStore();

  return (
    <div className="lesson-viewer">
      <h2>{lesson.title}</h2>
      <div className="lesson-content">
        {lesson.sections.map((sec, idx) => (
          <div key={idx} className={`section-${sec.type.toLowerCase()}`}>
            {sec.content}
          </div>
        ))}
      </div>
      <button onClick={() => markCompleted(lesson.id)}>Mark Complete</button>
    </div>
  );
};
""".strip())

# Mock CPU data
with open(os.path.join(ACADEMY_DIR, "data", "cpu", "index.ts"), "w", encoding="utf-8") as f:
    f.write("""
import { Lesson } from '../../types/lesson';

export const cpuLessons: Lesson[] = [
  {
    id: 'cpu-intro',
    title: 'Introduction to CPU Scheduling',
    domain: 'CPU',
    moduleId: 'cpu-core',
    order: 1,
    difficulty: 'beginner',
    estimatedMinutes: 5,
    objectives: ['Understand what CPU Scheduling is.'],
    prerequisites: [],
    sections: [
      { type: 'TEXT', content: 'CPU scheduling decides which process runs next.' },
      { type: 'SIMULATION', content: 'Launch the simulator to see basic states.', payload: { algorithm: 'FCFS' } }
    ],
    interactiveExamples: [],
    simulationLaunchers: [],
    knowledgeChecks: [],
    experimentSuggestions: [],
    completionCriteria: ['read']
  }
];
""".strip())

print("Phase 13.10 OS Academy files created successfully!")
