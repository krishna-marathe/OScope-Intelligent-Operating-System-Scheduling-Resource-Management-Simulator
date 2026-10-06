import { DeadlockSimulator } from '../features/deadlock/DeadlockSimulator';

export function Deadlock() {
  return (
    <div className="p-6 h-full overflow-y-auto">
      <DeadlockSimulator />
    </div>
  );
}
