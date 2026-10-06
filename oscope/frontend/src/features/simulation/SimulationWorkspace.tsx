import React from 'react';
import { NavLink } from 'react-router-dom';
import { SectionHeader } from '../../components/ui/SectionHeader';

export function SimulationWorkspace({ 
  title, 
  description,
  configPanel,
  visualizationPanel,
  metricsPanel,
  actions
}: { 
  title: string; 
  description: string;
  configPanel: React.ReactNode;
  visualizationPanel: React.ReactNode;
  metricsPanel?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <SectionHeader 
        title={title} 
        description={description}
        actions={
          <div className="flex items-center gap-2">
            <LabSwitcher />
            {actions}
          </div>
        }
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-4 xl:col-span-3 space-y-6 lg:sticky lg:top-20">
          {configPanel}
        </div>
        <div className="lg:col-span-8 xl:col-span-9 space-y-6">
          {visualizationPanel}
          {metricsPanel}
        </div>
      </div>
    </div>
  );
}

function LabSwitcher() {
  return (
    <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 shadow-sm mr-4 text-sm font-semibold">
      <SwitcherLink to="/simulator">CPU & I/O</SwitcherLink>
      <SwitcherLink to="/memory">Memory</SwitcherLink>
      <SwitcherLink to="/disk">Disk</SwitcherLink>
      <SwitcherLink to="/deadlock">Deadlock</SwitcherLink>
    </div>
  );
}

function SwitcherLink({ to, children }: { to: string, children: React.ReactNode }) {
  return (
    <NavLink 
      to={to} 
      className={({ isActive }) => 
        `px-3 py-1.5 rounded-md transition-colors ${
          isActive 
            ? 'bg-white text-slate-800 shadow-sm border border-slate-200/60' 
            : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
        }`
      }
    >
      {children}
    </NavLink>
  );
}
