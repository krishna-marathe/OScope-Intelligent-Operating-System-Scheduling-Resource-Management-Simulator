
export function StatusBadge({ 
  status,
  className = ''
}: { 
  status: 'READY' | 'SIMULATING' | 'ANALYZING' | 'ERROR' | 'IDLE';
  className?: string;
}) {
  const styles = {
    READY: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    SIMULATING: 'bg-blue-100 text-blue-800 border-blue-200 animate-pulse',
    ANALYZING: 'bg-indigo-100 text-indigo-800 border-indigo-200 animate-pulse',
    ERROR: 'bg-rose-100 text-rose-800 border-rose-200',
    IDLE: 'bg-slate-100 text-slate-600 border-slate-200'
  };

  return (
    <span className={`px-2.5 py-1 text-xs font-bold rounded-full border tracking-wide uppercase ${styles[status]} ${className}`}>
      {status}
    </span>
  );
}
