import numpy as np
from typing import List
from app.models.schemas import Process

def extract_features(processes: List[Process]) -> List[float]:
    if not processes:
        return [0.0] * 8
    
    burst_times = [p.burst_time for p in processes]
    arrival_times = [p.arrival_time for p in processes]
    priorities = [p.priority or 0 for p in processes]
    
    return [
        float(len(processes)),
        float(np.mean(burst_times)),
        float(np.median(burst_times)),
        float(np.min(burst_times)),
        float(np.max(burst_times)),
        float(np.std(burst_times)),
        float(np.mean(arrival_times)),
        float(np.max(arrival_times) - np.min(arrival_times))
    ]
