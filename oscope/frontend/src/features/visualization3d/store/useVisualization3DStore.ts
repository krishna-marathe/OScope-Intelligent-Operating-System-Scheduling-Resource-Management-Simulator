import { create } from 'zustand';
import { VisualEntity } from '../models/visualizationModel';

interface Visualization3DState {
  is3DMode: boolean;
  selectedEntity: VisualEntity | null;
  hoveredEntity: VisualEntity | null;
  showGrid: boolean;
  showLabels: boolean;
  
  toggle3DMode: () => void;
  set3DMode: (active: boolean) => void;
  setSelectedEntity: (entity: VisualEntity | null) => void;
  setHoveredEntity: (entity: VisualEntity | null) => void;
  toggleGrid: () => void;
  toggleLabels: () => void;
}

export const useVisualization3DStore = create<Visualization3DState>((set) => ({
  is3DMode: false,
  selectedEntity: null,
  hoveredEntity: null,
  showGrid: true,
  showLabels: true,
  
  toggle3DMode: () => set((state) => ({ is3DMode: !state.is3DMode })),
  set3DMode: (active: boolean) => set({ is3DMode: active }),
  setSelectedEntity: (entity) => set({ selectedEntity: entity }),
  setHoveredEntity: (entity) => set({ hoveredEntity: entity }),
  toggleGrid: () => set((state) => ({ showGrid: !state.showGrid })),
  toggleLabels: () => set((state) => ({ showLabels: !state.showLabels })),
}));
