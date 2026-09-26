import os

base_dir = "oscope/backend"
frontend_dir = "oscope/frontend"

files = {
    "app/db/database.py": """\
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker

SQLALCHEMY_DATABASE_URL = "sqlite:///./oscope.db"
# check_same_thread=False is needed for SQLite in FastAPI
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
""",
    "app/db/models.py": """\
from sqlalchemy import Column, Integer, String, JSON, DateTime
import datetime
from .database import Base

class Experiment(Base):
    __tablename__ = "experiments"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, default="Untitled Experiment")
    algorithm = Column(String, index=True)
    time_quantum = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    # store full json strings or dicts
    processes = Column(JSON)
    simulation_result = Column(JSON)
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
""",
    "app/api/endpoints/history.py": """\
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db import models
from app.models.requests import HistoryCreateRequest
import datetime

router = APIRouter()

@router.post("")
def save_experiment(req: HistoryCreateRequest, db: Session = Depends(get_db)):
    db_exp = models.Experiment(
        name=req.name,
        algorithm=req.algorithm,
        time_quantum=req.time_quantum,
        processes=[p.model_dump() for p in req.processes],
        simulation_result=req.simulation_result.model_dump()
    )
    db.add(db_exp)
    db.commit()
    db.refresh(db_exp)
    return {"id": db_exp.id, "status": "saved"}

@router.get("")
def list_experiments(db: Session = Depends(get_db)):
    exps = db.query(models.Experiment).order_by(models.Experiment.created_at.desc()).all()
    return [{
        "id": e.id,
        "name": e.name,
        "algorithm": e.algorithm,
        "created_at": e.created_at.isoformat()
    } for e in exps]

@router.get("/{exp_id}")
def get_experiment(exp_id: int, db: Session = Depends(get_db)):
    exp = db.query(models.Experiment).filter(models.Experiment.id == exp_id).first()
    if not exp:
        raise HTTPException(status_code=404, detail="Experiment not found")
    return {
        "id": exp.id,
        "name": exp.name,
        "algorithm": exp.algorithm,
        "time_quantum": exp.time_quantum,
        "created_at": exp.created_at.isoformat(),
        "processes": exp.processes,
        "simulation_result": exp.simulation_result
    }

@router.delete("/{exp_id}")
def delete_experiment(exp_id: int, db: Session = Depends(get_db)):
    exp = db.query(models.Experiment).filter(models.Experiment.id == exp_id).first()
    if not exp:
        raise HTTPException(status_code=404, detail="Experiment not found")
    db.delete(exp)
    db.commit()
    return {"status": "deleted"}
""",
    "app/api/router.py": """\
from fastapi import APIRouter
from app.api.endpoints import health, simulate, compare, history

api_router = APIRouter()
api_router.include_router(health.router, tags=["Health"])
api_router.include_router(simulate.router, tags=["Simulation"])
api_router.include_router(compare.router, tags=["Comparison"])
api_router.include_router(history.router, prefix="/history", tags=["History"])
""",
    "app/main.py": """\
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.router import api_router
from app.db.database import engine, Base

# Create DB tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="OScope CPU Scheduling API",
    description="Backend API for OScope CPU Scheduling Simulator",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")
""",
    "tests/test_history.py": """\
import pytest, sys, os; sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_history_flow():
    # Save an experiment
    payload = {
        "name": "Test Exp",
        "algorithm": "FCFS",
        "processes": [{"id": "P1", "arrival_time": 0, "burst_time": 5}],
        "simulation_result": {
            "gantt_chart": [{"process_id": "P1", "start_time": 0, "end_time": 5}],
            "metrics": {
                "process_metrics": [],
                "average_turnaround_time": 5,
                "average_waiting_time": 0,
                "average_response_time": 0,
                "cpu_utilization": 100,
                "throughput": 0.2
            }
        }
    }
    res = client.post("/api/v1/history", json=payload)
    assert res.status_code == 200
    exp_id = res.json()["id"]

    # List experiments
    res = client.get("/api/v1/history")
    assert res.status_code == 200
    assert len(res.json()) >= 1
    assert res.json()[0]["name"] == "Test Exp"

    # Get experiment
    res = client.get(f"/api/v1/history/{exp_id}")
    assert res.status_code == 200
    assert res.json()["algorithm"] == "FCFS"
    assert res.json()["processes"][0]["id"] == "P1"

    # Delete experiment
    res = client.delete(f"/api/v1/history/{exp_id}")
    assert res.status_code == 200

    # Get non-existent
    res = client.get(f"/api/v1/history/{exp_id}")
    assert res.status_code == 404
"""
}

