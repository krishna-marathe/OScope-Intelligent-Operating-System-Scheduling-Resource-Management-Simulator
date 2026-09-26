import os
import random
import numpy as np
import joblib
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report
from sklearn.model_selection import train_test_split
from app.models.schemas import Process
from app.ml.features import extract_features
from app.services.simulation import SimulationService
from app.models.requests import ComparisonRequest

ALGORITHMS = ["FCFS", "SJF", "SRTF", "RR", "PRIORITY_NP", "PRIORITY_P"]
TIME_QUANTUM = 2

def generate_workloads(n=200):
    np.random.seed(42)
    random.seed(42)
    workloads = []
    for i in range(n):
        num_proc = random.randint(3, 10)
        processes = []
        for j in range(num_proc):
            processes.append(Process(
                id=f"P{j+1}",
                arrival_time=random.randint(0, 15),
                burst_time=random.randint(1, 20),
                priority=random.randint(1, 5)
            ))
        workloads.append(processes)
    return workloads

def get_best_algorithm(workload, objective):
    req = ComparisonRequest(algorithms=ALGORITHMS, processes=workload, time_quantum=TIME_QUANTUM)
    results = SimulationService.compare(req)
    
    best_algo = None
    best_val = float('inf')
    
    for algo, res in results.items():
        if objective == "awt":
            val = res.metrics.average_waiting_time
        elif objective == "atat":
            val = res.metrics.average_turnaround_time
        else:
            val = res.metrics.average_response_time
            
        if val < best_val:
            best_val = val
            best_algo = algo
        elif val == best_val:
            if best_algo is None or algo < best_algo:
                best_algo = algo # tie-break lexicographical
                
    return best_algo

def train_model():
    print("Generating synthetic workloads...")
    workloads = generate_workloads(300)
    
    print("Extracting features and labels for objective: AWT...")
    X = [extract_features(w) for w in workloads]
    y = [get_best_algorithm(w, "awt") for w in workloads]
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    clf = RandomForestClassifier(n_estimators=100, random_state=42)
    clf.fit(X_train, y_train)
    
    y_pred = clf.predict(X_test)
    print("Accuracy:", accuracy_score(y_test, y_pred))
    print(classification_report(y_test, y_pred, zero_division=0))
    
    model_path = os.path.join(os.path.dirname(__file__), "model.joblib")
    joblib.dump(clf, model_path)
    print(f"Model saved to {model_path}")

if __name__ == "__main__":
    train_model()
