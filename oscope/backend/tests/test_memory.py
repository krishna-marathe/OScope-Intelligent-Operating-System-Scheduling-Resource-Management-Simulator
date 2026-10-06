from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_fifo_empty_frames():
    req = {
        "reference_sequence": [1, 2, 3],
        "frame_count": 3,
        "algorithm": "FIFO"
    }
    resp = client.post("/api/v1/memory/simulate", json=req)
    assert resp.status_code == 200
    data = resp.json()
    assert data["page_faults"] == 3
    assert data["page_hits"] == 0
    assert len(data["steps"]) == 3
    assert data["steps"][0]["frames"] == [1]
    assert data["steps"][1]["frames"] == [1, 2]
    assert data["steps"][2]["frames"] == [1, 2, 3]

def test_fifo_hits():
    req = {
        "reference_sequence": [1, 2, 1],
        "frame_count": 3,
        "algorithm": "FIFO"
    }
    resp = client.post("/api/v1/memory/simulate", json=req)
    assert resp.status_code == 200
    data = resp.json()
    assert data["page_faults"] == 2
    assert data["page_hits"] == 1
    assert data["steps"][2]["is_hit"] is True

def test_fifo_replacement():
    req = {
        "reference_sequence": [1, 2, 3, 4],
        "frame_count": 3,
        "algorithm": "FIFO"
    }
    resp = client.post("/api/v1/memory/simulate", json=req)
    data = resp.json()
    assert data["page_faults"] == 4
    # 1 replaced by 4
    assert data["steps"][3]["replaced_page"] == 1
    assert data["steps"][3]["frames"] == [4, 2, 3]

def test_repeated_references():
    req = {
        "reference_sequence": [1, 1, 1, 1],
        "frame_count": 2,
        "algorithm": "FIFO"
    }
    resp = client.post("/api/v1/memory/simulate", json=req)
    data = resp.json()
    assert data["page_faults"] == 1
    assert data["page_hits"] == 3

def test_one_frame_memory():
    req = {
        "reference_sequence": [1, 2, 1, 3],
        "frame_count": 1,
        "algorithm": "FIFO"
    }
    resp = client.post("/api/v1/memory/simulate", json=req)
    data = resp.json()
    assert data["page_faults"] == 4
    assert data["page_hits"] == 0
    assert data["steps"][1]["frames"] == [2]
    assert data["steps"][2]["frames"] == [1]
    assert data["steps"][3]["frames"] == [3]

def test_frame_count_larger_than_unique():
    req = {
        "reference_sequence": [1, 2, 3, 1, 2],
        "frame_count": 5,
        "algorithm": "FIFO"
    }
    resp = client.post("/api/v1/memory/simulate", json=req)
    data = resp.json()
    assert data["page_faults"] == 3
    assert data["page_hits"] == 2
    assert data["steps"][-1]["frames"] == [1, 2, 3]

def test_multiple_replacements():
    req = {
        "reference_sequence": [1, 2, 3, 4, 5, 1],
        "frame_count": 3,
        "algorithm": "FIFO"
    }
    resp = client.post("/api/v1/memory/simulate", json=req)
    data = resp.json()
    assert data["page_faults"] == 6
    assert data["steps"][3]["replaced_page"] == 1
    assert data["steps"][4]["replaced_page"] == 2
    assert data["steps"][5]["replaced_page"] == 3
    assert data["steps"][5]["frames"] == [4, 5, 1]

def test_invalid_frame_count():
    req = {
        "reference_sequence": [1, 2],
        "frame_count": 0,
        "algorithm": "FIFO"
    }
    resp = client.post("/api/v1/memory/simulate", json=req)
    assert resp.status_code == 422 # Validation error

def test_empty_reference_sequence():
    req = {
        "reference_sequence": [],
        "frame_count": 3,
        "algorithm": "FIFO"
    }
    resp = client.post("/api/v1/memory/simulate", json=req)
    assert resp.status_code == 422

def test_invalid_algorithm():
    req = {
        "reference_sequence": [1, 2],
        "frame_count": 3,
        "algorithm": "RANDOM"
    }
    resp = client.post("/api/v1/memory/simulate", json=req)
    assert resp.status_code == 400
    assert "Unknown memory algorithm" in resp.json()["detail"]

def test_api_response_structure():
    req = {
        "reference_sequence": [1, 2],
        "frame_count": 3,
        "algorithm": "FIFO"
    }
    resp = client.post("/api/v1/memory/simulate", json=req)
    data = resp.json()
    assert "algorithm" in data
    assert "reference_sequence" in data
    assert "frame_count" in data
    assert "steps" in data
    assert "page_faults" in data
    assert "page_hits" in data
    assert "hit_ratio" in data
    assert "fault_ratio" in data
    assert "total_references" in data

def test_lru_empty_frames():
    req = {
        "reference_sequence": [1, 2, 3],
        "frame_count": 3,
        "algorithm": "LRU"
    }
    resp = client.post("/api/v1/memory/simulate", json=req)
    assert resp.status_code == 200
    data = resp.json()
    assert data["page_faults"] == 3
    assert data["page_hits"] == 0

