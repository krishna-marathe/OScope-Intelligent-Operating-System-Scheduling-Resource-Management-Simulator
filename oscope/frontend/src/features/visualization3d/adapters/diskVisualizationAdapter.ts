import { DiskSimulationResult } from '../../../types';
import { VisualizationModel, VisualEntity, VisualConnection } from '../models/visualizationModel';

export function createDiskVisualizationModel(
  result: DiskSimulationResult | null,
  currentStep: number,
  diskSize: number
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

  const safeStep = Math.min(Math.max(currentStep, 0), result.movement_steps.length);
  const stepsToRender = result.movement_steps.slice(0, safeStep);

  // We want to visualize the disk size. 
  // Concentric tracks from radius 1 to N
  // But maybe just render a few representative tracks or only the requested tracks to avoid clutter
  const relevantTracks = new Set<number>();
  relevantTracks.add(0);
  relevantTracks.add(diskSize - 1);
  result.request_queue.forEach(q => relevantTracks.add(q));
  relevantTracks.add(result.initial_head_position);
  
  const sortedTracks = Array.from(relevantTracks).sort((a, b) => a - b);
  
  sortedTracks.forEach(track => {
    // If the track is in the request queue, check if it's pending/current/serviced
    const isRequest = result.request_queue.includes(track);
    let state = 'AVAILABLE';
    let label = `T${track}`;
    
    if (isRequest) {
      // Find where it was serviced
      const serviceIdx = result.service_order.indexOf(track);
      if (serviceIdx !== -1) {
        if (serviceIdx < safeStep) {
          state = 'TERMINATED'; // Serviced
          label = `T${track} (Done)`;
        } else if (serviceIdx === safeStep - 1) {
          state = 'RUNNING'; // Current
          label = `T${track} (Current)`;
        } else {
          state = 'ALLOCATED'; // Pending
          label = `T${track} (Req)`;
        }
      }
    }
    
    entities.push({
      id: `track-${track}`,
      type: 'disk_track', // not officially in the enum but primitives filter by type string if customized or we just use it
      label,
      state: state as any,
      metadata: {
        cylinder: track,
        is_request: isRequest,
        status: state === 'TERMINATED' ? 'SERVICED' : state === 'ALLOCATED' ? 'PENDING' : state === 'RUNNING' ? 'CURRENT' : 'NONE'
      }
    });
  });

  // Disk Head
  const currentHeadPos = safeStep === 0 
    ? result.initial_head_position 
    : result.movement_steps[safeStep - 1].end_cylinder;
  
  const currentDir = safeStep === 0 
    ? 'NONE'
    : (result.movement_steps[safeStep - 1].end_cylinder >= result.movement_steps[safeStep - 1].start_cylinder ? 'RIGHT' : 'LEFT');

  entities.push({
    id: 'disk-head',
    type: 'resource',
    label: `HEAD (T${currentHeadPos})`,
    state: 'RUNNING',
    metadata: {
      position: currentHeadPos,
      direction: currentDir
    }
  });

  // Connections (movement path)
  stepsToRender.forEach((step, idx) => {
    connections.push({
      id: `seek-${idx}`,
      sourceId: `track-${step.start_cylinder}`,
      targetId: `track-${step.end_cylinder}`,
      active: idx === safeStep - 1,
    });
  });

  return {
    entities,
    connections,
    currentTime: currentStep,
    currentStep,
    totalSteps: result.movement_steps.length,
  };
}
