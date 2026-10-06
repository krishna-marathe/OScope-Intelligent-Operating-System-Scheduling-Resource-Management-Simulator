import { useLocation } from 'react-router-dom';
import { StatusBadge } from '../ui/StatusBadge';

export function TopBar() {
  const location = useLocation();
  
  // Basic active route detection for context header
  const getContext = () => {
    if (location.pathname === '/') return 'Command Center';
    if (location.pathname.includes('/simulator')) return 'Simulation Lab / CPU';
    if (location.pathname.includes('/memory')) return 'Simulation Lab / Memory';
    if (location.pathname.includes('/disk')) return 'Simulation Lab / Disk';
    if (location.pathname.includes('/deadlock')) return 'Simulation Lab / Deadlock';
    if (location.pathname.includes('/compare')) return 'Experiments / Compare';
    if (location.pathname.includes('/history')) return 'Experiments / History';
    return 'OScope';
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shadow-sm z-10 sticky top-0 shrink-0">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-extrabold tracking-tight text-slate-800">
          OSCOPE <span className="text-blue-600 font-normal">2.0</span>
        </h1>
        <div className="h-6 w-px bg-slate-200 mx-2"></div>
        <div className="text-sm font-semibold text-slate-500 uppercase tracking-widest hidden sm:block">
          {getContext()}
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center text-xs text-slate-400 bg-slate-100 px-3 py-1.5 rounded-md border border-slate-200">
          <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200 mr-2 shadow-sm text-[10px]">Ctrl K</span>
          Command Palette
        </div>
        <StatusBadge status="READY" />
        <div className="h-8 w-8 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-sm shadow-indigo-600/30 cursor-pointer">
          AI
        </div>
      </div>
    </header>
  );
}
