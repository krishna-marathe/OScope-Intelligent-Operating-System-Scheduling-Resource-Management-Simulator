import React from 'react';
import { useVisualization3DStore } from '../store/useVisualization3DStore';
import { Camera, Grid, Type, Maximize } from 'lucide-react';

export const SceneControls: React.FC = () => {
  const { showGrid, showLabels, toggleGrid, toggleLabels } = useVisualization3DStore();

  const handleResetCamera = () => {
    window.dispatchEvent(new CustomEvent('oscope:3d-camera-reset'));
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

  return (
    <div className="absolute bottom-4 right-4 flex gap-2 z-50 bg-white/90 backdrop-blur rounded-lg p-2 shadow-sm border border-slate-200">
      <button 
        onClick={handleResetCamera}
        title="Reset Camera"
        className="p-2 hover:bg-slate-100 rounded text-slate-600 transition-colors"
      >
        <Camera className="w-5 h-5" />
      </button>
      <button 
        onClick={toggleGrid}
        title="Toggle Grid"
        className={`p-2 rounded transition-colors ${showGrid ? 'bg-blue-100 text-blue-600' : 'hover:bg-slate-100 text-slate-600'}`}
      >
        <Grid className="w-5 h-5" />
      </button>
      <button 
        onClick={toggleLabels}
        title="Toggle Labels"
        className={`p-2 rounded transition-colors ${showLabels ? 'bg-blue-100 text-blue-600' : 'hover:bg-slate-100 text-slate-600'}`}
      >
        <Type className="w-5 h-5" />
      </button>
      <button 
        onClick={handleFullscreen}
        title="Toggle Fullscreen"
        className="p-2 hover:bg-slate-100 rounded text-slate-600 transition-colors"
      >
        <Maximize className="w-5 h-5" />
      </button>
    </div>
  );
};
