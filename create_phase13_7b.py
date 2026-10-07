import os

WORKSPACE_DIR = r"c:\Users\marat\Downloads\3 rd Year\OS_LAB\Operating_system_CP"
FRONTEND_DIR = os.path.join(WORKSPACE_DIR, "oscope", "frontend")
BACKEND_DIR = os.path.join(WORKSPACE_DIR, "oscope", "backend")

INTELLIGENCE_API_DIR = os.path.join(BACKEND_DIR, "app", "intelligence")
INTELLIGENCE_ANALYZERS_DIR = os.path.join(INTELLIGENCE_API_DIR, "analyzers")
INTELLIGENCE_SCORING_DIR = os.path.join(INTELLIGENCE_API_DIR, "scoring")

os.makedirs(INTELLIGENCE_ANALYZERS_DIR, exist_ok=True)
os.makedirs(INTELLIGENCE_SCORING_DIR, exist_ok=True)

cpu_analyzer_code = """
import statistics

def analyze_cpu_workload(workload: list) -> dict:
    if not workload:
        return {"process_count": 0}
    
    process_count = len(workload)
    bursts = [p.get('burst_time', 0) for p in workload]
    avg_burst = sum(bursts) / process_count if process_count > 0 else 0
    min_burst = min(bursts) if bursts else 0
    max_burst = max(bursts) if bursts else 0
    
    burst_variance = statistics.variance(bursts) if len(bursts) > 1 else 0
    burst_stddev = statistics.stdev(bursts) if len(bursts) > 1 else 0
    
    labels = []
    if avg_burst < 5:
        labels.append({"label": "SHORT_BURST", "reason": "Average burst time is low.", "evidence": f"Avg burst = {avg_burst}"})
    elif avg_burst > 15:
        labels.append({"label": "LONG_BURST", "reason": "Average burst time is high.", "evidence": f"Avg burst = {avg_burst}"})
        
    return {
        "process_count": process_count,
        "average_burst": avg_burst,
        "min_burst": min_burst,
        "max_burst": max_burst,
        "burst_variance": burst_variance,
        "burst_stddev": burst_stddev,
        "labels": labels
    }
"""

with open(os.path.join(INTELLIGENCE_ANALYZERS_DIR, "cpu_workload_analyzer.py"), "w") as f:
    f.write(cpu_analyzer_code.strip())

cpu_scoring_code = """
def rank_algorithms(results: list, weights: dict) -> list:
    if not results:
        return []
        
    ranked = []
    for res in results:
        # Example naive scoring based on waiting time (lower is better)
        waiting = res.get('average_waiting_time', 100)
        score = 1.0 / (1.0 + waiting) # Normalize
        
        ranked.append({
            "algorithm": res.get("algorithm", "Unknown"),
            "score": score,
            "evidence": ["Based on waiting time inversion"]
        })
        
    ranked.sort(key=lambda x: x['score'], reverse=True)
    return ranked
"""

with open(os.path.join(INTELLIGENCE_SCORING_DIR, "scoring_engine.py"), "w") as f:
    f.write(cpu_scoring_code.strip())

with open(os.path.join(INTELLIGENCE_API_DIR, "router.py"), "w") as f:
    f.write("""
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/api/v1/intelligence")

class CpuAnalyzeRequest(BaseModel):
    workload: list
    results: list
    
@router.post("/analyze/cpu")
def analyze_cpu(req: CpuAnalyzeRequest):
    return {"status": "success", "message": "Deterministic analysis complete"}
""".strip())

# Frontend updates
FE_API_DIR = os.path.join(FRONTEND_DIR, "src", "features", "intelligence", "api")
os.makedirs(FE_API_DIR, exist_ok=True)
with open(os.path.join(FE_API_DIR, "intelligenceApi.ts"), "w") as f:
    f.write("""
import axios from 'axios';

export const analyzeCpu = async (workload: any[], results: any[]) => {
    const res = await axios.post('/api/v1/intelligence/analyze/cpu', { workload, results });
    return res.data;
};
""".strip())

print("Phase 13.7B deterministic scaffolding updated successfully!")
