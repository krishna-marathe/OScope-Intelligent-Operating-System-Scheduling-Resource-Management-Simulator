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