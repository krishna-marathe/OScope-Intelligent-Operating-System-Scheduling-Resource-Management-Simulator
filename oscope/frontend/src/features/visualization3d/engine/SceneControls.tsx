import React from 'react';
import { useVisualization3DStore } from '../store/useVisualization3DStore';
import { Camera, Grid, Type, Maximize, Scan } from 'lucide-react';

export const SceneControls: React.FC = () => {
  const { is3DMode, showGrid, showLabels, toggleGrid, toggleLabels } = useVisualization3DStore();

  const handleResetCamera = () => {
    window.dispatchEvent(new CustomEvent('oscope:3d-camera-reset'));
  };

  const handleFitCamera = () => {
    window.dispatchEvent(new CustomEvent('oscope:3d-camera-fit'));
  };

  const handleFullscreen = () => {
    const el = document.getElementById('oscope-3d-container');
    if (el) {
      if (!document.fullscreenElement) {
        el.requestFullscreen().catch(err => console.error(err));
      } else {
        document.exitFullscreen();
      }
    }
  };

  if (!is3DMode) return null;

  return (
    <div className="flex gap-1 ml-2 border-l pl-4 border-slate-300">
      <button 
        onClick={handleFitCamera}
        title="Fit Scene"
        className="p-1.5 hover:bg-slate-200 rounded text-slate-600 transition-colors"
      >
        <Scan className="w-4 h-4" />
      </button>
      <button 
        onClick={handleResetCamera}
        title="Reset Camera"
        className="p-1.5 hover:bg-slate-200 rounded text-slate-600 transition-colors"
      >
        <Camera className="w-4 h-4" />
      </button>
      <button 
        onClick={toggleGrid}
        title="Toggle Grid"
        className={`p-1.5 rounded transition-colors ${showGrid ? 'bg-blue-100 text-blue-600' : 'hover:bg-slate-200 text-slate-600'}`}
      >
        <Grid className="w-4 h-4" />
      </button>
      <button 
        onClick={toggleLabels}
        title="Toggle Labels"
        className={`p-1.5 rounded transition-colors ${showLabels ? 'bg-blue-100 text-blue-600' : 'hover:bg-slate-200 text-slate-600'}`}
      >
        <Type className="w-4 h-4" />
      </button>
      <button 
        onClick={handleFullscreen}
        title="Toggle Fullscreen"
        className="p-1.5 hover:bg-slate-200 rounded text-slate-600 transition-colors"
      >
        <Maximize className="w-4 h-4" />
      </button>
    </div>
  );
};
