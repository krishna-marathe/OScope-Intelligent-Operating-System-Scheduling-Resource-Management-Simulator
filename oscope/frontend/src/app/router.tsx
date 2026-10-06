import { Routes, Route } from 'react-router-dom';
import { CommandCenter } from '../pages/CommandCenter';
import { Simulator } from '../pages/Simulator';
import { Compare } from '../pages/Compare';
import { History } from '../pages/History';
import { Memory } from '../pages/Memory';
import { Disk } from '../pages/Disk';
import { Deadlock } from '../pages/Deadlock';

export function Router() {
  return (
    <Routes>
      <Route path="/" element={<CommandCenter />} />
      <Route path="/simulator" element={<Simulator />} />
      <Route path="/compare" element={<Compare />} />
      <Route path="/history" element={<History />} />
      <Route path="/memory" element={<Memory />} />
      <Route path="/disk" element={<Disk />} />
      <Route path="/deadlock" element={<Deadlock />} />
      <Route path="/about" element={<div>About OScope Placeholder</div>} />
    </Routes>
  );
}
