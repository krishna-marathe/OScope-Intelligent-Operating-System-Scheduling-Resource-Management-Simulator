from fastapi import APIRouter, HTTPException
from app.models.memory_schemas import MemorySimulationRequest, MemorySimulationResult
from app.memory.registry import get_memory_algorithm

router = APIRouter()

@router.post("/simulate", response_model=MemorySimulationResult)
def simulate_memory(req: MemorySimulationRequest):
    try:
        alg = get_memory_algorithm(req.algorithm)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
        
    steps = alg.simulate(req.reference_sequence, req.frame_count)
    
    total = len(req.reference_sequence)
    hits = sum(1 for step in steps if step.is_hit)
    faults = total - hits
    
    return MemorySimulationResult(
        algorithm=req.algorithm,
        reference_sequence=req.reference_sequence,
        frame_count=req.frame_count,
        steps=steps,
        page_faults=faults,
        page_hits=hits,
        hit_ratio=hits / total if total > 0 else 0,
        fault_ratio=faults / total if total > 0 else 0,
        total_references=total
    )
