import os

base_dir = "oscope/backend"

files = {
    "app/models/requests.py": """\
from pydantic import BaseModel, Field, field_validator
from typing import List, Optional
from app.models.schemas import Process

class SimulationRequest(BaseModel):
    algorithm: str = Field(..., description="Algorithm identifier (e.g., FCFS, SJF, SRTF, RR, PRIORITY_NP, PRIORITY_P)")
    processes: List[Process] = Field(..., min_length=1, description="List of processes to simulate")
    time_quantum: Optional[int] = Field(default=None, description="Time quantum for Round Robin")

    @field_validator('processes')
    def check_duplicate_ids(cls, v):
        ids = [p.id for p in v]
        if len(ids) != len(set(ids)):
            raise ValueError('Duplicate process IDs are not allowed')
        return v

class ComparisonRequest(BaseModel):
    algorithms: List[str] = Field(..., min_length=1, description="List of algorithms to compare")
    processes: List[Process] = Field(..., min_length=1, description="List of processes to simulate")
    time_quantum: Optional[int] = Field(default=None, description="Time quantum for Round Robin")

    @field_validator('processes')
    def check_duplicate_ids(cls, v):
        ids = [p.id for p in v]
        if len(ids) != len(set(ids)):
            raise ValueError('Duplicate process IDs are not allowed')
        return v
""",
    "app/services/simulation.py": """\
from typing import Dict, Any
import copy
from app.models.requests import SimulationRequest, ComparisonRequest
from app.models.schemas import SimulationResult
from app.scheduling.registry import SchedulingAlgorithmRegistry

class SimulationService:
    @staticmethod
    def simulate(request: SimulationRequest) -> SimulationResult:
        scheduler = SchedulingAlgorithmRegistry.get_scheduler(request.algorithm)
        if request.algorithm.upper() == "RR" and (request.time_quantum is None or request.time_quantum <= 0):
            raise ValueError("Round Robin requires a positive time_quantum.")
        
        return scheduler.simulate(request.processes, time_quantum=request.time_quantum)

    @staticmethod
    def compare(request: ComparisonRequest) -> Dict[str, SimulationResult]:
        results = {}
        for algo in request.algorithms:
            scheduler = SchedulingAlgorithmRegistry.get_scheduler(algo)
            if algo.upper() == "RR" and (request.time_quantum is None or request.time_quantum <= 0):
                raise ValueError(f"Algorithm {algo} requires a positive time_quantum.")
            processes_copy = copy.deepcopy(request.processes)
            results[algo.upper()] = scheduler.simulate(processes_copy, time_quantum=request.time_quantum)
        return results
""",
    "app/api/endpoints/__init__.py": "",
    "app/api/endpoints/health.py": """\
from fastapi import APIRouter
from app.scheduling.registry import SchedulingAlgorithmRegistry

router = APIRouter()

@router.get("/health")
def health_check():
    return {
        "status": "ok",
        "version": "1.0",
        "scheduling_engine": "available"
    }
""",
    "app/api/endpoints/simulate.py": """\
from fastapi import APIRouter, HTTPException
from app.models.requests import SimulationRequest
from app.models.schemas import SimulationResult
from app.services.simulation import SimulationService

router = APIRouter()

@router.post("/simulate", response_model=SimulationResult)
def simulate(request: SimulationRequest):
    try:
        return SimulationService.simulate(request)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
""",
    "app/api/endpoints/compare.py": """\
from fastapi import APIRouter, HTTPException
from typing import Dict
from app.models.requests import ComparisonRequest
from app.models.schemas import SimulationResult
from app.services.simulation import SimulationService

router = APIRouter()

@router.post("/compare", response_model=Dict[str, SimulationResult])
def compare(request: ComparisonRequest):
    try:
        return SimulationService.compare(request)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
""",
    "app/api/__init__.py": "",
    "app/api/router.py": """\
from fastapi import APIRouter
from app.api.endpoints import health, simulate, compare

api_router = APIRouter()
api_router.include_router(health.router, tags=["Health"])
api_router.include_router(simulate.router, tags=["Simulation"])
api_router.include_router(compare.router, tags=["Comparison"])
""",
    "app/main.py": """\
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.router import api_router

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
    "tests/test_api.py": """\
import pytest, sys, os; sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"

def test_simulate_fcfs():
    payload = {
        "algorithm": "FCFS",
        "processes": [
            {"id": "P1", "arrival_time": 0, "burst_time": 5},
            {"id": "P2", "arrival_time": 2, "burst_time": 3}
        ]
    }
    response = client.post("/api/v1/simulate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "gantt_chart" in data
    assert len(data["gantt_chart"]) == 2

def test_simulate_invalid_algorithm():
    payload = {
        "algorithm": "UNKNOWN",
        "processes": [{"id": "P1", "arrival_time": 0, "burst_time": 5}]
    }
    response = client.post("/api/v1/simulate", json=payload)
    assert response.status_code == 400
    assert "not supported" in response.json()["detail"].lower()

def test_simulate_rr_missing_quantum():
    payload = {
        "algorithm": "RR",
        "processes": [{"id": "P1", "arrival_time": 0, "burst_time": 5}]
    }
    response = client.post("/api/v1/simulate", json=payload)
    assert response.status_code == 400
    assert "positive time_quantum" in response.json()["detail"].lower()

def test_compare_algorithms():
    payload = {
        "algorithms": ["FCFS", "SJF"],
        "processes": [
            {"id": "P1", "arrival_time": 0, "burst_time": 5},
            {"id": "P2", "arrival_time": 2, "burst_time": 3}
        ]
    }
    response = client.post("/api/v1/compare", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "FCFS" in data
    assert "SJF" in data

def test_empty_workload():
    payload = {
        "algorithm": "FCFS",
        "processes": []
    }
    response = client.post("/api/v1/simulate", json=payload)
    assert response.status_code == 422

def test_duplicate_process_ids():
    payload = {
        "algorithm": "FCFS",
        "processes": [
            {"id": "P1", "arrival_time": 0, "burst_time": 5},
            {"id": "P1", "arrival_time": 2, "burst_time": 3}
        ]
    }
    response = client.post("/api/v1/simulate", json=payload)
    assert response.status_code == 422
"""
}

for rel_path, content in files.items():
    full_path = os.path.join(base_dir, rel_path)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, "w") as f:
        f.write(content)
