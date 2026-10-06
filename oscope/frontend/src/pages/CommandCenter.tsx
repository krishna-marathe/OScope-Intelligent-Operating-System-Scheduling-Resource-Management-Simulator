import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Panel } from '../components/ui/Panel';
import { MetricCard } from '../components/ui/MetricCard';
import { SectionHeader } from '../components/ui/SectionHeader';
import { ActionButton } from '../components/ui/ActionButton';
import { api } from '../services/api';

export function CommandCenter() {
  const navigate = useNavigate();
  const [historyCount, setHistoryCount] = useState<number | null>(null);

  useEffect(() => {
    // Attempt to fetch history length for metrics
    api.listHistory().then(res => setHistoryCount(res.data.length)).catch(() => setHistoryCount(0));
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <SectionHeader 
        title="Command Center" 
        description="System Overview and Laboratory Controls"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="System Status" value="IDLE" subtitle="Ready for Simulation" trend="neutral" className="border-indigo-100 bg-indigo-50/30" />
        <MetricCard title="Active Workloads" value="0" subtitle="No processes mapped" trend="neutral" />
        <MetricCard title="Experiments" value={historyCount !== null ? historyCount : '-'} subtitle="Saved results" trend="up" />
        <MetricCard title="AI Copilot" value="OFFLINE" subtitle="Pending Phase 13.5" trend="neutral" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="lg:col-span-2 space-y-6">
          <Panel title="OS CONCEPT VISUALIZATION (IDLE)">
            <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-lg bg-slate-50 relative overflow-hidden">
              
              <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, slate-400 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
              
              <div className="text-slate-400 mb-4">
                <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest">Awaiting Simulation Data</p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm text-center">Run a CPU, Memory, or Disk simulation to populate the System Graph.</p>
              
            </div>
          </Panel>

          <Panel title="QUICK LAUNCH">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ActionButton variant="secondary" onClick={() => navigate('/simulator')} className="h-16 justify-start px-6">
                <span className="text-blue-600 bg-blue-50 p-2 rounded mr-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" /></svg>
                </span>
                CPU Scheduling
              </ActionButton>
              
              <ActionButton variant="secondary" onClick={() => navigate('/memory')} className="h-16 justify-start px-6">
                <span className="text-emerald-600 bg-emerald-50 p-2 rounded mr-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>
                </span>
                Memory Management
              </ActionButton>

              <ActionButton variant="secondary" onClick={() => navigate('/disk')} className="h-16 justify-start px-6">
                <span className="text-amber-600 bg-amber-50 p-2 rounded mr-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                </span>
                Disk Scheduling
              </ActionButton>

              <ActionButton variant="secondary" onClick={() => navigate('/deadlock')} className="h-16 justify-start px-6">
                <span className="text-rose-600 bg-rose-50 p-2 rounded mr-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                </span>
                Deadlock & Resources
              </ActionButton>
            </div>
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel title="INTELLIGENCE INSIGHTS">
            <div className="p-4 bg-indigo-50/50 rounded border border-indigo-100 flex gap-3 text-sm">
              <span className="text-indigo-500">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </span>
              <p className="text-slate-600">Run a simulation to generate AI insights. Historical insights are currently disabled.</p>
            </div>
          </Panel>

          <Panel title="RECENT EXPERIMENTS">
            {historyCount === null ? (
              <div className="text-sm text-slate-500 animate-pulse">Loading history...</div>
            ) : historyCount === 0 ? (
              <div className="text-sm text-slate-500">No experiments saved yet.</div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm p-2 rounded hover:bg-slate-50 transition cursor-pointer" onClick={() => navigate('/history')}>
                  <span className="font-semibold text-slate-700">View History Archive</span>
                  <span className="text-blue-600">({historyCount} entries) →</span>
                </div>
              </div>
            )}
          </Panel>
        </div>

      </div>
    </div>
  );
}