def test_lru_hits():
    req = {
        "reference_sequence": [1, 2, 1],
        "frame_count": 3,
        "algorithm": "LRU"
    }
    resp = client.post("/api/v1/memory/simulate", json=req)
    data = resp.json()
    assert data["page_faults"] == 2
    assert data["page_hits"] == 1

def test_lru_replacement():
    # Sequence: 1, 2, 3, 1, 4
    # Frame 3:
    # 1 -> [1] (fault)
    # 2 -> [1, 2] (fault)
    # 3 -> [1, 2, 3] (fault)
    # 1 -> [1, 2, 3] (hit) -> LRU is now 2
    # 4 -> [1, 4, 3] (fault) -> replaces 2
    req = {
        "reference_sequence": [1, 2, 3, 1, 4],
        "frame_count": 3,
        "algorithm": "LRU"
    }
    resp = client.post("/api/v1/memory/simulate", json=req)
    data = resp.json()
    assert data["page_faults"] == 4
    assert data["steps"][4]["replaced_page"] == 2
    assert data["steps"][4]["frames"] == [1, 4, 3]

def test_lru_repeated_references():
    req = {
        "reference_sequence": [1, 1, 1, 1],
        "frame_count": 2,
        "algorithm": "LRU"
    }
    resp = client.post("/api/v1/memory/simulate", json=req)
    data = resp.json()
    assert data["page_faults"] == 1
    assert data["page_hits"] == 3

def test_lru_one_frame():
    req = {
        "reference_sequence": [1, 2, 1, 3],
        "frame_count": 1,
        "algorithm": "LRU"
    }
    resp = client.post("/api/v1/memory/simulate", json=req)
    data = resp.json()
    assert data["page_faults"] == 4

def test_invalid_algorithm():
    req = {
        "reference_sequence": [1, 2],
        "frame_count": 3,
        "algorithm": "MAGIC"
    }
    resp = client.post("/api/v1/memory/simulate", json=req)
    assert resp.status_code == 400
    assert "Unknown memory algorithm" in resp.json()["detail"]

def test_opt_empty_frames():
    req = {
        "reference_sequence": [1, 2, 3],
        "frame_count": 3,
        "algorithm": "OPTIMAL"
    }
    resp = client.post("/api/v1/memory/simulate", json=req)
    assert resp.status_code == 200
    data = resp.json()
    assert data["page_faults"] == 3
    assert data["page_hits"] == 0

def test_opt_hits():
    req = {
        "reference_sequence": [1, 2, 1],
        "frame_count": 3,
        "algorithm": "OPTIMAL"
    }
    resp = client.post("/api/v1/memory/simulate", json=req)
    data = resp.json()
    assert data["page_faults"] == 2
    assert data["page_hits"] == 1

def test_opt_replacement():
    # Sequence: 1, 2, 3, 4, 1, 2, 5
    # Frames: 3
    # 1 -> [1]
    # 2 -> [1, 2]
    # 3 -> [1, 2, 3]
    # 4 -> memory full. Future for 1 is index 4. Future for 2 is index 5. Future for 3 is infinity.
    # Therefore, replace 3 with 4 -> [1, 2, 4]
    # 1 -> hit
    # 2 -> hit
    # 5 -> memory full. Future for 1 is inf, 2 is inf, 4 is inf.
    # Tie-break deterministic rule (first frame index): 1 is replaced by 5 -> [5, 2, 4]
    
    req = {
        "reference_sequence": [1, 2, 3, 4, 1, 2, 5],
        "frame_count": 3,
        "algorithm": "OPTIMAL"
    }
    resp = client.post("/api/v1/memory/simulate", json=req)
    data = resp.json()
    
    # faults: 1, 2, 3, 4 (fault), 5 (fault) -> 5 faults
    assert data["page_faults"] == 5
    # Hit for 1, 2 -> 2 hits
    assert data["page_hits"] == 2
    
    # 4 replaces 3
    assert data["steps"][3]["replaced_page"] == 3
    assert data["steps"][3]["frames"] == [1, 2, 4]
    
    # 5 replaces 1 (first item in frames list that is not referenced again)
    assert data["steps"][6]["replaced_page"] == 1
    assert data["steps"][6]["frames"] == [5, 2, 4]

def test_opt_repeated_references():
    req = {
        "reference_sequence": [1, 1, 1, 1],
        "frame_count": 2,
        "algorithm": "OPTIMAL"
    }
    resp = client.post("/api/v1/memory/simulate", json=req)
    data = resp.json()
    assert data["page_faults"] == 1
    assert data["page_hits"] == 3

def test_opt_one_frame():
    req = {
        "reference_sequence": [1, 2, 1, 3],
        "frame_count": 1,
        "algorithm": "OPTIMAL"
    }
    resp = client.post("/api/v1/memory/simulate", json=req)
    data = resp.json()
    assert data["page_faults"] == 4
