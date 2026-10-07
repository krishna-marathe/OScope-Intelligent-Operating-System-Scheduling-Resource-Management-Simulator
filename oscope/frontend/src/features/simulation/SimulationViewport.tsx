import React from 'react';
import { Panel } from '../../components/ui/Panel';

import { useVisualization3DStore } from '../visualization3d/store/useVisualization3DStore';
import { CPULaboratory3D } from '../visualization3d/scenes/CPULaboratory3D';
import { MemoryLaboratory3D } from '../visualization3d/scenes/MemoryLaboratory3D';
import { DiskLaboratory3D } from '../visualization3d/scenes/DiskLaboratory3D';
import { DeadlockLaboratory3D } from '../visualization3d/scenes/DeadlockLaboratory3D';

export function SimulationViewport({ 
  title, 
  status,
  children,
  laboratoryType = 'GENERIC',
}: { 
  title: string; 
  status?: 'IDLE' | 'READY' | 'RUNNING' | 'COMPLETED' | 'ERROR';
  children: React.ReactNode;
  laboratoryType?: 'CPU' | 'MEMORY' | 'DISK' | 'DEADLOCK' | 'GENERIC';
}) {
  const { is3DMode, toggle3DMode } = useVisualization3DStore();

  return (
    <Panel 
      title={title} 
      className="flex flex-col h-full"
      action={
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-md border border-slate-200">
          <button
            onClick={() => { if (is3DMode) toggle3DMode(); }}
            className={`px-3 py-1 rounded text-xs font-bold transition-colors ${!is3DMode ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            2D
          </button>
          <button
            onClick={() => { if (!is3DMode) toggle3DMode(); }}
            className={`px-3 py-1 rounded text-xs font-bold transition-colors ${is3DMode ? 'bg-blue-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            3D
          </button>
        </div>
      }
    >
      <div className="relative flex-1 w-full h-full min-h-[400px] flex flex-col">
        {status === 'IDLE' && !is3DMode && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 border-2 border-dashed border-slate-200 z-10 rounded-lg">
            <div className="text-slate-400 mb-2">
              <svg className="w-10 h-10 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest">Viewport Idle</p>
            <p className="text-xs text-slate-400 mt-1">Configure parameters and run the simulation.</p>
          </div>
        )}
        
        <div className={`flex-1 transition-opacity duration-300 flex flex-col ${(status === 'IDLE' && !is3DMode) ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
          {!is3DMode ? children : (
            <div className="flex-1 w-full h-full min-h-[400px]">
              {laboratoryType === 'CPU' ? <CPULaboratory3D /> :
               laboratoryType === 'MEMORY' ? <MemoryLaboratory3D /> :
               laboratoryType === 'DISK' ? <DiskLaboratory3D /> :
               laboratoryType === 'DEADLOCK' ? <DeadlockLaboratory3D /> :
               null}
            </div>
          )}
        </div>
      </div>
    </Panel>
  );
}
