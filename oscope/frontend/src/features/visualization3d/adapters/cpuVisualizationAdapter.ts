import { SimulationResult, Process, MLQConfig, MLFQConfig } from '../../../types';
import { VisualizationModel, VisualEntity, VisualConnection } from '../models/visualizationModel';

export function createCpuVisualizationModel(
  processes: Process[],
  result: SimulationResult | null,
  currentTime: number,
  algorithm: string,
  mlqConfig?: MLQConfig,
  mlfqConfig?: MLFQConfig
): VisualizationModel {
  if (!result) {
    return {
      entities: [],
      connections: [],
      currentTime: 0,
      currentStep: 0,
      totalSteps: 0,
    };
  }

  const entities: VisualEntity[] = [];
  const connections: VisualConnection[] = [];

  // Core Resources
  let cpuState = 'IDLE';
  let ioState = 'IDLE';
  let activeProcessId: string | null = null;
  let activeIoProcessId: string | null = null;
  let activeCS: boolean = false;

  const currentGantt = result.gantt_chart.filter(
    (e) => e.start_time <= currentTime && e.end_time > currentTime
  );

  for (const e of currentGantt) {
    if (e.event_type === 'CS') {
      activeCS = true;
      cpuState = 'ALLOCATED'; // or some visual representation for CS
    } else if (e.event_type === 'IO') {
      ioState = 'RUNNING';
      activeIoProcessId = e.process_id;
    } else {
      cpuState = 'RUNNING';
      activeProcessId = e.process_id;
    }
  }

  entities.push({
    id: 'cpu-core',
    type: 'resource',
    label: activeCS ? 'CPU (CS)' : 'CPU Core',
    state: activeCS ? 'ALLOCATED' : cpuState as any,
    metadata: {
      active_process: activeProcessId || 'None',
      status: activeCS ? 'Context Switch' : cpuState
    }
  });

  const hasIO = result.gantt_chart.some(e => e.event_type === 'IO');
  if (hasIO) {
    entities.push({
      id: 'io-device',
      type: 'resource',
      label: 'I/O Device',
      state: ioState as any,
      metadata: {
        active_process: activeIoProcessId || 'None',
      }
    });
    entities.push({
      id: 'blocked-queue',
      type: 'queue',
      label: 'Blocked / IO',
      state: 'AVAILABLE',
    });
  }

  // Queues
  const isMLQ = algorithm === 'MLQ' && mlqConfig;
  const isMLFQ = algorithm === 'MLFQ' && mlfqConfig;
  
  if (isMLQ && mlqConfig) {
    mlqConfig.queues.forEach((q) => {
      entities.push({
        id: `ready-queue-${q.id}`,
        type: 'queue',
        label: `Q${q.id} (Pri: ${q.priority}) [${q.policy}]`,
        state: 'AVAILABLE',
      });
    });
  } else if (isMLFQ && mlfqConfig) {
    mlfqConfig.queues.forEach((q) => {
      entities.push({
        id: `ready-queue-${q.id}`,
        type: 'queue',
        label: `Q${q.id} (Pri: ${q.priority}) [${q.policy}]`,
        state: 'AVAILABLE',
      });
    });
  } else {
    entities.push({
      id: 'ready-queue-0',
      type: 'queue',
      label: 'Ready Queue',
      state: 'AVAILABLE',
    });
  }

  // Processes
  const lifecycles = result.lifecycles || [];

  for (const p of processes) {
    // Find current lifecycle state
    const currentLc = lifecycles.find(
      lc => lc.process_id === p.id && lc.start_time <= currentTime && lc.end_time >= currentTime
    );

    // Fallback logic if exactly at boundary
    const exactStartLc = !currentLc ? lifecycles.find(lc => lc.process_id === p.id && lc.start_time === currentTime) : null;
    const lastLc = !currentLc && !exactStartLc ? lifecycles.filter(lc => lc.process_id === p.id).pop() : null;

    let pState = 'NEW';
    let queueId = 0;
    
    if (currentLc) {
      pState = currentLc.state;
    } else if (exactStartLc) {
      pState = exactStartLc.state;
    } else if (lastLc && currentTime >= lastLc.end_time) {
      pState = 'TERMINATED';
    } else if (p.arrival_time > currentTime) {
      pState = 'NEW';
    } else {
      pState = 'TERMINATED'; // Safe fallback
    }
    
    if (pState === 'CS') {
      pState = 'READY'; // Visual mapping
    }

    // Determine current queue mapping for MLQ/MLFQ if running or ready
    if ((pState === 'READY' || pState === 'RUNNING') && (isMLQ || isMLFQ)) {
      const recentGantt = [...result.gantt_chart].reverse().find(
        g => g.process_id === p.id && g.start_time <= currentTime
      );
      if (recentGantt && recentGantt.queue_id) {
        queueId = recentGantt.queue_id;
      } else if (isMLQ && mlqConfig) {
        queueId = mlqConfig.process_assignments[p.id] || 1;
      } else if (isMLFQ) {
        queueId = 1; // Start at top queue
      }
    }

    const metrics = result.metrics.process_metrics.find(m => m.process_id === p.id);
    
    entities.push({
      id: `process-${p.id}`,
      type: 'process',
      label: p.id,
      state: pState as any,
      metadata: {
        state: pState,
        arrival: p.arrival_time,
        burst: p.burst_time,
        completion: metrics?.completion_time || 'N/A',
        turnaround: metrics?.turnaround_time || 'N/A',
        waiting: metrics?.waiting_time || 'N/A',
        current_queue: queueId > 0 ? `Q${queueId}` : 'N/A'
      }
    });

    // Connections
    if (pState === 'RUNNING') {
      const runningOnCpu = activeProcessId === p.id;
      const runningOnIo = activeIoProcessId === p.id;
      
      if (runningOnCpu) {
        connections.push({ id: `conn-cpu-${p.id}`, sourceId: `process-${p.id}`, targetId: 'cpu-core', active: true });
      }
      if (runningOnIo) {
        connections.push({ id: `conn-io-${p.id}`, sourceId: `process-${p.id}`, targetId: 'io-device', active: true });
      }
    }
  }

  // Calculate maximum end time for totalSteps approximation
  const maxEnd = Math.max(...result.gantt_chart.map(e => e.end_time), ...lifecycles.map(l => l.end_time));

  return {
    entities,
    connections,
    currentTime,
    currentStep: Math.floor(currentTime), // roughly
    totalSteps: Math.ceil(maxEnd),
  };
}
