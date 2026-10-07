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