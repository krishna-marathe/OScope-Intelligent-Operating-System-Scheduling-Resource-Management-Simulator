import React from 'react';

interface SceneHUDProps {
  title: string;
  subtitle?: string;
  stats?: { label: string; value: string }[];
}

export const SceneHUD: React.FC<SceneHUDProps> = ({ title, subtitle, stats }) => {
  return (
    <div className="absolute top-4 left-4 z-10 pointer-events-none">
      <div className="bg-white/90 backdrop-blur-md border border-slate-200/60 p-3 rounded-lg shadow-sm">
        <h3 className="font-bold text-slate-800 flex items-center gap-2 tracking-tight">
          <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></span>
          {title}
        </h3>
        {subtitle && (
          <p className="text-xs font-semibold text-slate-500 mt-1 pl-4 uppercase tracking-wider">
            {subtitle}
          </p>
        )}
        {stats && stats.length > 0 && (
          <div className="mt-3 pl-4 flex flex-col gap-1 border-t border-slate-100 pt-2">
            {stats.map((s, i) => (
              <div key={i} className="flex justify-between text-xs">
                <span className="text-slate-500">{s.label}:</span>
                <span className="font-mono font-medium text-slate-700">{s.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
