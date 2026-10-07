import { useEffect, useRef } from 'react';
import { useSimulatorStore } from '../../store/useSimulatorStore';
import { Play, Pause, RotateCcw, SkipForward, SkipBack } from 'lucide-react';
import { SceneControls } from '../visualization3d/engine/SceneControls';

export function PlaybackControls() {
  const { result, currentTime, isPlaying, playbackSpeed, setCurrentTime, setIsPlaying, setPlaybackSpeed, resetPlayback } = useSimulatorStore();
  const timerRef = useRef<number | null>(null);

  const maxTime = result?.gantt_chart.length ? Math.max(...result.gantt_chart.map(e => e.end_time)) : 0;
  
  const getEventBoundaries = () => {
    if (!result) return [0];
    const boundaries = new Set([0]);
    result.gantt_chart.forEach(ev => {
      boundaries.add(ev.start_time);
      boundaries.add(ev.end_time);
    });
    return Array.from(boundaries).sort((a, b) => a - b);
  };

  useEffect(() => {
    if (isPlaying && currentTime < maxTime) {
      timerRef.current = window.setInterval(() => {
        setCurrentTime(Math.min(maxTime, useSimulatorStore.getState().currentTime + 1));
      }, 1000 / playbackSpeed);
    } else if (currentTime >= maxTime) {
      setIsPlaying(false);
    }
    
    return () => {
      if (timerRef.current !== null) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isPlaying, playbackSpeed, maxTime, setCurrentTime, setIsPlaying]);

  const handlePlayPause = () => {
    if (currentTime >= maxTime) {
      resetPlayback();
      setIsPlaying(true);
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const handleStepForward = () => {
    const boundaries = getEventBoundaries();
    const nextBoundary = boundaries.find(b => b > currentTime);
    if (nextBoundary !== undefined) {
      setCurrentTime(nextBoundary);
    } else {
      setCurrentTime(maxTime);
    }
  };

  const handleStepBackward = () => {
    const boundaries = getEventBoundaries();
    const prevBoundaries = boundaries.filter(b => b < currentTime);
    if (prevBoundaries.length > 0) {
      setCurrentTime(prevBoundaries[prevBoundaries.length - 1]);
    } else {
      setCurrentTime(0);
    }
  };

  if (!result) return null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-50 p-4 rounded-xl shadow-sm border border-slate-200">
      <div className="flex flex-wrap items-center gap-2">
        <button data-testid="btn-reset" onClick={resetPlayback} className="p-2.5 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors" aria-label="Reset"><RotateCcw size={16} /></button>
        <button data-testid="btn-step-back" onClick={handleStepBackward} className="p-2.5 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors" aria-label="Step Backward"><SkipBack size={16} /></button>
        <button data-testid="btn-play-pause" onClick={handlePlayPause} className="p-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 w-12 flex justify-center transition-colors shadow-sm" aria-label={isPlaying ? "Pause" : "Play"}>
          {isPlaying ? <Pause size={16} /> : <Play size={16} />}
        </button>
        <button data-testid="btn-step-forward" onClick={handleStepForward} className="p-2.5 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors" aria-label="Step Forward"><SkipForward size={16} /></button>
      </div>
      
      <div className="flex flex-wrap items-center gap-4">
        <span className="font-mono text-sm font-bold bg-white text-slate-700 px-3 py-1.5 rounded-md border border-slate-200" data-testid="current-time-display">
          Time: {currentTime.toFixed(1)} / {maxTime.toFixed(1)}
        </span>
        <select 
          data-testid="speed-select"
          value={playbackSpeed}
          onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
          className="border border-slate-300 rounded-md p-1.5 text-sm bg-white font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Playback Speed"
        >
          <option value={0.5}>0.5x</option>
          <option value={1}>1.0x</option>
          <option value={2}>2.0x</option>
          <option value={4}>4.0x</option>
        </select>
        
        <SceneControls />
      </div>
    </div>
  );
}
