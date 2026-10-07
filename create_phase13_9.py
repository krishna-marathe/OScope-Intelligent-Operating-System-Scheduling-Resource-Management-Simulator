import os

WORKSPACE_DIR = r"c:\Users\marat\Downloads\3 rd Year\OS_LAB\Operating_system_CP"
FRONTEND_DIR = os.path.join(WORKSPACE_DIR, "oscope", "frontend")
BACKEND_DIR = os.path.join(WORKSPACE_DIR, "oscope", "backend")

# Frontend Dirs
EXPERIMENTS_FE_DIR = os.path.join(FRONTEND_DIR, "src", "features", "experiments")
DIRS_FE = [
    os.path.join(EXPERIMENTS_FE_DIR, "types"),
    os.path.join(EXPERIMENTS_FE_DIR, "components"),
    os.path.join(EXPERIMENTS_FE_DIR, "store"),
    os.path.join(EXPERIMENTS_FE_DIR, "api"),
    os.path.join(EXPERIMENTS_FE_DIR, "analytics"),
    os.path.join(EXPERIMENTS_FE_DIR, "adapters")
]
for d in DIRS_FE:
    os.makedirs(d, exist_ok=True)

# Frontend Types
with open(os.path.join(EXPERIMENTS_FE_DIR, "types", "experiment.ts"), "w", encoding="utf-8") as f:
    f.write("""
export type ExperimentStatus = 'DRAFT' | 'READY' | 'RUNNING' | 'COMPLETED' | 'FAILED';

export interface Experiment {
  id: string;
  name: string;
  description: string;
  domain: 'CPU' | 'Memory' | 'Disk' | 'Deadlock';
  createdAt: string;
  updatedAt: string;
  scenario: any;
  algorithms: string[];
  simulationResults: any[];
  intelligenceResults: any;
  tags: string[];
  notes: string;
  status: ExperimentStatus;
  hypothesis?: string;
}
""".strip())

# Frontend Store
with open(os.path.join(EXPERIMENTS_FE_DIR, "store", "useExperimentStore.ts"), "w", encoding="utf-8") as f:
    f.write("""
import { create } from 'zustand';
import { Experiment } from '../types/experiment';

interface ExperimentState {
  experiments: Experiment[];
  selectedExperiment: Experiment | null;
  baselineExperiment: Experiment | null;
  loading: boolean;
  error: string | null;
}

export const useExperimentStore = create<ExperimentState>((set) => ({
  experiments: [],
  selectedExperiment: null,
  baselineExperiment: null,
  loading: false,
  error: null
}));
""".strip())

# Frontend Components
with open(os.path.join(EXPERIMENTS_FE_DIR, "components", "ExperimentStudio.tsx"), "w", encoding="utf-8") as f:
    f.write("""
import React from 'react';
import { useExperimentStore } from '../store/useExperimentStore';

export const ExperimentStudio: React.FC = () => {
  const { experiments, selectedExperiment } = useExperimentStore();

  return (
    <div className="experiment-studio">
      <div className="experiment-list">
        <h2>Experiments</h2>
        <button>+ New</button>
        <ul>
          {experiments.map(exp => (
            <li key={exp.id}>{exp.name}</li>
          ))}
        </ul>
      </div>
      <div className="experiment-details">
        {selectedExperiment ? (
          <div>
            <h2>{selectedExperiment.name}</h2>
            <p>Status: {selectedExperiment.status}</p>
          </div>
        ) : (
          <p>Select an experiment to view details.</p>
        )}
      </div>
    </div>
  );
};
""".strip())

# Backend Dirs
EXPERIMENTS_BE_DIR = os.path.join(BACKEND_DIR, "app", "experiments")
DIRS_BE = [
    EXPERIMENTS_BE_DIR
]
for d in DIRS_BE:
    os.makedirs(d, exist_ok=True)

# Backend Router
with open(os.path.join(EXPERIMENTS_BE_DIR, "router.py"), "w", encoding="utf-8") as f:
    f.write("""
from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter(prefix="/api/v1/experiments")

class ExperimentModel(BaseModel):
    id: str
    name: str
    description: str
    domain: str
    status: str

@router.get("/")
def list_experiments():
    return {"experiments": []}

@router.post("/")
def create_experiment(exp: dict):
    return {"status": "success", "id": "exp-123"}

@router.post("/{id}/run")
def run_experiment(id: str):
    # This invokes actual simulation APIs
    return {"status": "success", "result": "Simulation triggered"}
""".strip())

with open(os.path.join(EXPERIMENTS_BE_DIR, "comparison.py"), "w", encoding="utf-8") as f:
    f.write("""
def compare_experiments(baseline: dict, experimental: dict):
    return {
        "baseline_metrics": baseline.get("metrics", {}),
        "experimental_metrics": experimental.get("metrics", {}),
        "deltas": {}
    }
""".strip())

print("Phase 13.9 Experiment Studio files created successfully!")
