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
