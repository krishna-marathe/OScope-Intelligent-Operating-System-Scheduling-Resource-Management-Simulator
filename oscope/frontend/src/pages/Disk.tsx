import { DiskSimulator } from '../features/disk/DiskSimulator';

export function Disk() {
  return (
    <div className="p-6 h-full overflow-y-auto">
      <DiskSimulator />
    </div>
  );
}
