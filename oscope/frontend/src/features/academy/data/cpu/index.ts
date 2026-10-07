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