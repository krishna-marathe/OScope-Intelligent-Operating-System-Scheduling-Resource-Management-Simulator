import React from 'react';

export function Panel({ children, title, action, className = '' }: { children: React.ReactNode; title?: string; action?: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden ${className}`}>
      {title && (
        <div className="bg-slate-50 border-b border-slate-200 px-5 py-3 font-semibold text-sm tracking-wide text-slate-700 flex justify-between items-center">
          <span>{title}</span>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="p-5">
        {children}
      </div>
    </div>
  );
}
