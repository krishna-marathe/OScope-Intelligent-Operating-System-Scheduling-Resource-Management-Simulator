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
