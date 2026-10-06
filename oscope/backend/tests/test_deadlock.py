from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_bankers_safe_state():
    req = {
        "process_count": 5,
        "resource_count": 3,
        "available": [3, 3, 2],
        "allocation": [
            [0, 1, 0],
            [2, 0, 0],
            [3, 0, 2],
            [2, 1, 1],
            [0, 0, 2]
        ],
        "maximum": [
            [7, 5, 3],
            [3, 2, 2],
            [9, 0, 2],
            [2, 2, 2],
            [4, 3, 3]
        ]
    }
    resp = client.post("/api/v1/deadlock/simulate", json=req)
    assert resp.status_code == 200
    data = resp.json()
    assert data["is_safe"] == True
    # The expected safe sequence for this deterministic loop is [1, 3, 0, 2, 4]
    assert data["safe_sequence"] == [1, 3, 0, 2, 4]
    assert len(data["safety_steps"]) == 5
    assert data["need_matrix"] == [
        [7, 4, 3],
        [1, 2, 2],
        [6, 0, 0],
        [0, 1, 1],
        [4, 3, 1]
    ]

def test_bankers_unsafe_state():
    req = {
        "process_count": 3,
        "resource_count": 1,
        "available": [0],
        "allocation": [[2], [2], [2]],
        "maximum": [[4], [4], [4]]
    }
    resp = client.post("/api/v1/deadlock/simulate", json=req)
    assert resp.status_code == 200
    data = resp.json()
    assert data["is_safe"] == False
    assert len(data["safe_sequence"]) == 0

def test_resource_request_approved():
    req = {
        "process_count": 5,
        "resource_count": 3,
        "available": [3, 3, 2],
        "allocation": [
            [0, 1, 0],
            [2, 0, 0],
            [3, 0, 2],
            [2, 1, 1],
            [0, 0, 2]
        ],
        "maximum": [
            [7, 5, 3],
            [3, 2, 2],
            [9, 0, 2],
            [2, 2, 2],
            [4, 3, 3]
        ],
        "resource_request": {
            "process_id": 1,
            "request": [1, 0, 2]
        }
    }
    resp = client.post("/api/v1/deadlock/simulate", json=req)
    data = resp.json()
    assert data["request_approved"] == True
    assert data["is_safe"] == True
    assert data["safe_sequence"][0] == 1 # 1 should be able to finish

def test_resource_request_denied_unsafe():
    req = {
        "process_count": 5,
        "resource_count": 3,
        "available": [3, 3, 2],
        "allocation": [
            [0, 1, 0],
            [2, 0, 0],
            [3, 0, 2],
            [2, 1, 1],
            [0, 0, 2]
        ],
        "maximum": [
            [7, 5, 3],
            [3, 2, 2],
            [9, 0, 2],
            [2, 2, 2],
            [4, 3, 3]
        ],
        "resource_request": {
            "process_id": 4,
            "request": [3, 3, 0]
        }
    }
    resp = client.post("/api/v1/deadlock/simulate", json=req)
    data = resp.json()
    assert data["request_approved"] == False
    assert "UNSAFE" in data["request_reason"]
    assert data["is_safe"] == True # Original state is safe
    
def test_resource_request_exceeds_need():
    req = {
        "process_count": 2,
        "resource_count": 1,
        "available": [10],
        "allocation": [[2], [0]],
        "maximum": [[5], [5]],
        "resource_request": {
            "process_id": 0,
            "request": [4] # Need is 3
        }
    }
    resp = client.post("/api/v1/deadlock/simulate", json=req)
    data = resp.json()
    assert data["request_approved"] == False
    assert "Request > Need" in data["request_reason"]

def test_invalid_matrices():
    req = {
        "process_count": 2,
        "resource_count": 2,
        "available": [1], # wrong dim
        "allocation": [[0, 0], [0, 0]],
        "maximum": [[1, 1], [1, 1]]
    }
    resp = client.post("/api/v1/deadlock/simulate", json=req)
    assert resp.status_code == 422
