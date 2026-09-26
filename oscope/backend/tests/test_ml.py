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
