import { Routes, Route } from 'react-router-dom';
import { Dashboard } from '../pages/Dashboard';
import { Simulator } from '../pages/Simulator';

export function Router() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/simulator" element={<Simulator />} />
      <Route path="/compare" element={<div>Comparison Placeholder</div>} />
      <Route path="/history" element={<div>History Placeholder</div>} />
      <Route path="/about" element={<div>About OScope Placeholder</div>} />
    </Routes>
  );
}
