import React from 'react';
import { useVisualization3DStore } from '../store/useVisualization3DStore';

export const ObjectTooltip: React.FC = () => {
  const hoveredEntity = useVisualization3DStore(state => state.hoveredEntity);

  if (!hoveredEntity) return null;

  return (
    <div className="absolute top-4 right-4 z-20 pointer-events-none animate-in fade-in duration-200">
      <div className="bg-slate-800 text-white p-3 rounded-lg shadow-lg border border-slate-700 min-w-[150px]">
        <div className="font-bold text-sm mb-1">{hoveredEntity.label}</div>
        <div className="text-xs text-slate-300 capitalize">{hoveredEntity.type.replace('_', ' ')}</div>
        <div className="mt-2 text-xs">
          <span className="inline-block px-2 py-0.5 rounded bg-slate-700 font-mono text-slate-200">
            {hoveredEntity.state}
          </span>
        </div>
        {hoveredEntity.metadata && (
          <div className="mt-2 text-xs text-slate-400 space-y-1">
            {Object.entries(hoveredEntity.metadata).map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4">
                <span className="capitalize">{k}:</span>
                <span className="text-slate-200 font-mono">{String(v)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
