import { ReactNode } from 'react';

interface VisualCanvasProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  legend?: ReactNode;
  controls?: ReactNode;
}

export function VisualCanvas({ children, title, subtitle, legend, controls }: VisualCanvasProps) {
  return (
    <div className="flex flex-col h-full bg-slate-50 relative rounded-lg border border-slate-200 shadow-inner overflow-hidden">
      {/* Grid Background */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{ 
          backgroundImage: 'radial-gradient(circle at 2px 2px, #94a3b8 1px, transparent 0)',
          backgroundSize: '24px 24px'
        }}
      />
      
      {/* Header Area */}
      <div className="relative z-10 flex items-center justify-between p-4 border-b border-slate-200/60 bg-white/50 backdrop-blur-sm">
        <div>
          {title && <h3 className="font-bold text-slate-800 tracking-tight text-sm uppercase">{title}</h3>}
          {subtitle && <p className="text-xs font-semibold text-slate-500">{subtitle}</p>}
        </div>
        {controls && (
          <div className="flex items-center gap-2">
            {controls}
          </div>
        )}
      </div>

      {/* Main Canvas Area */}
      <div className="relative flex-1 p-6 overflow-auto">
        <div className="min-w-max h-full relative">
          {children}
        </div>
      </div>

      {/* Footer / Legend Area */}
      {legend && (
        <div className="relative z-10 p-3 bg-white/80 backdrop-blur-md border-t border-slate-200/60 flex items-center justify-center gap-4 text-xs font-semibold text-slate-600">
          {legend}
        </div>
      )}
    </div>
  );
}

export function VisualizationLegendItem({ color, label, icon }: { color: string; label: string; icon?: ReactNode }) {
  return (
    <div className="flex items-center gap-1.5">
      {icon ? (
        <span className="text-slate-500 w-3 h-3 flex items-center justify-center">{icon}</span>
      ) : (
        <div className={`w-2.5 h-2.5 rounded-sm ${color} shadow-sm border border-black/10`} />
      )}
      <span className="uppercase tracking-wider">{label}</span>
    </div>
  );
}
