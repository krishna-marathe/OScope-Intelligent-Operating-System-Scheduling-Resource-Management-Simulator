from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_fcfs_basic():
    req = {
        "request_queue": [82, 170, 43, 140],
        "initial_head_position": 50,
        "disk_size": 200,
        "algorithm": "FCFS"
    }
    resp = client.post("/api/v1/disk/simulate", json=req)
    assert resp.status_code == 200
    data = resp.json()
    assert data["algorithm"] == "FCFS"
    assert data["service_order"] == [82, 170, 43, 140]
    
    # Movements: |82 - 50| = 32, |170 - 82| = 88, |43 - 170| = 127, |140 - 43| = 97
    # Total: 32 + 88 + 127 + 97 = 344
    assert data["total_head_movement"] == 344
    assert len(data["movement_steps"]) == 4
    assert data["movement_steps"][0] == {"start_cylinder": 50, "end_cylinder": 82, "movement": 32}
    assert data["movement_steps"][1] == {"start_cylinder": 82, "end_cylinder": 170, "movement": 88}

def test_fcfs_duplicate_requests():
    req = {
        "request_queue": [82, 82, 170],
        "initial_head_position": 50,
        "disk_size": 200,
        "algorithm": "FCFS"
    }
    resp = client.post("/api/v1/disk/simulate", json=req)
    data = resp.json()
    assert data["service_order"] == [82, 82, 170]
    assert data["total_head_movement"] == 32 + 0 + 88

def test_fcfs_request_equal_head():
    req = {
        "request_queue": [50, 60],
        "initial_head_position": 50,
        "disk_size": 200,
        "algorithm": "FCFS"
    }
    resp = client.post("/api/v1/disk/simulate", json=req)
    data = resp.json()
    assert data["service_order"] == [50, 60]
    assert data["total_head_movement"] == 0 + 10

def test_fcfs_single_request():
    req = {
        "request_queue": [100],
        "initial_head_position": 50,
        "disk_size": 200,
        "algorithm": "FCFS"
    }
    resp = client.post("/api/v1/disk/simulate", json=req)
    data = resp.json()
    assert data["service_order"] == [100]
    assert data["total_head_movement"] == 50

def test_fcfs_boundary_cylinders():
    req = {
        "request_queue": [0, 199],
        "initial_head_position": 100,
        "disk_size": 200,
        "algorithm": "FCFS"
    }
    resp = client.post("/api/v1/disk/simulate", json=req)
    data = resp.json()
    assert data["total_head_movement"] == 100 + 199

def test_invalid_empty_queue():
    req = {
        "request_queue": [],
        "initial_head_position": 50,
        "disk_size": 200,
        "algorithm": "FCFS"
    }
    resp = client.post("/api/v1/disk/simulate", json=req)
    assert resp.status_code == 422

def test_invalid_head_position():
    req = {
        "request_queue": [50],
        "initial_head_position": 250, # out of bounds
        "disk_size": 200,
        "algorithm": "FCFS"
    }
    resp = client.post("/api/v1/disk/simulate", json=req)
    assert resp.status_code == 422

def test_invalid_request_cylinder():
    req = {
        "request_queue": [250], # out of bounds
        "initial_head_position": 50,
        "disk_size": 200,
        "algorithm": "FCFS"
    }
    resp = client.post("/api/v1/disk/simulate", json=req)
    assert resp.status_code == 422

def test_invalid_disk_size():
    req = {
        "request_queue": [50],
        "initial_head_position": 50,
        "disk_size": -10,
        "algorithm": "FCFS"
    }
    resp = client.post("/api/v1/disk/simulate", json=req)
    assert resp.status_code == 422

def test_unsupported_algorithm():
    req = {
        "request_queue": [50],
        "initial_head_position": 50,
        "disk_size": 200,
        "algorithm": "MAGIC_DISK"
    }
    resp = client.post("/api/v1/disk/simulate", json=req)
    assert resp.status_code == 400

def test_api_response_structure():
    req = {
        "request_queue": [82],
        "initial_head_position": 50,
        "disk_size": 200,
        "algorithm": "FCFS"
    }
    resp = client.post("/api/v1/disk/simulate", json=req)
    data = resp.json()
    assert "algorithm" in data
    assert "initial_head_position" in data
    assert "request_queue" in data
    assert "service_order" in data
    assert "movement_steps" in data
    assert "total_head_movement" in data
    assert "average_head_movement" in data

def test_sstf_basic():
    req = {
        "request_queue": [98, 183, 37, 122, 14, 124, 65, 67],
        "initial_head_position": 53,
        "disk_size": 200,
        "algorithm": "SSTF"
    }
    resp = client.post("/api/v1/disk/simulate", json=req)
    assert resp.status_code == 200
    data = resp.json()
    assert data["service_order"] == [65, 67, 37, 14, 98, 122, 124, 183]
    assert data["total_head_movement"] == 236

def test_scan_basic():
    req = {
        "request_queue": [98, 183, 37, 122, 14, 124, 65, 67],
        "initial_head_position": 53,
        "disk_size": 200,
        "algorithm": "SCAN",
        "direction": "RIGHT"
    }
    resp = client.post("/api/v1/disk/simulate", json=req)
    data = resp.json()
    assert data["service_order"] == [65, 67, 98, 122, 124, 183, 37, 14]
    # 53 -> 199 (146) + 199 -> 14 (185) = 331
    assert data["total_head_movement"] == 331

def test_cscan_basic():
    req = {
        "request_queue": [98, 183, 37, 122, 14, 124, 65, 67],
        "initial_head_position": 53,
        "disk_size": 200,
        "algorithm": "C-SCAN",
        "direction": "RIGHT"
    }
    resp = client.post("/api/v1/disk/simulate", json=req)
    data = resp.json()
    assert data["service_order"] == [65, 67, 98, 122, 124, 183, 14, 37]
    # 53 -> 199 (146) + 199 -> 0 (199) + 0 -> 37 (37) = 382
    assert data["total_head_movement"] == 382

def test_look_basic():
    req = {
        "request_queue": [98, 183, 37, 122, 14, 124, 65, 67],
        "initial_head_position": 53,
        "disk_size": 200,
        "algorithm": "LOOK",
        "direction": "RIGHT"
    }
    resp = client.post("/api/v1/disk/simulate", json=req)
    data = resp.json()
    assert data["service_order"] == [65, 67, 98, 122, 124, 183, 37, 14]
    # 53 -> 183 (130) + 183 -> 14 (169) = 299
    assert data["total_head_movement"] == 299

def test_clook_basic():
    req = {
        "request_queue": [98, 183, 37, 122, 14, 124, 65, 67],
        "initial_head_position": 53,
        "disk_size": 200,
        "algorithm": "C-LOOK",
        "direction": "RIGHT"
    }
    resp = client.post("/api/v1/disk/simulate", json=req)
    data = resp.json()
    assert data["service_order"] == [65, 67, 98, 122, 124, 183, 14, 37]
    # 53 -> 183 (130) + 183 -> 14 (169) + 14 -> 37 (23) = 322
    assert data["total_head_movement"] == 322
