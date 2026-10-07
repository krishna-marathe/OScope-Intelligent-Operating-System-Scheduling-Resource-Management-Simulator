import React from 'react';
import { useExperimentStore } from '../store/useExperimentStore';

export const ExperimentStudio: React.FC = () => {
  const { experiments, selectedExperiment } = useExperimentStore();

  return (
    <div className="experiment-studio">
      <div className="experiment-list">
        <h2>Experiments</h2>
        <button>+ New</button>
        <ul>
          {experiments.map(exp => (
            <li key={exp.id}>{exp.name}</li>
          ))}
        </ul>
      </div>
      <div className="experiment-details">
        {selectedExperiment ? (
          <div>
            <h2>{selectedExperiment.name}</h2>
            <p>Status: {selectedExperiment.status}</p>
          </div>
        ) : (
          <p>Select an experiment to view details.</p>
        )}
      </div>
    </div>
  );
};