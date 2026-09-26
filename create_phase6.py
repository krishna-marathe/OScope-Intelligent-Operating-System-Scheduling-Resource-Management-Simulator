import os

base_dir = "oscope/backend"
frontend_dir = "oscope/frontend"

files = {
    "app/ml/__init__.py": "",
    "app/ml/features.py": """\
import numpy as np
from typing import List
from app.models.schemas import Process

def extract_features(processes: List[Process]) -> List[float]:
    if not processes:
        return [0.0] * 8
    
    burst_times = [p.burst_time for p in processes]
    arrival_times = [p.arrival_time for p in processes]
    priorities = [p.priority or 0 for p in processes]
    
    return [
        float(len(processes)),
        float(np.mean(burst_times)),
        float(np.median(burst_times)),
        float(np.min(burst_times)),
        float(np.max(burst_times)),
        float(np.std(burst_times)),
        float(np.mean(arrival_times)),
        float(np.max(arrival_times) - np.min(arrival_times))
    ]
""",
    "app/ml/train.py": """\
import os
import random
import numpy as np
import joblib
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report
from sklearn.model_selection import train_test_split
from app.models.schemas import Process
from app.ml.features import extract_features
from app.services.simulation import SimulationService
from app.models.requests import ComparisonRequest

ALGORITHMS = ["FCFS", "SJF", "SRTF", "RR", "PRIORITY_NP", "PRIORITY_P"]
TIME_QUANTUM = 2

def generate_workloads(n=200):
    np.random.seed(42)
    random.seed(42)
    workloads = []
    for i in range(n):
        num_proc = random.randint(3, 10)
        processes = []
        for j in range(num_proc):
            processes.append(Process(
                id=f"P{j+1}",
                arrival_time=random.randint(0, 15),
                burst_time=random.randint(1, 20),
                priority=random.randint(1, 5)
            ))
        workloads.append(processes)
    return workloads

def get_best_algorithm(workload, objective):
    req = ComparisonRequest(algorithms=ALGORITHMS, processes=workload, time_quantum=TIME_QUANTUM)
    results = SimulationService.compare(req)
    
    best_algo = None
    best_val = float('inf')
    
    for algo, res in results.items():
        if objective == "awt":
            val = res.metrics.average_waiting_time
        elif objective == "atat":
            val = res.metrics.average_turnaround_time
        else:
            val = res.metrics.average_response_time
            
        if val < best_val:
            best_val = val
            best_algo = algo
        elif val == best_val:
            if best_algo is None or algo < best_algo:
                best_algo = algo # tie-break lexicographical
                
    return best_algo

def train_model():
    print("Generating synthetic workloads...")
    workloads = generate_workloads(300)
    
    print("Extracting features and labels for objective: AWT...")
    X = [extract_features(w) for w in workloads]
    y = [get_best_algorithm(w, "awt") for w in workloads]
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    clf = RandomForestClassifier(n_estimators=100, random_state=42)
    clf.fit(X_train, y_train)
    
    y_pred = clf.predict(X_test)
    print("Accuracy:", accuracy_score(y_test, y_pred))
    print(classification_report(y_test, y_pred, zero_division=0))
    
    model_path = os.path.join(os.path.dirname(__file__), "model.joblib")
    joblib.dump(clf, model_path)
    print(f"Model saved to {model_path}")

if __name__ == "__main__":
    train_model()
""",
    "app/ml/predict.py": """\
import os
import joblib
from app.ml.features import extract_features

MODEL_PATH = os.path.join(os.path.dirname(__file__), "model.joblib")
_model = None

def get_model():
    global _model
    if _model is None:
        if os.path.exists(MODEL_PATH):
            _model = joblib.load(MODEL_PATH)
    return _model

def recommend(processes):
    model = get_model()
    if not model:
        raise RuntimeError("ML model artifact not found.")
    
    features = extract_features(processes)
    # Predict probabilities to get confidence
    probs = model.predict_proba([features])[0]
    best_idx = probs.argmax()
    predicted_algo = model.classes_[best_idx]
    confidence = probs[best_idx]
    
    return {
        "algorithm": predicted_algo,
        "confidence": float(confidence),
        "explanation": "Recommendation based on Random Forest prediction over workload burst and arrival variance."
    }
""",
    "app/models/requests.py": """\
from pydantic import BaseModel, Field, field_validator
from typing import List, Optional, Any
from app.models.schemas import Process, SimulationResult

class SimulationRequest(BaseModel):
    algorithm: str = Field(..., description="Algorithm identifier")
    processes: List[Process] = Field(..., min_length=1)
    time_quantum: Optional[int] = Field(default=None)

    @field_validator('processes')
    def check_duplicate_ids(cls, v):
        ids = [p.id for p in v]
        if len(ids) != len(set(ids)):
            raise ValueError('Duplicate process IDs are not allowed')
        return v

class ComparisonRequest(BaseModel):
    algorithms: List[str] = Field(..., min_length=1)
    processes: List[Process] = Field(..., min_length=1)
    time_quantum: Optional[int] = Field(default=None)

    @field_validator('processes')
    def check_duplicate_ids(cls, v):
        ids = [p.id for p in v]
        if len(ids) != len(set(ids)):
            raise ValueError('Duplicate process IDs are not allowed')
        return v

class HistoryCreateRequest(BaseModel):
    name: str = "Untitled Experiment"
    algorithm: str
    time_quantum: Optional[int] = None
    processes: List[Process]
    simulation_result: SimulationResult

class RecommendRequest(BaseModel):
    processes: List[Process] = Field(..., min_length=1)
    objective: str = Field("awt", description="Optimization objective, e.g. awt")
    
    @field_validator('processes')
    def check_duplicate_ids(cls, v):
        ids = [p.id for p in v]
        if len(ids) != len(set(ids)):
            raise ValueError('Duplicate process IDs are not allowed')
        return v
""",
    "app/api/endpoints/recommend.py": """\
from fastapi import APIRouter, HTTPException
from app.models.requests import RecommendRequest
from app.ml.predict import recommend

router = APIRouter()

@router.post("")
def get_recommendation(req: RecommendRequest):
    try:
        res = recommend(req.processes)
        return {
            "algorithm": res["algorithm"],
            "objective": req.objective,
            "version": "1.0",
            "confidence": res["confidence"],
            "explanation": res["explanation"]
        }
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
""",
    "app/api/router.py": """\
from fastapi import APIRouter
from app.api.endpoints import health, simulate, compare, history, recommend

api_router = APIRouter()
api_router.include_router(health.router, tags=["Health"])
api_router.include_router(simulate.router, tags=["Simulation"])
api_router.include_router(compare.router, tags=["Comparison"])
api_router.include_router(history.router, prefix="/history", tags=["History"])
api_router.include_router(recommend.router, prefix="/recommend", tags=["Recommend"])
""",
    "tests/test_ml.py": """\
import pytest, sys, os; sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from fastapi.testclient import TestClient
from app.main import app
from app.ml.features import extract_features
from app.models.schemas import Process

client = TestClient(app)

def test_feature_extraction():
    processes = [
        Process(id="P1", arrival_time=0, burst_time=5, priority=1),
        Process(id="P2", arrival_time=2, burst_time=3, priority=2)
    ]
    features = extract_features(processes)
    assert len(features) == 8
    assert features[0] == 2.0 # count
    assert features[3] == 3.0 # min burst

def test_recommend_endpoint_no_model():
    # If model is not there, we expect 503
    import app.ml.predict as predict
    old_model = predict._model
    predict._model = None
    
    payload = {
        "processes": [{"id": "P1", "arrival_time": 0, "burst_time": 5}],
        "objective": "awt"
    }
    
    res = client.post("/api/v1/recommend", json=payload)
    if os.path.exists(predict.MODEL_PATH):
        assert res.status_code == 200
    else:
        assert res.status_code == 503
    
    predict._model = old_model
"""
}

