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