frontend_files = {
    "src/types/index.ts": """\
export interface Process {
  id: string;
  arrival_time: number;
  burst_time: number;
  priority?: number;
}

export interface GanttEvent {
  process_id: string;
  start_time: number;
  end_time: number;
}

export interface ProcessMetrics {
  process_id: string;
  completion_time: number;
  turnaround_time: number;
  waiting_time: number;
  response_time: number;
}

export interface SimulationMetrics {
  process_metrics: ProcessMetrics[];
  average_turnaround_time: number;
  average_waiting_time: number;
  average_response_time: number;
  cpu_utilization: number;
  throughput: number;
}

export interface SimulationResult {
  gantt_chart: GanttEvent[];
  metrics: SimulationMetrics;
}

export interface SimulationRequest {
  algorithm: string;
  processes: Process[];
  time_quantum?: number;
}

export interface ExperimentSummary {
  id: number;
  name: string;
  algorithm: string;
  created_at: string;
}

export interface ExperimentDetails extends ExperimentSummary {
  time_quantum?: number;
  processes: Process[];
  simulation_result: SimulationResult;
}
""",
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
  deleteHistory: (id: number) => client.delete(`/history/${id}`)
};
""",
    "src/features/simulator/ResultsView.tsx": """\
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
""",
    "src/app/router.tsx": """\
import { Routes, Route } from 'react-router-dom';
import { Dashboard } from '../pages/Dashboard';
import { Simulator } from '../pages/Simulator';
import { Compare } from '../pages/Compare';
import { History } from '../pages/History';

export function Router() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/simulator" element={<Simulator />} />
      <Route path="/compare" element={<Compare />} />
      <Route path="/history" element={<History />} />
      <Route path="/about" element={<div>About OScope Placeholder</div>} />
    </Routes>
  );
}
""",
    "src/pages/Compare.tsx": """\
import { useState } from 'react';
import { useSimulatorStore } from '../store/useSimulatorStore';
import { api } from '../services/api';
import { SimulationResult } from '../types';

