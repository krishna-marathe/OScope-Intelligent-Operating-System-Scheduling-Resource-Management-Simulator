import React from 'react';
import { NavLink } from 'react-router-dom';

function SidebarSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3 px-4">{title}</h3>
      <div className="space-y-0.5">
        {children}
      </div>
    </div>
  );
}

function SidebarLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <NavLink 
      to={to} 
      className={({ isActive }) => 
        `block px-4 py-2 mx-2 rounded-md text-sm transition-colors relative group ${
          isActive 
            ? 'bg-blue-600/10 text-blue-400 font-semibold' 
            : 'text-slate-300 hover:bg-slate-800 hover:text-slate-100'
        }`
      }
    >
      {({ isActive }) => (
        <>
          {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-blue-500 rounded-r-full" />}
          {children}
        </>
      )}
    </NavLink>
  );
}

export function Sidebar() {
  return (
    <div className="w-64 bg-[#0B1120] text-slate-300 flex flex-col shrink-0 border-r border-slate-800 shadow-xl z-20 h-full overflow-y-auto hidden sm:flex">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 rounded bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
        </div>
        <div>
          <div className="font-bold tracking-tight text-white leading-tight">OS Laboratory</div>
          <div className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">Environment 2.0</div>
        </div>
      </div>
      
      <div className="flex-1 py-2">
        <SidebarSection title="Command Center">
          <SidebarLink to="/">Overview</SidebarLink>
        </SidebarSection>
        
        <SidebarSection title="Simulation Lab">
          <SidebarLink to="/simulator">CPU & I/O</SidebarLink>
          <SidebarLink to="/memory">Memory</SidebarLink>
          <SidebarLink to="/disk">Disk</SidebarLink>
          <SidebarLink to="/deadlock">Deadlock</SidebarLink>
        </SidebarSection>

        <SidebarSection title="Visual Lab">
          <div className="px-4 py-2 mx-2 text-sm text-slate-400 group" title="Integrated into all laboratories">
            System View <span className="float-right text-[9px] uppercase border border-emerald-700/50 px-1 rounded text-emerald-400 bg-emerald-900/30">Integrated</span>
          </div>
        </SidebarSection>

        <SidebarSection title="Intelligence">
          <div className="px-4 py-2 mx-2 text-sm text-slate-400 group" title="Integrated into intelligence panel">
            AI Copilot <span className="float-right text-[9px] uppercase border border-emerald-700/50 px-1 rounded text-emerald-400 bg-emerald-900/30">Integrated</span>
          </div>
        </SidebarSection>
        
        <SidebarSection title="Experiments">
          <SidebarLink to="/compare">Compare</SidebarLink>
          <SidebarLink to="/history">History</SidebarLink>
        </SidebarSection>
      </div>
    </div>
  );
}
