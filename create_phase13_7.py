import os
import json

# Base paths
WORKSPACE_DIR = r"c:\Users\marat\Downloads\3 rd Year\OS_LAB\Operating_system_CP"
FRONTEND_DIR = os.path.join(WORKSPACE_DIR, "oscope", "frontend")
BACKEND_DIR = os.path.join(WORKSPACE_DIR, "oscope", "backend")

# Frontend feature structure
INTELLIGENCE_DIR = os.path.join(FRONTEND_DIR, "src", "features", "intelligence")

DIRS = [
    os.path.join(INTELLIGENCE_DIR, "types"),
    os.path.join(INTELLIGENCE_DIR, "cpu"),
    os.path.join(INTELLIGENCE_DIR, "memory"),
    os.path.join(INTELLIGENCE_DIR, "disk"),
    os.path.join(INTELLIGENCE_DIR, "deadlock"),
    os.path.join(INTELLIGENCE_DIR, "scoring"),
    os.path.join(INTELLIGENCE_DIR, "explanations"),
    os.path.join(INTELLIGENCE_DIR, "adapters"),
    os.path.join(INTELLIGENCE_DIR, "store"),
    os.path.join(INTELLIGENCE_DIR, "components"),
    os.path.join(BACKEND_DIR, "app", "intelligence", "analyzers"),
    os.path.join(BACKEND_DIR, "app", "intelligence", "scoring"),
    os.path.join(BACKEND_DIR, "app", "intelligence", "explanations")
]

for d in DIRS:
    os.makedirs(d, exist_ok=True)

# 1. Types
TYPES = {
    "intelligence.ts": """
export type Domain = 'CPU' | 'Memory' | 'Disk' | 'Deadlock';

export interface Observation {
  category: string;
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'critical';
  evidence: string[];
}

export interface Tradeoff {
  metricA: string;
  metricB: string;
  relationship: string;
  explanation: string;
}

export interface Recommendation {
  algorithm: string;
  score: number;
  confidence: number;
  reasons: string[];
  strengths: string[];
  weaknesses: string[];
  metrics: Record<string, number>;
}

export interface IntelligenceResult {
  domain: Domain;
  summary: string;
  observations: Observation[];
  recommendations: Recommendation[];
  rankings: string[];
  tradeoffs: Tradeoff[];
  warnings: string[];
  confidence: number;
  evidence: string[];
  generatedAt: string;
}
"""
}

# 2. CPU
CPU = {
    "workloadAnalyzer.ts": """
export function analyzeWorkload(workload: any) {
  return {
    processCount: workload.length,
    averageBurstTime: 0,
    burstVariance: 0,
    burstStandardDeviation: 0,
    classification: ['SHORT_BURST']
  };
}
""",
    "cpuRecommendation.ts": """
export function getCpuRecommendation(simResults: any[]) {
  return null;
}
"""
}

# Write files
def write_dict(base_path, files_dict):
    for filename, content in files_dict.items():
        with open(os.path.join(base_path, filename), "w", encoding="utf-8") as f:
            f.write(content.strip() + "\n")

write_dict(os.path.join(INTELLIGENCE_DIR, "types"), TYPES)
write_dict(os.path.join(INTELLIGENCE_DIR, "cpu"), CPU)

with open(os.path.join(INTELLIGENCE_DIR, "store", "useIntelligenceStore.ts"), "w", encoding="utf-8") as f:
    f.write("""
import { create } from 'zustand';

interface IntelligenceState {
  currentAnalysis: any | null;
  selectedObjectiveWeights: Record<string, number>;
  loading: boolean;
  error: string | null;
}

export const useIntelligenceStore = create<IntelligenceState>((set) => ({
  currentAnalysis: null,
  selectedObjectiveWeights: {
    waitingTime: 0.25,
    turnaroundTime: 0.20,
    responseTime: 0.20,
    throughput: 0.15,
    cpuUtilization: 0.10,
    contextSwitchCost: 0.10
  },
  loading: false,
  error: null
}));
""".strip() + "\n")

with open(os.path.join(INTELLIGENCE_DIR, "components", "IntelligencePanel.tsx"), "w", encoding="utf-8") as f:
    f.write("""
import React from 'react';
import { useIntelligenceStore } from '../store/useIntelligenceStore';

export const IntelligencePanel: React.FC = () => {
  const { currentAnalysis } = useIntelligenceStore();

  return (
    <div className="intelligence-panel">
      <h2>Intelligence Engine</h2>
      {currentAnalysis ? (
        <div>
           {/* Render analysis here */}
        </div>
      ) : (
        <p>No intelligence data exists. Run an analysis.</p>
      )}
    </div>
  );
};
""".strip() + "\n")

# Backend files
with open(os.path.join(BACKEND_DIR, "app", "intelligence", "__init__.py"), "w") as f:
    f.write("")

print("Phase 13.7 files created successfully!")