export function Compare() {
  const { processes, timeQuantum } = useSimulatorStore();
  const [selectedAlgos, setSelectedAlgos] = useState<string[]>([]);
  const [results, setResults] = useState<Record<string, SimulationResult> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleAlgo = (alg: string) => {
    setSelectedAlgos(prev => prev.includes(alg) ? prev.filter(a => a !== alg) : [...prev, alg]);
  };

  const handleCompare = async () => {
    if (selectedAlgos.length < 2) {
      setError('Please select at least two algorithms to compare.');
      return;
    }
    if (processes.length === 0) {
      setError('Workload is empty. Go to Simulator to add processes.');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const res = await api.compare({
        algorithms: selectedAlgos,
        processes,
        time_quantum: timeQuantum
      });
      setResults(res.data);
    } catch (e: any) {
      setError(e.response?.data?.detail || e.message);
    } finally {
      setLoading(false);
    }
  };

  const algos = ['FCFS', 'SJF', 'SRTF', 'RR', 'PRIORITY_NP', 'PRIORITY_P'];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Compare Algorithms</h2>
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="font-bold mb-4">Select Algorithms</h3>
        <div className="flex gap-4 flex-wrap mb-4">
          {algos.map(a => (
            <label key={a} className="flex items-center gap-2">
              <input type="checkbox" checked={selectedAlgos.includes(a)} onChange={() => toggleAlgo(a)} />
              {a}
            </label>
          ))}
        </div>
        <button onClick={handleCompare} disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded">
          {loading ? 'Comparing...' : 'Compare'}
        </button>
        {error && <p className="text-red-600 mt-2">{error}</p>}
      </div>

      {results && (
        <div className="bg-white p-6 rounded-lg shadow overflow-x-auto">
          <h3 className="font-bold mb-4">Comparison Results</h3>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b">
                <th className="p-3">Algorithm</th>
                <th className="p-3">Avg Wait Time</th>
                <th className="p-3">Avg Turnaround</th>
                <th className="p-3">Avg Response</th>
                <th className="p-3">CPU Util (%)</th>
                <th className="p-3">Throughput</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(results).map(([alg, res]) => (
                <tr key={alg} className="border-b">
                  <td className="p-3 font-bold">{alg}</td>
                  <td className="p-3">{res.metrics.average_waiting_time.toFixed(2)}</td>
                  <td className="p-3">{res.metrics.average_turnaround_time.toFixed(2)}</td>
                  <td className="p-3">{res.metrics.average_response_time.toFixed(2)}</td>
                  <td className="p-3">{res.metrics.cpu_utilization.toFixed(1)}</td>
                  <td className="p-3">{res.metrics.throughput.toFixed(3)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
""",
    "src/pages/History.tsx": """\
import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { ExperimentSummary, ExperimentDetails } from '../types';

export function History() {
  const [exps, setExps] = useState<ExperimentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedExp, setSelectedExp] = useState<ExperimentDetails | null>(null);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await api.listHistory();
      setExps(res.data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleOpen = async (id: number) => {
    try {
      const res = await api.getHistory(id);
      setSelectedExp(res.data);
    } catch (e: any) {
      alert('Failed to load experiment');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this experiment?')) return;
    try {
      await api.deleteHistory(id);
      if (selectedExp?.id === id) setSelectedExp(null);
      fetchHistory();
    } catch (e: any) {
      alert('Failed to delete experiment');
    }
  };

  if (loading) return <p>Loading history...</p>;
  if (error) return <p className="text-red-600">Error: {error}</p>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Experiment History</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="font-bold mb-4">Saved Experiments</h3>
          {exps.length === 0 ? <p className="text-slate-500">No history found.</p> : (
            <ul className="space-y-2">
              {exps.map(exp => (
                <li key={exp.id} className="p-3 border rounded flex justify-between items-center hover:bg-slate-50">
                  <div>
                    <p className="font-bold">{exp.name}</p>
                    <p className="text-xs text-slate-500">{exp.algorithm} | {new Date(exp.created_at).toLocaleString()}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleOpen(exp.id)} className="text-blue-600 text-sm">Open</button>
                    <button onClick={() => handleDelete(exp.id)} className="text-red-600 text-sm">Delete</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        
        {selectedExp && (
          <div className="bg-white p-6 rounded-lg shadow space-y-4">
            <h3 className="font-bold">Details: {selectedExp.name}</h3>
            <p className="text-sm"><span className="font-semibold">Algorithm:</span> {selectedExp.algorithm}</p>
            <p className="text-sm"><span className="font-semibold">Processes:</span> {selectedExp.processes.length}</p>
            <h4 className="font-semibold mt-4">Metrics</h4>
            <ul className="text-sm space-y-1">
              <li>Avg Wait: {selectedExp.simulation_result.metrics.average_waiting_time.toFixed(2)}</li>
              <li>Avg TAT: {selectedExp.simulation_result.metrics.average_turnaround_time.toFixed(2)}</li>
              <li>Util: {selectedExp.simulation_result.metrics.cpu_utilization.toFixed(1)}%</li>
            </ul>
            <h4 className="font-semibold mt-4">Timeline</h4>
            <div className="flex gap-1 overflow-x-auto pb-2">
              {selectedExp.simulation_result.gantt_chart.map((ev, idx) => (
                <div key={idx} className="flex flex-col items-center min-w-[40px]">
                  <div className="w-full py-1 text-center text-white text-[10px] rounded bg-slate-700">
                    {ev.process_id}
                  </div>
                  <div className="text-[10px] mt-1 text-slate-500">
                    {ev.start_time}-{ev.end_time}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
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
