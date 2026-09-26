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
