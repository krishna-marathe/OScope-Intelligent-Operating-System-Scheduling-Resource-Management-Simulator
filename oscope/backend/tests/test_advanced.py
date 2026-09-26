import pytest, sys, os; sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_mlq():
    res = client.post("/api/v1/simulate", json={
        "algorithm": "MLQ",
        "processes": [{"id": "P1", "arrival_time": 0, "burst_time": 5}],
        "mlq_config": {
            "queues": [
                {"id": 1, "priority": 1, "policy": "RR", "time_quantum": 4},
                {"id": 2, "priority": 2, "policy": "FCFS"}
            ],
            "process_assignments": {"P1": 1},
            "inter_queue_policy": "FIXED_PRIORITY"
        }
    })
    assert res.status_code == 200
    assert res.json()["gantt_chart"][0]["process_id"] == "P1"

def test_mlfq():
    res = client.post("/api/v1/simulate", json={
        "algorithm": "MLFQ",
        "processes": [{"id": "P1", "arrival_time": 0, "burst_time": 5}]
    })
    assert res.status_code == 200
    assert res.json()["gantt_chart"][0]["process_id"] == "P1"
