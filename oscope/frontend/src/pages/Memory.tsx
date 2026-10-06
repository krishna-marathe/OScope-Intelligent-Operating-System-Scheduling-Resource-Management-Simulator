import { MemorySimulator } from '../features/memory/MemorySimulator';

export function Memory() {
  return (
    <div className="p-6 h-full overflow-y-auto">
      <MemorySimulator />
    </div>
  );
}
