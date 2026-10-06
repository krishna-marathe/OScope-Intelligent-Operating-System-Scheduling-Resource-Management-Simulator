from fastapi import APIRouter, HTTPException
from app.models.disk_schemas import DiskSimulationRequest, DiskSimulationResult
from app.disk.registry import get_disk_algorithm

router = APIRouter()

@router.post("/simulate", response_model=DiskSimulationResult)
def simulate_disk(req: DiskSimulationRequest):
    try:
        alg = get_disk_algorithm(req.algorithm)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
        
    service_order, movement_steps = alg.simulate(
        request_queue=req.request_queue,
        initial_head_position=req.initial_head_position,
        disk_size=req.disk_size,
        direction=req.direction
    )
    
    total_movement = sum(step.movement for step in movement_steps)
    num_requests = len(req.request_queue)
    average_movement = total_movement / num_requests if num_requests > 0 else 0.0
    
    return DiskSimulationResult(
        algorithm=req.algorithm,
        initial_head_position=req.initial_head_position,
        request_queue=req.request_queue,
        service_order=service_order,
        movement_steps=movement_steps,
        total_head_movement=total_movement,
        average_head_movement=average_movement
    )
