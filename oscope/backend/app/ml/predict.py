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
