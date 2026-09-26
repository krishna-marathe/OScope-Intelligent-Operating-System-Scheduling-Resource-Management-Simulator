import { Link } from 'react-router-dom';

export function Sidebar() {
  return (
    <div className="w-64 bg-slate-900 text-white flex flex-col">
      <div className="p-6">
        <h2 className="text-2xl font-bold">OScope</h2>
      </div>
      <nav className="flex-1 px-4 space-y-2">
        <Link to="/" className="block py-2 px-4 rounded hover:bg-slate-800">Dashboard</Link>
        <Link to="/simulator" className="block py-2 px-4 rounded hover:bg-slate-800">Simulator</Link>
        <Link to="/compare" className="block py-2 px-4 rounded hover:bg-slate-800">Compare</Link>
        <Link to="/history" className="block py-2 px-4 rounded hover:bg-slate-800">History</Link>
        <Link to="/about" className="block py-2 px-4 rounded hover:bg-slate-800">About</Link>
      </nav>
    </div>
  );
}
