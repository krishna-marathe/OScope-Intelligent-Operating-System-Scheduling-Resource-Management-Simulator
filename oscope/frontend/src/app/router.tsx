import { Routes, Route } from 'react-router-dom';
import { Dashboard } from '../pages/Dashboard';
import { Simulator } from '../pages/Simulator';
import { Compare } from '../pages/Compare';
import { History } from '../pages/History';

export function Router() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/simulator" element={<Simulator />} />
      <Route path="/compare" element={<Compare />} />
      <Route path="/history" element={<History />} />
      <Route path="/about" element={<div>About OScope Placeholder</div>} />
    </Routes>
  );
}
