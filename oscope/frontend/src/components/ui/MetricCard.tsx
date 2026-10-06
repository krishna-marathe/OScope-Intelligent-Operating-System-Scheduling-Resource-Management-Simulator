import React from 'react';

export function MetricCard({ 
  title, 
  value, 
  subtitle,
  trend,
  className = ''
}: { 
  title: string; 
  value: React.ReactNode; 
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
  className?: string;
}) {
  return (
    <div className={`bg-white border border-slate-200 rounded-lg p-5 shadow-sm flex flex-col ${className}`}>
      <div className="text-xs font-semibold tracking-wider text-slate-500 uppercase mb-2">
        {title}
      </div>
      <div className="text-3xl font-bold font-mono text-slate-800 mb-1">
        {value}
      </div>
      {subtitle && (
        <div className="text-sm text-slate-500 flex items-center gap-1">
          {trend === 'up' && <span className="text-emerald-500">↑</span>}
          {trend === 'down' && <span className="text-rose-500">↓</span>}
          {trend === 'neutral' && <span className="text-slate-400">-</span>}
          {subtitle}
        </div>
      )}
    </div>
  );
}
