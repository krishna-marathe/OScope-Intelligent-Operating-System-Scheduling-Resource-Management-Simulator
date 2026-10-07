import React from 'react';
import { useIntelligenceStore } from '../store/useIntelligenceStore';

export const IntelligencePanel: React.FC = () => {
  const { currentAnalysis } = useIntelligenceStore();

  return (
    <div className="intelligence-panel">
      <h2>Intelligence Engine</h2>
      {currentAnalysis ? (
        <div>
           {/* Render analysis here */}
        </div>
      ) : (
        <p>No intelligence data exists. Run an analysis.</p>
      )}
    </div>
  );
};
