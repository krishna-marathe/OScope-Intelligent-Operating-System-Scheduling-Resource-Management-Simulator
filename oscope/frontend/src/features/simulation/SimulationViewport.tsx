import React from 'react';
import { Panel } from '../../components/ui/Panel';

export function SimulationViewport({ 
  title, 
  status,
  children 
}: { 
  title: string; 
  status?: 'IDLE' | 'READY' | 'RUNNING' | 'COMPLETED' | 'ERROR';
  children: React.ReactNode;
}) {
  return (
    <Panel 
      title={title} 
      className="relative min-h-[400px] flex flex-col"
    >
      {status === 'IDLE' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 border-2 border-dashed border-slate-200 z-10 m-5 rounded-lg">
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
      
      <div className={`flex-1 transition-opacity duration-300 ${status === 'IDLE' ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        {children}
      </div>
    </Panel>
  );
}
