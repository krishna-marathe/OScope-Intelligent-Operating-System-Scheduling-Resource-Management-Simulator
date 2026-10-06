import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!isOpen) return null;

  const commands = [
    { name: 'Open Command Center', path: '/' },
    { name: 'Open CPU Simulator', path: '/simulator' },
    { name: 'Open Memory Simulator', path: '/memory' },
    { name: 'Open Disk Simulator', path: '/disk' },
    { name: 'Open Deadlock Simulator', path: '/deadlock' },
    { name: 'Open Compare', path: '/compare' },
    { name: 'Open History', path: '/history' },
  ];

  const filtered = commands.filter(c => c.name.toLowerCase().includes(query.toLowerCase()));

  const handleSelect = (path: string) => {
    navigate(path);
    setIsOpen(false);
    setQuery('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-32 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsOpen(false)}>
      <div 
        className="w-full max-w-lg bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden"
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center px-4 border-b border-slate-100">
          <span className="text-slate-400 font-bold mr-2">›</span>
          <input 
            type="text" 
            autoFocus 
            className="w-full py-4 bg-transparent outline-none text-slate-800 placeholder-slate-400"
            placeholder="Type a command or search..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <div className="text-[10px] uppercase font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded border">ESC</div>
        </div>
        <div className="max-h-80 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="p-4 text-center text-sm text-slate-500">No commands found.</div>
          ) : (
            filtered.map((cmd, idx) => (
              <button
                key={idx}
                className="w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600 focus:bg-slate-50 focus:text-blue-600 focus:outline-none flex items-center transition-colors"
                onClick={() => handleSelect(cmd.path)}
              >
                <svg className="w-4 h-4 mr-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                {cmd.name}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
