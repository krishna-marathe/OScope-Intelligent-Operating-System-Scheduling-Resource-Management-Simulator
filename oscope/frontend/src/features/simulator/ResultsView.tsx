import { useState } from 'react';
import { PlaybackControls } from './PlaybackControls';
import { GanttChart } from './GanttChart';
import { ProcessStatusPanel } from './ProcessStatusPanel';
import { SimulationMetricsPanel } from './SimulationMetricsPanel';
import { useSimulatorStore } from '../../store/useSimulatorStore';
import { api } from '../../services/api';

export function ResultsView() {
  const { result, processes, algorithm, timeQuantum } = useSimulatorStore();
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  if (!result) return <p className="text-slate-500" data-testid="empty-results">No results yet. Run a simulation.</p>;

  const handleSave = async () => {
    try {
      setSaving(true);
      await api.saveHistory({
        name: `Experiment - ${algorithm}`,
        algorithm,
        time_quantum: algorithm === 'RR' ? timeQuantum : undefined,
        processes,
        simulation_result: result
      });
      setSaveMsg('Saved successfully!');
      setTimeout(() => setSaveMsg(''), 3000);
    } catch (e: any) {
      setSaveMsg('Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">Results</h3>
        <div className="flex items-center gap-4">
          <span className="text-sm text-green-600">{saveMsg}</span>
          <button onClick={handleSave} disabled={saving} className="bg-blue-600 text-white px-4 py-2 rounded text-sm disabled:opacity-50">
            {saving ? 'Saving...' : 'Save Experiment'}
          </button>
        </div>
      </div>
      <SimulationMetricsPanel />
      <PlaybackControls />
      <GanttChart />
      <ProcessStatusPanel />
    </div>
  );
}