frontend_files = {
    "src/services/api.ts": """\
import axios from 'axios';
import { SimulationRequest, SimulationResult, ExperimentSummary, ExperimentDetails } from '../types';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

const client = axios.create({
  baseURL: `${BASE_URL}/api/v1`
});

export const api = {
  health: () => client.get('/health'),
  simulate: (req: SimulationRequest) => client.post<SimulationResult>('/simulate', req),
  compare: (req: any) => client.post('/compare', req),
  saveHistory: (req: any) => client.post('/history', req),
  listHistory: () => client.get<ExperimentSummary[]>('/history'),
  getHistory: (id: number) => client.get<ExperimentDetails>(`/history/${id}`),
  deleteHistory: (id: number) => client.delete(`/history/${id}`),
  recommend: (req: any) => client.post('/recommend', req)
};
""",
    "src/features/simulator/RecommendPanel.tsx": """\
import { useState } from 'react';
import { useSimulatorStore } from '../../store/useSimulatorStore';
import { api } from '../../services/api';

export function RecommendPanel() {
  const { processes, setAlgorithm } = useSimulatorStore();
  const [objective, setObjective] = useState('awt');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recommendation, setRecommendation] = useState<any>(null);

  const handleRecommend = async () => {
    if (processes.length === 0) return;
    try {
      setLoading(true);
      setError(null);
      const res = await api.recommend({ processes, objective });
      setRecommendation(res.data);
    } catch (e: any) {
      setError(e.response?.data?.detail || e.message);
    } finally {
      setLoading(false);
    }
  };

  const applyRecommendation = () => {
    if (recommendation) {
      setAlgorithm(recommendation.algorithm);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow mt-6 border-l-4 border-purple-500">
      <h3 className="text-lg font-bold mb-2">AI Algorithm Recommendation</h3>
      <p className="text-sm text-slate-600 mb-4">
        Our ML model predicts the most optimal scheduling algorithm based on synthetic workload simulations.
      </p>
      
      <div className="flex items-center gap-4 mb-4">
        <select value={objective} onChange={e => setObjective(e.target.value)} className="border p-2 rounded">
          <option value="awt">Minimize Wait Time</option>
          <option value="atat">Minimize Turnaround</option>
        </select>
        <button onClick={handleRecommend} disabled={loading || processes.length === 0} className="bg-purple-600 text-white px-4 py-2 rounded disabled:opacity-50">
          {loading ? 'Analyzing...' : 'Get Recommendation'}
        </button>
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      {recommendation && (
        <div className="bg-purple-50 p-4 rounded mt-4">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="font-bold text-lg text-purple-900">Predicted: {recommendation.algorithm}</p>
              <p className="text-sm text-purple-700">Confidence: {(recommendation.confidence * 100).toFixed(1)}%</p>
            </div>
            <button onClick={applyRecommendation} className="bg-purple-600 text-white px-3 py-1 text-sm rounded">
              Apply to Simulator
            </button>
          </div>
          <p className="text-sm text-purple-800 italic mt-2">{recommendation.explanation}</p>
        </div>
      )}
    </div>
  );
}
""",
    "src/pages/Simulator.tsx": """\
import { WorkloadEditor } from '../features/simulator/WorkloadEditor';
import { AlgorithmSelector } from '../features/simulator/AlgorithmSelector';
import { ResultsView } from '../features/simulator/ResultsView';
import { RecommendPanel } from '../features/simulator/RecommendPanel';
import { useSimulatorStore } from '../store/useSimulatorStore';
import { api } from '../services/api';

export function Simulator() {
  const { 
    processes, algorithm, timeQuantum, 
    setResult, setLoading, setError, loading, error 
  } = useSimulatorStore();

  const handleSimulate = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.simulate({
        algorithm,
        processes,
        time_quantum: algorithm === 'RR' ? timeQuantum : undefined
      });
      setResult(res.data);
    } catch (e: any) {
      setError(e.response?.data?.detail || e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-bold mb-4">Workload</h3>
          <WorkloadEditor />
        </div>
        <div className="flex flex-col gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-bold mb-4">Configuration</h3>
            <AlgorithmSelector />
            <button 
              data-testid="simulate-btn"
              onClick={handleSimulate}
              disabled={processes.length === 0 || loading}
              className="mt-4 w-full bg-blue-600 text-white py-2 rounded disabled:opacity-50"
            >
              {loading ? 'Simulating...' : 'Simulate'}
            </button>
            {error && <div className="mt-4 text-red-600" data-testid="error-msg">{error}</div>}
          </div>
        </div>
      </div>
      <RecommendPanel />
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-bold mb-4">Results</h3>
        <ResultsView />
      </div>
    </div>
  );
}
""",
    "src/tests/Recommend.test.tsx": """\
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { expect, test, vi, beforeEach } from 'vitest';
import { RecommendPanel } from '../features/simulator/RecommendPanel';
import { useSimulatorStore } from '../store/useSimulatorStore';
import { api } from '../services/api';

vi.mock('../services/api', () => ({
  api: {
    recommend: vi.fn()
  }
}));

beforeEach(() => {
  useSimulatorStore.setState({
    processes: [
      { id: 'P1', arrival_time: 0, burst_time: 2 }
    ],
    algorithm: 'FCFS'
  });
});

test('Requests recommendation and applies it', async () => {
  (api.recommend as any).mockResolvedValueOnce({
    data: {
      algorithm: 'SRTF',
      confidence: 0.85,
      explanation: 'Prediction based on burst variance.',
      objective: 'awt'
    }
  });

  render(<RecommendPanel />);
  
  fireEvent.click(screen.getByText('Get Recommendation'));
  
  await waitFor(() => {
    expect(screen.getByText('Predicted: SRTF')).toBeInTheDocument();
  });
  
  // Apply
  fireEvent.click(screen.getByText('Apply to Simulator'));
  expect(useSimulatorStore.getState().algorithm).toBe('SRTF');
});
"""
}

for rel_path, content in files.items():
    full_path = os.path.join(base_dir, rel_path)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, "w") as f:
        f.write(content)

for rel_path, content in frontend_files.items():
    full_path = os.path.join(frontend_dir, rel_path)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, "w") as f:
        f.write(content)
