from fastapi import APIRouter, HTTPException
from app.models.requests import SimulationRequest
from app.models.schemas import SimulationResult
from app.services.simulation import SimulationService

router = APIRouter()

@router.post("/simulate", response_model=SimulationResult)
def simulate(request: SimulationRequest):
    try:
        return SimulationService.simulate(request)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
